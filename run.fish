#!/usr/bin/env fish
# Crea SOLO app/admin/layout.tsx si no existe (heredoc via bash para evitar conflictos de fish)

set -l FILE app/admin/layout.tsx
if test -f $FILE
  echo "Ya existía: $FILE"
  exit 0
end

mkdir -p (dirname $FILE)

bash -lc '
cat > app/admin/layout.tsx << "TS"
// app/admin/layout.tsx
import type { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#1E3A8A" }}>
          Panel de Administración
        </h1>
        <p className="text-slate-600 text-sm">
          Gestión de usuarios y privilegios.
        </p>
      </header>
      {children}
    </section>
  )
}
TS
'

echo "✓ Creado: $FILE"
