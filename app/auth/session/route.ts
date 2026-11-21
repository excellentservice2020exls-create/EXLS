import { registerAuthenticatedSession } from "@/lib/supabase/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.match(/^Bearer\s+([^\s]+)$/i)?.[1];
  if (!accessToken) {
    console.warn("[auth/session] rejected: bearer_token_missing");
    return NextResponse.json(
      { error: "Jeton de session manquant ou invalide." },
      { status: 401 },
    );
  }

  const session = await registerAuthenticatedSession(accessToken, (reason) => {
    console.warn(`[auth/session] rejected: ${reason}`);
  });
  if (!session) {
    return NextResponse.json(
      { error: "Une nouvelle session de connexion est nécessaire." },
      { status: 401 },
    );
  }

  return NextResponse.json(
    { expiresAt: session.expiresAt.toISOString() },
    { status: 201 },
  );
}
