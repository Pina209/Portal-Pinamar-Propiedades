// api/sitemap.js — Pinamar Propiedades
// Genera sitemap.xml dinámicamente: páginas fijas + cada propiedad activa
// de las 10 tablas nuevas, con slug amigable.
//
// Se sirve en /sitemap.xml vía el rewrite en vercel.json.
// Corre como función serverless de Vercel (Node.js), no en el navegador.

const SUPABASE_URL = 'https://lyugffmltlvqirmmzhar.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xeY8RDN-wYnxFHhEpGoeOw_qgZ8c3C_';
const SITE_URL = 'https://portal-pinamar-propiedades.vercel.app';

const TABLAS_PROPIEDADES = [
  'propiedades_lotes', 'propiedades_deptos', 'propiedades_casas',
  'propiedades_duplex_ph', 'propiedades_emprendimientos', 'propiedades_locales',
  'propiedades_oficinas', 'propiedades_amarras', 'propiedades_hoteles', 'propiedades_edificios'
];

// Páginas fijas del portal (igual criterio que el sitemap.xml estático anterior)
const PAGINAS_FIJAS = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/listado-propiedades.html', changefreq: 'hourly', priority: '0.9' },
  { path: '/comparador.html', changefreq: 'daily', priority: '0.7' },
  { path: '/perfiles-zona.html', changefreq: 'weekly', priority: '0.8' },
  { path: '/zona-carilo.html', changefreq: 'weekly', priority: '0.8' },
  { path: '/quienes-somos.html', changefreq: 'monthly', priority: '0.5' },
  { path: '/pinamar-ai.html', changefreq: 'weekly', priority: '0.7' },
  { path: '/inmobiliarias.html', changefreq: 'weekly', priority: '0.6' },
  { path: '/noticias.html', changefreq: 'weekly', priority: '0.5' },
];

async function fetchTabla(tabla) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${tabla}?select=slug,updated_at&estado=eq.activa`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(`sitemap: error consultando ${tabla}`, e.message);
    return [];
  }
}

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = async function handler(req, res) {
  const urls = [];

  // 1) Páginas fijas
  for (const p of PAGINAS_FIJAS) {
    urls.push(
      `  <url>\n    <loc>${xmlEscape(SITE_URL + p.path)}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    );
  }

  // 2) Propiedades activas de las 10 tablas, en paralelo
  const resultados = await Promise.all(TABLAS_PROPIEDADES.map(fetchTabla));
  resultados.forEach((filas) => {
    filas.forEach((p) => {
      if (!p.slug) return;
      const lastmod = p.updated_at ? `\n    <lastmod>${xmlEscape(p.updated_at.slice(0, 10))}</lastmod>` : '';
      urls.push(
        `  <url>\n    <loc>${xmlEscape(SITE_URL + '/propiedad/' + p.slug)}</loc>${lastmod}\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`
      );
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.status(200).send(xml);
};
