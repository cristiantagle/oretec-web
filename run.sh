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

# Modificación de archivos
echo "📝 Corrigiendo app/courses/[slug]/page.tsx..."
# Corregir el uso de useState correctamente
sed -i '' 's/const \[isCompany, setIsCompany\] = useState(false) = useState(true)/const \[isCompany, setIsCompany\] = useState(true)/g' app/courses/[slug]/page.tsx

# Restaurando el archivo Navbar.tsx a su estado correcto
echo "📝 Restaurando componentes/Navbar.tsx..."
# Restaurar Navbar.tsx si ha sido modificado accidentalmente
git checkout -- components/Navbar.tsx

# Confirmar los cambios
echo "📂 Confirmando cambios y preparando para la integración..."
git add .
git commit -m "fix: corregir errores en los componentes y archivos del flujo de cursos y empresa"

# Crear rama preview para los cambios
echo "👉 Creando rama de preview desde feat/company-entrypoints-20250911-002916..."
git checkout -b preview/company-entrypoints-20250911-002916

# Subir los cambios a la rama de preview
echo "👉 Subiendo los cambios a la rama de preview..."
git push origin preview/company-entrypoints-20250911-002916

echo "🛠 Todo listo para la integración en la rama de preview. Verifica los cambios en el preview de la web."

# Fin del proceso
echo "🎉 Proceso completado con éxito."
