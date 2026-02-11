"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function ForceLogout({ reason = "inactive" }: { reason?: string }) {
  const router = useRouter();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // If the app also opened a Supabase client session, clear it as well.
        try {
          await supabase.auth.signOut();
        } catch {}

        await signOut({ redirect: false });
      } finally {
        if (!alive) return;
        // Force hard reload to clear client-side caches
        window.location.href = `/login?reason=${encodeURIComponent(reason)}`;
      }
    })();

    return () => {
      alive = false;
    };
  }, [reason, router]);

  return null;
}
