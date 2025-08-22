#!/usr/bin/env fish

function echo_ok
  set_color green; echo $argv; set_color normal
end
function echo_warn
  set_color yellow; echo $argv; set_color normal
end
function echo_err
  set_color red; echo $argv; set_color normal
end

# === 0) Inputs por defecto (ajusta si quieres) ===
set -q GIT_USER || set GIT_USER "Cristian Tagle"
set -q GIT_EMAIL || set GIT_EMAIL "cristiantagle@gmail.com"   # <-- pon el correo de tu GitHub si es otro
set -q GH_USER || set GH_USER "cristiantagle"
set -q REPO_NAME || set REPO_NAME "oretec-web"
set -q SSH_KEY_PATH || set SSH_KEY_PATH "~/.ssh/id_ed25519"

set PROJECT_DIR (pwd)
set REMOTE_URL "git@github.com:$GH_USER/$REPO_NAME.git"

echo_ok "Proyecto: $PROJECT_DIR"
echo_ok "Repo remoto: $REMOTE_URL"
echo_ok "Usuario Git: $GIT_USER <$GIT_EMAIL>"
echo

# === 1) Iniciar ssh-agent y agregar llave ===
echo_ok "Iniciando ssh-agent…"
eval (ssh-agent -c) >/dev/null

if test -f (eval echo $SSH_KEY_PATH)
  echo_ok "Agregando llave: $SSH_KEY_PATH"
  ssh-add (eval echo $SSH_KEY_PATH) >/dev/null
else
  echo_warn "No existe la llave en $SSH_KEY_PATH"
  read -l -P "¿Quieres crear una nueva llave SSH ahora? (y/n) " makekey
  if test "$makekey" = "y"
    ssh-keygen -t ed25519 -C "$GIT_EMAIL" -f (eval echo $SSH_KEY_PATH)
    ssh-add (eval echo $SSH_KEY_PATH) >/dev/null
    echo_ok "Llave creada. Agrega esta CLAVE PÚBLICA a GitHub → Settings → SSH and GPG keys:"
    echo "-------------------------------------------------------------"
    cat (eval echo $SSH_KEY_PATH)".pub"
    echo "-------------------------------------------------------------"
    echo_warn "Después de pegarla en GitHub, presiona Enter para continuar."
    read
  else
    echo_err "Sin llave SSH no podrás usar el remoto por SSH. Saliendo."
    exit 1
  end
end

# Probar conexión SSH con GitHub (no hace nada destructivo)
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"
if test $status -ne 0
  echo_warn "GitHub SSH aún no confirmó la autenticación (puede ser normal si recién agregaste la key)."
  echo_warn "Si falla el push, vuelve a correr este script en 1-2 minutos."
end

# === 2) Configurar identidad Git global (si no existe) ===
git config --global user.name >/dev/null 2>&1
if test $status -ne 0
  git config --global user.name "$GIT_USER"
end
git config --global user.email >/dev/null 2>&1
if test $status -ne 0
  git config --global user.email "$GIT_EMAIL"
end

# Rama por defecto a main
git config --global init.defaultBranch main

# === 3) Asegurar .gitignore sano (añade reglas si faltan) ===
set IGNORE_FILE ".gitignore"
if not test -f $IGNORE_FILE
  echo_ok "Creando .gitignore base…"
  printf "%s\n" \
"node_modules" \
".next" \
".out" \
"dist" \
".env" \
".env.*" \
"!.env.local.example" \
".DS_Store" \
".idea" \
".vscode" \
"*.zip" \
"waydroid_script" \
> $IGNORE_FILE
else
  for rule in node_modules .next .out dist .env .env.* '!.env.local.example' .DS_Store .idea .vscode '*.zip' waydroid_script
    grep -qx "$rule" $IGNORE_FILE; or echo "$rule" >> $IGNORE_FILE
  end
end

# === 4) Limpiar repo embebido y zips del índice si los hay ===
if test -d waydroid_script
  git rm -r --cached waydroid_script >/dev/null 2>&1
  if test -d waydroid_script/.git
    echo_ok "Quitando .git embebido en waydroid_script/ (local)…"
    rm -rf waydroid_script/.git
  end
end
for z in oretec-web-starter-mp-links-full.zip oretec-web-starter-mp-links.zip
  if test -f $z
    git rm --cached $z >/dev/null 2>&1
  end
end

# === 5) Inicializar repo si hace falta ===
if not test -d .git
  git init
end
# renombrar a main siempre
git branch -M main

# === 6) Añadir y commit inicial si no hay ninguno ===
set NEEDS_COMMIT 0
git rev-parse --verify HEAD >/dev/null 2>&1; or set NEEDS_COMMIT 1

git add .
if test $NEEDS_COMMIT -eq 1
  echo_ok "Creando primer commit…"
  git commit -m "Oretec web - primera versión"
else
  # Si ya hay commits, solo cometear cambios si los hay
  git diff --cached --quiet; or git commit -m "Actualiza archivos antes de deploy"
end

# === 7) Configurar remoto a SSH y push ===
git remote remove origin >/dev/null 2>&1
git remote add origin $REMOTE_URL
echo_ok "Haciendo push a $REMOTE_URL …"
git push -u origin main

echo_ok "✅ Listo. Repositorio publicado en: https://github.com/$GH_USER/$REPO_NAME"
