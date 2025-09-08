"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export const metadata = { title: "Pago pendiente — OreTec" };

type PaymentStatus = "loading" | "pending" | "approved" | "rejected" | "cancelled" | "error";

export default function PendingPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("collection_id") ||
    null;

    if (!paymentId) {
      // Si no hay id, mostramos simplemente “pendiente”
      setStatus("pending");
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
        const s: PaymentStatus = (j.payment?.status as any) ?? "pending";
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

    {status === "pending" && (
      <>
      <h1 className="text-2xl font-bold text-amber-600">Pago pendiente</h1>
      <p className="mt-2 text-slate-700">
      Estamos esperando la confirmación del pago. Puedes refrescar esta página más tarde.
      </p>
      <button onClick={() => location.reload()} className="btn-secondary mt-6">
      Actualizar estado
      </button>
      </>
    )}

    {status === "approved" && (
      <>
      <h1 className="text-2xl font-bold text-green-700">Pago aprobado</h1>
      <p className="mt-2 text-slate-700">
      ¡Listo! Tu pago fue acreditado.
      </p>
      <a href="/courses" className="btn-primary mt-6 inline-block">
      Ir a cursos
      </a>
      </>
    )}

    {(status === "rejected" || status === "cancelled") && (
      <>
      <h1 className="text-2xl font-bold text-red-700">Pago no completado</h1>
      <p className="mt-2 text-slate-700">
      El pago fue rechazado o cancelado.
      </p>
      <a href="/courses" className="btn-secondary mt-6 inline-block">
      Volver a cursos
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
