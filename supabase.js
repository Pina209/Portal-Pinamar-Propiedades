/**
 * supabase.js — Pinamar Propiedades
 * Cliente central de Supabase. Incluir en todas las páginas antes de cualquier otro script.
 *
 * CONFIGURAR:
 *   1. Reemplazá SUPABASE_URL y SUPABASE_ANON_KEY con los valores de tu proyecto
 *      Dashboard → Settings → API
 *   2. Subí este archivo junto a nav.js en la raíz del portal
 */

// ── Configuración ─────────────────────────────────────────────────────────
const SUPABASE_URL     = 'https://lyugffmltlvqirmmzhar.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_xeY8RDN-wYnxFHhEpGoeOw_qgZ8c3C_'
// ── Inicialización (usando CDN de Supabase JS v2) ─────────────────────────
// Requiere en el HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
const { createClient } = supabase;

// Exponer solo URL (no la key) para uso interno de páginas
// La anon key NO se expone al window — se usa solo dentro de este módulo
window._SUPABASE_URL = SUPABASE_URL;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helper ───────────────────────────────────────────────────────────
const Auth = {
  async getUser()    { const { data } = await db.auth.getUser(); return data.user },
  async getPerfil()  {
    const user = await Auth.getUser();
    if (!user) return null;
    const { data } = await db.from('perfiles').select('*').eq('id', user.id).single();
    return data;
  },
  async login(email, password) {
    return db.auth.signInWithPassword({ email, password });
  },
  async loginGoogle() {
    return db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/pinamar-propiedades-v2.html' } });
  },
  async registro(email, password, nombre) {
    return db.auth.signUp({ email, password, options: { data: { nombre } } });
  },
  async logout() {
    await db.auth.signOut();
    window.location.href = 'pinamar-propiedades-v2.html';
  },
  async onAuthChange(cb) {
    db.auth.onAuthStateChange((_event, session) => cb(session?.user ?? null));
  }
};

