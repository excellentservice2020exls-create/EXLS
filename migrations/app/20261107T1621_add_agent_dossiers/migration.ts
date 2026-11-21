#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/633533837ef9090e92c5cd44d666b571370f94dd74665a38d855d06078328b36/contract';
import startContract from '../../snapshots/633533837ef9090e92c5cd44d666b571370f94dd74665a38d855d06078328b36/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c6dcc89981f8a98e3572aaae0ad6e64b50069e1cebcae1bddee3cdbac713832e/contract';
import endContract from '../../snapshots/c6dcc89981f8a98e3572aaae0ad6e64b50069e1cebcae1bddee3cdbac713832e/contract.json' with { type: 'json' };
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

const uuidColumn = (name: string) =>
  col(name, 'uuid', {
    notNull: true,
    codecRef: { codecId: 'pg/uuid@1' },
  });

const textColumn = (name: string, nullable = false) =>
  col(name, 'text', {
    notNull: !nullable,
    codecRef: { codecId: 'pg/text@1' },
  });

const birthDateColumn = () =>
  col('birthDate', 'date', {
    notNull: true,
    codecRef: { codecId: 'pg/date-string@1' },
  });

const timestampColumn = (name: string) =>
  col(name, 'timestamptz(3)', {
    notNull: true,
    default: fn('now()'),
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
        table: 'agent_applications',
        columns: [
          uuidColumn('id'),
          birthDateColumn(),
          textColumn('birthPlace'),
          timestampColumn('createdAt'),
          textColumn('educationLevel'),
          textColumn('firstName'),
          textColumn('gender'),
          textColumn('lastName'),
          textColumn('nationality'),
          textColumn('phone'),
          textColumn('phone2', true),
          textColumn('postName'),
          textColumn('residentialAddress'),
          textColumn('residentialAddress2', true),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          timestampColumn('updatedAt'),
        ],
        constraints: [
          primaryKey(['id'], { name: 'agent_applications_pkey' }),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'agent_identities',
        columns: [
          uuidColumn('id'),
          uuidColumn('agentApplicationId'),
          birthDateColumn(),
          textColumn('birthPlace'),
          timestampColumn('createdAt'),
          textColumn('district'),
          textColumn('fatherName'),
          textColumn('firstName'),
          textColumn('gender'),
          textColumn('lastName'),
          textColumn('maritalStatus'),
          textColumn('motherName'),
          textColumn('nationality'),
          textColumn('phone'),
          textColumn('phone2', true),
          textColumn('postName'),
          textColumn('professionalExperiences', true),
          textColumn('province'),
          textColumn('residentialAddress'),
          textColumn('residentialAddress2', true),
          textColumn('sector'),
          textColumn('studies', true),
          textColumn('territory'),
          textColumn('additionalTrainings', true),
          textColumn('spokenLanguages', true),
        ],
        constraints: [
          primaryKey(['id'], { name: 'agent_identities_pkey' }),
          unique(['agentApplicationId'], {
            name: 'agent_identities_agentApplicationId_key',
          }),
          foreignKey(
            ['agentApplicationId'],
            'agent_applications',
            ['id'],
            {
              name: 'agent_identities_agentApplicationId_fkey',
              onDelete: 'cascade',
            },
          ),
        ],
      }),
      this.enableRowLevelSecurity({
        schema: 'public',
        table: 'agent_applications',
      }),
      this.enableRowLevelSecurity({
        schema: 'public',
        table: 'agent_identities',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
