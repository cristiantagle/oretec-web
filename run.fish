#!/usr/bin/env fish
# Crea SOLO archivos nuevos para links directos de Mercado Pago
# Usamos Python para escribir archivos y evitar expansiones de shell.

bash -lc '
set -e

python3 - << "PY"
from pathlib import Path

# 1) lib/catalog.ts — catálogo con tus links de MP
catalog_ts = """export type CatalogItem = {
  sku: string
  title: string
  priceCLP: number
  mpUrl: string // Link directo de Mercado Pago (preference / link de pago)
  description?: string
}

export const catalog: CatalogItem[] = [
  // ⚠️ Reemplaza los mpUrl por tus links reales de MP:
  {
    sku: "curso_basico",
    title: "Curso Básico de Seguridad",
    priceCLP: 19990,
    mpUrl: "https://mpago.la/xxxxx",
    description: "Introducción a prevención y seguridad laboral."
  },
  {
    sku: "curso_avanzado",
    title: "Curso Avanzado de Seguridad",
    priceCLP: 49990,
    mpUrl: "https://mpago.la/yyyyy",
    description: "Contenidos avanzados, normativa y casos."
  }
]

// Helper
export function getItemBySku(sku: string) {
  return catalog.find(c => c.sku === sku) || null
}
"""

# 2) components/BuyWithMercadoPago.tsx — botón que abre el link
buy_btn_tsx = """\\"use client\\"

import { getItemBySku } from \\"@/lib/catalog\\"

export default function BuyWithMercadoPago({ sku, label }: { sku: string; label?: string }) {
  const item = getItemBySku(sku)
  if (!item) {
    return (
      <button
        className=\\"rounded bg-gray-300 px-4 py-2 text-gray-600 cursor-not-allowed\\"
        title=\\"Producto no disponible\\"
        disabled
      >
        No disponible
      </button>
    )
  }

  return (
    <a
      href={item.mpUrl}
      target=\\"_blank\\"
      rel=\\"noopener noreferrer\\"
      className=\\"inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300\\"
      title={\`Pagar \${item.title} en Mercado Pago\`}
    >
      {label ?? \\"Comprar\\"} · $\${item.priceCLP.toLocaleString(\\"es-CL\\")}
    </a>
  )
}
"""

# Crear carpetas si no existen
Path("lib").mkdir(parents=True, exist_ok=True)
Path("components").mkdir(parents=True, exist_ok=True)

# Escribir archivos solo si NO existen
def write_if_missing(path: str, content: str):
    p = Path(path)
    if p.exists():
        print(f"Ya existía: {path}")
    else:
        p.write_text(content, encoding="utf-8")
        print(f"✓ Creado: {path}")

write_if_missing("lib/catalog.ts", catalog_ts)
write_if_missing("components/BuyWithMercadoPago.tsx", buy_btn_tsx)

print("Listo. Recuerda reemplazar los mpUrl por tus links reales de Mercado Pago en lib/catalog.ts")
PY
'