// ── Propiedades ───────────────────────────────────────────────────────────
const Propiedades = {

  /**
   * Listado con filtros desde query params o un objeto de filtros.
   * Devuelve { data, count, error }
   */
  async listar({
    zona, tipo, operacion, precio_min, precio_max,
    dist_max, ficha, kyc, permuta, cerrado, piscina, cochera,
    perfil_psico, orden = 'publicado_en', desc = true,
    page = 1, per_page = 12
  } = {}) {
    let q = db
      .from('v_propiedades_listado')
      .select('*', { count: 'exact' });

    if (zona)        q = q.eq('zona', zona);
    if (tipo)        q = q.eq('tipo', tipo);
    if (operacion)   q = q.eq('operacion', operacion);
    if (precio_min)  q = q.gte('precio_usd', precio_min);
    if (precio_max)  q = q.lte('precio_usd', precio_max);
    if (dist_max != null) q = q.lte('dist_mar_m', dist_max);
    if (ficha)       q = q.eq('tiene_ficha', true);
    if (kyc)         q = q.eq('tiene_kyc', true);
    if (permuta)     q = q.eq('permuta', true);
    if (cerrado)     q = q.eq('barrio_cerrado', true);
    if (piscina)     q = q.eq('piscina', true);
    if (cochera)     q = q.eq('cochera', true);
    if (perfil_psico) q = q.eq('perfil_psico', perfil_psico);

    const from = (page - 1) * per_page;
    q = q.order(orden, { ascending: !desc }).range(from, from + per_page - 1);

    return q;
  },

  /** Leer query params de la URL y convertirlos a objeto de filtros */
  filtrosDesdeURL() {
    const p = new URLSearchParams(location.search);
    const f = {};
    if (p.get('zona'))     f.zona      = p.get('zona');
    if (p.get('tipo'))     f.tipo      = p.get('tipo');
    if (p.get('operacion')) f.operacion = p.get('operacion');
    if (p.get('permuta'))  f.permuta   = true;
    if (p.get('ficha'))    f.ficha     = true;
    if (p.get('kyc'))      f.kyc       = true;
    if (p.get('cerrado'))  f.cerrado   = true;
    if (p.get('piscina'))  f.piscina   = true;
    if (p.get('cochera'))  f.cochera   = true;
    if (p.get('perfil_psico')) f.perfil_psico = p.get('perfil_psico');
    const precio = p.get('precio');
    if (precio && precio.includes('-')) {
      const [mn, mx] = precio.split('-').map(Number);
      f.precio_min = mn; f.precio_max = mx;
    }
    const dist = p.get('dist');
    if (dist && dist !== 'any') f.dist_max = parseInt(dist);
    return f;
  },

  /** Una propiedad por ID con joins completos */
  async getById(id) {
    return db
      .from('v_propiedades_listado')
      .select('*, prop_imagenes(*), fichas_tecnicas(*), kyc_verificaciones(*)')
      .eq('id', id)
      .single();
  },

  /** Stats por zona para perfiles y AI */
  async statsPorZona() {
    return db.from('v_stats_zona').select('*');
  },

  /** Propiedades destacadas para la homepage */
  async destacadas(limit = 6) {
    return db
      .from('v_propiedades_listado')
      .select('*')
      .eq('destacada', true)
      .order('publicado_en', { ascending: false })
      .limit(limit);
  },

  /** Propiedades similares (misma zona y tipo, distinto ID) */
  async similares(propiedad_id, zona, tipo, limit = 3) {
    return db
      .from('v_propiedades_listado')
      .select('*')
      .eq('zona', zona)
      .eq('tipo', tipo)
      .neq('id', propiedad_id)
      .limit(limit);
  },

  /** Crear propiedad nueva (requiere auth) */
  async crear(data) {
    const user = await Auth.getUser();
    if (!user) return { error: { message: 'No autenticado' } };
    return db.from('propiedades').insert({ ...data, publicante_id: user.id }).select().single();
  },

  /** Actualizar propiedad (solo el publicante o admin) */
  async actualizar(id, data) {
    return db.from('propiedades').update(data).eq('id', id).select().single();
  },

  /** Subir imagen a Storage y registrar en prop_imagenes */
  async subirImagen(propiedad_id, file, esPrincipal = false) {
    const ext  = file.name.split('.').pop();
    const path = `${propiedad_id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await db.storage.from('prop-imagenes').upload(path, file);
    if (uploadErr) return { error: uploadErr };
    const { data: { publicUrl } } = db.storage.from('prop-imagenes').getPublicUrl(path);
    return db.from('prop_imagenes').insert({
      propiedad_id, url: publicUrl, es_principal: esPrincipal
    });
  }
};

// ── Consultas / Leads ─────────────────────────────────────────────────────
const Consultas = {
  async crear({ propiedad_id, nombre, email, telefono, mensaje, canal = 'web' }) {
    return db.from('consultas').insert({
      propiedad_id, nombre, email, telefono, mensaje, canal,
      pagina_origen: location.pathname
    });
  },

  async misMensajes() {
    return db
      .from('consultas')
      .select('*, propiedades(titulo, zona, imagen_url:prop_imagenes(url))')
      .order('creado_en', { ascending: false });
  },

  async marcarVista(id) {
    return db.from('consultas').update({ estado: 'vista' }).eq('id', id);
  }
};

// ── Favoritos ─────────────────────────────────────────────────────────────
const Favoritos = {
  async agregar(propiedad_id) {
    const user = await Auth.getUser();
    if (!user) { window.location.href = 'login-registro.html'; return; }
    return db.from('favoritos').upsert({ usuario_id: user.id, propiedad_id });
  },

  async quitar(propiedad_id) {
    const user = await Auth.getUser();
    if (!user) return;
    return db.from('favoritos')
      .delete()
      .eq('usuario_id', user.id)
      .eq('propiedad_id', propiedad_id);
  },

  async listar() {
    const user = await Auth.getUser();
    if (!user) return { data: [] };
    return db
      .from('favoritos')
      .select('propiedad_id, propiedades:v_propiedades_listado(*)')
      .eq('usuario_id', user.id);
  },

  async estuvoGuardado(propiedad_id) {
    const user = await Auth.getUser();
    if (!user) return false;
    const { data } = await db
      .from('favoritos')
      .select('propiedad_id')
      .eq('usuario_id', user.id)
      .eq('propiedad_id', propiedad_id)
      .maybeSingle();
    return !!data;
  }
};

// ── Proveedores ───────────────────────────────────────────────────────────
const Proveedores = {
  async registrar(formData) {
    // formData: objeto con los campos del formulario proveedores-certificados.html
    return db.from('proveedores').insert(formData);
  },

  async subirArchivo(proveedorId, file) {
    const path = `${proveedorId}/${file.name}`;
    const { error } = await db.storage.from('proveedores-docs').upload(path, file);
    if (error) return { error };
    return { path };
  }
};

// ── AI — guardar conversaciones ───────────────────────────────────────────
const AIConversaciones = {
  _sessionId: crypto.randomUUID(),

  async guardar(mensajes, props_mostradas = []) {
    const user = await Auth.getUser();
    return db.from('ai_conversaciones').upsert({
      session_id: this._sessionId,
      usuario_id: user?.id ?? null,
      mensajes,
      props_mostradas,
      actualizado_en: new Date().toISOString()
    }, { onConflict: 'session_id' });
  },

  /** Construir contexto de propiedades en tiempo real para el prompt del AI */
  async contextoParaAI(filtros = {}) {
    const { data: props } = await Propiedades.listar({ ...filtros, per_page: 50 });
    const { data: stats } = await Propiedades.statsPorZona();

    const propsStr = (props || []).map(p =>
      `[${p.id}] ${p.titulo} | ${p.zona} | USD ${p.precio_usd?.toLocaleString()} | ` +
      `${p.dist_mar_m}m al mar | Ficha: ${p.tiene_ficha ? 'SÍ' : 'NO'} | ` +
      `KYC: ${p.tiene_kyc ? 'SÍ' : 'NO'} | ` +
      `CAC: USD ${p.cac_estimado?.toLocaleString() ?? 0} | ` +
      `Permuta: ${p.permuta ? 'SÍ' : 'NO'}`
    ).join('\n');

    const statsStr = (stats || []).map(s =>
      `${s.zona}: ${s.total_props} props | precio prom USD ${s.precio_prom} | ` +
      `m² prom USD ${s.precio_m2_prom} | con ficha: ${s.props_con_ficha}`
    ).join('\n');

    return { propsStr, statsStr };
  }
};


// ── Barrios ───────────────────────────────────────────────────────────────
const Barrios = {

  /** Todos los barrios activos, opcionalmente filtrados por zona */
  async listar(zona = null) {
    let q = db.from('v_barrios').select('*').eq('activo', true).order('orden');
    if (zona) q = q.eq('zona', zona);
    return q;
  },

  /** Un barrio por slug */
  async getBySlug(slug) {
    return db.from('v_barrios').select('*').eq('slug', slug).single();
  },

  /** Un barrio por ID */
  async getById(id) {
    return db.from('v_barrios').select('*').eq('id', id).single();
  },

  /** Barrios destacados para mostrar en la homepage o perfiles */
  async destacados(limit = 6) {
    return db
      .from('v_barrios')
      .select('slug,nombre,zona,perfil_psico,precio_m2_lote_usd,total_propiedades,imagen_portada_url')
      .eq('activo', true)
      .eq('destacado', true)
      .order('orden')
      .limit(limit);
  },

  /** Imágenes de un barrio */
  async imagenes(barrio_id) {
    return db
      .from('barrio_imagenes')
      .select('*')
      .eq('barrio_id', barrio_id)
      .order('orden');
  },

  /** Crear o actualizar barrio (solo admin) */
  async guardar(data, id = null) {
    if (id) return db.from('barrios').update(data).eq('id', id).select().single();
    return db.from('barrios').insert(data).select().single();
  },

  /** Subir foto de barrio a Storage */
  async subirFoto(barrio_id, file, esPortada = false) {
    const ext  = file.name.split('.').pop();
    const path = `${barrio_id}/${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage.from('barrio-fotos').upload(path, file);
    if (upErr) return { error: upErr };
    const { data: { publicUrl } } = db.storage.from('barrio-fotos').getPublicUrl(path);
    return db.from('barrio_imagenes').insert({
      barrio_id, url: publicUrl, es_portada: esPortada
    });
  }
};

// ── Indicadores de zona ───────────────────────────────────────────────────
const IndicadoresZona = {

  /** Todos los indicadores */
  async listar() {
    return db.from('indicadores_zona').select('*').order('zona');
  },

  /** Indicador de una zona específica */
  async getByZona(zona) {
    return db.from('indicadores_zona').select('*').eq('zona', zona).single();
  },

  /** Actualizar indicadores de una zona (solo admin) */
  async actualizar(zona, data) {
    return db
      .from('indicadores_zona')
      .upsert({ zona, ...data, fecha_datos: new Date().toISOString().split('T')[0] },
               { onConflict: 'zona' });
  },

  /** Contexto completo para Pinamar AI (indicadores + stats) */
  async contextoAI() {
    const [{ data: ind }, { data: stats }] = await Promise.all([
      db.from('indicadores_zona').select('*'),
      db.from('v_stats_zona').select('*'),
    ]);
    return { indicadores: ind || [], stats: stats || [] };
  }
};

// ── Utilidades de UI ──────────────────────────────────────────────────────
const UI = {
  /** Renderizar una card de propiedad desde datos de Supabase */
  renderCard(p) {
    const badgeFicha  = p.tiene_ficha ? '<span class="badge b-f">📋 Ficha</span>' : '';
    const badgeKYC    = p.tiene_kyc   ? '<span class="badge b-kyc">🛡️ KYC</span>' : '';
    const badgePerm   = p.permuta     ? '<span class="badge b-p">🔄 Permuta</span>' : '';
    const badgeDest   = p.destacada   ? '<span class="badge b-n">⭐ Destacada</span>' : '';
    // Texto y mensaje WA según operación
  let textoBotonWA, mensajeWA;
  const nombreEnc = encodeURIComponent(p.titulo || 'la propiedad');
  const codEnc    = encodeURIComponent(p.codigo || '');
  if (p.operacion === 'alquiler_temp') {
    textoBotonWA = '💬 Consultar disponibilidad';
    mensajeWA    = `Hola! Consulto disponibilidad de ${nombreEnc} (${codEnc}) para alquiler temporal en Pinamar Propiedades. ¿Qué fechas tienen disponibles?`;
  } else if (p.operacion === 'alquiler') {
    textoBotonWA = '💬 Consultar condiciones';
    mensajeWA    = `Hola! Me interesa ${nombreEnc} (${codEnc}) en alquiler publicada en Pinamar Propiedades. ¿Podría darme información?`;
  } else if (p.operacion === 'permuta') {
    textoBotonWA = '💬 Hablar de permuta';
    mensajeWA    = `Hola! Vi ${nombreEnc} (${codEnc}) en Pinamar Propiedades y me interesa explorar una permuta.`;
  } else {
    textoBotonWA = '💬 WA';
    mensajeWA    = `Hola! Me interesa ${nombreEnc} (${codEnc}) publicada en Pinamar Propiedades.`;
  }
  const telLimpio = p.publicante_tel?.replace(/\D/g,'') || '';
  const urlWA     = telLimpio ? `https://wa.me/${telLimpio}?text=${encodeURIComponent(mensajeWA)}` : '#';

  const imgUrl = p.imagen_url || 'https://placehold.co/400x260/0D5B48/F2E9D7?text=Sin+foto';
  const isAboveFold = false; // las cards se cargan dinámicamente siempre = lazy
    const distLabel   = p.dist_mar_m === 0 ? 'Frente al mar'
                      : p.dist_mar_m <= 300 ? `${p.dist_mar_m}m del mar`
                      : p.dist_mar_m <= 1000 ? `${p.dist_mar_m}m del mar`
                      : `${(p.dist_mar_m/1000).toFixed(1)}km del mar`;

    return `
      <div class="pc"
        data-zona="${p.zona}" data-tipo="${p.tipo}" data-precio="${p.precio_usd}"
        data-dist="${p.dist_mar_m}" data-ficha="${p.tiene_ficha ? 1 : 0}"
        data-kyc="${p.tiene_kyc ? 1 : 0}" data-permuta="${p.permuta ? 1 : 0}"
        data-piscina="${p.piscina ? 1 : 0}" data-cochera="${p.cochera ? 1 : 0}"
        data-cerrado="${p.barrio_cerrado ? 1 : 0}"
        onclick="window.location.href='ficha-propiedad.html?id=${p.id}'">
        <div class="pc-img" data-lazy-src="${imgUrl}" style="background-color:var(--beige2)">
          <div class="pc-badges">
            <span class="badge b-v">${p.operacion === 'venta' ? 'Venta' : p.operacion === 'alquiler_temp' ? 'Alquiler temp.' : 'Alquiler'}</span>
            ${badgeFicha}${badgeKYC}${badgePerm}${badgeDest}
          </div>
        </div>
        <div class="pc-body">
          <div class="pc-zone">${p.zona.replace('-',' ').replace(/\b\w/g,l=>l.toUpperCase())} · ${distLabel}</div>
          <div class="pc-title">${p.titulo}</div>
          <div class="pc-features">
            ${p.ambientes ? `<span>🏠 ${p.ambientes} amb.</span>` : ''}
            ${p.sup_cubierta_m2 ? `<span>📐 ${p.sup_cubierta_m2}m²</span>` : ''}
            ${p.sup_terreno_m2 ? `<span>🌿 ${p.sup_terreno_m2}m² lote</span>` : ''}
            ${p.cochera ? '<span>🚗 Cochera</span>' : ''}
          </div>
          <div class="pc-foot">
            <div class="pc-price">USD ${p.precio_usd?.toLocaleString('es-AR')}</div>
            <div class="pc-actions">
              <a href="${urlWA}" target="_blank" rel="noopener" class="btn-wsp" onclick="event.stopPropagation()">${textoBotonWA}</a>
              <a href="comparador.html" class="btn-comp" onclick="event.stopPropagation()">⚖️</a>
              <a href="ficha-propiedad.html?id=${p.id}" class="btn-ver">Ver ficha</a>
            </div>
          </div>
        </div>
      </div>`;
  },

  /** Renderizar skeleton loader mientras cargan los datos */
  renderSkeletons(n = 6) {
    return Array(n).fill(`
      <div class="pc skeleton" style="pointer-events:none">
        <div class="pc-img" style="background:#e8dcc4;animation:shimmer 1.5s infinite"></div>
        <div class="pc-body" style="padding:16px">
          <div style="height:12px;background:#e8dcc4;border-radius:4px;width:60%;margin-bottom:10px;animation:shimmer 1.5s infinite"></div>
          <div style="height:18px;background:#e8dcc4;border-radius:4px;width:90%;margin-bottom:14px;animation:shimmer 1.5s infinite"></div>
          <div style="height:12px;background:#e8dcc4;border-radius:4px;width:75%;animation:shimmer 1.5s infinite"></div>
        </div>
      </div>`).join('');
  },

  /** Toast de notificación */
  toast(msg, tipo = 'ok') {
    let t = document.getElementById('sb-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'sb-toast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 22px;border-radius:24px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2);transition:opacity .4s;white-space:nowrap;font-family:Poppins,sans-serif';
      document.body.appendChild(t);
    }
    t.style.background = tipo === 'error' ? '#c53030' : tipo === 'warn' ? '#d69b2d' : '#0D5B48';
    t.style.color = '#fff';
    t.textContent = (tipo === 'ok' ? '✓ ' : tipo === 'error' ? '✕ ' : '⚠ ') + msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.style.opacity = '0', 3500);
  },

  /** Agregar CSS de shimmer si no existe */
  initShimmer() {
    if (document.getElementById('shimmer-css')) return;
    const s = document.createElement('style');
    s.id = 'shimmer-css';
    s.textContent = `@keyframes shimmer{0%{opacity:1}50%{opacity:.5}100%{opacity:1}}`;
    document.head.appendChild(s);
  }
};

// ── Inicializar al cargar ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  UI.initShimmer();
  // Lazy loading para imágenes de propiedades vía IntersectionObserver
  if ('IntersectionObserver' in window) {
    const imgObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const src = el.dataset.lazySrc;
          if (src) { el.style.backgroundImage = `url('${src}')`; el.removeAttribute('data-lazy-src'); }
          imgObs.unobserve(el);
        }
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('[data-lazy-src]').forEach(el => imgObs.observe(el));
  }

  // Mostrar nombre del usuario en el nav si hay sesión
  Auth.getUser().then(user => {
    if (!user) return;
    const navR = document.querySelector('.nav-r');
    if (!navR) return;
    // Reemplazar "Iniciar sesión" por el nombre del usuario + logout
    navR.querySelectorAll('a').forEach(a => {
      if (a.textContent.includes('Iniciar sesión') || a.href?.includes('login-registro')) {
        a.textContent = '👤 Mi cuenta';
        a.href = 'panel-inmobiliaria.html';
      }
    });
  });
});
