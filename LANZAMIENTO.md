# 🚀 Checklist de Lanzamiento — Pinamar Propiedades
## Guía paso a paso para no programadores

**Tiempo total estimado: 3–4 horas**
Podés hacerlo en una tarde. No necesitás saber programar.

---

## FASE 1 — Preparación (30 min)

### Paso 1 · Descomprimí el ZIP del portal
1. Descargá el archivo `pinamar-portal-v8-barrios.zip`
2. Hacé doble click → se crea una carpeta `pinamar-portal-v8-barrios`
3. Guardala en un lugar fácil de encontrar (Escritorio está bien)

### Paso 2 · Creá una cuenta en GitHub
> GitHub es donde vas a guardar los archivos del portal. Es gratis.

1. Ir a **github.com** → clic en "Sign up"
2. Elegí un nombre de usuario (ej: `pinamarpropiedades`)
3. Confirmá el email que te mandan

### Paso 3 · Subí el portal a GitHub
1. Estando en GitHub, clic en el botón verde **"New"** (arriba a la izquierda)
2. Nombre del repositorio: `portal` → clic en **"Create repository"**
3. En la página que aparece, buscá la sección que dice **"uploading an existing file"** y hacé clic ahí
4. Arrastrá **todos los archivos** de la carpeta del portal (incluyendo la carpeta `supabase/`)
5. Clic en **"Commit changes"** (botón verde abajo)

✅ Los archivos ya están en la nube.

---

## FASE 2 — Base de datos con Supabase (45 min)

### Paso 4 · Creá tu proyecto en Supabase
> Supabase es la base de datos donde van a vivir las propiedades, barrios, usuarios, etc. Es gratis para empezar.

1. Ir a **supabase.com** → clic en **"Start your project"**
2. Iniciá sesión con tu cuenta de GitHub (el que creaste recién)
3. Clic en **"New project"**
4. Completá:
   - **Name:** `pinamar-propiedades`
   - **Database Password:** inventá una contraseña fuerte y **guardala en un bloc de notas**
   - **Region:** `South America (São Paulo)` — es la más cercana a Argentina
5. Clic en **"Create new project"**
6. Esperá 2 minutos hasta que aparezca el dashboard

### Paso 5 · Ejecutar el schema (crear las tablas)
> Esto crea toda la estructura de la base de datos: propiedades, barrios, usuarios, etc.

1. En el dashboard de Supabase, menú izquierdo → clic en **"SQL Editor"**
2. Clic en **"New query"** (botón arriba a la derecha)
3. Abrí el archivo `supabase/schema.sql` con el Bloc de notas (Windows) o TextEdit (Mac)
4. Seleccioná todo el texto (Ctrl+A) → Copiá (Ctrl+C)
5. Pegalo en el SQL Editor de Supabase (Ctrl+V)
6. Clic en el botón **"Run"** (triángulo verde, arriba a la derecha)
7. Abajo debería decir **"Success. No rows returned"** — eso es correcto

✅ La base de datos está lista.

### Paso 6 · Crear los buckets de archivos (fotos, PDFs)
> Los buckets son carpetas en la nube donde se guardan las imágenes y PDFs.

1. Menú izquierdo → clic en **"Storage"**
2. Clic en **"New bucket"**
3. Crear estos buckets uno por uno (exactamente con estos nombres):

| Nombre | ¿Público? | Tamaño máx. |
|---|---|---|
| `prop-imagenes` | ✅ Sí (marcar "Public bucket") | 5 MB |
| `fichas-pdf` | ✅ Sí | 10 MB |
| `kyc-docs` | ❌ No | 10 MB |
| `proveedores-docs` | ❌ No | 10 MB |
| `avatares` | ✅ Sí | 2 MB |
| `reportes-pdf` | ✅ Sí | 20 MB |
| `barrio-fotos` | ✅ Sí | 8 MB |

Para cada uno: clic en "New bucket" → escribir el nombre → marcar o no "Public bucket" → clic "Save"

### Paso 7 · Obtener las credenciales del proyecto
> Estas son las "llaves" que conectan el portal con la base de datos.

