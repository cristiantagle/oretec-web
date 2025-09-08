#!/usr/bin/env fish
# =========================================================
# run.fish — CI estable + bot de PRs (compatible fish)
# =========================================================

function die
  echo -e "❌ $argv"
  exit 1
end

# 1) Verifica repo git
git rev-parse --is-inside-work-tree >/dev/null 2>&1; or die "Ejecuta esto dentro de un repositorio git."

# 2) Verifica árbol limpio
set changed (git status --porcelain)
if test -n "$changed"
  die "Tienes cambios locales. Haz commit o stash antes de correr este script."
end

# 3) Crea o cambia a rama
set branch "chore/ci-stabilize"
git rev-parse --verify $branch >/dev/null 2>&1
if test $status -eq 0
  git checkout $branch; or die "No pude cambiar a la rama $branch"
else
  git checkout -b $branch; or die "No pude crear la rama $branch"
end

# 4) CI principal
set ci_file ".github/workflows/ci.yml"
mkdir -p (dirname $ci_file)

begin
  echo "name: Typecheck, Lint & Build"
  echo "on:"
  echo "  push:"
  echo "  pull_request:"
  echo ""
  echo "jobs:"
  echo "  ci:"
  echo "    runs-on: ubuntu-latest"
  echo "    steps:"
  echo "      - uses: actions/checkout@v4"
  echo "      - uses: actions/setup-node@v4"
  echo "        with:"
  echo "          node-version: '20'"
  echo "          cache: 'npm'"
  echo "      - run: npm ci"
  echo "      - run: npm run typecheck"
  echo "      - run: npm run lint --max-warnings=0"
  echo "      - run: npm run build"
  echo "        env:"
  echo "          NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co"
  echo "          NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-anon-key"
  echo "          SUPABASE_SERVICE_ROLE_KEY: dummy-service-role"
end > $ci_file

# 5) Auto PR Bot
set pr_file ".github/workflows/auto-pr.yml"
mkdir -p (dirname $pr_file)

begin
  echo "name: Auto PR"
  echo "on:"
  echo "  push:"
  echo "    branches:"
  echo "      - 'feat/**'"
  echo "      - 'fix/**'"
  echo "      - 'chore/**'"
  echo "      - 'hotfix/**'"
  echo ""
  echo "jobs:"
  echo "  create-pr:"
  echo "    runs-on: ubuntu-latest"
  echo "    steps:"
  echo "      - uses: actions/checkout@v4"
  echo "      - uses: actions/github-script@v7"
  echo "        with:"
  echo "          script: |"
  echo "            const branch = context.ref.replace('refs/heads/','');"
  echo "            const { owner, repo } = context.repo;"
  echo "            const prs = await github.rest.pulls.list({ owner, repo, state: 'open', head: owner + ':' + branch });"
  echo "            if (prs.data.length === 0) {"
  echo "              const r = await github.rest.pulls.create({"
  echo "                owner, repo,"
  echo "                title: 'Auto PR: ' + branch,"
  echo "                head: branch,"
  echo "                base: 'main',"
  echo "                body: 'PR creado automáticamente.'"
  echo "              });"
  echo "              core.info('PR creado: ' + r.data.html_url);"
  echo "            } else {"
  echo "              core.info('PR ya existe: ' + prs.data[0].html_url);"
  echo "            }"
end > $pr_file

# 6) Commit & Push
git add $ci_file $pr_file; or die "No pude agregar archivos."
git commit -m "chore(actions): CI estable + auto PR bot (fish-safe)" ; or die "No pude commitear."
git push -u origin $branch; or die "No pude hacer push."

echo "✅ Workflows listos en $branch → abre PR hacia main"
