import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

export const contract = contractFromJson<Contract>(contractJson);

type PrismaPostgresClient = ReturnType<typeof postgres>;

const globalForPrisma = globalThis as unknown as {
  prismaDb?: PrismaPostgresClient;
};

export const db: PrismaPostgresClient =
  globalForPrisma.prismaDb ??
  postgres({
    contract,
    url: process.env['DATABASE_URL']!,
    poolOptions: {
      connectionTimeoutMillis: 30_000,
      idleTimeoutMillis: 30_000,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaDb = db;
}
