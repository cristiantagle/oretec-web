import 'server-only'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { password, next } = await req.json()
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN
    if (!ADMIN_TOKEN) {
      return NextResponse.json({ error: 'ADMIN_TOKEN no configurado' }, { status: 500 })
    }
    if (!password || password !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true, next: next || '/admin' })
    const isProd = process.env.VERCEL === '1'
    res.cookies.set('admin_token', ADMIN_TOKEN, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
    })
    return res
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 })
  }
}
