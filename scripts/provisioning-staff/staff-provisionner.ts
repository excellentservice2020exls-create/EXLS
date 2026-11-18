import { createHash, randomBytes } from "node:crypto";
import { getBaseConfig, UserRole } from "@/scripts/provisioning-admin/config";
import { parseBatchEnvJson, BatchUserAccount, isValidEmail, validatePassword } from "@/scripts/provisioning-admin/validation";
import { listAllUsers, requestAdminApi, SupabaseUser } from "@/scripts/provisioning-admin/supabase-admin";
import { getDatabaseClient, acquireAdvisoryLock, releaseAdvisoryLock } from "@/scripts/provisioning-admin/database";

type OperationalRole = Extract<UserRole, "MANAGER" | "SUPERVISOR" | "TEAM_LEADER" | "AGENT">;

const ROLE_CONFIG: Record<OperationalRole, { envVar: string; prefix: string }> = {
    MANAGER: { envVar: "PROVISION_MANAGERS", prefix: "MGR" },
    SUPERVISOR: { envVar: "PROVISION_SUPERVISORS", prefix: "SUP" },
    TEAM_LEADER: { envVar: "PROVISION_TEAM_LEADERS", prefix: "TL" },
    AGENT: { envVar: "PROVISION_AGENTS", prefix: "AGT" },
};

const PROTECTED_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];

function parseName(fullName: string) {
    const [firstName, ...lastNameParts] = fullName.split(/\s+/).filter(Boolean);
    return {
        firstName: firstName || "Utilisateur",
        lastName: lastNameParts.join(" ") || firstName || "EXLS",
    };
}

/**
 * Assainit strictement les erreurs pour éviter toute fuite de données sensibles ou de messages d'API bruts.
 */
function formatError(err: unknown): string {
    const correlationId = randomBytes(4).toString("hex").toUpperCase();
    if (err instanceof Error) {
        // Ne renvoie pas le message brut s'il provient d'une API externe potentiellement bavarde
        return `[Ref: ${correlationId}] Une erreur technique interne est survenue lors de l'opération.`;
    }
    if (typeof err === "string") {
        return `[Ref: ${correlationId}] Erreur : ${err.substring(0, 100)}`;
    }
    return `[Ref: ${correlationId}] Erreur technique non spécifiée.`;
}

interface PreparedAccount {
    email: string;
    name: string;
    password: string;
    role: OperationalRole;
    prefix: string;
}

