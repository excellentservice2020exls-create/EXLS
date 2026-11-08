"use client";

import { useEffect } from "react";

export function SessionExpiry({ expiresAt }: { expiresAt: string }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let expired = false;

    async function expireSession() {
      if (expired) return;
      expired = true;

      try {
        const response = await fetch("/auth/session/expired", { method: "POST" });
        if (!response.ok) {
          throw new Error(`Session cleanup failed with status ${response.status}.`);
        }
      } catch (error) {
        console.error("Unable to clear the expired Supabase session.", error);
      } finally {
        window.location.replace("/auth/sign-in?status=session-expired");
      }
    }

    function checkExpiration() {
      clearTimeout(timer);
      const remaining = Date.parse(expiresAt) - Date.now();
      if (remaining <= 0) {
        void expireSession();
        return;
      }

      timer = setTimeout(checkExpiration, Math.min(remaining, 60_000));
    }

    checkExpiration();
    document.addEventListener("visibilitychange", checkExpiration);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", checkExpiration);
    };
  }, [expiresAt]);

  return null;
}
