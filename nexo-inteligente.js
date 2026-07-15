/**
 * nexo-inteligente.js — Pinamar Propiedades
 * Módulo nuevo con toda la lógica de la Arquitectura "Nexo Inteligente" v10/v11:
 * - CRUD de las 10 tablas de propiedades + vista unificada
 * - opciones_configurables, zonas, barrios_cerrados
 * - perfiles_busqueda (Hero + chat), favoritos, alertas_busqueda
 * - Sistema de Permutas
 *
 * IMPORTANTE: este archivo es un AGREGADO, no reemplaza a supabase.js.
 * Debe incluirse DESPUÉS de supabase.js en cada página, porque depende
 * del cliente global `db` ya creado ahí:
 *
 *   <script src="supabase-client.js"></script>
 *   <script src="supabase.js"></script>
 *   <script src="nexo-inteligente.js"></script>
 *
 * No se tocó ningún archivo existente para construir esto — es la
 * decisión más segura mientras el sistema viejo (tabla plana
 * "propiedades") sigue funcionando en producción.
 */

// ══════════════════════════════════════════════════════════════
// Sesión anónima (para perfiles_busqueda, favoritos, alertas)
// ══════════════════════════════════════════════════════════════
const SesionAnonima = {
  _KEY: 'pinamar_sesion_id',
  obtener() {
    let id = localStorage.getItem(this._KEY);
    if (!id) {
      id = 'anon_' + crypto.randomUUID();
      localStorage.setItem(this._KEY, id);
    }
    return id;
  }
};

// ══════════════════════════════════════════════════════════════
// Nombres de las 10 tablas (usado en varios módulos de abajo)
// ══════════════════════════════════════════════════════════════
const TABLAS_PROPIEDADES = [
  'propiedades_lotes', 'propiedades_deptos', 'propiedades_casas',
  'propiedades_duplex_ph', 'propiedades_emprendimientos', 'propiedades_locales',
  'propiedades_oficinas', 'propiedades_amarras', 'propiedades_hoteles', 'propiedades_edificios'
];

// ══════════════════════════════════════════════════════════════
// Generador de slug (SEO) — titulo + zona + tipo, con sufijo
// corto para garantizar unicidad
// ══════════════════════════════════════════════════════════════
function generarSlug(titulo, zonaNombre) {
  const base = `${titulo} ${zonaNombre || ''}`
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
  const sufijo = crypto.randomUUID().slice(0, 6);
  return `${base}-${sufijo}`;
}

// ══════════════════════════════════════════════════════════════
// OpcionesConfigurables — lectura de listas por categoría
// ══════════════════════════════════════════════════════════════
const OpcionesConfigurables = {
  async porCategoria(categoria) {
    const { data, error } = await db.from('opciones_configurables')
      .select('*')
      .eq('categoria', categoria)
      .eq('activo', true)
      .order('orden');
    if (error) { console.error('OpcionesConfigurables.porCategoria', error); return []; }
    return data;
  }
};

// ══════════════════════════════════════════════════════════════
// Zonas
// ══════════════════════════════════════════════════════════════
const Zonas = {
  async listar() {
    const { data, error } = await db.from('zonas').select('*').eq('activo', true).order('nombre');
    if (error) { console.error('Zonas.listar', error); return []; }
    return data;
  },
  async porId(id) {
    const { data } = await db.from('zonas').select('*').eq('id', id).single();
    return data;
  }
};

// ══════════════════════════════════════════════════════════════
// BarriosCerrados
// ══════════════════════════════════════════════════════════════
const BarriosCerrados = {
  async porZona(zonaId) {
    const { data, error } = await db.from('barrios_cerrados')
      .select('*, barrio_cerrado_amenities(opcion_id)')
      .eq('zona_id', zonaId)
      .eq('activo', true);
    if (error) { console.error('BarriosCerrados.porZona', error); return []; }
    return data;
  }
};

