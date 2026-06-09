-- ============================================================
-- PINAMAR PROPIEDADES — Schema Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── EXTENSIONES ────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";

-- ── 1. USUARIOS / PERFILES ─────────────────────────────────
create table public.perfiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  rol            text not null default 'comprador'
                   check (rol in ('comprador','vendedor','inmobiliaria','admin')),
  nombre         text,
  telefono       text,
  email          text,
  avatar_url     text,
  inmobiliaria_id uuid,
  creado_en      timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- ── 2. INMOBILIARIAS ───────────────────────────────────────
create table public.inmobiliarias (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  cuit        text,
  telefono    text,
  email       text,
  web         text,
  instagram   text,
  logo_url    text,
  activa      boolean default true,
  verificada  boolean default false,
  creado_en   timestamptz default now()
);

alter table public.perfiles
  add constraint fk_perfil_inmobiliaria
  foreign key (inmobiliaria_id) references public.inmobiliarias(id);

-- ── 3. PROPIEDADES ─────────────────────────────────────────
create table public.propiedades (
  id              uuid primary key default uuid_generate_v4(),
  codigo          text unique,
  titulo          text not null,
  descripcion     text,
  operacion       text not null default 'venta'
                    check (operacion in ('venta','alquiler','alquiler_temp','permuta')),
  tipo            text not null
                    check (tipo in ('casa','departamento','terreno','duplex','local','ph','emprendimiento')),
  zona            text not null
                    check (zona in ('carilo','pinamar-centro','pinamar-norte','valeria','ostende','costa-esmeralda')),
  barrio          text,
  perfil_psico    text
                    check (perfil_psico in ('refugio','vidriera','pueblo','horizonte','silvestre')),
  precio_usd      numeric(12,2),
  precio_ars      numeric(14,2),
  moneda          text default 'USD',
  sup_terreno_m2  numeric(10,2),
  sup_cubierta_m2 numeric(10,2),
  ambientes       smallint,
  dormitorios     smallint,
  banos           smallint,
  cochera         boolean default false,
  piscina         boolean default false,
  barrio_cerrado  boolean default false,
  permuta         boolean default false,
  gas_natural     boolean default false,
  fibra_optica    boolean default false,
  dist_mar_m      integer,
  lat             double precision,
  lng             double precision,
  estado          text default 'borrador'
                    check (estado in ('borrador','revision','activa','pausada','vendida','eliminada')),
  destacada       boolean default false,
  tiene_ficha     boolean default false,
  tiene_kyc       boolean default false,
  publicante_id   uuid references public.perfiles(id),
  inmobiliaria_id uuid references public.inmobiliarias(id),
  creado_en       timestamptz default now(),
  actualizado_en  timestamptz default now(),
  publicado_en    timestamptz
);

create index idx_prop_zona     on public.propiedades(zona);
create index idx_prop_tipo     on public.propiedades(tipo);
create index idx_prop_precio   on public.propiedades(precio_usd);
create index idx_prop_estado   on public.propiedades(estado);
create index idx_prop_ficha    on public.propiedades(tiene_ficha);
create index idx_prop_kyc      on public.propiedades(tiene_kyc);
create index idx_prop_dist_mar on public.propiedades(dist_mar_m);

-- ── 4. IMÁGENES ────────────────────────────────────────────
create table public.prop_imagenes (
  id           uuid primary key default uuid_generate_v4(),
  propiedad_id uuid not null references public.propiedades(id) on delete cascade,
  url          text not null,
  orden        smallint default 0,
  es_principal boolean default false,
  alt_text     text,
  creado_en    timestamptz default now()
);

-- ── 5. FICHA TÉCNICA ───────────────────────────────────────
create table public.fichas_tecnicas (
  id                    uuid primary key default uuid_generate_v4(),
  propiedad_id          uuid unique not null references public.propiedades(id) on delete cascade,
  profesional_nombre    text,
  profesional_matricula text,
  profesional_colegio   text,
  fecha_relevamiento    date,
  valida_hasta          date,
  estado_general        text check (estado_general in ('excelente','bueno','regular','malo')),
  score_pct             smallint,
  estructura            text check (estructura in ('bueno','regular','malo')),
  instalacion_electrica text check (instalacion_electrica in ('bueno','regular','malo')),
  instalacion_sanitaria text check (instalacion_sanitaria in ('bueno','regular','malo')),
  instalacion_gas       text check (instalacion_gas in ('bueno','regular','malo')),
  carpinterias          text check (carpinterias in ('bueno','regular','malo')),
  terminaciones_ext     text check (terminaciones_ext in ('bueno','regular','malo')),
  terminaciones_int     text check (terminaciones_int in ('bueno','regular','malo')),
  techo_cubierta        text check (techo_cubierta in ('bueno','regular','malo')),
  costo_reparaciones_usd numeric(10,2) default 0,
  indice_cac_fecha      date,
  observaciones         text,
  pdf_url               text,
  creado_en             timestamptz default now(),
  actualizado_en        timestamptz default now()
);

-- ── 6. KYC — VERIFICACIÓN DE TÍTULOS ───────────────────────
create table public.kyc_verificaciones (
  id                          uuid primary key default uuid_generate_v4(),
  propiedad_id                uuid unique not null references public.propiedades(id) on delete cascade,
  estado                      text default 'pendiente'
                                check (estado in ('pendiente','en_proceso','verificado','rechazado')),
  dominio_sin_gravamenes      boolean,
  deudas_municipales_ok       boolean,
  inhibiciones_vendedor_ok    boolean,
  sup_catastral_coincidente   boolean,
  mejoras_declaradas          boolean,
  situacion_sucesoria_ok      boolean,
  partida_municipal           text,
  zonificacion_cou            text,
  circunscripcion             text,
  seccion                     text,
  manzana                     text,
  parcela                     text,
  sup_terreno_catastral       numeric(10,2),
  sup_edificada_catastral     numeric(10,2),
  escribano_nombre            text,
  escribano_matricula         text,
  fecha_verificacion          date,
  observaciones               text,
  creado_en                   timestamptz default now(),
  actualizado_en              timestamptz default now()
);

-- ── 7. CONSULTAS / LEADS ───────────────────────────────────
create table public.consultas (
  id           uuid primary key default uuid_generate_v4(),
  propiedad_id uuid references public.propiedades(id) on delete set null,
  nombre       text not null,
  email        text not null,
  telefono     text,
  mensaje      text,
  canal        text default 'web'
                 check (canal in ('web','whatsapp','email','telefono','instagram')),
  pagina_origen text,
  utm_source   text,
  utm_medium   text,
  estado       text default 'nueva'
                 check (estado in ('nueva','vista','contactada','cerrada','descartada')),
  asignada_a   uuid references public.perfiles(id),
  nota_interna text,
  creado_en    timestamptz default now(),
  actualizado_en timestamptz default now()
);

