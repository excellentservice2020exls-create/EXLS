-- Generated from prisma/contract.json. Apply once using the Supabase SQL Editor.
-- RLS is enabled on all ERP tables; no client policies are added by this migration.
BEGIN;

CREATE TABLE "public"."attendances" (
  "agentId" integer NOT NULL,
  "clockInLatitude" double precision,
  "clockInLongitude" double precision,
  "clockInMethod" text NOT NULL DEFAULT 'QR_SCAN',
  "clockInTime" timestamptz(3) NOT NULL,
  "clockOutLatitude" double precision,
  "clockOutLongitude" double precision,
  "clockOutTime" timestamptz(3),
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "id" serial NOT NULL,
  "lateMinutes" integer NOT NULL DEFAULT 0,
  "shiftId" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'ON_TIME',
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  "verificationNotes" text,
  "verifiedById" integer,
  CONSTRAINT "attendances_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "attendances_shiftId_key" UNIQUE ("shiftId")
);

CREATE TABLE "public"."checkpoints" (
  "code" text NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "floorLocation" text,
  "id" serial NOT NULL,
  "isRequired" boolean NOT NULL DEFAULT true,
  "latitude" double precision,
  "longitude" double precision,
  "name" text NOT NULL,
  "nfcTagId" text,
  "orderIndex" integer NOT NULL DEFAULT 0,
  "qrCodeData" text NOT NULL,
  "siteId" integer NOT NULL,
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "checkpoints_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "checkpoints_qrCodeData_key" UNIQUE ("qrCodeData")
);

CREATE TABLE "public"."client_contracts" (
  "clientId" integer NOT NULL,
  "contractNumber" text NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "endDate" timestamptz(3),
  "hourlyRate" numeric,
  "id" serial NOT NULL,
  "notes" text,
  "serviceType" text NOT NULL,
  "startDate" timestamptz(3) NOT NULL,
  "status" text NOT NULL DEFAULT 'ACTIVE',
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "client_contracts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "client_contracts_contractNumber_key" UNIQUE ("contractNumber")
);

CREATE TABLE "public"."clients" (
  "billingAddress" text NOT NULL,
  "city" text NOT NULL,
  "code" text NOT NULL,
  "contactEmail" text NOT NULL,
  "contactName" text NOT NULL,
  "contactPhone" text NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "id" serial NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "name" text NOT NULL,
  "postalCode" text NOT NULL,
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "clients_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "clients_code_key" UNIQUE ("code")
);

CREATE TABLE "public"."equipment" (
  "category" text NOT NULL,
  "code" text NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "id" serial NOT NULL,
  "lastInspectionDate" timestamptz(3),
  "name" text NOT NULL,
  "purchaseDate" timestamptz(3),
  "serialNumber" text,
  "status" text NOT NULL DEFAULT 'AVAILABLE',
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "equipment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "equipment_code_key" UNIQUE ("code"),
  CONSTRAINT "equipment_serialNumber_key" UNIQUE ("serialNumber")
);

