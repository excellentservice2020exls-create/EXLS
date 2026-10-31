import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

function getSafeNextUrl(value: string | null, baseUrl: URL) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return new URL("/auth/sign-in", baseUrl);
  }

  const destination = new URL(value, baseUrl);
  if (destination.origin !== baseUrl.origin) {
    return new URL("/auth/sign-in", baseUrl);
  }
  return destination;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextUrl = getSafeNextUrl(
    request.nextUrl.searchParams.get("next"),
    request.nextUrl,
  );

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?status=callback", request.url),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?status=callback", request.url),
    );
  }

  return NextResponse.redirect(nextUrl);
}
