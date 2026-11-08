CREATE TABLE "public"."security_access_requests" (
  "id" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "sessionId" text NOT NULL,
  "status" text DEFAULT 'PENDING' NOT NULL,
  "requestedAt" timestamptz(3) DEFAULT now() NOT NULL,
  "decidedAt" timestamptz(3),
  "decidedById" uuid,
  CONSTRAINT "security_access_requests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "security_access_requests_sessionId_key" UNIQUE ("sessionId"),
  CONSTRAINT "security_access_requests_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE,
  CONSTRAINT "security_access_requests_decidedById_fkey"
    FOREIGN KEY ("decidedById") REFERENCES "public"."users" ("id") ON DELETE SET NULL,
  CONSTRAINT "security_access_requests_status_7ebbec5c"
    CHECK ((status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text])))
);

CREATE INDEX "security_access_requests_status_requestedAt_idx_27ce3e29"
  ON "public"."security_access_requests" ("status", "requestedAt");
CREATE INDEX "security_access_requests_userId_idx_a489d58a"
  ON "public"."security_access_requests" ("userId");
CREATE INDEX "security_access_requests_decidedById_idx_8194d55f"
  ON "public"."security_access_requests" ("decidedById");

ALTER TABLE "public"."security_access_requests" ENABLE ROW LEVEL SECURITY;
