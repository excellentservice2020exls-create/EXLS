BEGIN;

TRUNCATE TABLE
  "public"."attendances",
  "public"."checkpoints",
  "public"."client_contracts",
  "public"."clients",
  "public"."contract_service_types",
  "public"."contracts",
  "public"."equipment",
  "public"."equipment_assignments",
  "public"."equipment_categories",
  "public"."incident_attachments",
  "public"."incident_categories",
  "public"."incident_comments",
  "public"."incidents",
  "public"."notifications",
  "public"."patrol_scans",
  "public"."patrols",
  "public"."role_assignments",
  "public"."shifts",
  "public"."site_equipments",
  "public"."site_instructions",
  "public"."sites",
  "public"."users"
RESTART IDENTITY;

DROP TABLE IF EXISTS "public"."core_equipment";
DROP TABLE IF EXISTS "public"."core_incidents";

ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_shiftId_fkey";
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_agentId_fkey";
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_verifiedById_fkey";
ALTER TABLE "public"."checkpoints" DROP CONSTRAINT "checkpoints_siteId_fkey";
ALTER TABLE "public"."client_contracts" DROP CONSTRAINT "client_contracts_clientId_fkey";
ALTER TABLE "public"."contracts" DROP CONSTRAINT "contracts_service_type_id_fkey";
ALTER TABLE "public"."equipment_assignments" DROP CONSTRAINT "equipment_assignments_equipmentId_fkey";
ALTER TABLE "public"."equipment_assignments" DROP CONSTRAINT "equipment_assignments_agentId_fkey";
ALTER TABLE "public"."equipment_assignments" DROP CONSTRAINT "equipment_assignments_shiftId_fkey";
ALTER TABLE "public"."incident_attachments" DROP CONSTRAINT "incident_attachments_incidentId_fkey";
ALTER TABLE "public"."incident_comments" DROP CONSTRAINT "incident_comments_incidentId_fkey";
ALTER TABLE "public"."incident_comments" DROP CONSTRAINT "incident_comments_authorId_fkey";
ALTER TABLE "public"."incidents" DROP CONSTRAINT "incidents_siteId_fkey";
ALTER TABLE "public"."incidents" DROP CONSTRAINT "incidents_shiftId_fkey";
ALTER TABLE "public"."incidents" DROP CONSTRAINT "incidents_patrolId_fkey";
ALTER TABLE "public"."incidents" DROP CONSTRAINT "incidents_reportedById_fkey";
ALTER TABLE "public"."incidents" DROP CONSTRAINT "incidents_assignedToId_fkey";
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_userId_fkey";
ALTER TABLE "public"."patrol_scans" DROP CONSTRAINT "patrol_scans_patrolId_fkey";
ALTER TABLE "public"."patrol_scans" DROP CONSTRAINT "patrol_scans_checkpointId_fkey";
ALTER TABLE "public"."patrol_scans" DROP CONSTRAINT "patrol_scans_agentId_fkey";
ALTER TABLE "public"."patrols" DROP CONSTRAINT "patrols_siteId_fkey";
ALTER TABLE "public"."patrols" DROP CONSTRAINT "patrols_agentId_fkey";
ALTER TABLE "public"."patrols" DROP CONSTRAINT "patrols_shiftId_fkey";
ALTER TABLE "public"."role_assignments" DROP CONSTRAINT "role_assignments_userId_fkey";
ALTER TABLE "public"."shifts" DROP CONSTRAINT "shifts_siteId_fkey";
ALTER TABLE "public"."shifts" DROP CONSTRAINT "shifts_agentId_fkey";
ALTER TABLE "public"."shifts" DROP CONSTRAINT "shifts_teamLeaderId_fkey";
ALTER TABLE "public"."shifts" DROP CONSTRAINT "shifts_supervisorId_fkey";
ALTER TABLE "public"."site_equipments" DROP CONSTRAINT "site_equipments_siteId_fkey";
ALTER TABLE "public"."site_equipments" DROP CONSTRAINT "site_equipments_equipmentId_fkey";
ALTER TABLE "public"."site_instructions" DROP CONSTRAINT "site_instructions_siteId_fkey";
ALTER TABLE "public"."site_instructions" DROP CONSTRAINT "site_instructions_authorId_fkey";
ALTER TABLE "public"."sites" DROP CONSTRAINT "sites_clientId_fkey";
ALTER TABLE "public"."sites" DROP CONSTRAINT "sites_managerId_fkey";
ALTER TABLE "public"."sites" DROP CONSTRAINT "sites_supervisorId_fkey";
ALTER TABLE "public"."users" DROP CONSTRAINT "users_supervisorId_fkey";
ALTER TABLE "public"."users" DROP CONSTRAINT "users_teamLeaderId_fkey";

