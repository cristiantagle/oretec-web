import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const bad = (msg: string, code = 400) =>
    new Response(JSON.stringify({ error: msg }), { status: code, headers: { 'Content-Type': 'application/json' } })

  const json = await req.json().catch(() => null)
  if (!json) return bad('JSON inválido')

  const s = (x: any) => (typeof x === 'string' ? x.trim() : '')
  const name = s(json.name)
  const email = s(json.email)
  const phone = s(json.phone) || null
  const company = s(json.company) || null
  const message = s(json.message)
  const hp = s(json.hp)

  if (hp) return new Response(JSON.stringify({ ok: true }), { status: 200 }) // honeypot => ignorar silenciosamente
  if (!name || !email || !message) return bad('Faltan campos requeridos (name, email, message)')

  if (!email.includes('@') || email.length > 160) return bad('Email inválido')
  if (name.length > 160) return bad('Nombre demasiado largo')
  if (company && company.length > 160) return bad('Empresa demasiado larga')
  if (phone && phone.length > 60) return bad('Teléfono demasiado largo')
  if (message.length > 4000) return bad('Mensaje demasiado largo')

  const supabase = supabaseServer()
  const { error } = await supabase
    .from('contacts')
    .insert([{ name, email, phone, company, message, status: 'new' }])

  if (error) {
    return bad('Error al guardar', 500)
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
