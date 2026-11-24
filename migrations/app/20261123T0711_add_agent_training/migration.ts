#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/22871b24f6858f4540462468a3d9aade0f51c62ad602634ef0e26dd19d80a22b/contract';
import startContract from '../../snapshots/22871b24f6858f4540462468a3d9aade0f51c62ad602634ef0e26dd19d80a22b/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/8d3b71f0c63a80445dab0f57264461ffe8c9460b112057761c13578a2434e665/contract';
import endContract from '../../snapshots/8d3b71f0c63a80445dab0f57264461ffe8c9460b112057761c13578a2434e665/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  foreignKey,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'agent_trainings',
        columns: [
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('agentId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('trainingDate', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
          col('subject', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('trainer', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id'], { name: 'agent_trainings_pkey' }),
          foreignKey(['agentId'], 'users', ['id'], {
            name: 'agent_trainings_agentId_fkey',
            onDelete: 'cascade',
          }),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'agent_trainings',
        index: 'agent_trainings_agentId_idx_8d0ba4f0',
        columns: ['agentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'agent_trainings',
        index: 'agent_trainings_trainingDate_idx_8a2fa075',
        columns: ['trainingDate'],
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'agent_trainings' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
