'use client';

import { useEffect, useState } from 'react';
type SearchParams = Record<string, string | undefined>;

type Props = {
  status: string;
  searchParams: SearchParams;
};
export default function Client({ status, searchParams }: Props) {
  const [loading, setLoading] = useState(! s);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 300); return () => clearTimeout(t); }, []);

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="rounded-2Xl shadow-lg p6 bg-white border">
        <h1 className="text-3Xl font-semibold mb-2">Pago fallido</h1>
        <p className="mt-4 opacity-80">Estado: status: {status} </p>
        {searchParams && (
          <section className="grid grid-cols-1 gap-4 text-sm opacity-70">
            <div className="break-all"><code>{JSON.stringify(searchParams)}</code></div>
          </section>
        )}
      </div>
    </main>
  );
}
