-- =====================================================================
-- Script 2: Master Reference Tables & Core ERP Tables
-- =====================================================================

-- Tables de Référence (Administrables dynamiquement sans migration DB)
CREATE TABLE IF NOT EXISTS "public"."contract_service_types" (
    "id" TEXT PRIMARY KEY, -- ex: 'STATIC_GUARDING'
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."incident_categories" (
    "id" TEXT PRIMARY KEY, -- ex: 'INTRUSION'
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."equipment_categories" (
    "id" TEXT PRIMARY KEY, -- ex: 'RADIO_COMMUNICATION'
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tables Métiers Core
CREATE TABLE IF NOT EXISTS "public"."contracts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "service_type_id" TEXT NOT NULL REFERENCES "public"."contract_service_types"("id"),
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "client_name" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."incidents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "category_id" TEXT NOT NULL REFERENCES "public"."incident_categories"("id"),
    "severity" "IncidentSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'NEW',
    "description" TEXT NOT NULL,
    "reported_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."equipment" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "category_id" TEXT NOT NULL REFERENCES "public"."equipment_categories"("id"),
    "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "condition" "EquipmentCondition" NOT NULL DEFAULT 'EXCELLENT',
    "serial_number" TEXT UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);