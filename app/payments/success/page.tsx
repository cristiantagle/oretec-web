"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export const metadata = { title: "Pago exitoso — OreTec" };

type PaymentStatus = "loading" | "approved" | "pending" | "rejected" | "error";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("collection_id") || // MP usa a veces este nombre
    null;

    if (!paymentId) {
      setStatus("error");
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
        setStatus(j.payment?.status || "pending");
        setDetail(j.payment || null);
      } catch (e) {
        setStatus("error");
      }
    })();
  }, [searchParams]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
    {status === "loading" && (
      <div className="rounded-lg border p-6 text-slate-600">
      Verificando pago…
      </div>
    )}

    {status === "approved" && (
      <>
      <h1 className="text-2xl font-bold text-green-700">¡Pago aprobado!</h1>
      <p className="mt-2 text-slate-700">
      Gracias por tu compra. Te enviamos un correo con los detalles.
      </p>
      <a href="/courses" className="btn-primary mt-6 inline-block">
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
      </>
    )}

    {status === "rejected" && (
      <>
      <h1 className="text-2xl font-bold text-red-700">Pago rechazado</h1>
      <p className="mt-2 text-slate-700">
      No pudimos procesar tu pago. Inténtalo nuevamente.
      </p>
      <a href="/courses" className="btn-secondary mt-6 inline-block">
      Reintentar compra
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
