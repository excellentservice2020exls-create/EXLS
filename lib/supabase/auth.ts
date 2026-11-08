import "server-only";

import { isUnauthenticatedError } from "./auth-errors";
import { createClient } from "./server";
import { db } from "@/prisma/db";

const SESSION_MAX_AGE_MS = 60 * 60 * 1000;

type AuthenticatedUser = {
  id: string;
  email: string | null;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
};

async function getVerifiedAuthenticatedUser(
  accessToken?: string,
  onRejected?: (reason: string) => void,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims(accessToken);

  if (error) {
    if (!isUnauthenticatedError(error)) {
      throw error;
    }

    onRejected?.("claims_rejected");
    return null;
  }

  const claims = data?.claims;
  if (!claims?.sub) {
    onRejected?.("subject_missing");
    return null;
  }

  const issuedAt = claims.iat;
  const sessionId = claims.session_id;
  if (
    typeof sessionId !== "string" ||
    !sessionId ||
    typeof issuedAt !== "number" ||
    !Number.isSafeInteger(issuedAt) ||
    issuedAt <= 0
  ) {
    onRejected?.("session_claims_missing_or_invalid");
    return null;
  }

  const createdAt = new Date(issuedAt * 1000);
  if (createdAt.getTime() > Date.now() + 30_000) {
    onRejected?.("issued_at_in_future");
    return null;
  }

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    sessionId,
    createdAt,
    expiresAt: new Date(createdAt.getTime() + SESSION_MAX_AGE_MS),
  };
}

export async function registerAuthenticatedSession(
  accessToken?: string,
  onRejected?: (reason: string) => void,
): Promise<AuthenticatedUser | null> {
  const authenticatedUser = await getVerifiedAuthenticatedUser(accessToken, onRejected);
  if (!authenticatedUser) {
    return null;
  }

  const existingSession = await db.orm.public.AppAuthSession
    .where({ sessionId: authenticatedUser.sessionId })
    .select("authUserId", "createdAt", "expiresAt")
    .first();
  if (existingSession) {
    if (existingSession.authUserId !== authenticatedUser.id) {
      throw new Error("The Supabase session is already linked to a different user.");
    }

    if (existingSession.expiresAt.getTime() <= Date.now()) {
      onRejected?.("registered_session_expired");
      return null;
    }

    return {
      ...authenticatedUser,
      createdAt: existingSession.createdAt,
      expiresAt: existingSession.expiresAt,
    };
  }

  if (authenticatedUser.expiresAt.getTime() <= Date.now()) {
    onRejected?.("token_session_expired");
    return null;
  }

  await db.orm.public.AppAuthSession.create({
    authUserId: authenticatedUser.id,
    sessionId: authenticatedUser.sessionId,
    createdAt: authenticatedUser.createdAt,
    expiresAt: authenticatedUser.expiresAt,
  });

  return authenticatedUser;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const authenticatedUser = await getVerifiedAuthenticatedUser();
  if (!authenticatedUser) {
    return null;
  }

  const registeredSession = await db.orm.public.AppAuthSession
    .where({ sessionId: authenticatedUser.sessionId })
    .select("authUserId", "createdAt", "expiresAt")
    .first();

  if (
    !registeredSession ||
    registeredSession.authUserId !== authenticatedUser.id ||
    registeredSession.expiresAt.getTime() <= Date.now()
  ) {
    return null;
  }

  return {
    ...authenticatedUser,
    createdAt: registeredSession.createdAt,
    expiresAt: registeredSession.expiresAt,
  };
}
