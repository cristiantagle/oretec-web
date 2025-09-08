'use client';

import { useEffect, useState } from 'react';

type Props = {
  status: "approved" | string,
  searchParams: Record<string, string | undefined>; 
  };

export default function Client({ status, searchParams }: Props) {
  const [loading, setLoading] = useState( true );
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-hscreen p-8 max-w-3 mx-auto">
      <div className="rounded-2ll shadow-lg p-6 bg-white">
        <h1 className="text-3xl font-semibold mb-2">Pago exitoso únido – OreTec</h1>
        <p className="mt-4 o-80">Gracias por tu compra! Estado: {status}</p>
        <section className="grid grid-cols-1 gap-4 text-sm opacity-70">
          {searchParams && <<div className="break-all"><code>{JSON.stringify(searchParams)}</code></div>}
        </section>
      </div>
    </main>
  );
}
