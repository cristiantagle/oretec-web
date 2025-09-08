# Guía de contribución (ES)

**Regla de oro principal:**
Todos los *comentarios de código*, *mensajes de commit*, *PRs* y *documentación interna* deben estar en **español**.
Solo se permiten palabras en inglés cuando forman parte de librerías, APIs externas o convenciones (ej: \`useEffect\`, \`supabase\`, \`next build\`).

---

## Estilo de código
- Los comentarios deben ser claros, breves y en español.
- Evitar “spanglish”: usar inglés solo si es técnico y obligatorio.
- Mantener consistencia en nombres de variables y funciones. Si una API requiere inglés, se mantiene.
- Mensajes de commit con formato:
  
  \`\`\`
  tipo(scope): descripción
  \`\`\`
  
  Ejemplo:
  
  \`\`\`
  fix(navbar): ocultar menú móvil al salir
  chore(ci): corregir bloque de prueba health
  \`\`\`

---

## Reglas prácticas
- **Autostash automático:** los scripts (\`run.fish\`) realizan un *stash* automático de los cambios locales antes de modificar archivos.
  Esto evita que los commits fallen por un árbol sucio.
  - Para recuperar, usar \`git stash list\` y \`git stash pop\`.
- **Commits atómicos:** un commit = un cambio lógico.
- **Pull Requests:** siempre desde ramas feature/fix/chore/hotfix → \`main\`.

---

## CI/CD
- Los workflows de GitHub Actions están documentados en **español**.
- Variables sensibles (\`SUPABASE_*\`, \`ADMIN_TOKEN\`, etc.) **nunca se imprimen en logs**.
- En CI se pueden usar valores *dummy*, salvo cuando se requieran llaves reales (ej: Supabase).

---

## Revisión de código
- Usar comentarios en español también en las revisiones.
- Mantener consistencia visual en UI (colores, fuentes, componentes comunes).
- Evitar duplicación de código: crear componentes reutilizables.

---

✍️ **En resumen:** todo en español, commits limpios, ramas claras y confianza en los scripts \`run.fish\` para automatizar.
