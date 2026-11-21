-- Adds the application and identity dossier tables used by /employees.
CREATE TABLE "public"."agent_applications" (
  "id" uuid NOT NULL,
  "birthDate" date NOT NULL,
  "birthPlace" text NOT NULL,
  "createdAt" timestamptz(3) DEFAULT now() NOT NULL,
  "educationLevel" text NOT NULL,
  "firstName" text NOT NULL,
  "gender" text NOT NULL,
  "lastName" text NOT NULL,
  "nationality" text NOT NULL,
  "phone" text NOT NULL,
  "phone2" text,
  "postName" text NOT NULL,
  "residentialAddress" text NOT NULL,
  "residentialAddress2" text,
  "status" text DEFAULT 'ACTIVE' NOT NULL,
  "updatedAt" timestamptz(3) DEFAULT now() NOT NULL,
  CONSTRAINT "agent_applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."agent_identities" (
  "id" uuid NOT NULL,
  "agentApplicationId" uuid NOT NULL,
  "birthDate" date NOT NULL,
  "birthPlace" text NOT NULL,
  "createdAt" timestamptz(3) DEFAULT now() NOT NULL,
  "district" text NOT NULL,
  "fatherName" text NOT NULL,
  "firstName" text NOT NULL,
  "gender" text NOT NULL,
  "lastName" text NOT NULL,
  "maritalStatus" text NOT NULL,
  "motherName" text NOT NULL,
  "nationality" text NOT NULL,
  "phone" text NOT NULL,
  "phone2" text,
  "postName" text NOT NULL,
  "professionalExperiences" text,
  "province" text NOT NULL,
  "residentialAddress" text NOT NULL,
  "residentialAddress2" text,
  "sector" text NOT NULL,
  "studies" text,
  "territory" text NOT NULL,
  "additionalTrainings" text,
  "spokenLanguages" text,
  CONSTRAINT "agent_identities_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "agent_identities_agentApplicationId_key" UNIQUE ("agentApplicationId"),
  CONSTRAINT "agent_identities_agentApplicationId_fkey"
    FOREIGN KEY ("agentApplicationId") REFERENCES "public"."agent_applications" ("id") ON DELETE CASCADE
);

ALTER TABLE "public"."agent_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."agent_identities" ENABLE ROW LEVEL SECURITY;
