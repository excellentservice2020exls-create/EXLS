import { registerAuthenticatedSession } from "@/lib/supabase/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await registerAuthenticatedSession();
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
