import { PAGE_SIZE, MAX_PAGES } from "./config";

export interface SupabaseUser {
  id: string;
  email?: string;
  app_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
  user_metadata?: {
    name?: string;
    [key: string]: unknown;
  };
}

export async function requestAdminApi<T = unknown>(
  endpoint: URL,
  serviceRoleKey: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(endpoint, {
    ...options,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Erreur API Supabase (${response.status})`);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (null as T);
}

export async function listAllUsers(supabaseUrl: URL, serviceRoleKey: string): Promise<SupabaseUser[]> {
  const users: SupabaseUser[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const endpoint = new URL("/auth/v1/admin/users", supabaseUrl);
    endpoint.searchParams.set("page", String(page));
    endpoint.searchParams.set("per_page", String(PAGE_SIZE));

    const result = await requestAdminApi<unknown>(endpoint, serviceRoleKey);

    if (
      typeof result !== "object" ||
      result === null ||
      !("users" in result) ||
      !Array.isArray((result as any).users)
    ) {
      throw new Error("Réponse invalide de Supabase : liste des utilisateurs indisponible ou corrompue.");
    }

    const pageUsers = (result as { users: unknown[] }).users;

    for (const user of pageUsers) {
      if (
        typeof user !== "object" ||
        user === null ||
        !("id" in user) ||
        typeof (user as any).id !== "string"
      ) {
        throw new Error("Un utilisateur retourné par Supabase possède une structure invalide.");
      }
      users.push(user as SupabaseUser);
    }

    if (pageUsers.length < PAGE_SIZE) {
      return users;
    }
  }

  throw new Error("Nombre maximal de pages Supabase atteint.");
}