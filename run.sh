#!/usr/bin/env bash
set -euo pipefail

# Nombre de la rama con timestamp
BRANCH="fix/auth-redirect-test-$(date +%Y%m%d-%H%M%S)"

echo "🪄 Creando rama $BRANCH…"

# Guardar cambios en stash por si acaso
git stash push -u -m "auto-stash-before-$BRANCH" || true

# Crear rama desde main
git checkout main
git pull origin main
git checkout -b "$BRANCH"

# Restaurar cambios del stash
git stash pop || true

# Stage + commit
git add app/\(auth\)/register/page.tsx || true
git add . || true
git commit -m "fix(auth): probar flujo de registro con redirect corregido" || echo "⚠️ Nada que commitear"

# Push a GitHub
git push -u origin "$BRANCH"

echo "✅ Listo. Ahora espera que Vercel cree el Preview para la rama:"
echo "   $BRANCH"
