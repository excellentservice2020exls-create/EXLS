import { getAuthenticatorAssuranceLevel } from "@/lib/supabase/assurance";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getPostLoginRoleLevel, requireAppUser } from "@/lib/erp-auth";
import { getRoleHomePath } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ContinueAfterSignInPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    redirect("/auth/session/expired");
  }

  const supabase = await createClient();
  const assurance = await getAuthenticatorAssuranceLevel(supabase);
  if (!assurance) {
    redirect("/auth/sign-in");
  }
  if (assurance.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
    redirect("/auth/mfa");
  }

  const roleLevel = await getPostLoginRoleLevel();
  if (roleLevel === 7) {
    redirect(getRoleHomePath(roleLevel));
  }

  const appUser = await requireAppUser();
  redirect(getRoleHomePath(appUser.level));
}
