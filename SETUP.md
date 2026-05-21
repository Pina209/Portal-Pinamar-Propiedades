# Pinamar Propiedades — Setup Supabase

Tiempo estimado: **30–45 minutos**

---

## Paso 1 — Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → New Project
2. Nombre: `pinamar-propiedades`
3. Región: **South America (São Paulo)** — la más cercana a Argentina
4. Guardar la contraseña de la BD en un lugar seguro

---

## Paso 2 — Ejecutar el schema SQL

1. Dashboard → **SQL Editor** → New query
2. Pegar todo el contenido de `schema.sql`
3. Ejecutar (Run / Ctrl+Enter)
4. Verificar que aparezcan las tablas en **Table Editor**

---

## Paso 3 — Crear los Storage Buckets

Dashboard → **Storage** → New bucket:

| Nombre | Público | Tamaño máx. | Tipos MIME |
|---|---|---|---|
| `prop-imagenes` | ✅ Sí | 5 MB | image/jpeg, image/png, image/webp |
| `fichas-pdf` | ✅ Sí | 10 MB | application/pdf |
| `kyc-docs` | ❌ No | 10 MB | * (todos) |
| `proveedores-docs` | ❌ No | 10 MB | * (todos) |
| `avatares` | ✅ Sí | 2 MB | image/jpeg, image/png |

---

## Paso 4 — Configurar Auth

Dashboard → **Authentication** → Providers:

- **Email**: habilitado (por defecto)
- **Google**: 
  1. Crear proyecto en [console.cloud.google.com](https://console.cloud.google.com)
  2. APIs → Credentials → OAuth 2.0 → Web application
  3. Authorized redirect URIs: `https://TU-PROYECTO.supabase.co/auth/v1/callback`
  4. Copiar Client ID y Client Secret en Supabase → Auth → Providers → Google

Dashboard → **Authentication** → URL Configuration:
- Site URL: `https://tudominio.com` (o `http://localhost:5500` para desarrollo)
- Redirect URLs: agregar tu dominio

---

## Paso 5 — Configurar supabase.js

Editar `supabase.js` con tus credenciales:

```javascript
// Dashboard → Settings → API
const SUPABASE_URL      = 'https://XXXXXXXX.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsIn...';
```

**Nunca subas la `service_role` key al frontend** — solo la `anon` key.

---

## Paso 6 — Cargar propiedades de demo

En SQL Editor:

```sql
-- Primero necesitás un usuario admin registrado.
-- 1. Registrate en el portal con email y contraseña.
-- 2. Buscar tu UUID en Dashboard → Auth → Users
-- 3. Cambiar tu rol a admin:
UPDATE public.perfiles SET rol = 'admin' WHERE id = 'TU-UUID-AQUI';

-- Luego insertar propiedades de demo:
INSERT INTO public.propiedades
  (titulo, tipo, zona, barrio, perfil_psico, operacion, precio_usd,
   sup_terreno_m2, sup_cubierta_m2, ambientes, dormitorios, banos,
   cochera, piscina, dist_mar_m, lat, lng, estado, destacada,
   publicante_id)
VALUES
  ('Chalet en pino · 4 ambientes', 'casa', 'carilo', 'el-bosque', 'refugio',
   'venta', 620000, 900, 280, 4, 3, 2, false, true, 650,
   -37.163, -56.951, 'activa', true,
   (SELECT id FROM public.perfiles WHERE rol = 'admin' LIMIT 1)),

  ('Departamento frente al mar · 2 ambientes', 'departamento', 'pinamar-centro', null, 'pueblo',
   'venta', 98000, null, 62, 2, 1, 1, false, false, 300,
   -37.102, -56.865, 'activa', false,
   (SELECT id FROM public.perfiles WHERE rol = 'admin' LIMIT 1)),

  ('Casa en barrio cerrado · golf', 'casa', 'pinamar-norte', 'la-herradura', 'silvestre',
   'venta', 890000, 1200, 380, 5, 4, 3, true, false, 2000,
   -37.085, -56.850, 'activa', true,
   (SELECT id FROM public.perfiles WHERE rol = 'admin' LIMIT 1));
```

---

## Paso 7 — Verificar conexión

Abrir `listado-propiedades.html` en el navegador:
- Si aparecen las propiedades con datos reales → ✅ todo OK
- Si aparece "Supabase no disponible" → revisar las credenciales en `supabase.js`

---

## Paso 8 — Deploy en Vercel (recomendado)

1. Subir el proyecto a GitHub (repo privado)
2. [vercel.com](https://vercel.com) → New Project → importar repo
3. Framework: **Other** (HTML estático)
4. No hace falta configurar nada más — Vercel detecta los archivos HTML
5. Dominio: Dashboard → Domains → Add `pinamarpropiedades.com.ar`

### Variables de entorno en Vercel (opcional)
Si migrás a Next.js en el futuro:
```
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Estructura de archivos a subir

```
/
├── pinamar-propiedades-v2.html   ← homepage
├── listado-propiedades.html
├── ficha-propiedad.html
├── comparador.html
├── zona-carilo.html
├── perfiles-zona.html
├── pinamar-ai.html
├── guia-invertir.html
├── noticias.html
├── login-registro.html
├── panel-inmobiliaria.html
├── panel-admin.html
├── proveedores-certificados.html
├── nav.js                        ← navegación central
└── supabase.js                   ← cliente Supabase ← CONFIGURAR PRIMERO
```

---

## Soporte

- Docs Supabase: [supabase.com/docs](https://supabase.com/docs)
- Status: [status.supabase.com](https://status.supabase.com)
- Comunidad: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

---

## Paso 9 — Deploy de la Edge Function (Pinamar AI seguro)

La Edge Function mueve la llamada a Anthropic al servidor — la API key nunca queda expuesta en el navegador.

### Opción A — Con Supabase CLI (recomendado)
```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Linkear al proyecto
supabase link --project-ref TU-PROJECT-REF

# Configurar secretos
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Deploy
supabase functions deploy ai-search --no-verify-jwt
```

### Opción B — Desde el Dashboard
1. Dashboard → **Edge Functions** → New Function
2. Nombre: `ai-search`
3. Pegar el contenido de `supabase/functions/ai-search/index.ts`
4. Dashboard → **Settings** → **Secrets** → agregar `ANTHROPIC_API_KEY`

### Verificar
Hacer un POST desde la terminal:
```bash
curl -X POST https://TU-PROYECTO.supabase.co/functions/v1/ai-search \
  -H "Content-Type: application/json" \
  -H "apikey: TU-ANON-KEY" \
  -d '{"messages":[{"role":"user","content":"Hola, busco una casa en Cariló"}]}'
```
Debe devolver `{"respuesta":"..."}`.
