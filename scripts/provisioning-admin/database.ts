import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import contractJson from "../../prisma/contract.json" with { type: "json" };

const contract = contractFromJson(contractJson);

export function getDatabaseClient(databaseUrl: string) {
  return postgres({ contract, url: databaseUrl });
}

/**
 * Acquiert un verrou consultatif PostgreSQL global pour empêcher l'exécution concurrente des scripts.
 */
export async function acquireAdvisoryLock(
  db: ReturnType<typeof getDatabaseClient>,
): Promise<void> {
  // Clé arbitraire unique pour le verrou de provisionnement EXLS
  const lockKey = 987654321;
  const plan = db.raw.sql`SELECT pg_try_advisory_lock(${lockKey}) AS locked`
    .returnsRow({ locked: "pg/bool@1" })
    .build();
  const [{ locked }] = await db.query(plan);

  if (!locked) {
    throw new Error("Une autre instance de provisionnement est déjà en cours d'exécution.");
  }
}

export async function releaseAdvisoryLock(
  db: ReturnType<typeof getDatabaseClient>,
): Promise<void> {
  const lockKey = 987654321;
  const plan = db.raw.sql`SELECT pg_advisory_unlock(${lockKey}) AS unlocked`
    .returnsRow({ unlocked: "pg/bool@1" })
    .build();
  await db.query(plan);
}