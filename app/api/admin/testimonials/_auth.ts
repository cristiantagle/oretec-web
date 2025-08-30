import { cookies } from "next/headers"

export function requireAdmin() {
  const isAuth = cookies().get("admin_auth")?.value === "1"
  if (!isAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }
  return null
}