1. Menú izquierdo → clic en el ícono de **engranaje** (⚙️) → **"API"**
2. Copiá y guardá en un bloc de notas estos dos valores:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`)
   - **anon public** key (una cadena larga que empieza con `eyJ...`)

---

## FASE 3 — Configurar el portal (15 min)

### Paso 8 · Conectar el portal a Supabase
1. Abrí el archivo `supabase.js` con el Bloc de notas
2. Buscá estas dos líneas al principio del archivo:
```
const SUPABASE_URL      = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...';
```
3. Reemplazá `https://TU-PROYECTO.supabase.co` con tu **Project URL** del paso anterior
4. Reemplazá `eyJhbGciOiJIUzI1NiIsInR5cCI6...` con tu **anon public key**
5. Guardá el archivo (Ctrl+S)

### Paso 9 · Subir el archivo actualizado a GitHub
1. Volvé a tu repositorio en GitHub
2. Hacé clic en el archivo `supabase.js`
3. Clic en el ícono del **lápiz** (✏️ Edit this file)
4. Borrá todo el contenido y pegá el contenido del archivo que acabás de editar
5. Clic en **"Commit changes"** (botón verde)

---

## FASE 4 — Publicar el portal en internet (20 min)

### Paso 10 · Deploy en Vercel
> Vercel pone el portal en internet con una URL pública. Es gratis.

1. Ir a **vercel.com** → clic en **"Sign up"**
2. Elegí **"Continue with GitHub"** → autorizar Vercel
3. Clic en **"New Project"**
4. Buscá tu repositorio `portal` en la lista → clic en **"Import"**
5. En la pantalla siguiente:
   - **Framework Preset:** Other (HTML estático)
   - Todo lo demás dejalo como está
6. Clic en **"Deploy"**
7. Esperá 1-2 minutos

✅ Vercel te va a dar una URL como `portal-abc123.vercel.app`
¡El portal ya está en internet!

### Paso 11 · Probar que funciona
1. Abrí la URL que te dio Vercel
2. Deberías ver la homepage de Pinamar Propiedades
3. Navegá entre páginas — todo debería funcionar
4. El listado va a estar vacío (sin propiedades) — eso es normal, las cargás en el paso siguiente

---

## FASE 5 — Crear tu cuenta de administrador (10 min)

### Paso 12 · Registrarte como admin
1. Abrí tu portal → `login-registro.html`
2. Registrate con tu email y una contraseña
3. Confirmá el email que te llega
4. Volvé a Supabase → **"Authentication"** → **"Users"** → vas a ver tu usuario
5. Copiá el UUID de tu usuario (una cadena larga de números y letras)
6. Volvé al **SQL Editor** de Supabase → New query → pegá esto:
```sql
UPDATE public.perfiles SET rol = 'admin' WHERE id = 'PEGÁ-TU-UUID-ACÁ';
```
7. Reemplazá `PEGÁ-TU-UUID-ACÁ` con tu UUID → clic **"Run"**

✅ Ya sos administrador del sistema.

---

## FASE 6 — Cargar el primer contenido (45 min)

### Paso 13 · Cargar las propiedades de demo
1. Supabase → SQL Editor → New query
2. Pegá este SQL y ejecutalo:
```sql
INSERT INTO public.propiedades
  (titulo, tipo, zona, perfil_psico, operacion, precio_usd,
   sup_terreno_m2, sup_cubierta_m2, ambientes, dormitorios, banos,
   cochera, piscina, dist_mar_m, estado, destacada, publicante_id)
VALUES
  ('Chalet en pino · 4 ambientes', 'casa', 'carilo', 'refugio',
   'venta', 620000, 900, 280, 4, 3, 2, false, true, 650,
   'activa', true,
   (SELECT id FROM public.perfiles WHERE rol = 'admin' LIMIT 1)),

  ('Departamento frente al mar · 2 ambientes', 'departamento',
   'pinamar-centro', 'pueblo', 'venta', 98000, null, 62, 2, 1, 1,
   false, false, 300, 'activa', false,
   (SELECT id FROM public.perfiles WHERE rol = 'admin' LIMIT 1)),

  ('Casa en barrio cerrado · golf', 'casa', 'pinamar-norte',
   'silvestre', 'venta', 890000, 1200, 380, 5, 4, 3, true, false,
   2000, 'activa', true,
   (SELECT id FROM public.perfiles WHERE rol = 'admin' LIMIT 1));
```
3. Actualizá el listado en el portal — deberían aparecer las 3 propiedades

