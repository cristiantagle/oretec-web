'use client';

import { useEffect, useState } from 'react';

type Props = {
  status: "failure" | string,
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
        <h1 className="text-3xl font-semibold mb-2">Pago fallido</h1>
        <p className="mt-4 o-80">Lo sentimos, algo no salio bien. Estado': {status}</p>
        <section className="grid grid-cols-1 gap-4 text-sm opacity-70">
          {searchParams && <div className="break-all"><code>{JSON.stringify(searchParams)}</code></div>}
        </section>
      </div>
    </main>
  );
}
