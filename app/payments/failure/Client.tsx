"use client"
import { useEffect, useState } from 'react';

type SearchParams = Record<string, string | string[] | undefined>;
type Props = { status: 'approved' | 'pending' | 'failure'; searchParams: SearchParams };

export default function Client({ status, searchParams }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="rounded-2xl shadow-lg p-6 bg-white border">
        <h1 className="text-3xl font-semibold mb-2">
          {status === 'approved' ? 'Pago exitoso' : status === 'pending' ? 'Pago pendiente' : 'Pago fallido'} - OreTec
        </h1>
        <p className="mt-4 opacity-80">Estado: {loading ? 'cargando…' : status}</p>
        {searchParams && (
          <section className="grid grid-cols-1 gap-4 text-sm opacity-70 mt-4">
            <div className="break-all"><code>{JSON.stringify(searchParams)}</code></div>
          </section>
        )}
      </div>
    </main>
  );
}
