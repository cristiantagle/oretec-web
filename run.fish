#!/usr/bin/env fish

function die
  echo "❌ $argv" >&2
  exit 1
end

# 0) Verificaciones básicas
test -d .git; or die "Ejecuta este script en la raíz del repositorio (donde está la carpeta .git)."

set CI_FILE .github/workflows/ci.yml
mkdir -p (dirname $CI_FILE)

# 1) Escribe el workflow CI usando 'begin … end > archivo' (fish-friendly)
begin
  echo "name: Typecheck, Lint & Build"
  echo "on:"
  echo "  push:"
  echo "    branches: [\"**\"]"
  echo "  pull_request:"
  echo "    branches: [\"**\"]"
  echo ""
  echo "jobs:"
  echo "  ci:"
  echo "    runs-on: ubuntu-latest"
  echo "    steps:"
  echo "      - name: Checkout"
  echo "        uses: actions/checkout@v4"
  echo ""
  echo "      - name: Node 20"
  echo "        uses: actions/setup-node@v4"
  echo "        with:"
  echo "          node-version: '20'"
  echo "          cache: 'npm'"
  echo ""
  echo "      - name: Install deps"
  echo "        run: npm ci"
  echo ""
  echo "      - name: Typecheck"
  echo "        run: npm run typecheck"
  echo ""
  echo "      - name: Lint"
  echo "        run: npm run lint --max-warnings=0"
  echo ""
  echo "      - name: Build"
  echo "        env:"
  echo "          # SERVER-SIDE (dummy para CI/build)"
  echo "          SUPABASE_URL: 'https://example.supabase.co'"
  echo "          SUPABASE_SERVICE_ROLE_KEY: 'dummy-service-role-key'"
  echo "          # CLIENT-SIDE (dummy para CI/build)"
  echo "          NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co'"
  echo "          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dummy-anon-key'"
  echo "          # Apaga el badge en CI si molesta"
  echo "          NEXT_PUBLIC_SHOW_PREVIEW_BADGE: 'false'"
  echo "        run: npm run build"
  echo ""
  echo "      - name: Test /api/health handler (built)"
  echo "        run: |"
  echo "          node -e \""
  echo "            (async () => {"
  echo "              const { GET } = require('./.next/server/app/api/health/route.js');"
  echo "              const res = await GET();"
  echo "              const data = await res.json();"
  echo "              if (!data || data.ok !== true) {"
  echo "                console.error('Health not OK:', data);"
  echo "                process.exit(1);"
  echo "              }"
  echo "              if (!('env' in data)) {"
  echo "                console.error('Missing env in health payload:', data);"
  echo "                process.exit(1);"
  echo "              }"
  echo "              console.log('Health OK:', data);"
  echo "            })().catch((e) => { console.error(e); process.exit(1); });"
  echo "          \""
end > $CI_FILE

# 2) Rama y commit
set BRANCH chore/ci-envs-dummy

# Crea rama nueva desde main (sin pisar cambios locales)
git rev-parse --verify main >/dev/null 2>&1; or die "No encuentro la rama 'main'."
git status --porcelain | grep -q '^[ MADRCU]'; and die "Tienes cambios locales. Haz commit/stash antes de correr este script."

git checkout -b $BRANCH main; or die "No pude crear/cambiar a la rama $BRANCH."

git add $CI_FILE
git commit -m "ci: add dummy Supabase envs; build + health check on Node 20"
git push -u origin $BRANCH; or die "No pude pushear la rama $BRANCH."

echo "✅ Workflow escrito en $CI_FILE y enviado en la rama '$BRANCH'."
echo "   Abre el PR hacia main; el build ya no pedirá SUPABASE_* reales en CI."
