# OreTec Web

Plataforma web de e‑learning para cursos de prevención y seguridad laboral. Construida con Next.js (App Router), Tailwind CSS y Supabase. Incluye catálogo público, autenticación de usuarios, dashboard, flujo para empresas (carga de participantes), panel de administración y pagos con Mercado Pago.

Estado: estable (flujo empresas, panel admin y navbar reactivo funcionando).

## Características

- Autenticación y cuentas: registro/login con Supabase, sesión reactiva en UI.
- Dashboard del usuario: muestra/edita datos de perfil y campos extendidos.
- Empresas: carga de participantes con validación, borrador local y envío al curso.
- Catálogo y cursos: listado público y detalle por slug con normalización flexible.
- Administración: login por token, listado/búsqueda de usuarios y cambio de roles.
- Pagos: creación de preferencias de Mercado Pago (Checkout Pro) y páginas de retorno.

## Arquitectura y organización

- Frontend: Next.js 14 (App Router) + Tailwind CSS.
- Backend/API: rutas en `app/api/**` con runtime Node y Supabase Service Role.
- Supabase: cliente de navegador (Anon) y cliente de servidor (Service Role) para sortear RLS en endpoints server.
- Control admin: cookie `admin_auth=1` por `ADMIN_TOKEN` + middleware que protege `/admin/*`.

Estructura principal:

- `app/` páginas y rutas API (App Router).
- `components/` UI reutilizable (Navbar, Cards, Forms, etc.).
- `lib/` integraciones y utilidades (supabase, pagos, export, etc.).
- `supabase/` migraciones y metadata de la BD.
- `public/` assets estáticos.

## Flujos clave

- Navbar reactivo: `components/Navbar.tsx` escucha `supabase.auth.onAuthStateChange` y ejecuta `router.refresh()`; actualiza avatar/menú/rol sin F5.
- Empresas: `app/dashboard/company/participants/page.tsx` permite cargar participantes (nombre, email, RUT, teléfono), guarda borrador en `localStorage` y redirige con los datos codificados en Base64 hacia la página del curso.
- Admin: `app/admin/login/page.tsx` valida `ADMIN_TOKEN` contra `app/api/admin/login/route.ts`, setea cookie httpOnly `admin_auth=1` y `middleware.ts` protege `/admin/*`.
- Pagos: `app/api/payments/create-preference/route.ts` crea preferencias de MP; `app/payments/{success,pending,failure}` muestran resultados; `app/api/payments/webhook/route.ts` listo para implementar procesamiento.

## Endpoints relevantes

- Salud: `GET /api/health` (exposición de `VERCEL_ENV`, branch y commit para badges).
- Perfil: `GET /api/profile/get` (perfil normalizado incluyendo campos extendidos).
- Cursos públicos: `GET /api/public/courses` (normalización tolerante + `?onlyPublished=1`).
- Pagos (MP): `POST /api/payments/create-preference`, `GET|POST /api/payments/webhook`.
- Admin usuarios: `GET /api/admin/users/list`, `POST /api/admin/users/set-role`.

## Variables de entorno

Obligatorias:

- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase (pública).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key (pública) para cliente web.
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (solo servidor, nunca en cliente).
- `ADMIN_TOKEN`: token secreto para iniciar sesión en panel admin.
- `MP_ACCESS_TOKEN`: access token de Mercado Pago (server).

Opcionales/recomendadas:

- `NEXT_PUBLIC_SITE_URL`: URL base del sitio para callbacks (si no, se infiere de headers).
- `NEXT_PUBLIC_SHOW_PREVIEW_BADGE`: `true|false` para mostrar la píldora de Preview (por defecto, se muestra en preview).

Ejemplo (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_TOKEN=...
MP_ACCESS_TOKEN=...
NEXT_PUBLIC_SITE_URL=https://tusitio.com
NEXT_PUBLIC_SHOW_PREVIEW_BADGE=true
```

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de producción.
- `npm run start`: servidor en producción.
- `npm run lint`: lint sin warnings permitidos.
- `npm run typecheck`: verificación de tipos TS.

## Puesta en marcha (local)

1) Instalar dependencias: `npm i`
2) Configurar `.env.local` con las variables anteriores.
3) Ejecutar: `npm run dev`
4) Abrir `http://localhost:3000`.

Notas:
- Supabase: claves públicas en el cliente y Service Role solo en rutas API. No expongas `SUPABASE_SERVICE_ROLE_KEY` al cliente.
- Admin: visita `/admin/login` e ingresa tu `ADMIN_TOKEN`.

## Despliegue

- Vercel recomendado. `/api/health` expone `VERCEL_ENV`, rama y commit para badge de Preview.
- Configura los envs en el panel de Vercel (proyecto y entornos).
- Usa ramas `preview/*` para previews; mergea a `main` para producción.

## Seguridad

- Panel admin protegido por cookie httpOnly `admin_auth=1` y middleware; endpoints pueden además verificar Bearer de usuario con rol `admin` en BD.
- Supabase Service Role solo en server para RLS bypass en endpoints `app/api/**`.
- Pagos MP: `auto_return=approved` solo si las `back_urls` son HTTPS.
- Webhook MP: implementar validación de notificaciones y actualización de órdenes.

## Roadmap (mejoras)

- Webhook MP: validar y actualizar órdenes/inscripciones.
- Autorización admin: homogeneizar en todos los endpoints y auditar cambios.
- Flujo empresas: evitar pasar participantes por querystring (usar token corto/servidor).
- DX: unificar clientes Supabase y limpiar ficheros `.bak`/`_debug` en prod.
- Calidad: `zod` para validar inputs en endpoints.
- Observabilidad: logging estructurado en server y métricas básicas.

## Créditos

- Next.js 14, Tailwind CSS
- Supabase (Auth/DB/Storage)
- Mercado Pago (Checkout Pro)
- Vercel (deploy y previews)

