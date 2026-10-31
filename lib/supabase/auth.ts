import "server-only";

import { isUnauthenticatedError } from "./auth-errors";
import { createClient } from "./server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    if (!isUnauthenticatedError(error)) {
      throw error;
    }

    return null;
  }

  const claims = data?.claims;
  if (!claims?.sub) {
    return null;
  }

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
  };
}
