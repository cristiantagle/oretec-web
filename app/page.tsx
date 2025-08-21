import Link from 'next/link'

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold" style={{color:'var(--brand)'}}>OreTec</h1>
      <p className="mt-2 text-gray-600">Formación en Prevención y Seguridad Laboral</p>
      <div className="mt-6 flex gap-3">
        <Link className="px-4 py-2 rounded text-white" style={{background:'var(--brand)'}} href="/courses">Ver cursos</Link>
        <Link className="px-4 py-2 rounded border" style={{borderColor:'var(--brand)', color:'var(--brand)'}} href="/dashboard/proof">Enviar comprobante</Link>
        <Link className="px-4 py-2 rounded border" style={{borderColor:'var(--brand)', color:'var(--brand)'}} href="/admin">Admin</Link>
      </div>
    </main>
  )
}
