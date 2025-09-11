#!/usr/bin/env bash
set -euo pipefail

# Rama base = rama actual; si quieres otra, pásala como arg:  bash run.sh feat/...
BASE_BRANCH="${1:-$(git rev-parse --abbrev-ref HEAD)}"
FIX_BRANCH="hotfix/next-link-import-$(date +%Y%m%d-%H%M%S)"

echo "👉 Usando rama base: $BASE_BRANCH"
git fetch origin "$BASE_BRANCH" >/dev/null 2>&1 || true
git checkout "$BASE_BRANCH" >/dev/null
git pull --ff-only || true

echo "👉 Creando rama $FIX_BRANCH desde $BASE_BRANCH…"
git checkout -b "$FIX_BRANCH" >/dev/null

# Buscar archivos .tsx/.ts/.jsx/.js que importen Link desde next/navigation
mapfile -t FILES < <(grep -RIl --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' "from 'next/navigation'" | xargs -I{} grep -l "{" {} | xargs -I{} grep -l "Link" {} || true)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "ℹ No encontré imports con Link desde next/navigation. Nada que cambiar."
  exit 0
fi

echo "🔎 Archivos a corregir:"
printf ' - %s\n' "${FILES[@]}"

fix_file () {
  local f="$1"
  local tmp
  tmp="$(mktemp)"

  awk '
    BEGIN { fixed=0; hasLinkImport=0; }
    {
      # Detecta import desde next/navigation que incluye Link en las llaves
      if ($0 ~ /from[[:space:]]*'\''next\/navigation'\''/ && $0 ~ /{[^}]*Link[^}]*}/) {
        line=$0
        # Quita el identificador Link de las llaves (con o sin coma)
        gsub(/,\s*Link(\s*,)?/,"",line)
        gsub(/\{\s*Link\s*,/,"{ ",line)
        gsub(/\{\s*Link\s*\}/,"{}",line)  # por si queda solo
        # Limpieza de comas colgantes
        gsub(/\{\s*,\s*/,"{ ",line)
        gsub(/,\s*\}/," }",line)
        print line
        fixed=1
      } else {
        print
      }
      if ($0 ~ /from[[:space:]]*'\''next\/link'\''/) hasLinkImport=1
    }
    END {
      if (fixed && !hasLinkImport) {
        print "import Link from '\''next/link'\''"
      }
    }
  ' "$f" > "$tmp"

  # Si no hubo cambios reales, no sobrescribas
  if ! diff -q "$f" "$tmp" >/dev/null 2>&1; then
    mv "$tmp" "$f"
    echo "✔ Corregido: $f"
  else
    rm -f "$tmp"
  fi
}

for f in "${FILES[@]}"; do
  fix_file "$f"
done

# Agregar y commitear si hay cambios
if ! git diff --quiet; then
  git add -A
  git commit -m "fix(next): importar Link desde next/link en vez de next/navigation (autofix repo-wide)"
  git push -u origin "$FIX_BRANCH"
  echo "✅ Listo. Subido $FIX_BRANCH. Vercel hará el preview."
else
  echo "ℹ No hubo cambios que commitear."
fi
