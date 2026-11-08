#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/09a9599321e56934e967e64696dcda7347c728a3f41c34637c5f3e325eec2c14/contract';
import startContract from '../../snapshots/09a9599321e56934e967e64696dcda7347c728a3f41c34637c5f3e325eec2c14/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/b5fe57b44dc4bea771683490e2faa16b43f21cc5c103cea02c9c44a646fb4434/contract';
import endContract from '../../snapshots/b5fe57b44dc4bea771683490e2faa16b43f21cc5c103cea02c9c44a646fb4434/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  primaryKey,
  unique,
} from '@prisma/orm-postgres/migration';

const uuidColumn = (name: string) =>
  col(name, 'uuid', {
    notNull: true,
    codecRef: { codecId: 'pg/uuid@1' },
  });

const textColumn = (name: string) =>
  col(name, 'text', {
    notNull: true,
    codecRef: { codecId: 'pg/text@1' },
  });

const timestampColumn = (name: string) =>
  col(name, 'timestamptz(3)', {
    notNull: true,
    codecRef: {
      codecId: 'pg/timestamptz-date@1',
      typeParams: { precision: 3 },
    },
  });

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'app_auth_sessions',
        columns: [
          uuidColumn('id'),
          uuidColumn('authUserId'),
          textColumn('sessionId'),
          timestampColumn('createdAt'),
          timestampColumn('expiresAt'),
        ],
        constraints: [
          primaryKey(['id'], { name: 'app_auth_sessions_pkey' }),
          unique(['sessionId'], { name: 'app_auth_sessions_sessionId_key' }),
        ],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'app_auth_sessions',
        constraint: 'app_auth_sessions_expiration_de2b345a',
        expression: `"expiresAt" > "createdAt"`,
      }),
      this.createIndex({
        schema: 'public',
        table: 'app_auth_sessions',
        index: 'app_auth_sessions_expiresAt_idx_6b6b8c10',
        columns: ['expiresAt'],
      }),
      this.enableRowLevelSecurity({
        schema: 'public',
        table: 'app_auth_sessions',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
