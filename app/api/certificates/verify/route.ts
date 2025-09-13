import { NextResponse } from 'next/server'

// MVP: acepta ?folio=... y responde 200 con datos mínimos (en producción, look up real)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const folio = searchParams.get('folio')
  if (!folio) {
    return NextResponse.json({ ok: false, error: 'Folio requerido' }, { status: 400 })
  }
  // Aquí podrías validar HMAC o buscar en BD. MVP: echo.
  return NextResponse.json({
    ok: true,
    folio,
    message: 'Certificado válido (MVP). Validación real pendiente.'
  })
}
