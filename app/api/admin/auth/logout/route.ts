import 'server-only'
import { NextResponse } from 'next/server'

function logoutResponse(req: Request) {
  const res = NextResponse.redirect(new URL('/admin/login', req.url))
  res.cookies.set('admin_token', '', { path: '/', maxAge: 0 })
  return res
}

export async function POST(req: Request) {
  return logoutResponse(req)
}

export async function GET(req: Request) {
  return logoutResponse(req)
}
