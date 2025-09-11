#!/bin/bash

# Verificando la rama actual
echo "📂 Verificando rama actual..."
branch=$(git rev-parse --abbrev-ref HEAD)

if [[ "$branch" != "feat/company-entrypoints-20250911-002916" ]]; then
    echo "❌ Estás en la rama equivocada. Asegúrate de estar en la rama 'feat/company-entrypoints-20250911-002916'."
    exit 1
fi

# Actualizando la rama
echo "👉 Actualizando rama feat/company-entrypoints-20250911-002916..."
git pull origin feat/company-entrypoints-20250911-002916

# Verificando existencia de archivo
echo "📝 Verificando existencia de app/courses/[slug]/page.tsx..."
if [[ ! -f "app/courses/[slug]/page.tsx" ]]; then
    echo "❌ El archivo app/courses/[slug]/page.tsx no existe."
    exit 1
fi

# Corrigiendo errores en app/courses/[slug]/page.tsx
echo "📝 Corrigiendo app/courses/[slug]/page.tsx..."
sed -i '' 's/const \[isCompany, setIsCompany\] = useState(false) = useState(true)/const \[isCompany, setIsCompany\] = useState(true)/' app/courses/[slug]/page.tsx
sed -i '' 's/const \[loading, setLoading\]/const \[loading, setLoading\] = useState(true)/' app/courses/[slug]/page.tsx

# Restaurando componentes/Navbar.tsx
echo "📝 Restaurando componentes/Navbar.tsx..."
git restore components/Navbar.tsx

# Confirmando cambios
echo "📂 Confirmando cambios y preparando para la integración..."
git add .
git commit -m "fix: corregir errores en los componentes y archivos del flujo de cursos y empresa"

# Creando nueva rama de preview
echo "👉 Creando nueva rama de preview desde feat/company-entrypoints-20250911-002916..."
git checkout -b "preview/company-entrypoints-20250911-002916-$(date +%Y%m%d%H%M%S)"

# Subiendo los cambios a la nueva rama de preview
echo "👉 Subiendo los cambios a la nueva rama de preview..."
git push origin "preview/company-entrypoints-20250911-002916-$(date +%Y%m%d%H%M%S)"

echo "🛠 Todo listo para la integración en la nueva rama de preview. Verifica los cambios en el preview de la web."
echo "🎉 Proceso completado con éxito."
