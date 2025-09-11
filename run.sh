#!/bin/bash

# Verificando la rama actual
current_branch=$(git branch --show-current)
echo "📂 Verificando rama actual..."
if [[ "$current_branch" != "feat/company-entrypoints-20250911-002916" ]]; then
  echo "❌ Error: No estás en la rama correcta. Cambiando a la rama 'feat/company-entrypoints-20250911-002916'..."
  git checkout feat/company-entrypoints-20250911-002916
else
  echo "✔ Estás en la rama correcta: feat/company-entrypoints-20250911-002916"
fi

# Actualizando la rama local con la remota
echo "👉 Actualizando rama feat/company-entrypoints-20250911-002916..."
git pull origin feat/company-entrypoints-20250911-002916

# Verificar que el archivo exista antes de corregir
echo "📝 Verificando existencia de app/courses/[slug]/page.tsx..."
if [ -f "app/courses/[slug]/page.tsx" ]; then
  echo "📝 Corrigiendo app/courses/[slug]/page.tsx..."
  sed -i 's/const \[isCompany, setIsCompany\] = useState(false) = useState(true)/const \[isCompany, setIsCompany\] = useState(true)/g' app/courses/[slug]/page.tsx
else
  echo "⚠️ El archivo app/courses/[slug]/page.tsx no fue encontrado, no se aplicaron correcciones."
fi

# Restaurando el archivo Navbar.tsx a su estado correcto
echo "📝 Restaurando componentes/Navbar.tsx..."
git checkout -- components/Navbar.tsx

# Confirmar los cambios
echo "📂 Confirmando cambios y preparando para la integración..."
git add .
git commit -m "fix: corregir errores en los componentes y archivos del flujo de cursos y empresa"

# Creando una nueva rama de preview desde feat/company-entrypoints-20250911-002916
new_branch="preview/company-entrypoints-20250911-002916-$(date +%Y%m%d%H%M%S)"
echo "👉 Creando nueva rama de preview desde feat/company-entrypoints-20250911-002916..."
git checkout -b "$new_branch"

# Subir cambios a la nueva rama de preview
echo "👉 Subiendo los cambios a la nueva rama de preview..."
git push origin "$new_branch"

# Finalización del proceso
echo "🛠 Todo listo para la integración en la nueva rama de preview. Verifica los cambios en el preview de la web."
echo "🎉 Proceso completado con éxito."
