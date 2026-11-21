-- Add optional personal and education details to EXLS user profiles.
BEGIN;

ALTER TABLE "public"."users"
  ADD COLUMN "birthDate" timestamptz(3),
  ADD COLUMN "birthPlace" text,
  ADD COLUMN "educationLevel" text,
  ADD COLUMN "phone2" text,
  ADD COLUMN "postName" text,
  ADD COLUMN "residentialAddress" text,
  ADD COLUMN "residentialAddress2" text,
  ADD COLUMN "studies" text;

COMMIT;
