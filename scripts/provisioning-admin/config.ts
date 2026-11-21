import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export const PAGE_SIZE = 1000;
export const MAX_PAGES = 10000;

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "SUPERVISOR" | "TEAM_LEADER" | "AGENT" | "USER";

export function getBaseConfig() {
  const required = [
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Variables d'environnement manquantes : ${missing.join(", ")}`);
  }

  let supabaseUrl: URL;
  try {
    supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL doit être une URL valide.");
  }

  if (!["http:", "https:"].includes(supabaseUrl.protocol)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL doit utiliser le protocole HTTP ou HTTPS.");
  }

  return {
    databaseUrl: process.env.DATABASE_URL!,
    supabaseUrl,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  };
}