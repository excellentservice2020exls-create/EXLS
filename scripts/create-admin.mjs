import "dotenv/config";
import { pathToFileURL } from "node:url";

const pageSize = 100;

function getConfig() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ADMIN_NAME",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
  ];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!["http:", "https:"].includes(supabaseUrl.protocol)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use HTTP or HTTPS.");
  }

  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }

  return {
    supabaseUrl,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    name: process.env.ADMIN_NAME.trim(),
    email,
    password: process.env.ADMIN_PASSWORD,
  };
}

function adminUsersEndpoint(supabaseUrl, page) {
  const endpoint = new URL("/auth/v1/admin/users", supabaseUrl);
  endpoint.searchParams.set("page", String(page));
  endpoint.searchParams.set("per_page", String(pageSize));
  return endpoint;
}

async function requestAdminApi(endpoint, serviceRoleKey, options = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Supabase Auth Admin API returned HTTP ${response.status}. Check the project URL and service role key.`,
    );
  }

  return response.json();
}

async function listUsers({ supabaseUrl, serviceRoleKey }) {
  const users = [];

  for (let page = 1; ; page += 1) {
    const result = await requestAdminApi(
      adminUsersEndpoint(supabaseUrl, page),
      serviceRoleKey,
    );

    if (!Array.isArray(result.users)) {
      throw new Error("Supabase Auth Admin API returned an invalid user list.");
    }

    users.push(...result.users);
    if (result.users.length < pageSize) return users;
  }
}

export async function createAdmin() {
  const config = getConfig();
  const users = await listUsers(config);
  const admins = users.filter((user) => user.app_metadata?.role === "ADMIN");
  const existingUser = users.find(
    (user) => user.email?.toLowerCase() === config.email,
  );

  if (admins.length > 0) {
    if (admins.length === 1 && admins[0].email?.toLowerCase() === config.email) {
      console.log("The configured ADMIN already exists; no changes were made.");
      return;
    }

    throw new Error("An ADMIN account already exists; no second ADMIN was created.");
  }

  if (existingUser) {
    throw new Error(
      "The configured email already belongs to a non-ADMIN account; no changes were made.",
    );
  }

  const endpoint = new URL("/auth/v1/admin/users", config.supabaseUrl);
  const result = await requestAdminApi(endpoint, config.serviceRoleKey, {
    method: "POST",
    body: JSON.stringify({
      email: config.email,
      password: config.password,
      email_confirm: true,
      user_metadata: { name: config.name },
      app_metadata: { role: "ADMIN" },
    }),
  });
  const createdUser = result.user ?? result;

  if (
    createdUser.email?.toLowerCase() !== config.email ||
    createdUser.app_metadata?.role !== "ADMIN"
  ) {
    throw new Error(
      "Supabase did not confirm the requested ADMIN role; check the account in Supabase Auth.",
    );
  }

  console.log(`Created the ADMIN account for ${config.email}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createAdmin().catch((error) => {
    console.error(`ADMIN creation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
