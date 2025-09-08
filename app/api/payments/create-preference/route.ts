// app/api/payments/create-preference/route.ts
import { createPreference, type MPCreatePrefInput } from "@/lib/payments/mp";

function computeBaseUrl(req: Request, explicit?: string | null) {
  if (explicit && explicit.trim()) return explicit.trim().replace(/\/+$/, "");

  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim()) {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/+$/, "");
  }

  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  try {
    const url = new URL(req.url);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "http://localhost:3000";
  }
}

function isHttps(url: string | undefined | null) {
  return !!url && /^https:\/\//i.test(url);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<MPCreatePrefInput> & {
      // atajos comunes
      title?: string;
      quantity?: number;
      unit_price?: number;
      course_code?: string;
      course_id?: string;
      payer_email?: string;
      success_url?: string;
      failure_url?: string;
      pending_url?: string;
      base_url?: string;
      debug?: boolean;
    };

    // Items: atajo simple
    let items = body.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      const title = (body.title || "Pago OreTec").toString();
      const quantity = Math.max(1, Number(body.quantity ?? 1));
      const unit_price = Math.max(0, Number(body.unit_price ?? 0));
      items = [
        {
          title,
          quantity,
          unit_price,
          currency_id: "CLP",
          id: body.course_code || body.course_id || undefined,
        },
      ];
    }

    // Construye URLs de retorno
    const baseUrl = computeBaseUrl(req, body.base_url);
    const success = (body.success_url && body.success_url.trim()) || `${baseUrl}/payments/success`;
    const failure = (body.failure_url && body.failure_url.trim()) || `${baseUrl}/payments/failure`;
    const pending = (body.pending_url && body.pending_url.trim()) || `${baseUrl}/payments/pending`;

    const back_urls = { success, failure, pending };
    const notification_url = `${baseUrl}/api/payments/webhook`;

    // Mercado Pago exige success HTTPS cuando auto_return="approved".
    // Si NO son HTTPS (por ejemplo, localhost), omitimos auto_return para no gatillar el error.
    const allHttps = isHttps(success) && isHttps(failure) && isHttps(pending);

    const payload: MPCreatePrefInput = {
      items: items.map((it) => ({ ...it, currency_id: it.currency_id || "CLP" })),
      back_urls,
      notification_url,
      ...(allHttps ? { auto_return: "approved" as const } : {}), // condicional
      metadata: {
        course_code: body.course_code || null,
        course_id: body.course_id || null,
        source: "checkout_pro",
        ...(body.metadata || {}),
      },
      payer: body.payer_email ? { email: body.payer_email } : undefined,
      statement_descriptor: "ORETEC",
    };

    const pref = await createPreference(payload);

    if (body.debug) {
      return Response.json({
        ok: true,
        debug: { baseUrl, back_urls, notification_url, allHttps },
        id: pref.id,
        init_point: pref.init_point,
        sandbox_init_point: pref.sandbox_init_point || null,
      });
    }

    return Response.json({
      ok: true,
      id: pref.id,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point || null,
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: "mp_error", detail: e?.message || String(e) }),
                        { status: 500 }
    );
  }
}