### Paso 14 · Verificar los barrios
Los barrios ya fueron cargados por el schema (seed). Para verificar:
1. Abrí en el portal: `barrio.html?slug=carilo-bosque`
2. Deberías ver la página completa de Cariló Bosque con todos sus datos

### Paso 15 · Publicar tu primer reporte de mercado
1. Iniciá sesión en el portal con tu cuenta admin
2. Ir a `panel-admin.html` → sección **"Noticias / Blog"**
3. Clic en **"+ Nuevo reporte"**
4. Cargá el título, categoría y contenido
5. Si tenés un PDF, adjuntalo
6. Clic en **"💾 Guardar"**

---

## FASE 7 — Dominio propio (30 min) — OPCIONAL

### Paso 16 · Conectar tu dominio
> Si ya tenés `pinamarpropiedades.com.ar` o similar.

1. En Vercel → tu proyecto → **"Settings"** → **"Domains"**
2. Clic en **"Add"** → escribí tu dominio
3. Vercel te va a dar dos registros DNS
4. Entrá al panel de tu registrador de dominio (NIC Argentina, Donweb, etc.)
5. Agregá los registros DNS que te indica Vercel
6. Esperá hasta 24 horas (generalmente tarda menos de 1 hora)

---

## FASE 8 — Pinamar AI con API key real (20 min)

### Paso 17 · Obtener API key de Anthropic
> Esto activa el buscador conversacional inteligente del portal.

1. Ir a **console.anthropic.com** → creá una cuenta
2. **"API Keys"** → **"Create Key"** → copiá la key (empieza con `sk-ant-`)
3. Volvé a Supabase → menú izquierdo → **"Edge Functions"**
4. Si no deployaste la función todavía, contactame — te guío en ese paso específico
5. Menú → **"Settings"** → **"Secrets"**
6. Clic en **"Add new secret"**:
   - Name: `ANTHROPIC_API_KEY`
   - Value: pegá la key que copiaste
7. Clic en **"Save"**

✅ El Pinamar AI ya usa datos reales de tu base de datos.

---

## ✅ Checklist de verificación final

Antes de anunciar el portal, verificá que:

- [ ] La homepage carga bien en desktop y en celular
- [ ] El listado muestra al menos 3 propiedades
- [ ] Podés filtrar por zona y el resultado cambia
- [ ] La ficha de propiedad abre correctamente
- [ ] El comparador permite agregar propiedades
- [ ] Pinamar AI responde preguntas (aunque sea en modo demo)
- [ ] El formulario de proveedores se puede completar y enviar
- [ ] El panel admin es accesible con tu cuenta
- [ ] Los términos y condiciones están accesibles
- [ ] El portal abre bien desde el celular

---

## 🆘 Si algo no funciona

**El listado no muestra propiedades:**
→ Verificá que el schema se ejecutó sin errores en Supabase
→ Verificá que las credenciales en `supabase.js` son correctas

**Login no funciona:**
→ Supabase → Authentication → Settings → verificá que "Email Auth" está habilitado

**Las imágenes no cargan:**
→ Verificá que los buckets están marcados como "Public"

**Vercel da error al deployar:**
→ Asegurate de que subiste todos los archivos incluyendo `nav.js` y `supabase.js`

**Cualquier otra duda:**
→ Volvé a esta conversación con una captura de pantalla del error

---

## 📞 Contacto de soporte técnico de las plataformas

- **Supabase:** discord.supabase.com (comunidad muy activa en español)
- **Vercel:** vercel.com/support
- **GitHub:** support.github.com

---

*Pinamar Propiedades · Guía de lanzamiento v8 · Mayo 2026*
