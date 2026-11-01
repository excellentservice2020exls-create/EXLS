import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAuthenticatorAssuranceLevel(
  supabase: SupabaseClient,
  accessToken?: string,
) {
  let token = accessToken;

  if (!token) {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }

    token = data.session?.access_token;
  }

  if (!token) {
    return null;
  }

  const { data, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel(token);
  if (error) {
    throw error;
  }

  return data;
}
