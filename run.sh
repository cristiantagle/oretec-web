#!/bin/bash

# Paso 1: Guardar cambios no confirmados en stash
echo "👉 Guardando cambios actuales en stash..."
git stash -u
if [ $? -ne 0 ]; then
    echo "❌ Error al guardar cambios en stash."
    exit 1
fi
echo "✔ Cambios guardados en stash."

# Paso 2: Cambiar a la rama 'main'
echo "👉 Cambiando a la rama 'main'..."
git checkout main
if [ $? -ne 0 ]; then
    echo "❌ Error al cambiar a la rama 'main'."
    exit 1
fi
echo "✔ Cambiado correctamente a la rama 'main'."

# Paso 3: Actualizar la rama 'main'
echo "👉 Actualizando la rama 'main'..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ Error al actualizar la rama 'main'."
    exit 1
fi
echo "✔ Rama 'main' actualizada."

# Paso 4: Realizar las modificaciones necesarias en los archivos
echo "📝 Realizando las modificaciones necesarias..."
# Corregir el error de 'useState' en app/courses/[slug]/page.tsx
sed -i 's/const \[isCompany, setIsCompany\] = useState(false) = useState(true)/const \[isCompany, setIsCompany\] = useState(true)/' app/courses/[slug]/page.tsx
if [ $? -ne 0 ]; then
    echo "❌ Error al corregir app/courses/[slug]/page.tsx."
    exit 1
fi
echo "✔ Corrección realizada en app/courses/[slug]/page.tsx."

# Restaurar Navbar (si es necesario)
# Aquí puedes agregar cualquier restauración si es necesario para Navbar.tsx u otros archivos.
echo "📝 Restaurando el componente Navbar si es necesario..."
# Realizar cambios en Navbar.tsx
# (Agrega cualquier restauración o corrección aquí)

# Paso 5: Crear una nueva rama para los cambios
branch_name="feature-update-$(date +%Y%m%d%H%M%S)"
echo "👉 Creando una nueva rama: $branch_name"
git checkout -b "$branch_name"
if [ $? -ne 0 ]; then
    echo "❌ Error al crear la nueva rama."
    exit 1
fi
echo "✔ Nueva rama creada: $branch_name"

# Paso 6: Crear una rama de preview desde la rama actual
preview_branch="preview/$branch_name"
echo "👉 Creando una nueva rama de preview: $preview_branch"
git checkout -b "$preview_branch"
if [ $? -ne 0 ]; then
    echo "❌ Error al crear la rama de preview."
    exit 1
fi
echo "✔ Nueva rama de preview creada: $preview_branch"

# Paso 7: Subir los cambios a la nueva rama de preview
echo "👉 Subiendo los cambios a la rama de preview..."
git push origin "$preview_branch"
if [ $? -ne 0 ]; then
    echo "❌ Error al subir los cambios."
    exit 1
fi
echo "✔ Cambios subidos a la rama de preview."

# Paso 8: Restaurar los cambios guardados en stash
echo "👉 Restaurando los cambios desde stash..."
git stash pop
if [ $? -ne 0 ]; then
    echo "❌ Error al restaurar los cambios desde stash."
    exit 1
fi
echo "✔ Cambios restaurados desde stash."

# Paso 9: Confirmación
echo "🎉 Proceso completado con éxito. Puedes revisar la rama de preview en GitHub."

# Instrucciones finales
echo "👉 Ahora puedes verificar los cambios en el preview. Cuando esté listo para hacer el merge, avísame."
