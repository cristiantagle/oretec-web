# === 0) Asegúrate de estar en el repo y rama correcta ===
git rev-parse --is-inside-work-tree >/dev/null 2>&1; or begin
  echo "❌ Esto no es un repo git"; exit 1
end

git switch feat/preview-check

# === 1) Cambios locales: elige A (guardar) o B (descartar) ===
# --- A) GUARDAR cambios locales (recomendado si tocaste run.fish a propósito)
git add -A
git commit -m "chore(dev): keep local run.fish tweaks" 2>/dev/null; or echo "ℹ️ Nada que commitear (ok)"

# --- B) DESCARTAR cambios en run.fish (si no quieres subirlos)
# git checkout -- run.fish

# (Si 'snapd' te aparece modificado pero no quieres subirlo, descártalo también)
# git checkout -- snapd

# === 2) Crea un archivo “ping” para forzar un diff y disparar el bot ===
set ts (date "+%Y%m%d-%H%M%S")
set ping ".github/ci-ping-$ts.txt"
mkdir -p .github
echo "ci ping $ts" > $ping
git add $ping
git commit -m "chore(ci): ping to trigger auto PR bot"

# === 3) Push a la rama feature ===
git push -u origin feat/preview-check

echo "✅ Push hecho. Abre GitHub → Actions y Pull Requests para ver el bot en acción."
