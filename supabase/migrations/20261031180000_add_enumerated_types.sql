-- =====================================================================
-- Script 1: Stable PostgreSQL ENUM Types (Idempotent)
-- =====================================================================

DO $$ BEGIN CREATE TYPE "public"."Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'TEAM_LEADER', 'AGENT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."ContractStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."ShiftType" AS ENUM ('HOUR', 'DAY', 'NIGHT', 'WEEK_DAYS', 'WEEK_NIGHTS', 'FULL_DAY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."ShiftStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'REPLACED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."AttendanceStatus" AS ENUM ('ON_TIME', 'LATE', 'ABSENT', 'EARLY_DEPARTURE', 'VERIFIED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."ClockMethod" AS ENUM ('QR_SCAN', 'GPS_GEOFENCE', 'SUPERVISOR_OVERRIDE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."PatrolStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'INCOMPLETE', 'ABORTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."ScanStatus" AS ENUM ('OK', 'ANOMALY_DETECTED', 'MISSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."IncidentStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."EquipmentStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'DAMAGED', 'LOST', 'RETIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."EquipmentCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."InstructionType" AS ENUM ('PERMANENT', 'TEMPORARY', 'EMERGENCY_PROCEDURE', 'ACCESS_CONTROL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."PriorityLevel" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."NotificationType" AS ENUM ('SOS_ALERT', 'LATE_CLOCK_IN', 'PATROL_MISSED', 'INCIDENT_CRITICAL', 'SHIFT_ASSIGNED', 'SYSTEM'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;