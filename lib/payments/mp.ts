// lib/payments/mp.ts
type MPItem = {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string; // CLP por defecto
  id?: string; // opcional: course_code o course_id
};

export type MPCreatePrefInput = {
  items: MPItem[];
  auto_return?: "approved";
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url?: string;
  metadata?: Record<string, any>;
  payer?: { email?: string };
  statement_descriptor?: string;
};

const MP_API_BASE = "https://api.mercadopago.com";
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

/** Lanza error con mensaje detallado si la respuesta no es OK */
async function mpFetch(path: string, init: RequestInit) {
  if (!MP_ACCESS_TOKEN) {
    throw new Error("Falta MP_ACCESS_TOKEN en variables de entorno (server).");
  }
  const res = await fetch(`${MP_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    const snippet = text || res.statusText;
    throw new Error(`MP API error ${res.status}: ${snippet}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text as any;
  }
}

export async function createPreference(payload: MPCreatePrefInput) {
  // Asegura currency CLP por item
  const safe: MPCreatePrefInput = {
    ...payload,
    items: (payload.items || []).map((it) => ({
      ...it,
      currency_id: it.currency_id || "CLP",
    })),
  };

  const json = await mpFetch("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(safe),
  });

  // Campos típicos devueltos por MP
  return {
    id: json.id as string,
    init_point: json.init_point as string,
    sandbox_init_point: json.sandbox_init_point as string | null,
    raw: json,
  };
}