// ══════════════════════════════════════════════════════════════
// PropiedadesNexo — CRUD genérico para cualquiera de las 10 tablas
// Uso: PropiedadesNexo.crear('propiedades_casas', {...})
// ══════════════════════════════════════════════════════════════
const PropiedadesNexo = {
  async crear(tabla, datos) {
    if (!TABLAS_PROPIEDADES.includes(tabla)) throw new Error(`Tabla inválida: ${tabla}`);
    if (!datos.slug) datos.slug = generarSlug(datos.titulo, datos._zonaNombre);
    delete datos._zonaNombre;
    const { data, error } = await db.from(tabla).insert(datos).select().single();
    return { data, error };
  },

  async obtenerPorSlug(tabla, slug) {
    if (!TABLAS_PROPIEDADES.includes(tabla)) throw new Error(`Tabla inválida: ${tabla}`);
    const { data, error } = await db.from(tabla).select('*').eq('slug', slug).single();
    return { data, error };
  },

  async actualizar(tabla, id, cambios) {
    if (!TABLAS_PROPIEDADES.includes(tabla)) throw new Error(`Tabla inválida: ${tabla}`);
    const { data, error } = await db.from(tabla).update(cambios).eq('id', id).select().single();
    return { data, error };
  },

  async eliminar(tabla, id) {
    if (!TABLAS_PROPIEDADES.includes(tabla)) throw new Error(`Tabla inválida: ${tabla}`);
    return db.from(tabla).delete().eq('id', id);
  },

  /**
   * Listado unificado (todas las tablas) desde la vista v10.
   * filtros soporta: zona_id, tipo (tabla_origen), operacion, estado,
   * precio_min/precio_max (sobre columnas específicas si hiciera falta
   * ampliarlo — hoy la vista no expone precio directo, se agrega si
   * se necesita en el listado real).
   */
  async listarUnificado(filtros = {}) {
    let q = db.from('v_propiedades_listado_v10').select('*');
    if (filtros.zona_id) q = q.eq('zona_id', filtros.zona_id);
    if (filtros.tabla_origen) q = q.eq('tabla_origen', filtros.tabla_origen);
    if (filtros.operacion) q = q.eq('operacion', filtros.operacion);
    q = q.eq('estado', filtros.estado || 'activa'); // por defecto solo activas
    const { data, error } = await q;
    if (error) { console.error('PropiedadesNexo.listarUnificado', error); return []; }
    return data;
  },

  /**
   * Filtro SQL determinístico previo a la IA (Sección 5/6 de la
   * arquitectura): acota el pool de candidatas ANTES de armar el
   * prompt, sin depender de una segunda llamada al modelo.
   */
  async filtrarParaIA(perfil) {
    let q = db.from('v_propiedades_listado_v10').select('*').eq('estado', 'activa');
    if (perfil?.uso === 'turismo') q = q.eq('operacion', 'alquiler_temporal');
    if (perfil?.zona_id) q = q.eq('zona_id', perfil.zona_id);
    // Nota: filtros adicionales (presupuesto, dormitorios, estado_dominial,
    // avance de obra) se completan cuando el listado público y el quiz
    // ya estén conectados de punta a punta con datos reales.
    const { data, error } = await q.limit(20);
    if (error) { console.error('PropiedadesNexo.filtrarParaIA', error); return []; }
    return data;
  }
};

