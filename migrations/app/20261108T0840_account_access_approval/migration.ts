#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/09a9599321e56934e967e64696dcda7347c728a3f41c34637c5f3e325eec2c14/contract';
import endContract from '../../snapshots/09a9599321e56934e967e64696dcda7347c728a3f41c34637c5f3e325eec2c14/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c6dcc89981f8a98e3572aaae0ad6e64b50069e1cebcae1bddee3cdbac713832e/contract';
import startContract from '../../snapshots/c6dcc89981f8a98e3572aaae0ad6e64b50069e1cebcae1bddee3cdbac713832e/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  foreignKey,
  fn,
  lit,
  primaryKey,
  unique,
} from '@prisma/orm-postgres/migration';

const uuidColumn = (name: string, nullable = false) =>
  col(name, 'uuid', {
    notNull: !nullable,
    codecRef: { codecId: 'pg/uuid@1' },
  });

const textColumn = (name: string, defaultValue?: string) =>
  col(name, 'text', {
    notNull: true,
    ...(defaultValue ? { default: lit(defaultValue) } : {}),
    codecRef: { codecId: 'pg/text@1' },
  });

const timestampColumn = (name: string, nullable = false) =>
  col(name, 'timestamptz(3)', {
    notNull: !nullable,
    ...(!nullable ? { default: fn('now()') } : {}),
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
        table: 'security_access_requests',
        columns: [
          uuidColumn('id'),
          uuidColumn('userId'),
          textColumn('sessionId'),
          textColumn('status', 'PENDING'),
          timestampColumn('requestedAt'),
          timestampColumn('decidedAt', true),
          uuidColumn('decidedById', true),
        ],
        constraints: [
          primaryKey(['id'], { name: 'security_access_requests_pkey' }),
          unique(['sessionId'], {
            name: 'security_access_requests_sessionId_key',
          }),
          foreignKey(['userId'], 'users', ['id'], {
            name: 'security_access_requests_userId_fkey',
            onDelete: 'cascade',
          }),
          foreignKey(['decidedById'], 'users', ['id'], {
            name: 'security_access_requests_decidedById_fkey',
            onDelete: 'setNull',
          }),
        ],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'security_access_requests',
        constraint: 'security_access_requests_status_7ebbec5c',
        expression:
          `(status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text]))`,
      }),
      this.createIndex({
        schema: 'public',
        table: 'security_access_requests',
        index: 'security_access_requests_status_requestedAt_idx_27ce3e29',
        columns: ['status', 'requestedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'security_access_requests',
        index: 'security_access_requests_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'security_access_requests',
        index: 'security_access_requests_decidedById_idx_8194d55f',
        columns: ['decidedById'],
      }),
      this.enableRowLevelSecurity({
        schema: 'public',
        table: 'security_access_requests',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
