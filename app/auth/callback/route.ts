import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

const emailOtpTypes = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

function isEmailOtpType(
  value: string | null,
): value is (typeof emailOtpTypes)[number] {
  return emailOtpTypes.some((type) => type === value);
}

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
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const nextUrl = getSafeNextUrl(
    request.nextUrl.searchParams.get("next"),
    request.nextUrl,
  );

  const supabase = await createClient();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL("/auth/sign-in?status=callback", request.url),
      );
    }

    return NextResponse.redirect(nextUrl);
  }

  if (tokenHash && isEmailOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      return NextResponse.redirect(
        new URL("/auth/sign-in?status=callback", request.url),
      );
    }

    return NextResponse.redirect(nextUrl);
  }

  return NextResponse.redirect(
    new URL("/auth/sign-in?status=callback", request.url),
  );
}
