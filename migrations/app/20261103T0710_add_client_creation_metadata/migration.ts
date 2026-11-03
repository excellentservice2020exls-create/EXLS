#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/56ee8d8239480e425db4af4bb825ef86a709b5b0dc5d5780400c34f87df585c7/contract';
import startContract from '../../snapshots/56ee8d8239480e425db4af4bb825ef86a709b5b0dc5d5780400c34f87df585c7/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/633533837ef9090e92c5cd44d666b571370f94dd74665a38d855d06078328b36/contract';
import endContract from '../../snapshots/633533837ef9090e92c5cd44d666b571370f94dd74665a38d855d06078328b36/contract.json' with { type: 'json' };
import { col, Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'clients',
        column: col('createdByEmail', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'clients',
        column: col('createdById', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'clients',
        column: col('createdByName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
