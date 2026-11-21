import "server-only";

import { isUnauthenticatedError } from "./auth-errors";
import { createClient } from "./server";
import { db } from "@/prisma/db";

const SESSION_MAX_AGE_MS = 60 * 60 * 1000;

type VerifiedUser = {
  id: string;
  email: string | null;
  sessionId: string;
};

type AuthenticatedUser = VerifiedUser & {
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

  const sessionId = claims.session_id;
  if (typeof sessionId !== "string" || !sessionId) {
    onRejected?.("session_id_missing_or_invalid");
    return null;
  }

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    sessionId,
  };
}

async function findRegisteredSession(sessionId: string) {
  return db.orm.public.AppAuthSession
    .where({ sessionId })
    .select("authUserId", "createdAt", "expiresAt")
    .first();
}

function getActiveRegisteredSession(
  authenticatedUser: VerifiedUser,
  registeredSession: Awaited<ReturnType<typeof findRegisteredSession>>,
  onRejected?: (reason: string) => void,
): AuthenticatedUser | null {
  if (!registeredSession) {
    return null;
  }

  if (registeredSession.authUserId !== authenticatedUser.id) {
    throw new Error("The Supabase session is already linked to a different user.");
  }

  const expiresAt = new Date(
    registeredSession.createdAt.getTime() + SESSION_MAX_AGE_MS,
  );
  if (expiresAt.getTime() <= Date.now()) {
    onRejected?.("registered_session_expired");
    return null;
  }

  return {
    ...authenticatedUser,
    createdAt: registeredSession.createdAt,
    expiresAt,
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

  const existingSession = await findRegisteredSession(authenticatedUser.sessionId);
  if (existingSession) {
    return getActiveRegisteredSession(authenticatedUser, existingSession, onRejected);
  }

  // Start the app session clock when this session is first registered. JWT iat
  // can be ahead of this server's clock, so it must not control app expiry.
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_MAX_AGE_MS);

  try {
    await db.orm.public.AppAuthSession.create({
      authUserId: authenticatedUser.id,
      sessionId: authenticatedUser.sessionId,
      createdAt,
      expiresAt,
    });
  } catch (error) {
    // Sign-in and callback requests can race to register the same session.
    // Reuse the row created by the winning request when that happens.
    const concurrentlyRegisteredSession = await findRegisteredSession(
      authenticatedUser.sessionId,
    );
    if (!concurrentlyRegisteredSession) {
      throw error;
    }

    return getActiveRegisteredSession(
      authenticatedUser,
      concurrentlyRegisteredSession,
      onRejected,
    );
  }

  return { ...authenticatedUser, createdAt, expiresAt };
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const authenticatedUser = await getVerifiedAuthenticatedUser();
  if (!authenticatedUser) {
    return null;
  }

  const registeredSession = await findRegisteredSession(authenticatedUser.sessionId);
  return getActiveRegisteredSession(authenticatedUser, registeredSession);
}