create index idx_consultas_propiedad on public.consultas(propiedad_id);
create index idx_consultas_estado    on public.consultas(estado);
create index idx_consultas_fecha     on public.consultas(creado_en desc);

-- ── 8. PROVEEDORES CERTIFICADOS ────────────────────────────
create table public.proveedores (
  id               uuid primary key default uuid_generate_v4(),
  nombre           text not null,
  tipo_inscripcion text,
  cuit             text,
  email            text not null,
  telefono         text,
  web              text,
  presentacion     text,
  rubros           text[],
  rubro_otro       text,
  zonas            text[],
  experiencia      text,
  matricula_org    text,
  matricula_num    text,
  ref1_nombre      text,
  ref1_tel         text,
  ref1_rel         text,
  ref2_nombre      text,
  ref2_tel         text,
  ref2_rel         text,
  docs_aportados   text[],
  archivos_urls    text[],
  estado           text default 'pendiente'
                     check (estado in ('pendiente','en_revision','certificado','rechazado','vencido')),
  certificado_hasta date,
  como_conociste   text,
  creado_en        timestamptz default now(),
  actualizado_en   timestamptz default now()
);

-- ── 9. FAVORITOS ───────────────────────────────────────────
create table public.favoritos (
  usuario_id   uuid not null references public.perfiles(id) on delete cascade,
  propiedad_id uuid not null references public.propiedades(id) on delete cascade,
  creado_en    timestamptz default now(),
  primary key (usuario_id, propiedad_id)
);

