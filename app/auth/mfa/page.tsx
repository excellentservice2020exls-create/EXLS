import { MfaChallenge } from "@/components/auth/mfa-challenge";
import { SessionExpiry } from "@/components/auth/session-expiry";
import { getAuthenticatorAssuranceLevel } from "@/lib/supabase/assurance";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MfaPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/session/expired");
  }

  const supabase = await createClient();
  const data = await getAuthenticatorAssuranceLevel(supabase);
  if (!data) {
    redirect("/auth/sign-in");
  }
  if (data.currentLevel === "aal2") {
    redirect("/attendance");
  }
  if (data.nextLevel !== "aal2") {
    redirect("/attendance");
  }

  return (
    <>
      <SessionExpiry expiresAt={user.expiresAt.toISOString()} />
      <MfaChallenge />
    </>
  );
}
