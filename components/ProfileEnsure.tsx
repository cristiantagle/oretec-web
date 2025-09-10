"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function ProfileEnsure() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (token) {
          await fetch("/api/profile/ensure", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
        }
      } catch (_) {
        // ignoramos errores
      } finally {
        if (!abort) router.refresh();
      }
    })();
    return () => { abort = true; };
  }, [router, supabase]);

  return null;
}