export async function runStaffProvisioning() {
    console.log("🔍 Phase 1 : Validation stricte et normalisation des lots...");

    const globalEmailSet = new Set<string>();
    const preparedAccounts: PreparedAccount[] = [];

    for (const [role, config] of Object.entries(ROLE_CONFIG) as [OperationalRole, { envVar: string; prefix: string }][]) {
        const rawAccounts = parseBatchEnvJson(config.envVar);
        if (rawAccounts.length === 0) continue;

        for (const acc of rawAccounts) {
            const normalizedEmail = acc.email.trim().toLowerCase();
            const trimmedName = acc.name.trim();

            if (!isValidEmail(normalizedEmail)) {
                throw new Error(`Validation échouée : format d'e-mail invalide.`);
            }
            if (!trimmedName) {
                throw new Error(`Validation échouée : nom vide.`);
            }
            validatePassword(acc.password);

            if (globalEmailSet.has(normalizedEmail)) {
                throw new Error(`Conflit critique : e-mail en double dans les configurations.`);
            }
            globalEmailSet.add(normalizedEmail);

            preparedAccounts.push({
                email: normalizedEmail,
                name: trimmedName,
                password: acc.password,
                role,
                prefix: config.prefix,
            });
        }
    }

    if (preparedAccounts.length === 0) {
        console.log("ℹ️ Aucun compte opérationnel configuré. Fin du processus.");
        return;
    }

    const env = getBaseConfig();
    const db = getDatabaseClient(env.databaseUrl);
    let lockAcquired = false;

    try {
        await acquireAdvisoryLock(db);
        lockAcquired = true;
        console.log("🔒 Verrou exclusif de base de données acquis.");

        const authUsers = await listAllUsers(env.supabaseUrl, env.serviceRoleKey);
        const authUserMap = new Map<string, SupabaseUser>();
        for (const u of authUsers) {
            if (u.email) authUserMap.set(u.email.toLowerCase(), u);
        }

        // Phase 1.4 : Inspection initiale de sécurité
        for (const acc of preparedAccounts) {
            const existingAuth = authUserMap.get(acc.email);
            if (existingAuth) {
                const currentAuthRole = existingAuth.app_metadata?.role as UserRole | undefined;
                if (currentAuthRole && PROTECTED_ROLES.includes(currentAuthRole)) {
                    throw new Error(`Sécurité bloquante : tentative d'écraser un compte protégé dans Auth.`);
                }
            }

            const dbProfiles = await db.orm.public.User
                .where((user: any) => user.email.eq(acc.email))
                .select("id", "email", "role", "adminLock")
                .limit(1)
                .all();

            if (dbProfiles.length === 1) {
                const profile = dbProfiles[0];
                if (profile.role && PROTECTED_ROLES.includes(profile.role as UserRole)) {
                    throw new Error(`Sécurité bloquante : le profil en base possède un rôle protégé.`);
                }
                if (profile.adminLock) {
                    throw new Error(`Sécurité bloquante : le profil en base est verrouillé.`);
                }
            }
        }

        console.log("✅ Phase 1 validée. Exécution des mutations synchronisées...");

        // ----------------------------------------------------
        // Phase 2 : Application idempotente avec reprise sécurisée
        // ----------------------------------------------------
        for (const acc of preparedAccounts) {
            let authUser = authUserMap.get(acc.email);

            // 2.1 Mutation Supabase Auth
            if (!authUser) {
                const createEndpoint = new URL("/auth/v1/admin/users", env.supabaseUrl);
                const createResult = await requestAdminApi<any>(createEndpoint, env.serviceRoleKey, {
                    method: "POST",
                    body: JSON.stringify({
                        email: acc.email,
                        password: acc.password,
                        email_confirm: true,
                        user_metadata: { name: acc.name },
                        app_metadata: { role: acc.role },
                    }),
                });

                const created = createResult?.user ?? createResult;
                if (!created || typeof created.id !== "string" || created.email?.toLowerCase() !== acc.email) {
                    throw new Error(`Réponse invalide de l'API Supabase Auth.`);
                }
                authUser = created;
                authUserMap.set(acc.email, authUser);
                console.log(`  ✓ [Auth] Compte créé avec succès.`);
            } else {
                const updateEndpoint = new URL(`/auth/v1/admin/users/${authUser.id}`, env.supabaseUrl);
                const updateResult = await requestAdminApi<any>(updateEndpoint, env.serviceRoleKey, {
                    method: "PUT",
                    body: JSON.stringify({
                        app_metadata: { ...authUser.app_metadata, role: acc.role },
                        user_metadata: { ...authUser.user_metadata, name: acc.name },
                    }),
                });

                const updated = updateResult?.user ?? updateResult;
                if (!updated || updated.id !== authUser.id || updated.app_metadata?.role !== acc.role) {
                    throw new Error(`Échec de confirmation PUT pour la mise à jour Auth.`);
                }
                console.log(`  ↻ [Auth] Métadonnées synchronisées.`);
            }

            // 2.2 Mutation PostgreSQL sécurisée contre la concurrence
            const { firstName, lastName } = parseName(acc.name);

            // Re-vérification atomique de l'état du profil juste avant l'écriture en base (protection anti-concurrence)
            const currentDbProfiles = await db.orm.public.User
                .where((user: any) => user.email.eq(acc.email))
                .select("id", "role", "adminLock")
                .limit(1)
                .all();

            if (currentDbProfiles.length > 1) {
                throw new Error(`Intégrité compromise : doublon détecté en base.`);
            }

            if (currentDbProfiles.length === 1) {
                const profile = currentDbProfiles[0];
                // Protection conditionnelle : on refuse d'écraser si le profil est devenu protégé ou verrouillé entre-temps
                if ((profile.role && PROTECTED_ROLES.includes(profile.role as UserRole)) || profile.adminLock) {
                    throw new Error(`Conflit concurrent : le profil a été verrouillé ou promu par un autre processus.`);
                }

                await db.orm.public.User.where({ id: profile.id }).update({
                    firstName,
                    lastName,
                    role: acc.role,
                });
                console.log(`  ↻ [DB] Profil mis à jour.`);
            } else {
                let createdInDb = false;
                let attempts = 0;

                while (!createdInDb && attempts < 3) {
                    attempts++;
                    try {
                        const matricule = `${acc.prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
                        await db.orm.public.User.create({
                            email: acc.email,
                            firstName,
                            lastName,
                            matricule,
                            passwordHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
                            role: acc.role,
                            status: "ACTIVE",
                        });
                        createdInDb = true;
                        console.log(`  ✓ [DB] Profil créé avec succès.`);
                    } catch (dbErr: any) {
                        const errCode = dbErr?.code || dbErr?.original?.code;
                        const constraintName = dbErr?.constraint || dbErr?.constraint_name || dbErr?.detail || "";

                        // Analyse fine : Est-ce une violation d'unicité (23505) ?
                        const isUniqueViolation = errCode === "23505";

                        // Si c'est l'e-mail qui est en double en base, on bloque immédiatement (pas de réessai sur l'e-mail)
                        const isEmailDuplicate = isUniqueViolation && (constraintName.includes("email") || constraintName.includes("User_email_key"));
                        if (isEmailDuplicate) {
                            throw new Error(`Conflit d'unicité : l'e-mail existe déjà en base de données de manière concurrente.`);
                        }

                        // Si c'est une collision de matricule, on autorise un nombre limité de nouvelles tentatives
                        const isMatriculeCollision = isUniqueViolation && (constraintName.includes("matricule") || constraintName.includes("User_matricule_key"));

                        if (isMatriculeCollision && attempts < 3) {
                            console.warn(`⚠️ Collision de matricule détectée (tentative ${attempts}/3). Régénération...`);
                            continue;
                        }
                        throw dbErr;
                    }
                }
            }
        }

        console.log("✨ Processus de provisionnement opérationnel terminé avec succès.");

    } catch (err: unknown) {
        const safeMsg = formatError(err);
        console.error(`❌ Erreur critique de provisionnement : ${safeMsg}`);
        throw err;
    } finally {
        try {
            if (lockAcquired) {
                await releaseAdvisoryLock(db);
                console.log("🔓 Verrou de base de données libéré.");
            }
        } catch (lockErr: unknown) {
            console.error(`⚠️ Avertissement : échec lors de la libération du verrou.`);
        }

        try {
            await db.close();
            console.log("🔌 Connexion base de données fermée.");
        } catch (closeErr: unknown) {
            console.error(`⚠️ Avertissement : échec lors de la fermeture de la connexion.`);
        }
    }
}