// ══════════════════════════════════════════════════════════════
// PerfilBusqueda — captura del perfil de comprador (Hero + chat)
// ══════════════════════════════════════════════════════════════
const PerfilBusqueda = {
  /**
   * Se llama desde los 3 botones del Hero ("Invertir" / "Mi Refugio" /
   * "Turismo"). Inferencia silenciosa: un clic ya guarda el perfil.
   */
  async registrarDesdeHero(uso) {
    const usuario = await Auth.getUser().catch(() => null);
    const payload = {
      sesion_id: usuario ? null : SesionAnonima.obtener(),
      usuario_id: usuario ? usuario.id : null,
      uso
    };
    const { data, error } = await db.from('perfiles_busqueda').insert(payload).select().single();
    if (error) console.error('PerfilBusqueda.registrarDesdeHero', error);
    return { data, error };
  },

  /**
   * Se llama desde el chat de Pinamar AI (tool calling): la IA
   * infiere estos campos de la conversación natural del usuario.
   */
  async registrarDesdeChat(camposInferidos) {
    const usuario = await Auth.getUser().catch(() => null);
    const payload = {
      sesion_id: usuario ? null : SesionAnonima.obtener(),
      usuario_id: usuario ? usuario.id : null,
      ...camposInferidos
    };
    const { data, error } = await db.from('perfiles_busqueda').insert(payload).select().single();
    if (error) console.error('PerfilBusqueda.registrarDesdeChat', error);
    return { data, error };
  },

  async ultimoDeLaSesion() {
    const usuario = await Auth.getUser().catch(() => null);
    let q = db.from('perfiles_busqueda').select('*').order('created_at', { ascending: false }).limit(1);
    q = usuario ? q.eq('usuario_id', usuario.id) : q.eq('sesion_id', SesionAnonima.obtener());
    const { data } = await q.single();
    return data;
  }
};

// ══════════════════════════════════════════════════════════════
// Favoritos
// ══════════════════════════════════════════════════════════════
const FavoritosNexo = {
  async agregar(propiedadId, tablaOrigen) {
    const usuario = await Auth.getUser().catch(() => null);
    const payload = {
      sesion_id: usuario ? null : SesionAnonima.obtener(),
      usuario_id: usuario ? usuario.id : null,
      propiedad_id: propiedadId,
      tabla_origen: tablaOrigen
    };
    return db.from('favoritos').insert(payload);
  },

  async quitar(propiedadId, tablaOrigen) {
    const usuario = await Auth.getUser().catch(() => null);
    let q = db.from('favoritos').delete().eq('propiedad_id', propiedadId).eq('tabla_origen', tablaOrigen);
    q = usuario ? q.eq('usuario_id', usuario.id) : q.eq('sesion_id', SesionAnonima.obtener());
    return q;
  },

  async listarMios() {
    const usuario = await Auth.getUser().catch(() => null);
    if (!usuario) {
      // Solo el propio navegador puede ver sus favoritos anónimos
      // (no hay policy de lectura por sesion_id, se resuelve guardando
      // localmente los ids devueltos al agregar, o pidiendo registro).
      console.warn('Favoritos.listarMios: se requiere estar logueado para listar de forma persistente.');
      return [];
    }
    const { data, error } = await db.from('favoritos').select('*').eq('usuario_id', usuario.id);
    if (error) { console.error('Favoritos.listarMios', error); return []; }
    return data;
  }
};

// ══════════════════════════════════════════════════════════════
// AlertasBusqueda — estructura lista; el disparo real de emails
// depende de resolver Resend (pendiente ya conocido del proyecto)
// ══════════════════════════════════════════════════════════════
const AlertasBusqueda = {
  async crear({ email, criteriosFiltro, frecuencia = 'semanal' }) {
    const usuario = await Auth.getUser().catch(() => null);
    const payload = {
      sesion_id: usuario ? null : SesionAnonima.obtener(),
      usuario_id: usuario ? usuario.id : null,
      email,
      criterios_filtro: criteriosFiltro,
      frecuencia
    };
    const { data, error } = await db.from('alertas_busqueda').insert(payload).select().single();
    if (error) console.error('AlertasBusqueda.crear', error);
    return { data, error };
  },

  async listarMias() {
    const usuario = await Auth.getUser().catch(() => null);
    if (!usuario) return [];
    const { data, error } = await db.from('alertas_busqueda').select('*').eq('usuario_id', usuario.id);
    if (error) { console.error('AlertasBusqueda.listarMias', error); return []; }
    return data;
  },

  async pausar(id) {
    return db.from('alertas_busqueda').update({ activa: false }).eq('id', id);
  }
};

