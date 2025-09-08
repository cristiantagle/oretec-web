"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export const metadata = { title: "Pago fallido — OreTec" };

type PaymentStatus = "loading" | "rejected" | "cancelled" | "failure" | "error" | "pending" | "approved";

export default function FailurePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("collection_id") ||
    null;

    // Si venimos sin payment_id (p.ej. el usuario canceló antes de pagar)
    if (!paymentId) {
      setStatus("failure");
      return;
    }

    (async () => {
      try {
        const r = await fetch(`/api/payments/verify?payment_id=${paymentId}`);
        const j = await r.json();
        if (!r.ok || !j.ok) {
          setStatus("error");
          setDetail(j);
          return;
        }
        // MP puede reportar "rejected", "cancelled", "pending", etc.
        const s: PaymentStatus = (j.payment?.status as any) ?? "failure";
        setStatus(s);
        setDetail(j.payment || null);
      } catch {
        setStatus("error");
      }
    })();
  }, [searchParams]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
    {status === "loading" && (
      <div className="rounded-lg border p-6 text-slate-600">
      Verificando estado del pago…
      </div>
    )}

    {(status === "rejected" || status === "cancelled" || status === "failure") && (
      <>
      <h1 className="text-2xl font-bold text-red-700">Pago no completado</h1>
      <p className="mt-2 text-slate-700">
      Tu pago no pudo completarse o fue cancelado. Puedes intentar nuevamente.
      </p>
      <a href="/courses" className="btn-secondary mt-6 inline-block">
      Volver a cursos
      </a>
      </>
    )}

    {status === "pending" && (
      <>
      <h1 className="text-2xl font-bold text-amber-600">
      Pago pendiente de confirmación
      </h1>
      <p className="mt-2 text-slate-700">
      Tu pago aún no se confirma. Te avisaremos cuando se acredite.
      </p>
      <a href="/payments/pending" className="btn-secondary mt-6 inline-block">
      Ver estado
      </a>
      </>
    )}

    {status === "approved" && (
      <>
      <h1 className="text-2xl font-bold text-green-700">Pago aprobado</h1>
      <p className="mt-2 text-slate-700">
      Tu pago fue procesado correctamente.
      </p>
      <a href="/courses" className="btn-primary mt-6 inline-block">
      Ir a cursos
      </a>
      </>
    )}

    {status === "error" && (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
      Error al verificar el pago. {detail?.error || ""}
      </div>
    )}
    </main>
  );
}
