#!/bin/bash

# Verifica la rama actual y las actualizaciones
echo "📂 Verificando rama actual..."
git status

# Verifica si estamos en la rama correcta
if [ "$(git rev-parse --abbrev-ref HEAD)" != "feat/company-entrypoints-20250911-002916" ]; then
  echo "⚠️ No estás en la rama feat/company-entrypoints-20250911-002916, cambiando a ella..."
  git checkout feat/company-entrypoints-20250911-002916
else
  echo "✔️ Estás en la rama correcta: feat/company-entrypoints-20250911-002916"
fi

# Asegúrate de que todo esté actualizado
echo "👉 Actualizando rama feat/company-entrypoints-20250911-002916..."
git pull origin feat/company-entrypoints-20250911-002916

# Corrige archivos
echo "📝 Corrigiendo app/courses/[slug]/page.tsx..."
sed -i 's/const [courses, setCourses] = useState<APICourse[]>([])\nconst [loading, setLoading]\n    const [isCompany, setIsCompany] = useState(false) = useState(true)\nconst [error, setError] = useState<string | null>(null)/const [courses, setCourses] = useState<APICourse[]>([])\nconst [loading, setLoading] = useState(true)\nconst [isCompany, setIsCompany] = useState(false)\nconst [error, setError] = useState<string | null>(null)/g' app/courses/[slug]/page.tsx

# Restaurar Navbar
echo "📝 Restaurando componentes/Navbar.tsx..."
git checkout -- app/components/Navbar.tsx

# Confirmar los cambios
echo "📂 Confirmando cambios y preparando para la integración..."
git add .
git commit -m "fix: corregir errores en los componentes y archivos del flujo de cursos y empresa"

# Crear la rama de preview
echo "👉 Creando rama de preview desde feat/company-entrypoints-20250911-002916..."
git checkout -b preview/company-entrypoints-20250911-002916

# Subir a la rama de preview
echo "👉 Subiendo los cambios a la rama de preview..."
git push origin preview/company-entrypoints-20250911-002916

echo "🛠 Todo listo para la integración en la rama de preview. Verifica los cambios en el preview de la web."

# Finalización
echo "🎉 Proceso completado con éxito."
