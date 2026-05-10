"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

const REFRESH_INTERVAL_MS = 30 * 1000;

export function SessionPermissionsRefresher() {
  const { status, update } = useSession();

  React.useEffect(() => {
    if (status !== "authenticated") return;

    let refreshing = false;
    let lastRefresh = 0;

    const refresh = async () => {
      const now = Date.now();
      if (refreshing || now - lastRefresh < 5_000) return;

      refreshing = true;
      lastRefresh = now;
      try {
        await update();
      } finally {
        refreshing = false;
      }
    };

    const handleFocus = () => {
      void refresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, update]);

  return null;
}
