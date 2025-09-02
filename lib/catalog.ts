export type CatalogItem = {
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
