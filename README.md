# OreTec Web

**Estado:** **estable** (flujo empresas + panel admin + navbar con refresco de sesión).

## ¿Qué puede hacer la página hoy?

- **Registro / Login** con Supabase.
- **Dashboard** del usuario con datos de perfil.
- **Empresas:** botón **“Agregar estudiantes”** visible solo para cuentas *company* en `/dashboard` que lleva a:
  - `/dashboard/company/participants`: formulario para cargar participantes (nombre, email, RUT, teléfono), validación, borrador en `localStorage`.
  - Continuación a compra: pasa los participantes codificados en **Base64** por querystring hacia la página del curso (slug/código/id).
- **Navbar** reactivo a login/logout:
  - Escucha `supabase.auth.onAuthStateChange`.
  - Llama a `router.refresh()` para que **no sea necesario F5**.
  - Muestra nombre/avatar y menú según rol (admin, instructor, company, student).
- **Admin / Usuarios** (`/admin/users`):
  - Listado paginado + búsqueda (nombre, RUT, email, empresa).
  - Cambio de **rol** con llamada a `/api/admin/users/set-role`.
  - Peticiones con `credentials: 'include'` y Bearer cuando existe.

## Ramas importantes

- `main`: rama de producción.
- `preview/*`: ramas de preview para revisar cambios antes de merge.

## Puntos clave de implementación

- `components/Navbar.tsx`: escucha de auth + `router.refresh()` en login/logout.
- `app/dashboard/page.tsx`: muestra botón “Agregar estudiantes” **solo si** `profile.account_type === 'company'`.
- `app/dashboard/company/participants/page.tsx`: captura y valida participantes, guarda borrador y continúa al flujo de compra.
- `app/admin/users/page.tsx`: listado y cambio de roles en caliente.

## Notas operativas

- Evitar mezclar scripts o texto ajeno en archivos `.tsx` (especialmente en `app/admin/users/page.tsx`).
- Para cambios visibles, crear **siempre** rama `preview/*`, validar en Vercel y luego hacer merge a `main`.
- Si el navbar no reflejara el estado tras login/logout, verificar que:
  - `onAuthStateChange` está montado una sola vez.
  - Se llama a `router.refresh()` dentro de ese listener.
  - No hay caché en el fetch del perfil (`cache: 'no-store'`).
- El proyecto ya **no descarga fuentes de Google en build**. Las familias Inter y Poppins se definen como *fallbacks* locales en `app/globals.css` y Tailwind las expone mediante `font-sans`/`font-display`. Si un deploy falla por fonts antiguas en caché, basta con limpiar el build cache desde Vercel (`Deployments → ... → Redeploy with latest`).
- Para forzar un redeploy de la PR en Vercel:
  1. Abrir el panel del deployment fallido.
  2. Pulsar **Redeploy** y elegir *Redeploy with existing build cache* si no se modificó Supabase; usar *Redeploy without cache* si persisten los errores.
  3. Esperar a que termine la fase “Creating an optimized production build…”. Si concluye sin errores, la vista previa queda lista para QA.

## Créditos

- Next.js 14
- Tailwind CSS
- Supabase Auth/Storage
- Vercel (deploys/preview)