-- ── 10. CONVERSACIONES AI ──────────────────────────────────
create table public.ai_conversaciones (
  id             uuid primary key default uuid_generate_v4(),
  usuario_id     uuid references public.perfiles(id) on delete set null,
  session_id     text,
  mensajes       jsonb default '[]',
  props_mostradas uuid[],
  creado_en      timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- ── 11. NOTICIAS ───────────────────────────────────────────
create table public.noticias (
  id          uuid primary key default uuid_generate_v4(),
  titulo      text not null,
  slug        text unique not null,
  bajada      text,
  contenido   text,
  imagen_url  text,
  categoria   text check (categoria in ('mercado','inversion','legal','zona','tendencias')),
  autor_id    uuid references public.perfiles(id),
  publicada   boolean default false,
  destacada   boolean default false,
  creado_en   timestamptz default now(),
  publicado_en timestamptz
);

-- ── 12. PERMUTAS ───────────────────────────────────────────
create table public.permutas (
  id                uuid primary key default uuid_generate_v4(),
  propiedad_ofrezco uuid not null references public.propiedades(id),
  busco_zona        text[],
  busco_tipo        text[],
  busco_precio_max  numeric(12,2),
  diferencia_usd    numeric(12,2),
  notas             text,
  activa            boolean default true,
  creado_en         timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- VISTA: listado de propiedades con joins completos
-- ══════════════════════════════════════════════════════════════
create or replace view public.v_propiedades_listado as
select
  p.id, p.codigo, p.titulo, p.operacion, p.tipo, p.zona, p.barrio, p.perfil_psico,
  p.precio_usd, p.sup_terreno_m2, p.sup_cubierta_m2,
  p.ambientes, p.dormitorios, p.banos,
  p.cochera, p.piscina, p.barrio_cerrado, p.permuta,
  p.dist_mar_m, p.lat, p.lng,
  p.destacada, p.tiene_ficha, p.tiene_kyc, p.estado, p.publicado_en,
  (select url from public.prop_imagenes i
   where i.propiedad_id = p.id and i.es_principal = true limit 1) as imagen_url,
  inm.nombre   as inmobiliaria_nombre,
  inm.logo_url as inmobiliaria_logo,
  per.nombre   as publicante_nombre,
  per.telefono as publicante_tel,
  ft.score_pct          as ficha_score,
  ft.estado_general     as ficha_estado,
  ft.costo_reparaciones_usd as cac_estimado,
  kyc.estado            as kyc_estado,
  kyc.fecha_verificacion as kyc_fecha
from public.propiedades p
left join public.inmobiliarias inm  on inm.id = p.inmobiliaria_id
left join public.perfiles per       on per.id = p.publicante_id
left join public.fichas_tecnicas ft on ft.propiedad_id = p.id
left join public.kyc_verificaciones kyc on kyc.propiedad_id = p.id
where p.estado = 'activa';

-- Vista de stats por zona para AI y perfiles
create or replace view public.v_stats_zona as
select
  zona,
  count(*)                                       as total_props,
  round(avg(precio_usd))                         as precio_prom,
  round(avg(precio_usd / nullif(sup_terreno_m2,0))) as precio_m2_prom,
  count(*) filter (where tiene_ficha)            as props_con_ficha,
  count(*) filter (where tiene_kyc)              as props_con_kyc,
  count(*) filter (where permuta)                as props_permuta,
  round(avg(dist_mar_m))                         as dist_mar_prom
from public.propiedades
where estado = 'activa'
group by zona;

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════
alter table public.propiedades        enable row level security;
alter table public.perfiles           enable row level security;
alter table public.consultas          enable row level security;
alter table public.favoritos          enable row level security;
alter table public.fichas_tecnicas    enable row level security;
alter table public.kyc_verificaciones enable row level security;
alter table public.proveedores        enable row level security;
alter table public.ai_conversaciones  enable row level security;

-- Propiedades activas: lectura pública
drop policy if exists "props_lectura_publica" on public.propiedades;
create policy "props_lectura_publica"
  on public.propiedades for select using (estado = 'activa');

-- Propiedades: escritura solo publicante o admin
drop policy if exists "props_escritura_propia" on public.propiedades;
create policy "props_escritura_propia"
  on public.propiedades for all
  using (
    auth.uid() = publicante_id
    or exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

-- Perfiles: solo el propio usuario
drop policy if exists "perfil_propio" on public.perfiles;
create policy "perfil_propio"
  on public.perfiles for all using (auth.uid() = id);

-- Consultas: insertar (pública), leer (publicante de la prop o admin)
drop policy if exists "consultas_insertar" on public.consultas;
create policy "consultas_insertar"
  on public.consultas for insert with check (true);

drop policy if exists "consultas_lectura" on public.consultas;
create policy "consultas_lectura"
  on public.consultas for select
  using (
    exists (
      select 1 from public.propiedades p
      where p.id = propiedad_id and p.publicante_id = auth.uid()
    )
    or exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
  );

-- Fichas y KYC: lectura pública, escritura solo admin
drop policy if exists "fichas_lectura" on public.fichas_tecnicas;
create policy "fichas_lectura"   on public.fichas_tecnicas    for select using (true);
drop policy if exists "kyc_lectura" on public.kyc_verificaciones;
create policy "kyc_lectura"      on public.kyc_verificaciones for select using (true);

drop policy if exists "fichas_admin" on public.fichas_tecnicas;
create policy "fichas_admin"     on public.fichas_tecnicas    for all
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

drop policy if exists "kyc_admin" on public.kyc_verificaciones;
create policy "kyc_admin"        on public.kyc_verificaciones for all
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

-- Favoritos: solo el propio usuario
drop policy if exists "favoritos_propios" on public.favoritos;
create policy "favoritos_propios"
  on public.favoritos for all using (auth.uid() = usuario_id);

-- Proveedores: inserción pública, lectura solo admin
drop policy if exists "proveedores_insertar" on public.proveedores;
create policy "proveedores_insertar"
  on public.proveedores for insert with check (true);

drop policy if exists "proveedores_admin" on public.proveedores;
create policy "proveedores_admin"
  on public.proveedores for select
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

-- AI conversaciones: solo el propio usuario o session anónima
drop policy if exists "ai_conv_propia" on public.ai_conversaciones;
create policy "ai_conv_propia"
  on public.ai_conversaciones for all
  using (auth.uid() = usuario_id or usuario_id is null);

-- ══════════════════════════════════════════════════════════════
-- FUNCIONES Y TRIGGERS
-- ══════════════════════════════════════════════════════════════

-- Auto-crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.perfiles (id, email, nombre)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-timestamp updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.actualizado_en = now(); return new; end;
$$;

create trigger props_updated_at     before update on public.propiedades      for each row execute procedure public.set_updated_at();
create trigger fichas_updated_at    before update on public.fichas_tecnicas   for each row execute procedure public.set_updated_at();
create trigger kyc_updated_at       before update on public.kyc_verificaciones for each row execute procedure public.set_updated_at();
create trigger consultas_updated_at before update on public.consultas         for each row execute procedure public.set_updated_at();

-- Auto-código de propiedad (PP-2026-0001)
-- SEQUENCE para código de propiedad — evita race condition con COUNT()+1
create sequence if not exists public.prop_codigo_seq start 1 increment 1;

create or replace function public.generar_codigo_propiedad()
returns trigger language plpgsql as $$
declare
  anio text;
  seq  bigint;
begin
  anio := to_char(now(), 'YYYY');
  -- nextval es atómico — nunca genera duplicados con inserciones concurrentes
  seq  := nextval('public.prop_codigo_seq');
  new.codigo := 'PP-' || anio || '-' || lpad(seq::text, 4, '0');
  return new;
end;
$$;

create trigger props_codigo before insert on public.propiedades
  for each row when (new.codigo is null) execute procedure public.generar_codigo_propiedad();

-- Sync tiene_ficha / tiene_kyc cuando se carga o actualiza una ficha/KYC
create or replace function public.sync_ficha_kyc()
returns trigger language plpgsql as $$
begin
  update public.propiedades set
    tiene_ficha = exists(select 1 from public.fichas_tecnicas where propiedad_id = new.propiedad_id),
    tiene_kyc   = exists(
      select 1 from public.kyc_verificaciones
      where propiedad_id = new.propiedad_id and estado = 'verificado'
    )
  where id = new.propiedad_id;
  return new;
end;
$$;

create trigger sync_ficha after insert or update on public.fichas_tecnicas
  for each row execute procedure public.sync_ficha_kyc();
create trigger sync_kyc after insert or update on public.kyc_verificaciones
  for each row execute procedure public.sync_ficha_kyc();

-- ══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS (crear manualmente en Dashboard → Storage)
-- ══════════════════════════════════════════════════════════════
-- Bucket: prop-imagenes   → público  | 5MB  | image/jpeg, image/png, image/webp
-- Bucket: fichas-pdf      → público  | 10MB | application/pdf
-- Bucket: kyc-docs        → privado  | 10MB | todos
-- Bucket: proveedores-docs→ privado  | 10MB | todos
-- Bucket: avatares        → público  | 2MB  | image/jpeg, image/png

-- ══════════════════════════════════════════════════════════════
-- SEED — datos demo
-- ══════════════════════════════════════════════════════════════
insert into public.inmobiliarias (nombre, email, telefono, verificada) values
  ('Rodríguez & Cía Inmobiliaria',  'info@rodriguezcia.com.ar',     '+54 9 2254 123456', true),
  ('Pinamar Brokers',               'ventas@pinamarbrokers.com.ar', '+54 9 2254 654321', true),
  ('Cariló Premium Properties',     'hola@carilopremium.com.ar',    '+54 9 2254 111222', false);

-- ══════════════════════════════════════════════════════════════
-- PATCH: Reportes de mercado
-- ══════════════════════════════════════════════════════════════

-- Agregar campos a noticias para soportar PDFs y permisos
alter table public.noticias
  add column if not exists tipo          text default 'articulo'
                                           check (tipo in ('articulo','reporte','informe')),
  add column if not exists pdf_url       text,
  add column if not exists pdf_nombre    text,
  add column if not exists pdf_tamano    integer,
  add column if not exists inmobiliaria_id uuid references public.inmobiliarias(id),
  add column if not exists vistas        integer default 0,
  add column if not exists descargas     integer default 0;

-- Agregar permiso de publicación de reportes a inmobiliarias
alter table public.inmobiliarias
  add column if not exists puede_publicar_reportes boolean default false;

-- Política: noticias publicadas son de lectura pública
drop policy if exists "noticias_lectura_publica" on public.noticias;
create policy "noticias_lectura_publica"
  on public.noticias for select
  using (publicada = true);

-- Política: admin puede todo
drop policy if exists "noticias_admin" on public.noticias;
create policy "noticias_admin"
  on public.noticias for all
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

-- Política: inmobiliaria autorizada puede insertar/editar sus propias noticias
drop policy if exists "noticias_inmobiliaria_autorizada" on public.noticias;
create policy "noticias_inmobiliaria_autorizada"
  on public.noticias for all
  using (
    inmobiliaria_id in (
      select id from public.inmobiliarias
      where puede_publicar_reportes = true
      and id = (select inmobiliaria_id from public.perfiles where id = auth.uid())
    )
  );

-- Función para incrementar contador de descargas (llamada desde el cliente)
create or replace function public.incrementar_descargas(noticia_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.noticias set descargas = descargas + 1 where id = noticia_id;
end;
$$;

-- Función para incrementar contador de vistas
create or replace function public.incrementar_vistas(noticia_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.noticias set vistas = vistas + 1 where id = noticia_id;
end;
$$;

-- Bucket para PDFs de reportes (agregar manualmente en Dashboard → Storage)
-- Bucket: reportes-pdf → público | 20MB | application/pdf

-- ══════════════════════════════════════════════════════════════
-- ETAPA 1A: TABLA BARRIOS
-- Cada barrio pertenece a una zona del Partido de Pinamar
-- ══════════════════════════════════════════════════════════════

create table public.barrios (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text unique not null,          -- 'carilo-bosque', 'la-herradura'
  nombre              text not null,                 -- 'Cariló Bosque'
  zona                text not null
                        check (zona in ('carilo','pinamar-centro','pinamar-norte',
                                        'valeria','ostende','costa-esmeralda')),
  perfil_psico        text
                        check (perfil_psico in ('refugio','vidriera','pueblo',
                                                'horizonte','silvestre')),

  -- Descripción e historia
  descripcion_corta   text,                          -- 1-2 frases para cards
  descripcion_larga   text,                          -- texto completo, acepta HTML básico
  historia            text,                          -- historia y origen del barrio

  -- Precios de mercado (actualizables desde el panel)
  precio_m2_lote_usd      numeric(10,2),
  precio_m2_constr_usd    numeric(10,2),
  precio_m2_lote_min      numeric(10,2),             -- rango mínimo
  precio_m2_lote_max      numeric(10,2),             -- rango máximo
  fecha_actualizacion_precios date,

  -- Servicios disponibles
  gas_natural         boolean default false,
  agua_corriente      boolean default true,
  cloacas             boolean default false,
  fibra_optica        boolean default false,
  asfalto             boolean default false,
  seguridad_privada   boolean default false,
  alumbrado           boolean default true,
  recoleccion_residuos boolean default true,

  -- Restricciones COU (Código de Ordenamiento Urbano)
  cou_zonificacion    text,                          -- 'R1', 'R2', 'Bosque', etc.
  cou_altura_max_m    numeric(4,1),                  -- metros
  cou_fos             numeric(4,3),                  -- Factor Ocupación Suelo (0.000–1.000)
  cou_fot             numeric(4,3),                  -- Factor Ocupación Total
  cou_superficie_min_m2 numeric(8,2),                -- superficie mínima de parcela
  cou_retiro_frente_m numeric(4,1),
  cou_retiro_lateral_m numeric(4,1),
  cou_retiro_fondo_m  numeric(4,1),
  cou_notas           text,                          -- restricciones especiales

  -- Geografía
  lat_centro          double precision,              -- centro del barrio para el mapa
  lng_centro          double precision,
  poligono            jsonb,                         -- array de {lat, lng} para el límite
  zoom_mapa           smallint default 15,

  -- Media
  imagen_portada_url  text,
  galeria_urls        text[],                        -- array de URLs de fotos

  -- Estadísticas (actualizadas por trigger)
  total_propiedades   integer default 0,
  propiedades_venta   integer default 0,
  propiedades_alquiler integer default 0,

  -- Control
  activo              boolean default true,
  destacado           boolean default false,
  orden               smallint default 0,            -- orden de aparición en listados
  creado_en           timestamptz default now(),
  actualizado_en      timestamptz default now()
);

-- Índices
create index idx_barrios_zona    on public.barrios(zona);
create index idx_barrios_slug    on public.barrios(slug);
create index idx_barrios_activo  on public.barrios(activo);

-- Trigger updated_at
create trigger barrios_updated_at before update on public.barrios
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.barrios enable row level security;

drop policy if exists "barrios_lectura_publica" on public.barrios;
create policy "barrios_lectura_publica"
  on public.barrios for select using (activo = true);

drop policy if exists "barrios_admin" on public.barrios;
create policy "barrios_admin"
  on public.barrios for all
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

-- Imágenes de barrios (galería separada para mejor gestión)
create table public.barrio_imagenes (
  id           uuid primary key default uuid_generate_v4(),
  barrio_id    uuid not null references public.barrios(id) on delete cascade,
  url          text not null,
  alt_text     text,
  es_portada   boolean default false,
  orden        smallint default 0,
  creado_en    timestamptz default now()
);

alter table public.barrio_imagenes enable row level security;
drop policy if exists "barrio_imgs_publica" on public.barrio_imagenes;
create policy "barrio_imgs_publica" on public.barrio_imagenes for select using (true);
drop policy if exists "barrio_imgs_admin" on public.barrio_imagenes;
create policy "barrio_imgs_admin"   on public.barrio_imagenes for all
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

-- FK en propiedades: agregar referencia al barrio
alter table public.propiedades
  add column if not exists barrio_id uuid references public.barrios(id);

create index idx_prop_barrio on public.propiedades(barrio_id);

-- ══════════════════════════════════════════════════════════════
-- ETAPA 1B: TABLA INDICADORES_ZONA
-- Precios de mercado por zona, editables desde el panel admin
-- Se usan en perfiles-zona.html y Pinamar AI en tiempo real
-- ══════════════════════════════════════════════════════════════

create table public.indicadores_zona (
  id                      uuid primary key default uuid_generate_v4(),
  zona                    text unique not null
                            check (zona in ('carilo','pinamar-centro','pinamar-norte',
                                            'valeria','ostende','costa-esmeralda')),
  -- Precios de mercado
  precio_m2_lote_usd      numeric(10,2),
  precio_m2_constr_usd    numeric(10,2),
  precio_ticket_prom_usd  numeric(12,2),            -- ticket promedio de transacción
  precio_m2_depto_usd     numeric(10,2),            -- específico para dptos

  -- Tendencia
  apreciacion_pct_anual   numeric(5,2),             -- % de apreciación anual
  tendencia               text check (tendencia in ('sube','estable','baja')),

  -- Sentimiento (editable, base para el AI y perfiles)
  sentimiento_positivo_pct smallint,                -- 0-100
  sentimiento_negativo_pct smallint,
  sentimiento_neutro_pct   smallint,
  polarizacion             text check (polarizacion in ('baja','media','media-baja','alta')),

  -- Mercado
  total_transacciones_anuales integer,
  dias_promedio_venta     integer,                  -- días en mercado hasta vender
  stock_disponible        integer,                  -- propiedades activas en el portal

  -- Timestamps
  fecha_datos             date default current_date, -- período al que corresponden
  creado_en               timestamptz default now(),
  actualizado_en          timestamptz default now()
);

create trigger indicadores_updated_at before update on public.indicadores_zona
  for each row execute procedure public.set_updated_at();

alter table public.indicadores_zona enable row level security;

drop policy if exists "indicadores_lectura_publica" on public.indicadores_zona;
create policy "indicadores_lectura_publica"
  on public.indicadores_zona for select using (true);

drop policy if exists "indicadores_admin" on public.indicadores_zona;
create policy "indicadores_admin"
  on public.indicadores_zona for all
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

-- ══════════════════════════════════════════════════════════════
-- ETAPA 1C: VISTA ENRIQUECIDA DE BARRIOS
-- Incluye stats de propiedades en tiempo real
-- ══════════════════════════════════════════════════════════════

create or replace view public.v_barrios as
select
  b.*,
  iz.precio_m2_lote_usd        as zona_precio_m2_lote,
  iz.precio_m2_constr_usd      as zona_precio_m2_constr,
  iz.apreciacion_pct_anual     as zona_apreciacion,
  iz.sentimiento_positivo_pct  as zona_sentimiento_pos,
  iz.sentimiento_negativo_pct  as zona_sentimiento_neg,
  iz.polarizacion              as zona_polarizacion,
  count(p.id)                  as props_activas,
  count(p.id) filter (where p.operacion = 'venta')        as props_venta,
  count(p.id) filter (where p.operacion in ('alquiler','alquiler_temp')) as props_alquiler,
  count(p.id) filter (where p.tiene_ficha = true)         as props_con_ficha,
  round(avg(p.precio_usd))     as precio_prom_props,
  round(avg(p.precio_usd / nullif(p.sup_terreno_m2,0)))   as precio_m2_real_prom
from public.barrios b
left join public.indicadores_zona iz on iz.zona = b.zona
left join public.propiedades p on p.barrio_id = b.id and p.estado = 'activa'
where b.activo = true
group by b.id, iz.precio_m2_lote_usd, iz.precio_m2_constr_usd,
         iz.apreciacion_pct_anual, iz.sentimiento_positivo_pct,
         iz.sentimiento_negativo_pct, iz.polarizacion
order by b.zona, b.orden;

-- ══════════════════════════════════════════════════════════════
-- ETAPA 1D: FUNCIÓN SYNC stats de barrio
-- Actualiza contadores en la tabla barrios cuando cambia una prop
-- ══════════════════════════════════════════════════════════════

create or replace function public.sync_stats_barrio()
returns trigger language plpgsql as $$
begin
  if new.barrio_id is not null then
    update public.barrios set
      total_propiedades  = (select count(*) from public.propiedades
                            where barrio_id = new.barrio_id and estado = 'activa'),
      propiedades_venta  = (select count(*) from public.propiedades
                            where barrio_id = new.barrio_id and estado = 'activa'
                            and operacion = 'venta'),
      propiedades_alquiler = (select count(*) from public.propiedades
                              where barrio_id = new.barrio_id and estado = 'activa'
                              and operacion in ('alquiler','alquiler_temp'))
    where id = new.barrio_id;
  end if;
  return new;
end;
$$;

create trigger sync_barrio_stats after insert or update or delete on public.propiedades
  for each row execute procedure public.sync_stats_barrio();

-- ══════════════════════════════════════════════════════════════
-- ETAPA 1E: SEED — barrios demo del Partido de Pinamar
-- ══════════════════════════════════════════════════════════════

insert into public.indicadores_zona
  (zona, precio_m2_lote_usd, precio_m2_constr_usd, precio_ticket_prom_usd,
   apreciacion_pct_anual, tendencia,
   sentimiento_positivo_pct, sentimiento_negativo_pct, sentimiento_neutro_pct,
   polarizacion, dias_promedio_venta, fecha_datos)
values
  ('carilo',          5500, 7200, 620000, 18, 'sube', 91,  4,  5, 'baja',       45, current_date),
  ('pinamar-centro',  2200, 2800, 110000,  8, 'sube', 78, 12, 10, 'media',      28, current_date),
  ('pinamar-norte',   2800, 3400, 390000,  9, 'sube', 81, 11,  8, 'media',      60, current_date),
  ('valeria',         1800, 2600, 240000, 14, 'sube', 83,  8,  9, 'baja',       55, current_date),
  ('ostende',         1800, 2600, 240000, 14, 'sube', 83,  8,  9, 'baja',       55, current_date),
  ('costa-esmeralda', 3200, 4800, 320000, 11, 'sube', 68, 24,  8, 'alta',       70, current_date)
on conflict (zona) do update set
  precio_m2_lote_usd       = excluded.precio_m2_lote_usd,
  precio_m2_constr_usd     = excluded.precio_m2_constr_usd,
  precio_ticket_prom_usd   = excluded.precio_ticket_prom_usd,
  apreciacion_pct_anual    = excluded.apreciacion_pct_anual,
  sentimiento_positivo_pct = excluded.sentimiento_positivo_pct,
  sentimiento_negativo_pct = excluded.sentimiento_negativo_pct,
  sentimiento_neutro_pct   = excluded.sentimiento_neutro_pct,
  polarizacion             = excluded.polarizacion,
  fecha_datos              = excluded.fecha_datos;

insert into public.barrios
  (slug, nombre, zona, perfil_psico,
   descripcion_corta, descripcion_larga, historia,
   precio_m2_lote_usd, precio_m2_constr_usd, precio_m2_lote_min, precio_m2_lote_max,
   fecha_actualizacion_precios,
   gas_natural, agua_corriente, cloacas, fibra_optica, asfalto,
   seguridad_privada, alumbrado, recoleccion_residuos,
   cou_zonificacion, cou_altura_max_m, cou_fos, cou_fot,
   cou_superficie_min_m2, cou_retiro_frente_m, cou_retiro_lateral_m, cou_retiro_fondo_m,
   cou_notas,
   lat_centro, lng_centro, zoom_mapa, destacado, orden)
values

-- Cariló
('carilo-bosque', 'Cariló Bosque', 'carilo', 'refugio',
 'El corazón del bosque de pinos de Cariló. Máxima privacidad y menor densidad constructiva del Partido.',
 '<p>Cariló Bosque es la zona de mayor exclusividad dentro de Cariló. Sus calles de arena bordeadas de pinos centenarios y la arquitectura integrada al entorno natural lo convierten en el destino más codiciado del litoral bonaerense.</p>',
 'Cariló nació como un proyecto de forestación en la década de 1940. El bosque fue plantado como barrera contra el viento y con el tiempo se convirtió en el activo más valioso del lugar.',
 5800, 7500, 4800, 7200, current_date,
 false, true, false, true, false, false, true, true,
 'Bosque Residencial', 7.0, 0.20, 0.40, 900, 5, 3, 5,
 'Prohibido talar árboles sin autorización municipal. Construcción máxima: 2 plantas. Materiales deben integrarse al entorno natural.',
 -37.163, -56.951, 15, true, 1),

('carilo-golf', 'Cariló Golf', 'carilo', 'refugio',
 'Adyacente al campo de golf. Lotes grandes, máxima tranquilidad y vistas al verde.',
 '<p>Cariló Golf combina la exclusividad del bosque con la proximidad al campo de golf de 9 hoyos. Los lotes son notablemente más grandes que en el resto de Cariló.</p>',
 'El campo de golf de Cariló se inauguró en 1980 y ordenó el desarrollo urbanístico del sector norte.',
 5200, 7000, 4500, 6800, current_date,
 false, true, false, true, false, true, true, true,
 'Residencial Golf', 7.0, 0.20, 0.40, 1200, 5, 3, 5,
 'Frentes al fairway tienen restricciones de altura para no obstruir la visual del campo.',
 -37.158, -56.948, 15, false, 2),

('carilo-el-remanso', 'Cariló El Remanso', 'carilo', 'refugio',
 'La zona más tranquila de Cariló. Ideal para familias que buscan contacto directo con la naturaleza.',
 '<p>El Remanso es el sector más reservado de Cariló, con acceso limitado y la menor densidad de todo el Partido de Pinamar.</p>',
 'Desarrollado en los años 90 como extensión natural de Cariló hacia el norte.',
 4800, 6800, 4200, 6000, current_date,
 false, true, false, false, false, false, true, true,
 'Residencial Baja Densidad', 6.0, 0.18, 0.36, 1000, 5, 3, 6,
 null,
 -37.155, -56.945, 15, false, 3),

-- Pinamar Centro
('pinamar-bunge', 'Avenida Bunge y centro comercial', 'pinamar-centro', 'pueblo',
 'El corazón comercial y gastronómico de Pinamar. Máxima actividad en temporada y alta demanda de alquiler.',
 '<p>La Avenida Bunge es la arteria principal de Pinamar, con gastronomía, comercios y acceso directo a la playa más animada del Partido.</p>',
 'Pinamar fue fundada en 1941 por Jorge Bunge, quien diseñó el trazado de calles siguiendo las curvas de los médanos.',
 2400, 3000, 1800, 3200, current_date,
 true, true, true, true, true, false, true, true,
 'Comercial Mixto', 12.0, 0.60, 1.20, 250, 3, 0, 3,
 'Zona de alta densidad. Se permiten edificios de hasta 4 pisos en avenidas principales.',
 -37.102, -56.866, 15, true, 10),

('pinamar-las-gaviotas', 'Barrio Las Gaviotas', 'pinamar-centro', 'pueblo',
 'Barrio residencial familiar a metros del mar. Lotes amplios y ambiente tranquilo dentro de Pinamar Centro.',
 '<p>Las Gaviotas es uno de los barrios más consolidados de Pinamar, preferido por familias que buscan un ambiente más tranquilo que el centro pero con todos los servicios a mano.</p>',
 'Desarrollado en los años 60-70 como la primera expansión residencial de Pinamar Centro.',
 2000, 2600, 1600, 2800, current_date,
 true, true, true, true, true, false, true, true,
 'Residencial R2', 9.0, 0.45, 0.90, 400, 3, 1.5, 4,
 null,
 -37.098, -56.860, 15, false, 11),

-- Pinamar Norte
('pinamar-la-herradura', 'Barrio La Herradura', 'pinamar-norte', 'silvestre',
 'Barrio privado con cancha de golf. El más exclusivo de Pinamar Norte.',
 '<p>La Herradura es un barrio privado con acceso controlado, cancha de golf de 18 hoyos, canchas de tenis y lago artificial. Uno de los emprendimientos más completos del Partido.</p>',
 'Inaugurado en 1998, fue pionero en el concepto de barrio privado con golf en la costa bonaerense.',
 3200, 4000, 2800, 4500, current_date,
 false, true, true, true, true, true, true, true,
 'Residencial Privado', 8.5, 0.25, 0.50, 800, 5, 3, 5,
 'Reglamento interno del barrio. Construcción sujeta a aprobación del comité de arquitectura.',
 -37.085, -56.848, 15, true, 20),

('pinamar-las-hortensias', 'Barrio Las Hortensias', 'pinamar-norte', 'silvestre',
 'Barrio arbolado y tranquilo. Buena relación precio-superficie en Pinamar Norte.',
 '<p>Las Hortensias combina proximidad a los servicios de Pinamar Norte con un ambiente residencial tranquilo. Popular entre familias que buscan lotes grandes a precios razonables.</p>',
 'Desarrollado en los años 80, debe su nombre a la vegetación característica de la zona.',
 2600, 3200, 2200, 3600, current_date,
 true, true, true, true, true, false, true, true,
 'Residencial R1', 7.0, 0.35, 0.70, 600, 4, 2, 4,
 null,
 -37.088, -56.852, 15, false, 21),

-- Valeria del Mar
('valeria-centro', 'Valeria del Mar Centro', 'valeria', 'horizonte',
 'El corazón de Valeria del Mar. Playa tranquila, ambiente íntimo y arquitectura heterogénea.',
 '<p>Valeria del Mar es una de las localidades más tranquilas del Partido. Su playa de aguas más calmas que Pinamar y su ambiente familiar la hacen ideal para quienes buscan escapar de la masificación.</p>',
 'Valeria del Mar fue fundada en 1943. Su nombre hace referencia a la esposa de uno de los primeros propietarios de la zona.',
 1900, 2700, 1500, 2600, current_date,
 true, true, false, false, true, false, true, true,
 'Residencial R1', 7.0, 0.35, 0.70, 500, 4, 2, 4,
 null,
 -37.168, -56.971, 15, false, 30),

-- Ostende
('ostende-centro', 'Ostende Centro', 'ostende', 'horizonte',
 'La localidad con más historia del Partido. Chalets históricos y playa tranquila.',
 '<p>Ostende es la localidad más antigua del Partido de Pinamar. Su arquitectura mezcla chalets históricos de los años 40 con construcciones modernas. La playa es tranquila y el ambiente muy familiar.</p>',
 'Ostende fue fundada en 1913 por colonos belgas, convirtiéndose en el primer asentamiento costero del Partido.',
 1700, 2500, 1400, 2400, current_date,
 true, true, false, true, true, false, true, true,
 'Residencial R1', 7.0, 0.35, 0.70, 450, 4, 2, 4,
 null,
 -37.143, -56.958, 15, false, 35),

-- Costa Esmeralda
('costa-esmeralda-nautico', 'Costa Esmeralda Náutico', 'costa-esmeralda', 'vidriera',
 'Barrio privado con acceso al mar. El más exclusivo de Costa Esmeralda.',
 '<p>El Barrio Náutico de Costa Esmeralda ofrece acceso directo al mar con playa privada, seguridad perimetral 24hs y amenities de nivel country.</p>',
 'Costa Esmeralda fue desarrollada por el Grupo EIDICO a partir de 1999 como una ciudad planificada con múltiples barrios.',
 3800, 5200, 3200, 5500, current_date,
 false, true, true, true, true, true, true, true,
 'Residencial Privado', 10.0, 0.25, 0.50, 900, 5, 3, 5,
 'Reglamento interno EIDICO. Aprobación arquitectónica obligatoria.',
 -37.040, -56.780, 15, true, 40),

('costa-esmeralda-atlantico', 'Costa Esmeralda Atlántico', 'costa-esmeralda', 'vidriera',
 'Barrio privado con golf. Estatus y seguridad en un entorno natural único.',
 '<p>El Barrio Atlántico combina la seguridad del barrio cerrado con la cercanía a las canchas de golf y el club de equitación de Costa Esmeralda.</p>',
 'Inaugurado en 2003 como parte de la segunda etapa del desarrollo de Costa Esmeralda.',
 3400, 4800, 2800, 4800, current_date,
 false, true, true, true, true, true, true, true,
 'Residencial Privado Golf', 9.0, 0.25, 0.50, 1000, 5, 3, 5,
 'Restricciones de diseño arquitectónico. Tejados en tonos neutros obligatorios.',
 -37.045, -56.785, 15, false, 41)

on conflict (slug) do update set
  precio_m2_lote_usd   = excluded.precio_m2_lote_usd,
  precio_m2_constr_usd = excluded.precio_m2_constr_usd,
  actualizado_en       = now();

-- Bucket Storage para fotos de barrios
-- Bucket: barrio-fotos → público | 8MB | image/jpeg, image/png, image/webp

-- ── Campo privacidad de ubicación en propiedades ─────────────────────────
alter table public.propiedades
  add column if not exists mostrar_ubicacion_exacta boolean default true;

-- ── Campos de fuente y fecha para noticias ───────────────────────────────
alter table public.noticias
  add column if not exists fuente_nombre    text,          -- ej: "INDEC", "La Nación", "Infobae"
  add column if not exists fuente_url       text,          -- link a la fuente original
  add column if not exists fecha_novedad    date,          -- fecha del hecho (puede diferir de publicado_en)
  add column if not exists link_externo     text,          -- si es solo un link a artículo externo
  add column if not exists es_link_externo  boolean default false,  -- true = redirige, false = artículo propio
  add column if not exists tags             text[];         -- tags para búsqueda: {'cariló','precios','2026'}

-- Vista pública de noticias (sin datos sensibles)
create or replace view public.v_noticias as
select
  id, titulo, slug, bajada, contenido, imagen_url,
  categoria, tipo, pdf_url, pdf_nombre,
  fuente_nombre, fuente_url, fecha_novedad,
  link_externo, es_link_externo, tags,
  destacada, vistas, descargas,
  publicado_en,
  inmobiliaria_id
from public.noticias
where publicada = true
order by publicado_en desc;

-- ── Ampliar tabla inmobiliarias para directorio público ──────────────────
alter table public.inmobiliarias
  add column if not exists descripcion        text,
  add column if not exists slug               text unique,
  add column if not exists direccion          text,
  add column if not exists localidad          text,
  add column if not exists whatsapp           text,
  add column if not exists facebook           text,
  add column if not exists linkedin           text,
  add column if not exists matricula_cmcpd    text,
  add column if not exists anios_mercado      smallint,
  add column if not exists zonas_opera        text[],           -- ['carilo','pinamar-centro']
  add column if not exists especialidades     text[],           -- ['venta','alquiler_temp','inversión']
  add column if not exists propiedades_vendidas integer default 0,
  add column if not exists prop_en_portal      integer default 0,
  add column if not exists destacada           boolean default false,
  add column if not exists orden               smallint default 0,
  add column if not exists foto_portada_url    text,
  add column if not exists galeria_urls        text[],
  add column if not exists horario_atencion    text,
  add column if not exists puede_publicar_reportes boolean default false;

-- Tabla de reseñas verificadas de inmobiliarias
create table if not exists public.resenas_inmobiliarias (
  id              uuid primary key default uuid_generate_v4(),
  inmobiliaria_id uuid not null references public.inmobiliarias(id) on delete cascade,
  usuario_id      uuid references public.perfiles(id),
  nombre_cliente  text not null,
  email_cliente   text,
  puntaje         smallint not null check (puntaje between 1 and 5),
  titulo          text,
  comentario      text not null,
  tipo_operacion  text check (tipo_operacion in ('venta','alquiler','alquiler_temp','permuta')),
  verificada      boolean default false,   -- admin la verifica antes de publicar
  publicada       boolean default false,
  creado_en       timestamptz default now()
);

alter table public.resenas_inmobiliarias enable row level security;

drop policy if exists "resenas_lectura_publica" on public.resenas_inmobiliarias;
create policy "resenas_lectura_publica"
  on public.resenas_inmobiliarias for select
  using (publicada = true and verificada = true);

drop policy if exists "resenas_insertar_auth" on public.resenas_inmobiliarias;
create policy "resenas_insertar_auth"
  on public.resenas_inmobiliarias for insert
  with check (auth.uid() is not null);

drop policy if exists "resenas_admin" on public.resenas_inmobiliarias;
create policy "resenas_admin"
  on public.resenas_inmobiliarias for all
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

-- Vista pública del directorio de inmobiliarias
create or replace view public.v_inmobiliarias as
select
  i.*,
  count(distinct r.id) filter (where r.publicada and r.verificada) as total_resenas,
  round(avg(r.puntaje) filter (where r.publicada and r.verificada), 1) as puntaje_promedio,
  count(distinct p.id) filter (where p.estado = 'activa') as props_activas
from public.inmobiliarias i
left join public.resenas_inmobiliarias r on r.inmobiliaria_id = i.id
left join public.propiedades p on p.inmobiliaria_id = i.id
where i.activa = true
group by i.id
order by i.destacada desc, i.orden, i.nombre;

-- Tabla configuración calculadora hipotecaria (admin la edita)
create table if not exists public.config_calculadora (
  id              uuid primary key default uuid_generate_v4(),
  tipo            text not null check (tipo in ('uva','dolares')),
  nombre_banco    text not null,
  tna_fija        numeric(6,3) not null,    -- % fijo anual
  spread_variable numeric(6,3) default 0,   -- % variable (UVA: CER spread)
  plazo_min_años  smallint default 5,
  plazo_max_años  smallint default 30,
  anticipo_min_pct smallint default 20,
  anticipo_max_pct smallint default 70,
  monto_min_usd   integer default 10000,
  monto_max_usd   integer default 2000000,
  activa          boolean default true,
  actualizado_en  timestamptz default now(),
  notas           text
);

alter table public.config_calculadora enable row level security;

drop policy if exists "calc_lectura_publica" on public.config_calculadora;
create policy "calc_lectura_publica"
  on public.config_calculadora for select using (activa = true);

drop policy if exists "calc_admin" on public.config_calculadora;
create policy "calc_admin"
  on public.config_calculadora for all
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

-- Seed: tasas iniciales (actualizables desde el panel admin)
insert into public.config_calculadora
  (tipo, nombre_banco, tna_fija, spread_variable, plazo_min_años, plazo_max_años, anticipo_min_pct, notas)
values
  ('uva', 'Banco Nación — UVA', 3.5, 0, 5, 30, 20,
   'Tasa fija 3,5% anual + ajuste UVA (CER). Cuota inicial en pesos.'),
  ('uva', 'Banco Provincia — UVA', 4.0, 0, 5, 20, 20,
   'Tasa fija 4% anual + ajuste UVA. Cuota inicial en pesos.'),
  ('uva', 'Banco Ciudad — UVA', 3.75, 0, 5, 25, 20,
   'Tasa fija 3,75% anual + ajuste UVA.'),
  ('dolares', 'Crédito en USD — Referencia', 6.5, 2.5, 5, 20, 30,
   'Tasa fija 6,5% + spread variable 2,5%. Solo referencia — verificar con banco.')
on conflict do nothing;

-- ── Configuración de marca / quiénes somos ───────────────────────────────
create table if not exists public.config_brand (
  id              uuid primary key default uuid_generate_v4(),
  clave           text not null unique,   -- 'pdf_descargable', 'pdf_nombre', 'pdf_descripcion', etc.
  valor           text,
  actualizado_en  timestamptz default now(),
  actualizado_por uuid references public.perfiles(id)
);

alter table public.config_brand enable row level security;

drop policy if exists "brand_lectura_publica" on public.config_brand;
create policy "brand_lectura_publica"
  on public.config_brand for select using (true);

drop policy if exists "brand_admin" on public.config_brand;
create policy "brand_admin"
  on public.config_brand for all
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

-- Valores iniciales
insert into public.config_brand (clave, valor) values
  ('pdf_descargable_url',   null),
  ('pdf_descargable_nombre','Pinamar Propiedades — El Nexo Inteligente'),
  ('pdf_descargable_desc',  'Blueprint de Producto, Diseño y Arquitectura para el Ecosistema Digital 2026.'),
  ('pdf_descargable_activo','true')
on conflict (clave) do nothing;

-- ── Tabla de tasas de gastos de escrituración (editables desde admin) ────
create table if not exists public.config_gastos (
  id              uuid primary key default uuid_generate_v4(),
  clave           text not null unique,
  valor           numeric(6,3) not null,
  descripcion     text,
  quien_paga      text check (quien_paga in ('comprador','vendedor','ambos')),
  activa          boolean default true,
  actualizado_en  timestamptz default now()
);

alter table public.config_gastos enable row level security;
create policy "gastos_lectura_publica" on public.config_gastos for select using (activa = true);
create policy "gastos_admin" on public.config_gastos for all
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'));

-- Tasas iniciales PBA 2026
insert into public.config_gastos (clave, valor, descripcion, quien_paga) values
  ('sellos_pba',           3.6,  'Impuesto de Sellos PBA — sobre valor escriturado', 'comprador'),
  ('honorarios_escribano', 2.5,  'Honorarios escribano — promedio negociable', 'comprador'),
  ('comision_inmobiliaria',3.0,  'Comisión inmobiliaria — cada parte', 'ambos'),
  ('iti_vendedor',         1.5,  'ITI (Impuesto a la Transferencia de Inmuebles) — si es casa habitación', 'vendedor'),
  ('ganancias_vendedor',  15.0,  'Impuesto a las Ganancias — si no es casa habitación permanente', 'vendedor'),
  ('registros_certificados',0.5, 'Registros y certificados — inhibición, dominio, etc.', 'ambos'),
  ('aporte_notarial_pba',  0.3,  'Aporte notarial PBA — Caja Notarial', 'comprador')
on conflict (clave) do nothing;

-- ── Textos editables del hero de Quiénes somos ───────────────────────────
insert into public.config_brand (clave, valor) values
  ('hero_titulo_es',   'Somos el nexo inteligente — conectando la naturaleza con la inversión inteligente'),
  ('hero_titulo_en',   'We are the intelligent hub — connecting nature with smart investment'),
  ('hero_subtitulo_es','Reducimos la incertidumbre del inversor con datos duros, transparencia y tecnología en el mercado premium del Partido de Pinamar.'),
  ('hero_subtitulo_en','We reduce investor uncertainty with hard data, transparency and technology in the premium real estate market of Partido de Pinamar.'),
  ('hero_mision_es',   '"Conectamos la naturaleza con la inversión inteligente. Datos duros, títulos verificados y gestión integral de activos en el destino premium de la costa bonaerense."'),
  ('hero_mision_en',   '"We connect nature with intelligent investment. Hard data, verified titles, and comprehensive asset management in the premium destination of the Buenos Aires coast."')
on conflict (clave) do nothing;
