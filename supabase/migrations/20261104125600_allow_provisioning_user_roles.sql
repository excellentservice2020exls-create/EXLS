-- Keep the users role constraint aligned with prisma/contract.prisma.
BEGIN;

ALTER TABLE "public"."users"
  DROP CONSTRAINT IF EXISTS "users_role_check_3b8a4a49";

ALTER TABLE "public"."users"
  ADD CONSTRAINT "users_role_check_3b8a4a49"
  CHECK ("role" IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DIRECTOR', 'SUPERVISOR', 'TEAM_LEADER', 'AGENT', 'USER'));

COMMIT;