CREATE TABLE "public"."equipment_assignments" (
  "agentId" integer NOT NULL,
  "anomalyReported" boolean NOT NULL DEFAULT false,
  "assignedAt" timestamptz(3) NOT NULL DEFAULT now(),
  "conditionOnAssignment" text NOT NULL DEFAULT 'GOOD',
  "conditionOnReturn" text,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "equipmentId" integer NOT NULL,
  "id" serial NOT NULL,
  "notes" text,
  "returnedAt" timestamptz(3),
  "shiftId" integer,
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "equipment_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."incident_attachments" (
  "caption" text,
  "fileName" text NOT NULL,
  "fileSize" integer,
  "fileType" text NOT NULL,
  "fileUrl" text NOT NULL,
  "id" serial NOT NULL,
  "incidentId" integer NOT NULL,
  "uploadedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "incident_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."incident_comments" (
  "authorId" integer NOT NULL,
  "comment" text NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "id" serial NOT NULL,
  "incidentId" integer NOT NULL,
  CONSTRAINT "incident_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."incidents" (
  "actionTaken" text,
  "assignedToId" integer,
  "category" text NOT NULL,
  "clientNotified" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "description" text NOT NULL,
  "id" serial NOT NULL,
  "incidentNumber" text NOT NULL,
  "locationDetail" text,
  "occurredAt" timestamptz(3) NOT NULL,
  "patrolId" integer,
  "policeCalled" boolean NOT NULL DEFAULT false,
  "reportedAt" timestamptz(3) NOT NULL DEFAULT now(),
  "reportedById" integer NOT NULL,
  "resolutionSummary" text,
  "resolvedAt" timestamptz(3),
  "severity" text NOT NULL DEFAULT 'MEDIUM',
  "shiftId" integer,
  "siteId" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'NEW',
  "title" text NOT NULL,
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "incidents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "incidents_incidentNumber_key" UNIQUE ("incidentNumber")
);

CREATE TABLE "public"."notifications" (
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "id" serial NOT NULL,
  "isRead" boolean NOT NULL DEFAULT false,
  "message" text NOT NULL,
  "readAt" timestamptz(3),
  "title" text NOT NULL,
  "type" text NOT NULL DEFAULT 'SYSTEM',
  "userId" integer NOT NULL,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."patrol_scans" (
  "agentId" integer NOT NULL,
  "anomalyDescription" text,
  "checkpointId" integer NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "id" serial NOT NULL,
  "latitude" double precision,
  "longitude" double precision,
  "patrolId" integer NOT NULL,
  "scanMethod" text NOT NULL DEFAULT 'QR',
  "scannedAt" timestamptz(3) NOT NULL DEFAULT now(),
  "status" text NOT NULL DEFAULT 'OK',
  CONSTRAINT "patrol_scans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."patrols" (
  "agentId" integer NOT NULL,
  "completedAt" timestamptz(3),
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "id" serial NOT NULL,
  "notes" text,
  "scannedCheckpoints" integer NOT NULL DEFAULT 0,
  "scheduledStartTime" timestamptz(3),
  "shiftId" integer,
  "siteId" integer NOT NULL,
  "startedAt" timestamptz(3) NOT NULL DEFAULT now(),
  "status" text NOT NULL DEFAULT 'IN_PROGRESS',
  "title" text NOT NULL,
  "totalCheckpoints" integer NOT NULL DEFAULT 0,
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "patrols_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."role_assignments" (
  "assignedAt" timestamptz(3) NOT NULL DEFAULT now(),
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "id" serial NOT NULL,
  "role" text NOT NULL,
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  "userId" integer NOT NULL,
  CONSTRAINT "role_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."shifts" (
  "agentId" integer NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "endTime" timestamptz(3) NOT NULL,
  "hourlyRate" numeric,
  "id" serial NOT NULL,
  "notes" text,
  "shiftType" text NOT NULL,
  "siteId" integer NOT NULL,
  "startTime" timestamptz(3) NOT NULL,
  "status" text NOT NULL DEFAULT 'SCHEDULED',
  "supervisorId" integer,
  "teamLeaderId" integer,
  "title" text NOT NULL,
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."site_equipments" (
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "equipmentId" integer NOT NULL,
  "id" serial NOT NULL,
  "installedAt" timestamptz(3) NOT NULL DEFAULT now(),
  "notes" text,
  "siteId" integer NOT NULL,
  CONSTRAINT "site_equipments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "site_equipments_siteId_equipmentId_key" UNIQUE ("siteId", "equipmentId")
);

CREATE TABLE "public"."site_instructions" (
  "authorId" integer NOT NULL,
  "content" text NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "effectiveFrom" timestamptz(3) NOT NULL DEFAULT now(),
  "effectiveUntil" timestamptz(3),
  "id" serial NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "priority" text NOT NULL DEFAULT 'NORMAL',
  "siteId" integer NOT NULL,
  "title" text NOT NULL,
  "type" text NOT NULL DEFAULT 'PERMANENT',
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "site_instructions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."sites" (
  "accessCode" text,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "clientId" integer NOT NULL,
  "code" text NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "emergencyPhone" text,
  "generalInstructions" text,
  "geofenceRadius" integer NOT NULL DEFAULT 100,
  "id" serial NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "latitude" double precision,
  "longitude" double precision,
  "managerId" integer,
  "name" text NOT NULL,
  "postalCode" text NOT NULL,
  "supervisorId" integer,
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "sites_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sites_code_key" UNIQUE ("code")
);

CREATE TABLE "public"."users" (
  "adminLock" text,
  "cnapsExpiration" timestamptz(3),
  "cnapsNumber" text,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  "email" text NOT NULL,
  "firstName" text NOT NULL,
  "id" serial NOT NULL,
  "lastName" text NOT NULL,
  "matricule" text NOT NULL,
  "mustChangePassword" boolean NOT NULL DEFAULT false,
  "passwordHash" text NOT NULL,
  "phone" text,
  "role" text NOT NULL,
  "status" text NOT NULL DEFAULT 'ACTIVE',
  "supervisorId" integer,
  "teamLeaderId" integer,
  "updatedAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_email_key" UNIQUE ("email"),
  CONSTRAINT "users_matricule_key" UNIQUE ("matricule"),
  CONSTRAINT "users_adminLock_key" UNIQUE ("adminLock")
);

ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."shifts" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."checkpoints" ADD CONSTRAINT "checkpoints_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."sites" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."client_contracts" ADD CONSTRAINT "client_contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."equipment_assignments" ADD CONSTRAINT "equipment_assignments_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."equipment_assignments" ADD CONSTRAINT "equipment_assignments_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."equipment_assignments" ADD CONSTRAINT "equipment_assignments_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."shifts" ("id");
ALTER TABLE "public"."incident_attachments" ADD CONSTRAINT "incident_attachments_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "public"."incidents" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."incident_comments" ADD CONSTRAINT "incident_comments_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "public"."incidents" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."incident_comments" ADD CONSTRAINT "incident_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."sites" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."shifts" ("id");
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_patrolId_fkey" FOREIGN KEY ("patrolId") REFERENCES "public"."patrols" ("id");
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."patrol_scans" ADD CONSTRAINT "patrol_scans_patrolId_fkey" FOREIGN KEY ("patrolId") REFERENCES "public"."patrols" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."patrol_scans" ADD CONSTRAINT "patrol_scans_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "public"."checkpoints" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."patrol_scans" ADD CONSTRAINT "patrol_scans_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."patrols" ADD CONSTRAINT "patrols_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."sites" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."patrols" ADD CONSTRAINT "patrols_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."patrols" ADD CONSTRAINT "patrols_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."shifts" ("id");
ALTER TABLE "public"."role_assignments" ADD CONSTRAINT "role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."sites" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."site_equipments" ADD CONSTRAINT "site_equipments_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."sites" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."site_equipments" ADD CONSTRAINT "site_equipments_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."site_instructions" ADD CONSTRAINT "site_instructions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."sites" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."site_instructions" ADD CONSTRAINT "site_instructions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."sites" ADD CONSTRAINT "sites_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."sites" ADD CONSTRAINT "sites_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."sites" ADD CONSTRAINT "sites_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."users" ADD CONSTRAINT "users_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."users" ADD CONSTRAINT "users_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "public"."users" ("id");

ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_check_3b8a4a49" CHECK ("role" IN ('ADMIN', 'MANAGER', 'DIRECTOR', 'SUPERVISOR', 'AGENT'));
ALTER TABLE "public"."users" ADD CONSTRAINT "users_status_check_0f44f6b1" CHECK ("status" IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED'));
ALTER TABLE "public"."role_assignments" ADD CONSTRAINT "role_assignments_role_check_3b8a4a49" CHECK ("role" IN ('ADMIN', 'MANAGER', 'DIRECTOR', 'SUPERVISOR', 'AGENT'));
ALTER TABLE "public"."client_contracts" ADD CONSTRAINT "client_contracts_serviceType_check_8cfda18d" CHECK ("serviceType" IN ('STATIC_GUARDING', 'MOBILE_PATROL', 'EVENT_SECURITY', 'VIP_PROTECTION', 'DOG_HANDLER'));
ALTER TABLE "public"."client_contracts" ADD CONSTRAINT "client_contracts_status_check_814bd882" CHECK ("status" IN ('ACTIVE', 'EXPIRED', 'TERMINATED'));
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_shiftType_check_ba185ef3" CHECK ("shiftType" IN ('DAY', 'NIGHT', 'WEEKEND', 'REINFORCEMENT', 'DOG_PATROL'));
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_status_check_51c56842" CHECK ("status" IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'REPLACED'));
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_clockInMethod_check_f1817fd0" CHECK ("clockInMethod" IN ('QR_SCAN', 'GPS_GEOFENCE', 'SUPERVISOR_OVERRIDE'));
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_status_check_02d150d7" CHECK ("status" IN ('ON_TIME', 'LATE', 'ABSENT', 'EARLY_DEPARTURE', 'VERIFIED'));
ALTER TABLE "public"."patrols" ADD CONSTRAINT "patrols_status_check_7f8da3e7" CHECK ("status" IN ('IN_PROGRESS', 'COMPLETED', 'INCOMPLETE', 'ABORTED'));
ALTER TABLE "public"."patrol_scans" ADD CONSTRAINT "patrol_scans_status_check_4e0b1ed4" CHECK ("status" IN ('OK', 'ANOMALY_DETECTED', 'MISSED'));
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_category_check_c2d2dc6c" CHECK ("category" IN ('INTRUSION', 'FIRE_ALARM', 'THEFT', 'VANDALISM', 'AGGRESSION', 'TECHNICAL_FAILURE', 'MEDICAL_EMERGENCY', 'ACCESS_DENIAL', 'SUSPICIOUS_PERSON', 'OTHER'));
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_severity_check_5e5a5e80" CHECK ("severity" IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_status_check_50d14964" CHECK ("status" IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'));
ALTER TABLE "public"."equipment" ADD CONSTRAINT "equipment_category_check_03887e0a" CHECK ("category" IN ('RADIO_COMMUNICATION', 'LIGHTING', 'DEFENSE_AND_PPE', 'DETECTION', 'KEYS_AND_BADGES', 'PTI_DEVICE', 'VEHICLE'));
ALTER TABLE "public"."equipment" ADD CONSTRAINT "equipment_status_check_ca4725d1" CHECK ("status" IN ('AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'DAMAGED', 'LOST', 'RETIRED'));
ALTER TABLE "public"."equipment_assignments" ADD CONSTRAINT "equipment_assignments_conditionOnAssignment_check_cd969df4" CHECK ("conditionOnAssignment" IN ('EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'));
ALTER TABLE "public"."equipment_assignments" ADD CONSTRAINT "equipment_assignments_conditionOnReturn_check_fc912f52" CHECK ("conditionOnReturn" IN ('EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'));
ALTER TABLE "public"."site_instructions" ADD CONSTRAINT "site_instructions_type_check_f1605544" CHECK ("type" IN ('PERMANENT', 'TEMPORARY', 'EMERGENCY_PROCEDURE', 'ACCESS_CONTROL'));
ALTER TABLE "public"."site_instructions" ADD CONSTRAINT "site_instructions_priority_check_72dbae57" CHECK ("priority" IN ('LOW', 'NORMAL', 'HIGH', 'URGENT'));
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_type_check_c46f6706" CHECK ("type" IN ('SOS_ALERT', 'LATE_CLOCK_IN', 'PATROL_MISSED', 'INCIDENT_CRITICAL', 'SHIFT_ASSIGNED', 'SYSTEM'));

CREATE INDEX "attendances_agentId_idx_8d0ba4f0" ON "public"."attendances" ("agentId");
CREATE INDEX "attendances_verifiedById_idx_dfd74b37" ON "public"."attendances" ("verifiedById");
CREATE INDEX "checkpoints_siteId_idx_cabdc5ab" ON "public"."checkpoints" ("siteId");
CREATE INDEX "client_contracts_clientId_idx_153a9a49" ON "public"."client_contracts" ("clientId");
CREATE INDEX "equipment_assignments_agentId_idx_8d0ba4f0" ON "public"."equipment_assignments" ("agentId");
CREATE INDEX "equipment_assignments_equipmentId_idx_e1548594" ON "public"."equipment_assignments" ("equipmentId");
CREATE INDEX "equipment_assignments_shiftId_idx_fee8a58d" ON "public"."equipment_assignments" ("shiftId");
CREATE INDEX "incident_attachments_incidentId_idx_20b6f3c9" ON "public"."incident_attachments" ("incidentId");
CREATE INDEX "incident_comments_authorId_idx_e47547ed" ON "public"."incident_comments" ("authorId");
CREATE INDEX "incident_comments_incidentId_idx_20b6f3c9" ON "public"."incident_comments" ("incidentId");
CREATE INDEX "incidents_assignedToId_idx_45a131c2" ON "public"."incidents" ("assignedToId");
CREATE INDEX "incidents_patrolId_idx_d6f44378" ON "public"."incidents" ("patrolId");
CREATE INDEX "incidents_reportedById_idx_4bd24876" ON "public"."incidents" ("reportedById");
CREATE INDEX "incidents_shiftId_idx_fee8a58d" ON "public"."incidents" ("shiftId");
CREATE INDEX "incidents_siteId_idx_cabdc5ab" ON "public"."incidents" ("siteId");
CREATE INDEX "notifications_userId_idx_a489d58a" ON "public"."notifications" ("userId");
CREATE INDEX "patrol_scans_agentId_idx_8d0ba4f0" ON "public"."patrol_scans" ("agentId");
CREATE INDEX "patrol_scans_checkpointId_idx_4eb4c383" ON "public"."patrol_scans" ("checkpointId");
CREATE INDEX "patrol_scans_patrolId_idx_d6f44378" ON "public"."patrol_scans" ("patrolId");
CREATE INDEX "patrols_agentId_idx_8d0ba4f0" ON "public"."patrols" ("agentId");
CREATE INDEX "patrols_shiftId_idx_fee8a58d" ON "public"."patrols" ("shiftId");
CREATE INDEX "patrols_siteId_idx_cabdc5ab" ON "public"."patrols" ("siteId");
CREATE INDEX "role_assignments_userId_idx_a489d58a" ON "public"."role_assignments" ("userId");
CREATE INDEX "shifts_agentId_idx_8d0ba4f0" ON "public"."shifts" ("agentId");
CREATE INDEX "shifts_siteId_idx_cabdc5ab" ON "public"."shifts" ("siteId");
CREATE INDEX "shifts_supervisorId_idx_fe423ed5" ON "public"."shifts" ("supervisorId");
CREATE INDEX "shifts_teamLeaderId_idx_1d5c7be0" ON "public"."shifts" ("teamLeaderId");
CREATE INDEX "site_equipments_equipmentId_idx_e1548594" ON "public"."site_equipments" ("equipmentId");
CREATE INDEX "site_equipments_siteId_idx_cabdc5ab" ON "public"."site_equipments" ("siteId");
CREATE INDEX "site_instructions_authorId_idx_e47547ed" ON "public"."site_instructions" ("authorId");
CREATE INDEX "site_instructions_siteId_idx_cabdc5ab" ON "public"."site_instructions" ("siteId");
CREATE INDEX "sites_clientId_idx_153a9a49" ON "public"."sites" ("clientId");
CREATE INDEX "sites_managerId_idx_f8369ba6" ON "public"."sites" ("managerId");
CREATE INDEX "sites_supervisorId_idx_fe423ed5" ON "public"."sites" ("supervisorId");
CREATE INDEX "users_supervisorId_idx_fe423ed5" ON "public"."users" ("supervisorId");
CREATE INDEX "users_teamLeaderId_idx_1d5c7be0" ON "public"."users" ("teamLeaderId");

ALTER TABLE "public"."attendances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."checkpoints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."client_contracts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."equipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."equipment_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."incident_attachments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."incident_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."incidents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."patrol_scans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."patrols" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."role_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."site_equipments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."site_instructions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."sites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

COMMIT;
