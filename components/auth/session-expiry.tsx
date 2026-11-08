"use client";

import { useEffect } from "react";

export function SessionExpiry({ expiresInMs }: { expiresInMs: number }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let expired = false;
    const deadline = performance.now() + expiresInMs;

    function expireSession() {
      if (expired) return;
      expired = true;
      window.location.replace("/auth/session/expired");
    }

    function checkExpiration() {
      clearTimeout(timer);
      const remaining = deadline - performance.now();
      if (remaining <= 0) {
        expireSession();
        return;
      }

      timer = setTimeout(expireSession, remaining);
    }

    checkExpiration();
    document.addEventListener("visibilitychange", checkExpiration);
    window.addEventListener("focus", checkExpiration);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", checkExpiration);
      window.removeEventListener("focus", checkExpiration);
    };
  }, [expiresInMs]);

  return null;
}
