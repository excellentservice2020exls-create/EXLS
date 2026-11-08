-- Keep the assignable role constraint aligned with the application RBAC roles.
-- DIRECTOR is retained for existing database compatibility; it is not granted
-- by the current application permission map.
BEGIN;

ALTER TABLE "public"."role_assignments"
  DROP CONSTRAINT IF EXISTS "role_assignments_role_check_3b8a4a49";

ALTER TABLE "public"."role_assignments"
  ADD CONSTRAINT "role_assignments_role_check_3b8a4a49"
  CHECK ("role" IN ('ADMIN', 'MANAGER', 'DIRECTOR', 'SUPERVISOR', 'TEAM_LEADER', 'AGENT'));

COMMIT;
