import "dotenv/config";
import { createHash, randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import contractJson from "../prisma/contract.json" with { type: "json" };

const pageSize = 100;
const contract = contractFromJson(contractJson);

function getConfig() {
  const required = [
    "DATABASE_URL",
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
    databaseUrl: process.env.DATABASE_URL,
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

function getAdminName(name) {
  const [firstName, ...lastNameParts] = name.split(/\s+/).filter(Boolean);
  return {
    firstName: firstName || "Administrateur",
    lastName: lastNameParts.join(" ") || firstName || "EXLS",
  };
}

async function ensureAdminProfile(config) {
  const { email, name } = config;
  const db = postgres({ contract, url: config.databaseUrl });

  try {
    const escapedEmail = email.replace(/[\\%_]/g, "\\$&");
    const profiles = await db.orm.public.User
      .where((user) => user.email.ilike(escapedEmail))
      .select("id", "email", "role", "status", "adminLock")
      .limit(2)
      .all();

    if (profiles.length > 1) {
      throw new Error("Multiple EXLS profiles match the configured ADMIN email.");
    }

    const otherAdmins = await db.orm.public.User
      .where({ role: "ADMIN" })
      .select("id", "email", "adminLock")
      .all();
    if (otherAdmins.some((profile) => profile.email.toLowerCase() !== email)) {
      throw new Error(
        "Another EXLS ADMIN profile already exists; no profile was changed.",
      );
    }

    const profile = profiles[0];
    if (profile) {
      if (profile.adminLock && profile.adminLock !== "GLOBAL_ADMIN") {
        throw new Error(
          "The configured ADMIN profile has a conflicting admin lock; no profile was changed.",
        );
      }

      await db.orm.public.User.where({ id: profile.id }).update({
        role: "ADMIN",
        adminLock: "GLOBAL_ADMIN",
      });
      return {
        created: false,
        active: String(profile.status) === "ACTIVE",
      };
    }

    const { firstName, lastName } = getAdminName(name);
    await db.orm.public.User.create({
      email,
      firstName,
      lastName,
      matricule: `ADMIN-${randomBytes(6).toString("hex").toUpperCase()}`,
      passwordHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
      role: "ADMIN",
      status: "ACTIVE",
      adminLock: "GLOBAL_ADMIN",
    });

    return { created: true, active: true };
  } finally {
    await db.close();
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
    if (admins.length !== 1 || admins[0].email?.toLowerCase() !== config.email) {
      throw new Error("An ADMIN account already exists; no second ADMIN was created.");
    }

  } else {
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
  }

  const profile = await ensureAdminProfile(config);
  const action = profile.created ? "created" : "verified";
  console.log(
    `The EXLS ADMIN profile for ${config.email} was ${action}.${profile.active ? "" : " Its existing status is inactive; activate it after reviewing the account."}`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createAdmin().catch((error) => {
    console.error(`ADMIN creation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
