-- Add enum membership constraints to ERP tables created by the original schema migration.
-- Apply once only if the tables were already created before enum constraints were added.
BEGIN;

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

COMMIT;