// ══════════════════════════════════════════════════════════════
// Permutas — publicar una propiedad en el pool, ofertar sobre un
// aviso puntual, y consultar el pool (regla de acceso vía RLS ya
// resuelta del lado de la base — acá solo se envuelve el llamado)
// ══════════════════════════════════════════════════════════════
const Permutas = {
  /**
   * Paso 1 del flujo: publicar la propiedad ofrecida. Requiere
   * usuario logueado (se valida también por RLS). tabla y datos
   * son los mismos que usa PropiedadesNexo.crear, con estado
   * forzado a 'oferta_permuta'.
   */
  async publicarPropiedadOfrecida(tabla, datos) {
    const usuario = await Auth.getUser();
    if (!usuario) return { data: null, error: 'Requiere estar registrado.' };
    datos.publicante_id = usuario.id;
    datos.estado = 'oferta_permuta';
    return PropiedadesNexo.crear(tabla, datos);
  },

  async agregarDatosOferta(propiedadId, tablaOrigen, { tieneCotizacionPrevia, montoUsd, inmobiliaria }) {
    return db.from('permuta_datos_oferta').insert({
      propiedad_id: propiedadId,
      tabla_origen: tablaOrigen,
      tiene_cotizacion_previa: tieneCotizacionPrevia,
      cotizacion_previa_monto_usd: montoUsd || null,
      cotizacion_previa_inmobiliaria: inmobiliaria || null
    });
  },

  /**
   * Vincula la propiedad ofrecida con un destino (opcional) — si
   * propiedadDestinoId es null, la oferta "flota" en el pool general.
   */
  async crearOferta({ propiedadOfrecidaId, tablaOrigenOfrecida, propiedadDestinoId = null, tablaOrigenDestino = null, tipologiaId = null }) {
    const usuario = await Auth.getUser();
    if (!usuario) return { data: null, error: 'Requiere estar registrado.' };
    const { data, error } = await db.from('permuta_ofertas').insert({
      usuario_id: usuario.id,
      propiedad_ofrecida_id: propiedadOfrecidaId,
      tabla_origen_ofrecida: tablaOrigenOfrecida,
      propiedad_destino_id: propiedadDestinoId,
      tabla_origen_destino: tablaOrigenDestino,
      tipologia_id: tipologiaId
    }).select().single();
    if (error) console.error('Permutas.crearOferta', error);
    return { data, error };
  },

  /** Ofertas que YO hice */
  async misOfertas() {
    const usuario = await Auth.getUser();
    if (!usuario) return [];
    const { data, error } = await db.from('permuta_ofertas').select('*').eq('usuario_id', usuario.id);
    if (error) { console.error('Permutas.misOfertas', error); return []; }
    return data;
  },

  /** Ofertas dirigidas a MIS avisos (requiere ser el publicante del destino) */
  async ofertasRecibidas() {
    const usuario = await Auth.getUser();
    if (!usuario) return [];
    const { data, error } = await db.from('permuta_ofertas')
      .select('*')
      .not('propiedad_destino_id', 'is', null);
    // El filtro real de "es mi propiedad" ya lo aplica la policy RLS
    // "permuta_ofertas_select_destinatario" del lado del servidor.
    if (error) { console.error('Permutas.ofertasRecibidas', error); return []; }
    return data;
  },

  /**
   * El pool general — solo devuelve resultados si el usuario cumple
   * la condición de tener una propiedad activa (RLS lo garantiza;
   * si no cumple, la consulta devuelve vacío, no error).
   */
  async verPool() {
    const { data, error } = await db.from('permuta_ofertas')
      .select('*')
      .is('propiedad_destino_id', null);
    if (error) { console.error('Permutas.verPool', error); return []; }
    return data;
  }
};

// ══════════════════════════════════════════════════════════════
// Export implícito: todos los objetos de arriba quedan disponibles
// como globales (mismo patrón que Auth/Propiedades en supabase.js).
// ══════════════════════════════════════════════════════════════
