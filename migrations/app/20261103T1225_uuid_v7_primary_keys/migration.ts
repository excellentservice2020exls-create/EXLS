#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/633533837ef9090e92c5cd44d666b571370f94dd74665a38d855d06078328b36/contract';
import startContract from '../../snapshots/633533837ef9090e92c5cd44d666b571370f94dd74665a38d855d06078328b36/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/7f07d695d4317eb2f479c0e059cbaf49a54f846883dae8891db51d022b59e752/contract';
import endContract from '../../snapshots/7f07d695d4317eb2f479c0e059cbaf49a54f846883dae8891db51d022b59e752/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, rawSql } from '@prisma/orm-postgres/migration';

type ForeignKeyMigrationSpec = {
  table: string;
  name: string;
  columns: readonly string[];
  referencedTable: string;
  onDelete?: 'cascade';
};

const foreignKeys: readonly ForeignKeyMigrationSpec[] = [
  { table: 'attendances', name: 'attendances_shiftId_fkey', columns: ['shiftId'], referencedTable: 'shifts', onDelete: 'cascade' },
  { table: 'attendances', name: 'attendances_agentId_fkey', columns: ['agentId'], referencedTable: 'users' },
  { table: 'attendances', name: 'attendances_verifiedById_fkey', columns: ['verifiedById'], referencedTable: 'users' },
  { table: 'checkpoints', name: 'checkpoints_siteId_fkey', columns: ['siteId'], referencedTable: 'sites', onDelete: 'cascade' },
  { table: 'client_contracts', name: 'client_contracts_clientId_fkey', columns: ['clientId'], referencedTable: 'clients', onDelete: 'cascade' },
  { table: 'contracts', name: 'contracts_service_type_id_fkey', columns: ['service_type_id'], referencedTable: 'contract_service_types' },
  { table: 'equipment_assignments', name: 'equipment_assignments_equipmentId_fkey', columns: ['equipmentId'], referencedTable: 'equipment', onDelete: 'cascade' },
  { table: 'equipment_assignments', name: 'equipment_assignments_agentId_fkey', columns: ['agentId'], referencedTable: 'users' },
  { table: 'equipment_assignments', name: 'equipment_assignments_shiftId_fkey', columns: ['shiftId'], referencedTable: 'shifts' },
  { table: 'incident_attachments', name: 'incident_attachments_incidentId_fkey', columns: ['incidentId'], referencedTable: 'incidents', onDelete: 'cascade' },
  { table: 'incident_comments', name: 'incident_comments_incidentId_fkey', columns: ['incidentId'], referencedTable: 'incidents', onDelete: 'cascade' },
  { table: 'incident_comments', name: 'incident_comments_authorId_fkey', columns: ['authorId'], referencedTable: 'users' },
  { table: 'incidents', name: 'incidents_siteId_fkey', columns: ['siteId'], referencedTable: 'sites', onDelete: 'cascade' },
  { table: 'incidents', name: 'incidents_shiftId_fkey', columns: ['shiftId'], referencedTable: 'shifts' },
  { table: 'incidents', name: 'incidents_patrolId_fkey', columns: ['patrolId'], referencedTable: 'patrols' },
  { table: 'incidents', name: 'incidents_reportedById_fkey', columns: ['reportedById'], referencedTable: 'users' },
  { table: 'incidents', name: 'incidents_assignedToId_fkey', columns: ['assignedToId'], referencedTable: 'users' },
  { table: 'notifications', name: 'notifications_userId_fkey', columns: ['userId'], referencedTable: 'users', onDelete: 'cascade' },
  { table: 'patrol_scans', name: 'patrol_scans_patrolId_fkey', columns: ['patrolId'], referencedTable: 'patrols', onDelete: 'cascade' },
  { table: 'patrol_scans', name: 'patrol_scans_checkpointId_fkey', columns: ['checkpointId'], referencedTable: 'checkpoints', onDelete: 'cascade' },
  { table: 'patrol_scans', name: 'patrol_scans_agentId_fkey', columns: ['agentId'], referencedTable: 'users' },
  { table: 'patrols', name: 'patrols_siteId_fkey', columns: ['siteId'], referencedTable: 'sites', onDelete: 'cascade' },
  { table: 'patrols', name: 'patrols_agentId_fkey', columns: ['agentId'], referencedTable: 'users' },
  { table: 'patrols', name: 'patrols_shiftId_fkey', columns: ['shiftId'], referencedTable: 'shifts' },
  { table: 'role_assignments', name: 'role_assignments_userId_fkey', columns: ['userId'], referencedTable: 'users', onDelete: 'cascade' },
  { table: 'shifts', name: 'shifts_siteId_fkey', columns: ['siteId'], referencedTable: 'sites', onDelete: 'cascade' },
  { table: 'shifts', name: 'shifts_agentId_fkey', columns: ['agentId'], referencedTable: 'users' },
  { table: 'shifts', name: 'shifts_teamLeaderId_fkey', columns: ['teamLeaderId'], referencedTable: 'users' },
  { table: 'shifts', name: 'shifts_supervisorId_fkey', columns: ['supervisorId'], referencedTable: 'users' },
  { table: 'site_equipments', name: 'site_equipments_siteId_fkey', columns: ['siteId'], referencedTable: 'sites', onDelete: 'cascade' },
  { table: 'site_equipments', name: 'site_equipments_equipmentId_fkey', columns: ['equipmentId'], referencedTable: 'equipment', onDelete: 'cascade' },
  { table: 'site_instructions', name: 'site_instructions_siteId_fkey', columns: ['siteId'], referencedTable: 'sites', onDelete: 'cascade' },
  { table: 'site_instructions', name: 'site_instructions_authorId_fkey', columns: ['authorId'], referencedTable: 'users' },
  { table: 'sites', name: 'sites_clientId_fkey', columns: ['clientId'], referencedTable: 'clients', onDelete: 'cascade' },
  { table: 'sites', name: 'sites_managerId_fkey', columns: ['managerId'], referencedTable: 'users' },
  { table: 'sites', name: 'sites_supervisorId_fkey', columns: ['supervisorId'], referencedTable: 'users' },
  { table: 'users', name: 'users_supervisorId_fkey', columns: ['supervisorId'], referencedTable: 'users' },
  { table: 'users', name: 'users_teamLeaderId_fkey', columns: ['teamLeaderId'], referencedTable: 'users' },
] as const;

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  protected override alterColumnType(options: {
    readonly schema: string;
    readonly table: string;
    readonly column: string;
    readonly type: string;
    readonly using?: string;
    readonly operationClass?: 'widening' | 'destructive' | 'data';
  }) {
    return super.alterColumnType({
      ...options,
      using: options.using ?? 'gen_random_uuid()',
    });
  }

  override get operations() {
    const dropForeignKeys = foreignKeys.map(({ table, name }) =>
      this.dropConstraint({ schema: 'public', table, constraint: name, kind: 'foreignKey' }),
    );
    const addForeignKeys = foreignKeys.map(({ table, name, columns, referencedTable, onDelete }) =>
      this.addForeignKey({
        schema: 'public',
        table,
        foreignKey: {
          name,
          columns,
          references: { schema: 'public', table: referencedTable, columns: ['id'] },
          ...(onDelete ? { onDelete } : {}),
        },
      }),
    );

    return [
      rawSql({
        id: 'truncate-erp-data-before-uuid-conversion',
        label: 'Remove existing ERP data before replacing numeric identifiers',
        operationClass: 'destructive',
        target: {
          id: 'postgres',
          details: {
            schema: 'public',
            objectType: 'dependency',
            name: 'uuid_v7_primary_keys',
          },
        },
        precheck: [],
        execute: [{
          description: 'truncate ERP tables before replacing identifiers',
          sql: 'TRUNCATE TABLE "public"."attendances", "public"."checkpoints", "public"."client_contracts", "public"."clients", "public"."contract_service_types", "public"."contracts", "public"."core_equipment", "public"."core_incidents", "public"."equipment", "public"."equipment_assignments", "public"."equipment_categories", "public"."incident_attachments", "public"."incident_categories", "public"."incident_comments", "public"."incidents", "public"."notifications", "public"."patrol_scans", "public"."patrols", "public"."role_assignments", "public"."shifts", "public"."site_equipments", "public"."site_instructions", "public"."sites", "public"."users" RESTART IDENTITY',
        }],
        postcheck: [],
      }),
      rawSql({
        id: 'drop-obsolete-core-equipment-and-incident-tables',
        label: 'Remove obsolete core ERP tables absent from the current contract',
        operationClass: 'destructive',
        target: {
          id: 'postgres',
          details: { schema: 'public', objectType: 'dependency', name: 'legacy-core-tables' },
        },
        precheck: [],
        execute: [{
          description: 'drop obsolete core tables',
          sql: 'DROP TABLE IF EXISTS "public"."core_equipment", "public"."core_incidents" CASCADE',
        }],
        postcheck: [],
      }),
      ...dropForeignKeys,
      this.dropDefault({ schema: 'public', table: 'attendances', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'checkpoints', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'client_contracts', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'clients', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'contracts', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'equipment', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'equipment_assignments', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'incident_attachments', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'incident_comments', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'incidents', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'notifications', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'patrol_scans', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'patrols', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'role_assignments', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'shifts', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'site_equipments', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'site_instructions', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'sites', column: 'id' }),
      this.dropDefault({ schema: 'public', table: 'users', column: 'id' }),
      this.alterColumnType({
        schema: 'public',
        table: 'attendances',
        column: 'agentId',
        type: 'uuid',
      }),
      this.alterColumnType({ schema: 'public', table: 'attendances', column: 'id', type: 'uuid' }),
      this.alterColumnType({
        schema: 'public',
        table: 'attendances',
        column: 'shiftId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'attendances',
        column: 'verifiedById',
        type: 'uuid',
      }),
      this.alterColumnType({ schema: 'public', table: 'checkpoints', column: 'id', type: 'uuid' }),
      this.alterColumnType({
        schema: 'public',
        table: 'checkpoints',
        column: 'siteId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'client_contracts',
        column: 'clientId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'client_contracts',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'clients',
        column: 'createdById',
        type: 'uuid',
      }),
      this.alterColumnType({ schema: 'public', table: 'clients', column: 'id', type: 'uuid' }),
      this.alterColumnType({
        schema: 'public',
        table: 'contract_service_types',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'contracts',
        column: 'service_type_id',
        type: 'uuid',
      }),
      this.alterColumnType({ schema: 'public', table: 'equipment', column: 'id', type: 'uuid' }),
      this.alterColumnType({
        schema: 'public',
        table: 'equipment_assignments',
        column: 'agentId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'equipment_assignments',
        column: 'equipmentId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'equipment_assignments',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'equipment_assignments',
        column: 'shiftId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'equipment_categories',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'incident_attachments',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'incident_attachments',
        column: 'incidentId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'incident_categories',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'incident_comments',
        column: 'authorId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'incident_comments',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'incident_comments',
        column: 'incidentId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'incidents',
        column: 'assignedToId',
        type: 'uuid',
      }),
      this.alterColumnType({ schema: 'public', table: 'incidents', column: 'id', type: 'uuid' }),
      this.alterColumnType({
        schema: 'public',
        table: 'incidents',
        column: 'patrolId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'incidents',
        column: 'reportedById',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'incidents',
        column: 'shiftId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'incidents',
        column: 'siteId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'notifications',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'notifications',
        column: 'userId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'patrol_scans',
        column: 'agentId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'patrol_scans',
        column: 'checkpointId',
        type: 'uuid',
      }),
      this.alterColumnType({ schema: 'public', table: 'patrol_scans', column: 'id', type: 'uuid' }),
      this.alterColumnType({
        schema: 'public',
        table: 'patrol_scans',
        column: 'patrolId',
        type: 'uuid',
      }),
      this.alterColumnType({ schema: 'public', table: 'patrols', column: 'agentId', type: 'uuid' }),
      this.alterColumnType({ schema: 'public', table: 'patrols', column: 'id', type: 'uuid' }),
      this.alterColumnType({ schema: 'public', table: 'patrols', column: 'shiftId', type: 'uuid' }),
      this.alterColumnType({ schema: 'public', table: 'patrols', column: 'siteId', type: 'uuid' }),
      this.alterColumnType({
        schema: 'public',
        table: 'role_assignments',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'role_assignments',
        column: 'userId',
        type: 'uuid',
      }),
      this.alterColumnType({ schema: 'public', table: 'shifts', column: 'agentId', type: 'uuid' }),
      this.alterColumnType({ schema: 'public', table: 'shifts', column: 'id', type: 'uuid' }),
      this.alterColumnType({ schema: 'public', table: 'shifts', column: 'siteId', type: 'uuid' }),
      this.alterColumnType({
        schema: 'public',
        table: 'shifts',
        column: 'supervisorId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'shifts',
        column: 'teamLeaderId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'site_equipments',
        column: 'equipmentId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'site_equipments',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'site_equipments',
        column: 'siteId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'site_instructions',
        column: 'authorId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'site_instructions',
        column: 'id',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'site_instructions',
        column: 'siteId',
        type: 'uuid',
      }),
      this.alterColumnType({ schema: 'public', table: 'sites', column: 'clientId', type: 'uuid' }),
      this.alterColumnType({ schema: 'public', table: 'sites', column: 'id', type: 'uuid' }),
      this.alterColumnType({ schema: 'public', table: 'sites', column: 'managerId', type: 'uuid' }),
      this.alterColumnType({
        schema: 'public',
        table: 'sites',
        column: 'supervisorId',
        type: 'uuid',
      }),
      this.alterColumnType({ schema: 'public', table: 'users', column: 'id', type: 'uuid' }),
      this.alterColumnType({
        schema: 'public',
        table: 'users',
        column: 'supervisorId',
        type: 'uuid',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'users',
        column: 'teamLeaderId',
        type: 'uuid',
      }),
      ...addForeignKeys,
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
