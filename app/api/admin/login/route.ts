import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json().catch(() => ({} as any))
    const provided = token || password
    const expected = process.env.ADMIN_TOKEN

    if (!expected) {
      return NextResponse.json({ error: 'ADMIN_TOKEN not configured' }, { status: 500 })
    }
    if (!provided || provided !== expected) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
    }

    cookies().set({
      name: 'admin_auth',
      value: '1',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,   // en Vercel es HTTPS
      path: '/',      // visible para todo el sitio y APIs
      maxAge: 60 * 60 * 8, // 8h
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'unexpected', detail: e?.message ?? String(e) },
      { status: 500 }
    )
  }
}
