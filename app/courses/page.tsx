// app/courses/page.tsx
import { supabaseServer } from '@/lib/supabase/server'

export const revalidate = 0 // siempre fresco

function clp(n: number) {
  return (n || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })
}

export default async function CoursesPage() {
  const supabase = supabaseServer()

  const { data: courses, error } = await supabase
  .from('courses')
  .select('id, code, slug, title, description, price_cents, hours, level, mp_link, published')
  .eq('published', true)
  .order('code', { ascending: true })

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#1E3A8A' }}>
      Catálogo de cursos
      </h1>
      <div className="rounded-xl border bg-red-50 text-red-700 p-4">
      <div className="font-semibold">Error cargando cursos</div>
      <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
      </div>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
    <h1 className="text-2xl font-bold mb-6" style={{ color: '#1E3A8A' }}>
    Catálogo de cursos
    </h1>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
    {courses?.map((c) => (
      <div key={c.id} className="rounded-2xl border p-5">
      <div className="text-sm text-gray-500 mb-1">
      {c.code} · {c.level}
      </div>
      <h3 className="font-semibold">{c.title}</h3>
      <p className="text-sm text-gray-600 mt-2">{c.description}</p>

      <div className="flex items-center justify-between mt-4">
      <div className="text-xl font-extrabold" style={{ color: '#1E3A8A' }}>
      {clp(c.price_cents ?? 0)}
      </div>

      <a
      href={c.mp_link ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white"
      style={{
        background: '#1E3A8A',
        opacity: c.mp_link ? 1 : 0.4,
        pointerEvents: c.mp_link ? 'auto' : 'none',
      }}
      >
      Comprar
      </a>
      </div>

      <div className="text-xs text-gray-500 mt-2">{c.hours} horas</div>
      </div>
    ))}
    {!courses?.length && (
      <div className="col-span-full rounded-xl border p-6 text-center text-gray-600">
      Aún no hay cursos publicados.
      </div>
    )}
    </div>
    </main>
  )
}
