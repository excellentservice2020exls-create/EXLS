#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/a1acb21fd19abc1d0ead33c46cac404089ffe1c4854a93e4c40c3cb0ffc63086/contract';
import startContract from '../../snapshots/a1acb21fd19abc1d0ead33c46cac404089ffe1c4854a93e4c40c3cb0ffc63086/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d34b7ec0195aa728155605f1627098ad2d67ef562c18d691d1848f1772d0adba/contract';
import endContract from '../../snapshots/d34b7ec0195aa728155605f1627098ad2d67ef562c18d691d1848f1772d0adba/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('birthDate', 'timestamptz(3)', {
          codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('birthPlace', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('educationLevel', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('phone2', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('postName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('residentialAddress', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('residentialAddress2', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('studies', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
