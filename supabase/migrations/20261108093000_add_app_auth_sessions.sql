CREATE TABLE "public"."app_auth_sessions" (
  "id" uuid NOT NULL,
  "authUserId" uuid NOT NULL,
  "sessionId" text NOT NULL,
  "createdAt" timestamptz(3) NOT NULL,
  "expiresAt" timestamptz(3) NOT NULL,
  CONSTRAINT "app_auth_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "app_auth_sessions_sessionId_key" UNIQUE ("sessionId"),
  CONSTRAINT "app_auth_sessions_expiration_de2b345a"
    CHECK ("expiresAt" > "createdAt")
);

CREATE INDEX "app_auth_sessions_expiresAt_idx_6b6b8c10"
  ON "public"."app_auth_sessions" ("expiresAt");

ALTER TABLE "public"."app_auth_sessions" ENABLE ROW LEVEL SECURITY;
