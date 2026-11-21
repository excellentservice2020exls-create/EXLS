import "server-only";

import { createHmac } from "node:crypto";
import { createAdminClient } from "./admin";

type RateLimitRow = {
  allowed: boolean;
  retry_after_seconds: number;
};

function hashKey(scope: "account" | "ip", value: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be configured.");
  }

  return createHmac("sha256", secret)
    .update(`${scope}:${value}`)
    .digest("hex");
}

export async function checkSignInRateLimit(
  email: string | null,
  clientIp: string | null,
) {
  const { data, error } = await createAdminClient().rpc(
    "consume_auth_sign_in_rate_limit",
    {
      p_account_key: email ? hashKey("account", email.trim().toLowerCase()) : null,
      p_client_ip_key: clientIp ? hashKey("ip", clientIp) : null,
    },
  );

  if (error) {
    throw new Error("Unable to check the sign-in rate limit.", { cause: error });
  }

  const row = Array.isArray(data) ? (data[0] as RateLimitRow | undefined) : undefined;
  if (
    !row ||
    typeof row.allowed !== "boolean" ||
    typeof row.retry_after_seconds !== "number"
  ) {
    throw new Error("The sign-in rate-limit response is invalid.");
  }

  return row;
}
