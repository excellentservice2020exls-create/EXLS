import { createClient } from "@/lib/supabase/server";
import { isUnauthenticatedError } from "@/lib/supabase/auth-errors";
import { NextResponse, type NextRequest } from "next/server";

async function clearLocalSession() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error && !isUnauthenticatedError(error)) {
    throw error;
  }
}

export async function POST() {
  await clearLocalSession();
  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  await clearLocalSession();
  return NextResponse.redirect(
    new URL("/auth/sign-in?status=session-expired", request.url),
  );
}
