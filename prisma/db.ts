import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

export const contract = contractFromJson<Contract>(contractJson);

const contractMarker = (contractJson as {
  meta?: { storageHash?: string };
}).meta?.storageHash ?? "unknown";

function createDb() {
  return postgres({
    contract,
    url: process.env['DATABASE_URL']!,
    poolOptions: {
      connectionTimeoutMillis: 30_000,
      idleTimeoutMillis: 30_000,
    },
  });
}

type PrismaPostgresClient = ReturnType<typeof createDb>;

const globalForPrisma = globalThis as unknown as {
  prismaDb?: PrismaPostgresClient;
  prismaContractMarker?: string;
};

export const db: PrismaPostgresClient =
  globalForPrisma.prismaDb && globalForPrisma.prismaContractMarker === contractMarker
    ? globalForPrisma.prismaDb
    : createDb();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaDb = db;
  globalForPrisma.prismaContractMarker = contractMarker;
}
