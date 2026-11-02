#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/56ee8d8239480e425db4af4bb825ef86a709b5b0dc5d5780400c34f87df585c7/contract';
import endContract from '../../snapshots/56ee8d8239480e425db4af4bb825ef86a709b5b0dc5d5780400c34f87df585c7/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'attendances',
        columns: [
          col('agentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('clockInLatitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('clockInLongitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('clockInMethod', 'text', {
            notNull: true,
            default: lit('QR_SCAN'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('clockInTime', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('clockOutLatitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('clockOutLongitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('clockOutTime', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lateMinutes', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('shiftId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('ON_TIME'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('verificationNotes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('verifiedById', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'attendances_clockInMethod_check_f1817fd0',
            sql`"clockInMethod" IN ('QR_SCAN', 'GPS_GEOFENCE', 'SUPERVISOR_OVERRIDE')`,
          ),
          checkExpression(
            'attendances_status_check_acacb634',
            sql`"status" IN ('ON_TIME', 'LATE', 'PRESENT', 'ABSENT', 'EARLY_DEPARTURE', 'VERIFIED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'checkpoints',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('floorLocation', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isRequired', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('latitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('longitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('nfcTagId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('orderIndex', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('qrCodeData', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('siteId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'client_contracts',
        columns: [
          col('clientId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('contractNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('endDate', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('hourlyRate', 'numeric(10,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('serviceType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('startDate', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'client_contracts_serviceType_check_8cfda18d',
            sql`"serviceType" IN ('STATIC_GUARDING', 'MOBILE_PATROL', 'EVENT_SECURITY', 'VIP_PROTECTION', 'DOG_HANDLER')`,
          ),
          checkExpression(
            'client_contracts_status_check_814bd882',
            sql`"status" IN ('ACTIVE', 'EXPIRED', 'TERMINATED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'clients',
        columns: [
          col('billingAddress', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('city', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('contactEmail', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('contactName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('contactPhone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('postalCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'contract_service_types',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('is_active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'contracts',
        columns: [
          col('client_name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('end_date', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('service_type_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('start_date', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'contracts_status_check_814bd882',
            sql`"status" IN ('ACTIVE', 'EXPIRED', 'TERMINATED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'core_equipment',
        columns: [
          col('category_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('condition', 'text', {
            notNull: true,
            default: lit('EXCELLENT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('serial_number', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('AVAILABLE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'core_equipment_condition_check_c3464631',
            sql`"condition" IN ('EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED')`,
          ),
          checkExpression(
            'core_equipment_status_check_ca4725d1',
            sql`"status" IN ('AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'DAMAGED', 'LOST', 'RETIRED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'core_incidents',
        columns: [
          col('category_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('reported_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('severity', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('NEW'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'core_incidents_severity_check_5e5a5e80',
            sql`"severity" IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`,
          ),
          checkExpression(
            'core_incidents_status_check_50d14964',
            sql`"status" IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'equipment',
        columns: [
          col('category', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lastInspectionDate', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('purchaseDate', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('serialNumber', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('AVAILABLE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'equipment_category_check_03887e0a',
            sql`"category" IN ('RADIO_COMMUNICATION', 'LIGHTING', 'DEFENSE_AND_PPE', 'DETECTION', 'KEYS_AND_BADGES', 'PTI_DEVICE', 'VEHICLE')`,
          ),
          checkExpression(
            'equipment_status_check_ca4725d1',
            sql`"status" IN ('AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'DAMAGED', 'LOST', 'RETIRED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'equipment_assignments',
        columns: [
          col('agentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('anomalyReported', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('assignedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('conditionOnAssignment', 'text', {
            notNull: true,
            default: lit('GOOD'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('conditionOnReturn', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('equipmentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('returnedAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('shiftId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'equipment_assignments_conditionOnAssignment_check_cd969df4',
            sql`"conditionOnAssignment" IN ('EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED')`,
          ),
          checkExpression(
            'equipment_assignments_conditionOnReturn_check_fc912f52',
            sql`"conditionOnReturn" IN ('EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'equipment_categories',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('is_active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'incident_attachments',
        columns: [
          col('caption', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('fileName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fileSize', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('fileType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fileUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('incidentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('uploadedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'incident_categories',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('is_active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'incident_comments',
        columns: [
          col('authorId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('comment', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('incidentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'incidents',
        columns: [
          col('actionTaken', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('assignedToId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('category', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('clientNotified', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('incidentNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('locationDetail', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('occurredAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('patrolId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('policeCalled', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('reportedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('reportedById', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('resolutionSummary', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('resolvedAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('severity', 'text', {
            notNull: true,
            default: lit('MEDIUM'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('shiftId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('siteId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('NEW'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'incidents_category_check_c2d2dc6c',
            sql`"category" IN ('INTRUSION', 'FIRE_ALARM', 'THEFT', 'VANDALISM', 'AGGRESSION', 'TECHNICAL_FAILURE', 'MEDICAL_EMERGENCY', 'ACCESS_DENIAL', 'SUSPICIOUS_PERSON', 'OTHER')`,
          ),
          checkExpression(
            'incidents_severity_check_5e5a5e80',
            sql`"severity" IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`,
          ),
          checkExpression(
            'incidents_status_check_50d14964',
            sql`"status" IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'notifications',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isRead', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('readAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('SYSTEM'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'notifications_type_check_c46f6706',
            sql`"type" IN ('SOS_ALERT', 'LATE_CLOCK_IN', 'PATROL_MISSED', 'INCIDENT_CRITICAL', 'SHIFT_ASSIGNED', 'SYSTEM')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'patrol_scans',
        columns: [
          col('agentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('anomalyDescription', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('checkpointId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('latitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('longitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('patrolId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('scanMethod', 'text', {
            notNull: true,
            default: lit('QR'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('scannedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('OK'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'patrol_scans_status_check_4e0b1ed4',
            sql`"status" IN ('OK', 'ANOMALY_DETECTED', 'MISSED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'patrols',
        columns: [
          col('agentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('completedAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('scannedCheckpoints', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('scheduledStartTime', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('shiftId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('siteId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('startedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('IN_PROGRESS'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('totalCheckpoints', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'patrols_status_check_7f8da3e7',
            sql`"status" IN ('IN_PROGRESS', 'COMPLETED', 'INCOMPLETE', 'ABORTED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'shifts',
        columns: [
          col('agentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('endTime', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('hourlyRate', 'numeric(10,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('shiftType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('siteId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('startTime', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('SCHEDULED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('supervisorId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('teamLeaderId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'shifts_shiftType_check_5a43ab5b',
            sql`"shiftType" IN ('DAY', 'NIGHT', 'WEEKEND', 'WEEKDAY', 'FULL_TIME', 'PART_TIME', 'REINFORCEMENT', 'DOG_PATROL')`,
          ),
          checkExpression(
            'shifts_status_check_51c56842',
            sql`"status" IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'REPLACED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'site_equipments',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('equipmentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('installedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('siteId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'site_instructions',
        columns: [
          col('authorId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('effectiveFrom', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('effectiveUntil', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('priority', 'text', {
            notNull: true,
            default: lit('NORMAL'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('siteId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('PERMANENT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'site_instructions_priority_check_72dbae57',
            sql`"priority" IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')`,
          ),
          checkExpression(
            'site_instructions_type_check_f1605544',
            sql`"type" IN ('PERMANENT', 'TEMPORARY', 'EMERGENCY_PROCEDURE', 'ACCESS_CONTROL')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'sites',
        columns: [
          col('accessCode', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('address', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('city', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('clientId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('emergencyPhone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('generalInstructions', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('geofenceRadius', 'int4', {
            notNull: true,
            default: lit(100),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('latitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('longitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('managerId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('postalCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('supervisorId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('adminLock', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('cnapsExpiration', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('cnapsNumber', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('firstName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lastName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('matricule', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('mustChangePassword', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('AGENT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('supervisorId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('teamLeaderId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'users_role_check_3f12cb29',
            sql`"role" IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'TEAM_LEADER', 'AGENT', 'USER')`,
          ),
          checkExpression(
            'users_status_check_299522e6',
            sql`"status" IN ('ACTIVE', 'SUSPENDED', 'DESERTER', 'DISMISSED', 'ARCHIVED')`,
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'attendances',
        constraint: 'attendances_shiftId_key',
        columns: ['shiftId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'checkpoints',
        constraint: 'checkpoints_qrCodeData_key',
        columns: ['qrCodeData'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'client_contracts',
        constraint: 'client_contracts_contractNumber_key',
        columns: ['contractNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'clients',
        constraint: 'clients_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'core_equipment',
        constraint: 'core_equipment_serial_number_key',
        columns: ['serial_number'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'equipment',
        constraint: 'equipment_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'equipment',
        constraint: 'equipment_serialNumber_key',
        columns: ['serialNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'incidents',
        constraint: 'incidents_incidentNumber_key',
        columns: ['incidentNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'site_equipments',
        constraint: 'site_equipments_siteId_equipmentId_key',
        columns: ['siteId', 'equipmentId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'sites',
        constraint: 'sites_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_matricule_key',
        columns: ['matricule'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_adminLock_key',
        columns: ['adminLock'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attendances',
        index: 'attendances_agentId_idx_8d0ba4f0',
        columns: ['agentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attendances',
        index: 'attendances_verifiedById_idx_dfd74b37',
        columns: ['verifiedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'checkpoints',
        index: 'checkpoints_siteId_idx_cabdc5ab',
        columns: ['siteId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'client_contracts',
        index: 'client_contracts_clientId_idx_153a9a49',
        columns: ['clientId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'contracts',
        index: 'contracts_service_type_id_idx_2ed171c9',
        columns: ['service_type_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'core_equipment',
        index: 'core_equipment_category_id_idx_da7213d4',
        columns: ['category_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'core_incidents',
        index: 'core_incidents_category_id_idx_da7213d4',
        columns: ['category_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'equipment_assignments',
        index: 'equipment_assignments_agentId_idx_8d0ba4f0',
        columns: ['agentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'equipment_assignments',
        index: 'equipment_assignments_equipmentId_idx_e1548594',
        columns: ['equipmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'equipment_assignments',
        index: 'equipment_assignments_shiftId_idx_fee8a58d',
        columns: ['shiftId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'incident_attachments',
        index: 'incident_attachments_incidentId_idx_20b6f3c9',
        columns: ['incidentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'incident_comments',
        index: 'incident_comments_authorId_idx_e47547ed',
        columns: ['authorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'incident_comments',
        index: 'incident_comments_incidentId_idx_20b6f3c9',
        columns: ['incidentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'incidents',
        index: 'incidents_assignedToId_idx_45a131c2',
        columns: ['assignedToId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'incidents',
        index: 'incidents_patrolId_idx_d6f44378',
        columns: ['patrolId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'incidents',
        index: 'incidents_reportedById_idx_4bd24876',
        columns: ['reportedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'incidents',
        index: 'incidents_shiftId_idx_fee8a58d',
        columns: ['shiftId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'incidents',
        index: 'incidents_siteId_idx_cabdc5ab',
        columns: ['siteId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'patrol_scans',
        index: 'patrol_scans_agentId_idx_8d0ba4f0',
        columns: ['agentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'patrol_scans',
        index: 'patrol_scans_checkpointId_idx_4eb4c383',
        columns: ['checkpointId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'patrol_scans',
        index: 'patrol_scans_patrolId_idx_d6f44378',
        columns: ['patrolId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'patrols',
        index: 'patrols_agentId_idx_8d0ba4f0',
        columns: ['agentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'patrols',
        index: 'patrols_shiftId_idx_fee8a58d',
        columns: ['shiftId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'patrols',
        index: 'patrols_siteId_idx_cabdc5ab',
        columns: ['siteId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'shifts',
        index: 'shifts_agentId_idx_8d0ba4f0',
        columns: ['agentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'shifts',
        index: 'shifts_siteId_idx_cabdc5ab',
        columns: ['siteId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'shifts',
        index: 'shifts_supervisorId_idx_fe423ed5',
        columns: ['supervisorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'shifts',
        index: 'shifts_teamLeaderId_idx_1d5c7be0',
        columns: ['teamLeaderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'site_equipments',
        index: 'site_equipments_equipmentId_idx_e1548594',
        columns: ['equipmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'site_equipments',
        index: 'site_equipments_siteId_idx_cabdc5ab',
        columns: ['siteId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'site_instructions',
        index: 'site_instructions_authorId_idx_e47547ed',
        columns: ['authorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'site_instructions',
        index: 'site_instructions_siteId_idx_cabdc5ab',
        columns: ['siteId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sites',
        index: 'sites_clientId_idx_153a9a49',
        columns: ['clientId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sites',
        index: 'sites_managerId_idx_f8369ba6',
        columns: ['managerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sites',
        index: 'sites_supervisorId_idx_fe423ed5',
        columns: ['supervisorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_supervisorId_idx_fe423ed5',
        columns: ['supervisorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_teamLeaderId_idx_1d5c7be0',
        columns: ['teamLeaderId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attendances',
        foreignKey: {
          name: 'attendances_shiftId_fkey',
          columns: ['shiftId'],
          references: { schema: 'public', table: 'shifts', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attendances',
        foreignKey: {
          name: 'attendances_agentId_fkey',
          columns: ['agentId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attendances',
        foreignKey: {
          name: 'attendances_verifiedById_fkey',
          columns: ['verifiedById'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'checkpoints',
        foreignKey: {
          name: 'checkpoints_siteId_fkey',
          columns: ['siteId'],
          references: { schema: 'public', table: 'sites', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'client_contracts',
        foreignKey: {
          name: 'client_contracts_clientId_fkey',
          columns: ['clientId'],
          references: { schema: 'public', table: 'clients', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'contracts',
        foreignKey: {
          name: 'contracts_service_type_id_fkey',
          columns: ['service_type_id'],
          references: { schema: 'public', table: 'contract_service_types', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'core_equipment',
        foreignKey: {
          name: 'core_equipment_category_id_fkey',
          columns: ['category_id'],
          references: { schema: 'public', table: 'equipment_categories', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'core_incidents',
        foreignKey: {
          name: 'core_incidents_category_id_fkey',
          columns: ['category_id'],
          references: { schema: 'public', table: 'incident_categories', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'equipment_assignments',
        foreignKey: {
          name: 'equipment_assignments_equipmentId_fkey',
          columns: ['equipmentId'],
          references: { schema: 'public', table: 'equipment', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'equipment_assignments',
        foreignKey: {
          name: 'equipment_assignments_agentId_fkey',
          columns: ['agentId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'equipment_assignments',
        foreignKey: {
          name: 'equipment_assignments_shiftId_fkey',
          columns: ['shiftId'],
          references: { schema: 'public', table: 'shifts', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'incident_attachments',
        foreignKey: {
          name: 'incident_attachments_incidentId_fkey',
          columns: ['incidentId'],
          references: { schema: 'public', table: 'incidents', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'incident_comments',
        foreignKey: {
          name: 'incident_comments_incidentId_fkey',
          columns: ['incidentId'],
          references: { schema: 'public', table: 'incidents', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'incident_comments',
        foreignKey: {
          name: 'incident_comments_authorId_fkey',
          columns: ['authorId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'incidents',
        foreignKey: {
          name: 'incidents_siteId_fkey',
          columns: ['siteId'],
          references: { schema: 'public', table: 'sites', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'incidents',
        foreignKey: {
          name: 'incidents_shiftId_fkey',
          columns: ['shiftId'],
          references: { schema: 'public', table: 'shifts', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'incidents',
        foreignKey: {
          name: 'incidents_patrolId_fkey',
          columns: ['patrolId'],
          references: { schema: 'public', table: 'patrols', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'incidents',
        foreignKey: {
          name: 'incidents_reportedById_fkey',
          columns: ['reportedById'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'incidents',
        foreignKey: {
          name: 'incidents_assignedToId_fkey',
          columns: ['assignedToId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'notifications',
        foreignKey: {
          name: 'notifications_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'patrol_scans',
        foreignKey: {
          name: 'patrol_scans_patrolId_fkey',
          columns: ['patrolId'],
          references: { schema: 'public', table: 'patrols', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'patrol_scans',
        foreignKey: {
          name: 'patrol_scans_checkpointId_fkey',
          columns: ['checkpointId'],
          references: { schema: 'public', table: 'checkpoints', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'patrol_scans',
        foreignKey: {
          name: 'patrol_scans_agentId_fkey',
          columns: ['agentId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'patrols',
        foreignKey: {
          name: 'patrols_siteId_fkey',
          columns: ['siteId'],
          references: { schema: 'public', table: 'sites', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'patrols',
        foreignKey: {
          name: 'patrols_agentId_fkey',
          columns: ['agentId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'patrols',
        foreignKey: {
          name: 'patrols_shiftId_fkey',
          columns: ['shiftId'],
          references: { schema: 'public', table: 'shifts', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'shifts',
        foreignKey: {
          name: 'shifts_siteId_fkey',
          columns: ['siteId'],
          references: { schema: 'public', table: 'sites', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'shifts',
        foreignKey: {
          name: 'shifts_agentId_fkey',
          columns: ['agentId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'shifts',
        foreignKey: {
          name: 'shifts_teamLeaderId_fkey',
          columns: ['teamLeaderId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'shifts',
        foreignKey: {
          name: 'shifts_supervisorId_fkey',
          columns: ['supervisorId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'site_equipments',
        foreignKey: {
          name: 'site_equipments_siteId_fkey',
          columns: ['siteId'],
          references: { schema: 'public', table: 'sites', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'site_equipments',
        foreignKey: {
          name: 'site_equipments_equipmentId_fkey',
          columns: ['equipmentId'],
          references: { schema: 'public', table: 'equipment', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'site_instructions',
        foreignKey: {
          name: 'site_instructions_siteId_fkey',
          columns: ['siteId'],
          references: { schema: 'public', table: 'sites', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'site_instructions',
        foreignKey: {
          name: 'site_instructions_authorId_fkey',
          columns: ['authorId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sites',
        foreignKey: {
          name: 'sites_clientId_fkey',
          columns: ['clientId'],
          references: { schema: 'public', table: 'clients', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sites',
        foreignKey: {
          name: 'sites_managerId_fkey',
          columns: ['managerId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sites',
        foreignKey: {
          name: 'sites_supervisorId_fkey',
          columns: ['supervisorId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'users',
        foreignKey: {
          name: 'users_supervisorId_fkey',
          columns: ['supervisorId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'users',
        foreignKey: {
          name: 'users_teamLeaderId_fkey',
          columns: ['teamLeaderId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
