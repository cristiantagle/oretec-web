"use client"

import { getItemBySku } from "@/lib/catalog"

export default function BuyWithMercadoPago({ sku, label }: { sku: string; label?: string }) {
  const item = getItemBySku(sku)
  if (!item) {
    return (
      <button
        className="rounded bg-gray-300 px-4 py-2 text-gray-600 cursor-not-allowed"
        title="Producto no disponible"
        disabled
      >
        No disponible
      </button>
    )
  }

  return (
    <a
      href={item.mpUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
      title={\`Pagar \${item.title} en Mercado Pago\`}
    >
      {label ?? "Comprar"} · $\${item.priceCLP.toLocaleString("es-CL")}
    </a>
  )
}
