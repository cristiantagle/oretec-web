/**
 * Webhook de notificaciones de MercadoPago (IPN/Webhooks)
 * Por ahora: hace echo de lo recibido. Luego puedes validar y actualizar ordenes.
 */
export async function POST(req: Request) {
  try {
    const text = await req.text();
    // MP envía query params y/o body JSON dependiendo del evento.
    // Aquí sólo lo devolvemos para depurar en dev.
    return new Response(text || "ok", { status: 200 });
  } catch {
    return new Response("ok", { status: 200 });
  }
}

export async function GET(req: Request) {
  // MP puede pingear con GET para verificar webhook
  const url = new URL(req.url);
  const qp: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (qp[k] = v));
  return Response.json({ ok: true, query: qp });
}
