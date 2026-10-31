import { MfaChallenge } from "@/components/auth/mfa-challenge";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const instant = false;

export default async function MfaPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) {
    throw error;
  }
  if (data.currentLevel === "aal2") {
    redirect("/account");
  }
  if (data.nextLevel !== "aal2") {
    redirect("/account");
  }

  return <MfaChallenge />;
}
