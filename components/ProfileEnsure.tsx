"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileEnsure() {
  const router = useRouter();

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        await fetch("/api/profile/ensure", { method: "POST", cache: "no-store" });
      } catch (_) {
        // ignoramos errores
      } finally {
        if (!abort) router.refresh();
      }
    })();
    return () => { abort = true; };
  }, [router]);

  return null;
}
