import 'dotenv/config';
import { realpathSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

async function importCanonical<T>(specifier: string): Promise<T> {
  const resolvedUrl = import.meta.resolve(specifier);
  const canonicalUrl = pathToFileURL(
    realpathSync(fileURLToPath(resolvedUrl)),
  ).href;

  return import(canonicalUrl) as Promise<T>;
}

const [{ definePrismaConfig }, { defineConfig: ormConfig }] = await Promise.all([
  importCanonical<typeof import('@prisma/cli-engine')>('@prisma/cli-engine'),
  importCanonical<typeof import('@prisma/orm-postgres/config')>(
    '@prisma/orm-postgres/config',
  ),
]);

export default definePrismaConfig({
  orm: ormConfig({
    contract: './prisma/contract.prisma',
    db: {
      connection: process.env['DIRECT_URL'] ?? process.env['DATABASE_URL']!,
    },
  }),
});
