import { createHash, randomBytes } from "node:crypto";
import { getBaseConfig, UserRole } from "./config";
import { isValidEmail } from "./validation";
import { listAllUsers, requestAdminApi, SupabaseUser } from "./supabase-admin";
import { getDatabaseClient, acquireAdvisoryLock, releaseAdvisoryLock } from "./database";

function parseName(fullName: string) {
  const [firstName, ...lastNameParts] = fullName.split(/\s+/).filter(Boolean);
  return {
    firstName: firstName || "Utilisateur",
    lastName: lastNameParts.join(" ") || firstName || "EXLS",
  };
}

export async function runProvisioning() {
  const env = getBaseConfig();
  const db = getDatabaseClient(env.databaseUrl);

  try {
    await acquireAdvisoryLock(db);
    console.log("🔒 Verrou exclusif de base de données acquis.");

    // Récupération unique de la photographie globale de Supabase Auth
    let users = await listAllUsers(env.supabaseUrl, env.serviceRoleKey);
    const userMap = new Map<string, SupabaseUser>();
    for (const u of users) {
      if (u.email) userMap.set(u.email.toLowerCase(), u);
    }

    // ----------------------------------------------------
    // 1. PROVISIONNEMENT SUPER_ADMIN
    // ----------------------------------------------------
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME?.trim() || "Super Administrateur";

    if (superAdminEmail && superAdminPassword) {
      if (!isValidEmail(superAdminEmail)) throw new Error("SUPER_ADMIN_EMAIL invalide.");

      // Vérification unicité PostgreSQL
      const existingSuperAdmins = await db.orm.public.User
        .where({ role: "SUPER_ADMIN" })
        .select("id", "email", "role", "adminLock")
        .all();

      if (existingSuperAdmins.some((u: any) => u.email?.trim().toLowerCase() !== superAdminEmail)) {
        throw new Error("Un autre SUPER_ADMIN existe déjà dans PostgreSQL.");
      }

      const superAdminsInAuth = users.filter((u) => u.app_metadata?.role === "SUPER_ADMIN");
      if (superAdminsInAuth.length > 0 && superAdminsInAuth[0].email?.toLowerCase() !== superAdminEmail) {
        throw new Error("Conflit critique : un autre SUPER_ADMIN existe dans Supabase Auth.");
      }

      let superAdminUser = userMap.get(superAdminEmail);
      if (!superAdminUser) {
        const endpoint = new URL("/auth/v1/admin/users", env.supabaseUrl);
        const result = await requestAdminApi<any>(endpoint, env.serviceRoleKey, {
          method: "POST",
          body: JSON.stringify({
            email: superAdminEmail,
            password: superAdminPassword,
            email_confirm: true,
            user_metadata: { name: superAdminName },
            app_metadata: { role: "SUPER_ADMIN" },
          }),
        });

        const created = result?.user ?? result;
        if (!created || created.email?.toLowerCase() !== superAdminEmail || created.app_metadata?.role !== "SUPER_ADMIN") {
          throw new Error("Supabase n'a pas confirmé la création du SUPER_ADMIN.");
        }
        superAdminUser = created;
      }

      // Sync Postgres
      const escapedEmail = superAdminEmail.replace(/[\\%_]/g, "\\$&");
      const profiles = await db.orm.public.User
        .where((user: any) => user.email.ilike(escapedEmail))
        .select("id", "email", "role", "adminLock", "status")
        .limit(2)
        .all();

      if (profiles.length > 1) throw new Error("Doublon détecté pour le SUPER_ADMIN en base.");

      const { firstName, lastName } = parseName(superAdminName);
      if (profiles.length > 0) {
        const profile = profiles[0];
        if (profile.role && profile.role !== "SUPER_ADMIN") {
          throw new Error(`Conflit de rôle PostgreSQL : ${profile.role}. Promotion explicite requise.`);
        }
        if (profile.adminLock && profile.adminLock !== "SUPER_GLOBAL_ADMIN") {
          throw new Error("Verrouillage incompatible avec SUPER_ADMIN.");
        }
        await db.orm.public.User.where({ id: profile.id }).update({
          role: "SUPER_ADMIN",
          adminLock: "SUPER_GLOBAL_ADMIN",
        });
      } else {
        await db.orm.public.User.create({
          email: superAdminEmail,
          firstName,
          lastName,
          matricule: `SUPADMIN-${randomBytes(4).toString("hex").toUpperCase()}`,
          passwordHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          adminLock: "SUPER_GLOBAL_ADMIN",
        });
      }
      console.log(`[SUPER_ADMIN] ${superAdminEmail} provisionné avec succès.`);
    }

    // ----------------------------------------------------
    // 2. PROVISIONNEMENT ADMIN
    // ----------------------------------------------------
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME?.trim() || "Administrateur";

    if (adminEmail && adminPassword) {
      if (!isValidEmail(adminEmail)) throw new Error("ADMIN_EMAIL invalide.");

      const otherAdmins = await db.orm.public.User
        .where({ role: "ADMIN" })
        .select("id", "email")
        .all();

      if (otherAdmins.some((u: any) => u.email?.trim().toLowerCase() !== adminEmail)) {
        throw new Error("Un autre ADMIN existe déjà dans PostgreSQL.");
      }

      let adminUser = userMap.get(adminEmail);
      if (!adminUser) {
        const endpoint = new URL("/auth/v1/admin/users", env.supabaseUrl);
        const result = await requestAdminApi<any>(endpoint, env.serviceRoleKey, {
          method: "POST",
          body: JSON.stringify({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { name: adminName },
            app_metadata: { role: "ADMIN" },
          }),
        });
        adminUser = result?.user ?? result;
      }

      const escapedEmail = adminEmail.replace(/[\\%_]/g, "\\$&");
      const profiles = await db.orm.public.User
        .where((user: any) => user.email.ilike(escapedEmail))
        .select("id", "email", "role", "adminLock")
        .limit(2)
        .all();

      if (profiles.length > 1) throw new Error("Doublon détecté pour l'ADMIN en base.");

      const { firstName, lastName } = parseName(adminName);
      if (profiles.length > 0) {
        const profile = profiles[0];
        if (profile.role && profile.role !== "ADMIN") {
          throw new Error(`Conflit de rôle PostgreSQL : ${profile.role}`);
        }
        await db.orm.public.User.where({ id: profile.id }).update({
          role: "ADMIN",
          adminLock: "GLOBAL_ADMIN",
        });
      } else {
        await db.orm.public.User.create({
          email: adminEmail,
          firstName,
          lastName,
          matricule: `ADMIN-${randomBytes(4).toString("hex").toUpperCase()}`,
          passwordHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
          role: "ADMIN",
          status: "ACTIVE",
          adminLock: "GLOBAL_ADMIN",
        });
      }
      console.log(`[ADMIN] ${adminEmail} provisionné avec succès.`);
    }

  } finally {
    await releaseAdvisoryLock(db);
    await db.close();
    console.log("🔓 Verrou libéré et connexion fermée.");
  }
}