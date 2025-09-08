#!/usr/bin/env fish

# ===== Reglas de oro (fish-only) =====
# - Sin heredocs (<<), usar begin...end > archivo o printf
# - Sin backticks `...` ni ${...} en strings
# - Salir si hay cambios locales sin commit

# 1) Validaciones
git rev-parse --is-inside-work-tree >/dev/null 2>&1; or begin
  echo "❌ No estás dentro de un repo git"; exit 1
end

set -l dirty (git status --porcelain)
if test -n "$dirty"
  echo "❌ Tienes cambios locales. Haz commit o stash antes de correr este script."
  exit 1
end

# 2) Variables
set -l branch chore/fix-bot-ci
set -l ci_file .github/workflows/ci.yml
set -l bot_file .github/workflows/auto-pr.yml

mkdir -p .github/workflows

# 3) Cambiar/crear rama
git switch -c $branch 2>/dev/null; or git switch $branch; or begin
  echo "❌ No pude cambiar/crear la rama $branch"; exit 1
end

# 4) Escribir ci.yml (typecheck + lint + build con envs dummy + test /api/health)
begin
  echo "on:"
  echo "  push:"
  echo "    branches: [ main, \"feat/**\", \"fix/**\", \"chore/**\", \"hotfix/**\" ]"
  echo "  pull_request:"
  echo "    branches: [ main ]"
  echo ""
  echo "jobs:"
  echo "  ci:"
  echo "    runs-on: ubuntu-latest"
  echo "    steps:"
  echo "      - name: Checkout"
  echo "        uses: actions/checkout@v4"
  echo "      - name: Use Node 20"
  echo "        uses: actions/setup-node@v4"
  echo "        with:"
  echo "          node-version: '20'"
  echo "          cache: 'npm'"
  echo "      - name: Install deps"
  echo "        run: npm ci"
  echo "      - name: Typecheck"
  echo "        run: npm run typecheck"
  echo "      - name: Lint"
  echo "        run: npm run lint --max-warnings=0"
  echo "      - name: Build"
  echo "        env:"
  echo "          NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co'"
  echo "          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dummy-anon-key'"
  echo "          SUPABASE_SERVICE_ROLE_KEY: 'dummy-service-role-key'"
  echo "        run: npm run build"
  echo "      - name: Test /api/health (built)"
  echo "        run: |"
  echo "          node -e \"(async () => {"
  echo "            const mod = require('./.next/server/app/api/health/route.js');"
  echo "            const res = await mod.GET();"
  echo "            const data = await res.json();"
  echo "            if (!data || data.ok !== true) { throw new Error('Health not OK: ' + JSON.stringify(data)); }"
  echo "            if (!Object.prototype.hasOwnProperty.call(data, 'env')) { throw new Error('Missing env in payload: ' + JSON.stringify(data)); }"
  echo "            console.log('Health OK: ' + JSON.stringify(data));"
  echo "          })().catch(e => { console.error(e); process.exit(1); });\""
end > $ci_file

# 5) Escribir auto-pr.yml (crea PR desde ramas feat/*|fix/*|chore/*|hotfix/* y activa auto-merge si hay número de PR)
begin
  echo "on:"
  echo "  push:"
  echo "    branches:"
  echo "      - 'feat/**'"
  echo "      - 'fix/**'"
  echo "      - 'chore/**'"
  echo "      - 'hotfix/**'"
  echo ""
  echo "jobs:"
  echo "  auto-pr:"
  echo "    runs-on: ubuntu-latest"
  echo "    steps:"
  echo "      - name: Checkout"
  echo "        uses: actions/checkout@v4"
  echo "      - name: Create PR"
  echo "        id: cpr"
  echo "        uses: peter-evans/create-pull-request@v6"
  echo "        with:"
  echo "          token: \${{ secrets.GITHUB_TOKEN }}"
  echo "          commit-message: 'chore(bot): open PR from \${{ github.ref_name }}'"
  echo "          title: 'Auto PR: \${{ github.ref_name }}'"
  echo "          body: 'Automated PR created by workflow'"
  echo "          branch: 'auto/pr-\${{ github.ref_name }}'"
  echo "          base: main"
  echo "          labels: 'automated,bot'"
  echo "          draft: false"
  echo "      - name: Enable auto-merge (squash)"
  echo "        if: \${{ steps.cpr.outputs.pull-request-number != '' }}"
  echo "        uses: peter-evans/enable-pull-request-automerge@v3"
  echo "        with:"
  echo "          token: \${{ secrets.GITHUB_TOKEN }}"
  echo "          pull-request-number: \${{ steps.cpr.outputs.pull-request-number }}"
  echo "          merge-method: squash"
  echo "      - name: PR info"
  echo "        if: \${{ steps.cpr.outputs.pull-request-url != '' }}"
  echo "        run: |"
  echo "          echo 'PR #: \${{ steps.cpr.outputs.pull-request-number }}'"
  echo "          echo 'URL: \${{ steps.cpr.outputs.pull-request-url }}'"
end > $bot_file

# 6) Commit & push
git add $ci_file $bot_file
git commit -m "chore(ci/bot): fix auto-pr conditions and add Supabase envs for build"
git push -u origin $branch

echo "✅ Listo:"
echo "  - $ci_file actualizado con envs dummy"
echo "  - $bot_file corregido (condiciones != '' y auto-merge)"
echo "➡ Abre el PR de $branch. Desde ahora, push a feat/*|fix/*|chore/*|hotfix/* crea PR y activa auto-merge."
