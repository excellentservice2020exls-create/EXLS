#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/22871b24f6858f4540462468a3d9aade0f51c62ad602634ef0e26dd19d80a22b/contract';
import endContract from '../../snapshots/22871b24f6858f4540462468a3d9aade0f51c62ad602634ef0e26dd19d80a22b/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/b5fe57b44dc4bea771683490e2faa16b43f21cc5c103cea02c9c44a646fb4434/contract';
import startContract from '../../snapshots/b5fe57b44dc4bea771683490e2faa16b43f21cc5c103cea02c9c44a646fb4434/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  foreignKey,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';

const textColumn = (name: string) =>
  col(name, 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } });

const uuidColumn = (name: string) =>
  col(name, 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } });

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'role_assignments',
        constraint: 'role_assignments_role_check_3b8a4a49',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'role_assignments',
        constraint: 'role_assignments_role_check_3b8a4a49',
        expression: `"role" IN ('ADMIN', 'MANAGER', 'DIRECTOR', 'SUPERVISOR', 'TEAM_LEADER', 'AGENT')`,
      }),
      this.createTable({
        schema: 'public',
        table: 'auth_sign_in_rate_limits',
        columns: [
          textColumn('keyHash'),
          col('windowStartedAt', 'timestamptz(6)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 6 } },
          }),
          col('requestCount', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['keyHash'], { name: 'auth_sign_in_rate_limits_pkey' })],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'auth_sign_in_rate_limits',
        constraint: 'auth_sign_in_rate_limits_requestCount_check',
        expression: '"requestCount" > 0',
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_sign_in_rate_limits',
        index: 'auth_sign_in_rate_limits_windowStartedAt_idx',
        columns: ['windowStartedAt'],
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'auth_sign_in_rate_limits' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
