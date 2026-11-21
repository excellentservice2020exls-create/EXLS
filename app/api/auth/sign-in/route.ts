import { isIP } from "node:net";
import { NextResponse, type NextRequest } from "next/server";
import { checkSignInRateLimit } from "@/lib/supabase/auth-rate-limit";
import { createClient } from "@/lib/supabase/server";

const MAX_BODY_BYTES = 4096;

class PayloadTooLargeError extends Error {}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const candidate = forwardedFor?.split(",")[0]?.trim();
  return candidate && isIP(candidate) ? candidate : null;
}

async function readJsonBody(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    throw new PayloadTooLargeError();
  }

  if (!request.body) {
    throw new SyntaxError("Request body is missing.");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

function jsonResponse(
  body: { error: string },
  status: number,
  headers?: HeadersInit,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse({ error: "Format de requête invalide." }, 415);
  }

  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return jsonResponse({ error: "Requête trop volumineuse." }, 413);
    }
    if (error instanceof SyntaxError) {
      return jsonResponse({ error: "Requête invalide." }, 400);
    }
    throw error;
  }

  const values =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const email = typeof values.email === "string" ? values.email.trim() : null;
  const password = typeof values.password === "string" ? values.password : null;

  let limit: Awaited<ReturnType<typeof checkSignInRateLimit>>;
  try {
    limit = await checkSignInRateLimit(email, getClientIp(request));
  } catch (error) {
    console.error("[api/auth/sign-in] rate_limit_check_failed", error);
    return jsonResponse(
      { error: "La connexion est temporairement indisponible. Réessayez plus tard." },
      503,
    );
  }

  if (!limit.allowed) {
    const retryAfter = Math.max(1, Math.ceil(limit.retry_after_seconds));
    return jsonResponse(
      { error: "Trop de tentatives. Veuillez réessayer plus tard." },
      429,
      { "Retry-After": String(retryAfter) },
    );
  }

  if (
    !email ||
    email.length > 320 ||
    !email.includes("@") ||
    /\s/.test(email) ||
    !password ||
    password.length > 1024
  ) {
    return jsonResponse({ error: "Adresse e-mail ou mot de passe invalide." }, 400);
  }

  let result;
  try {
    const supabase = await createClient();
    result = await supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    console.error("[api/auth/sign-in] authentication_request_failed", error);
    return jsonResponse(
      { error: "La connexion est temporairement indisponible. Réessayez plus tard." },
      503,
    );
  }

  if (result.error) {
    if (result.error.status === 429) {
      return jsonResponse(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        429,
        { "Retry-After": "60" },
      );
    }
    if (result.error.status !== 400 && result.error.status !== 401) {
      console.error("[api/auth/sign-in] authentication_request_failed", result.error);
      return jsonResponse(
        { error: "La connexion est temporairement indisponible. Réessayez plus tard." },
        503,
      );
    }
    return jsonResponse(
      { error: "Adresse e-mail ou mot de passe invalide." },
      401,
    );
  }

  const accessToken = result.data.session?.access_token;
  if (!accessToken) {
    return jsonResponse(
      { error: "La session de connexion est introuvable. Veuillez réessayer." },
      401,
    );
  }

  return NextResponse.json(
    { accessToken },
    { headers: { "Cache-Control": "no-store" } },
  );
}
