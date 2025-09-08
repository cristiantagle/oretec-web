// components/BuyNowMP.tsx
"use client";

import { useState } from "react";

type Props = {
  title: string;
  unitPriceCLP: number;
  quantity?: number;
  courseCode?: string;
  courseId?: string;
  label?: string;
  className?: string;
  /** fuerza sandbox desde UI, útil para pruebas manuales (sobre-escribe NODE_ENV) */
  forceSandbox?: boolean;
};

export default function BuyNowMP({
  title,
  unitPriceCLP,
  quantity = 1,
  courseCode,
  courseId,
  label = "Comprar ahora",
  className = "inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300",
  forceSandbox = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          title,
          quantity,
          unit_price: unitPriceCLP,
          course_code: courseCode,
          course_id: courseId,
        }),
      });

      const j = await r.json();
      if (!r.ok) throw new Error(j?.detail || j?.error || "mp_pref_error");

      // 🔹 En dev (o si forzamos), usa siempre SANDBOX
      const useSandbox =
      forceSandbox || (typeof window !== "undefined" && process.env.NODE_ENV !== "production");

      const url = useSandbox && j.sandbox_init_point ? j.sandbox_init_point : j.init_point;
      if (!url) throw new Error("No se obtuvo URL de pago");

      // Consejo: abrir en nueva pestaña ayuda a ver la URL exacta cuando falla
      window.location.href = url;
      // o: window.open(url, "_blank", "noopener,noreferrer")
    } catch (e: any) {
      setErr(e?.message || "No se pudo iniciar el pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-stretch gap-1">
    <button onClick={go} disabled={loading} className={className} type="button">
    {loading ? "Redirigiendo…" : label}
    </button>
    {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
