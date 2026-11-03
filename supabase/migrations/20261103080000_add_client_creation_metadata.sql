ALTER TABLE "public"."clients"
  ADD COLUMN "createdByEmail" text,
  ADD COLUMN "createdById" integer,
  ADD COLUMN "createdByName" text;