ALTER TABLE "public"."attendances" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."checkpoints" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."client_contracts" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."clients" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."contracts" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."equipment" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."equipment_assignments" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."incident_attachments" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."incident_comments" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."incidents" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."notifications" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."patrol_scans" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."patrols" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."role_assignments" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."shifts" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."site_equipments" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."site_instructions" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."sites" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "public"."attendances" ALTER COLUMN "agentId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."attendances" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."attendances" ALTER COLUMN "shiftId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."attendances" ALTER COLUMN "verifiedById" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."checkpoints" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."checkpoints" ALTER COLUMN "siteId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."client_contracts" ALTER COLUMN "clientId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."client_contracts" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."clients" ALTER COLUMN "createdById" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."clients" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."contract_service_types" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."contracts" ALTER COLUMN "service_type_id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."equipment" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."equipment_assignments" ALTER COLUMN "agentId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."equipment_assignments" ALTER COLUMN "equipmentId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."equipment_assignments" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."equipment_assignments" ALTER COLUMN "shiftId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."equipment_categories" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incident_attachments" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incident_attachments" ALTER COLUMN "incidentId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incident_categories" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incident_comments" ALTER COLUMN "authorId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incident_comments" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incident_comments" ALTER COLUMN "incidentId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incidents" ALTER COLUMN "assignedToId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incidents" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incidents" ALTER COLUMN "patrolId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incidents" ALTER COLUMN "reportedById" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incidents" ALTER COLUMN "shiftId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."incidents" ALTER COLUMN "siteId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."notifications" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."notifications" ALTER COLUMN "userId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."patrol_scans" ALTER COLUMN "agentId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."patrol_scans" ALTER COLUMN "checkpointId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."patrol_scans" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."patrol_scans" ALTER COLUMN "patrolId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."patrols" ALTER COLUMN "agentId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."patrols" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."patrols" ALTER COLUMN "shiftId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."patrols" ALTER COLUMN "siteId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."role_assignments" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."role_assignments" ALTER COLUMN "userId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."shifts" ALTER COLUMN "agentId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."shifts" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."shifts" ALTER COLUMN "siteId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."shifts" ALTER COLUMN "supervisorId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."shifts" ALTER COLUMN "teamLeaderId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."site_equipments" ALTER COLUMN "equipmentId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."site_equipments" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."site_equipments" ALTER COLUMN "siteId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."site_instructions" ALTER COLUMN "authorId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."site_instructions" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."site_instructions" ALTER COLUMN "siteId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."sites" ALTER COLUMN "clientId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."sites" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."sites" ALTER COLUMN "managerId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."sites" ALTER COLUMN "supervisorId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."users" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."users" ALTER COLUMN "supervisorId" TYPE uuid USING gen_random_uuid();
ALTER TABLE "public"."users" ALTER COLUMN "teamLeaderId" TYPE uuid USING gen_random_uuid();

ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."shifts" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "public"."users" ("id");
ALTER TABLE "public"."checkpoints" ADD CONSTRAINT "checkpoints_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."sites" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."client_contracts" ADD CONSTRAINT "client_contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients" ("id") ON DELETE CASCADE;
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "public"."contract_service_types" ("id");
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

COMMIT;
