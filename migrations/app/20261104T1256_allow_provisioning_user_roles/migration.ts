#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/7f07d695d4317eb2f479c0e059cbaf49a54f846883dae8891db51d022b59e752/contract';
import startContract from '../../snapshots/7f07d695d4317eb2f479c0e059cbaf49a54f846883dae8891db51d022b59e752/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a1acb21fd19abc1d0ead33c46cac404089ffe1c4854a93e4c40c3cb0ffc63086/contract';
import endContract from '../../snapshots/a1acb21fd19abc1d0ead33c46cac404089ffe1c4854a93e4c40c3cb0ffc63086/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'users',
        constraint: 'users_role_check_3b8a4a49',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'users',
        constraint: 'users_role_check_3b8a4a49',
        expression:
          `"role" IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DIRECTOR', 'SUPERVISOR', 'TEAM_LEADER', 'AGENT', 'USER')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
