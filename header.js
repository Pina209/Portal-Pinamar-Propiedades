/* header.js — Header compartido de Pinamar Propiedades
   Uso: <script src="header.js"></script> justo después de <body>.
   En el home: <script src="header.js" data-home></script> (oculta el botón "Volver").
   Para cambiar el menú en TODO el sitio, se edita solo este archivo. */
(function () {
  var script = document.currentScript;
  var isHome = script && script.hasAttribute('data-home');
  var isCarilo = script && script.hasAttribute('data-carilo');

  var css = '\
.pp-hdr{position:sticky;top:0;z-index:1000;height:68px;background:#0D5B48;box-shadow:0 2px 14px rgba(0,0,0,.12);font-family:"Poppins",sans-serif}\
.pp-hdr *{box-sizing:border-box}\
.pp-row{max-width:1320px;height:100%;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:20px}\
.pp-back{display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);color:#fff;font:600 12px "Poppins",sans-serif;padding:7px 12px;border-radius:8px;cursor:pointer;white-space:nowrap}\
.pp-back:hover{background:rgba(255,255,255,.22)}\
.pp-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;flex-shrink:0}\
.pp-logo svg{width:36px;height:36px}\
.pp-logo-t{display:flex;flex-direction:column;line-height:1.05}\
.pp-logo-t b{font-size:14px;font-weight:800;letter-spacing:.04em}\
.pp-logo-t span{font-size:9.5px;font-weight:500;opacity:.75;letter-spacing:.14em}\
.pp-menu{display:flex;align-items:center;gap:20px;list-style:none;margin:0 0 0 auto;padding:0}\
.pp-menu>li{position:relative;height:68px;display:flex;align-items:center}\
.pp-menu>li>a{color:#fff;text-decoration:none;font-size:13px;font-weight:600;opacity:.93;display:flex;align-items:center;gap:4px;white-space:nowrap}\
.pp-menu>li>a:hover{opacity:1}\
.pp-menu a.pp-quienes{color:#D69B2D;opacity:1}\
.pp-menu a.pp-ai{color:#8fe3da;opacity:1}\
.pp-dd{position:absolute;top:100%;left:-12px;background:#fff;border-radius:12px;min-width:270px;box-shadow:0 18px 40px rgba(0,0,0,.2);padding:8px;display:none;flex-direction:column;gap:2px}\
.pp-menu>li:hover .pp-dd,.pp-menu>li:focus-within .pp-dd{display:flex}\
.pp-dd a{color:#1c2b26;text-decoration:none;font-size:13px;font-weight:500;padding:10px 12px;border-radius:8px}\
.pp-dd a:hover{background:#F2E9D7}\
.pp-cta{display:flex;align-items:center;gap:10px;flex-shrink:0}\
.pp-login{border:1.5px solid rgba(255,255,255,.45);color:#fff;padding:8px 15px;border-radius:8px;font-size:12.5px;font-weight:600;text-decoration:none;white-space:nowrap}\
.pp-login:hover{background:rgba(255,255,255,.14)}\
.pp-pub{background:#D69B2D;color:#2b2007;padding:9px 16px;border-radius:8px;font-size:12.5px;font-weight:700;text-decoration:none;white-space:nowrap}\
.pp-pub:hover{background:#e3a937}\
.pp-sub{font-size:11px;font-weight:800;letter-spacing:.1em;color:#8fe3da;line-height:1.1;border-left:1px solid rgba(255,255,255,.3);padding-left:12px;white-space:nowrap}\
.pp-sub em{font-style:normal;font-size:9px;font-weight:500;opacity:.8;letter-spacing:.16em}\
.pp-burger{display:none;margin-left:auto;background:none;border:1.5px solid rgba(255,255,255,.45);color:#fff;border-radius:8px;width:40px;height:36px;font-size:18px;cursor:pointer}\
@media (max-width:1100px){\
 .pp-burger{display:block}\
 .pp-menu,.pp-cta{display:none}\
 .pp-hdr.pp-open{height:auto;min-height:68px}\
 .pp-hdr.pp-open .pp-row{flex-wrap:wrap;height:auto;padding-bottom:16px}\
 .pp-hdr.pp-open .pp-menu{display:flex;flex-direction:column;align-items:flex-start;gap:0;width:100%;margin:8px 0 0}\
 .pp-hdr.pp-open .pp-menu>li{height:auto;flex-direction:column;align-items:flex-start;width:100%;padding:8px 0;border-top:1px solid rgba(255,255,255,.12)}\
 .pp-hdr.pp-open .pp-dd{position:static;display:flex;background:transparent;box-shadow:none;padding:4px 0 0 10px;min-width:0}\
 .pp-hdr.pp-open .pp-dd a{color:#fff;opacity:.85;padding:6px 8px}\
 .pp-hdr.pp-open .pp-cta{display:flex;width:100%}\
}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var logo = '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
    '<circle cx="60" cy="52" r="46" fill="#F2E9D7" opacity=".9"/>' +
    '<circle cx="35" cy="28" r="7" fill="#D69B2D"/>' +
    '<ellipse cx="38" cy="64" rx="16" ry="10" fill="#D69B2D" opacity=".85"/>' +
    '<polygon points="60,14 68,32 64,32 72,48 66,48 74,64 46,64 54,48 48,48 56,32 52,32" fill="#0D5B48"/>' +
    '<path d="M18 72 Q28 62 38 72 Q48 82 58 72 Q68 62 78 72 Q88 82 102 72 L102 92 L18 92 Z" fill="#16A39C"/></svg>';

  var html = '<div class="pp-hdr" id="pp-hdr" role="banner"><div class="pp-row">' +
    (isHome ? '' : '<button type="button" class="pp-back" id="pp-back" aria-label="Volver a la página anterior">← Volver</button>') +
    '<a class="pp-logo" href="pinamar-propiedades-v2.html">' + logo +
      '<span class="pp-logo-t"><b>PINAMAR</b><span>PROPIEDADES</span></span></a>' +
    (isCarilo ? '<span class="pp-sub">CARILÓ<br><em>PROPIEDADES</em></span>' : '') +
    '<button type="button" class="pp-burger" id="pp-burger" aria-label="Abrir menú">☰</button>' +
    '<ul class="pp-menu">' +
      '<li><a class="pp-quienes" href="quienes-somos.html">Quiénes Somos</a></li>' +
      '<li><a href="listado-propiedades.html">Propiedades ▾</a><div class="pp-dd">' +
        '<a href="listado-propiedades.html">🔍 Buscador y mapa</a>' +
        '<a href="comparador.html">⚖️ Comparador</a>' +
        '<a href="servicios-portal.html#ficha">📋 Ficha técnica certificada</a>' +
        '<a href="calculadora-hipoteca.html">🏦 Calculadora hipotecaria</a>' +
        '<a href="servicios-portal.html">🛡️ Servicios del portal</a>' +
        '<a href="servicios-portal.html#certificacion">🏗️ Certificación técnica y presupuesto de obra</a>' +
      '</div></li>' +
      '<li><a href="pinamar-propiedades-v2.html#mercado">Panorama de Mercado ▾</a><div class="pp-dd">' +
        '<a href="pinamar-propiedades-v2.html#mercado">📊 Indicadores de mercado</a>' +
        '<a href="perfiles-zona.html">🧭 Análisis de zonas</a>' +
        '<a href="noticias.html">📑 Informes y relevamientos</a>' +
      '</div></li>' +
      '<li><a href="servicios.html">Servicios</a></li>' +
      '<li><a class="pp-ai" href="pinamar-ai.html">✨ Pinamar AI</a></li>' +
    '</ul>' +
    '<div class="pp-cta">' +
      '<a class="pp-login" href="login-registro.html?tab=login">Iniciar sesión</a>' +
      '<a class="pp-pub" href="login-registro.html?tab=registro&accion=publicar">+ Publicar</a>' +
    '</div>' +
  '</div></div>';

  script.insertAdjacentHTML('beforebegin', html);

  var hdr = document.getElementById('pp-hdr');
  var burger = document.getElementById('pp-burger');
  if (burger) burger.addEventListener('click', function () { hdr.classList.toggle('pp-open'); });

  var back = document.getElementById('pp-back');
  if (back) back.addEventListener('click', function () {
    var ref = document.referrer || '';
    if (window.history.length > 1 && ref.indexOf(location.host) !== -1) { window.history.back(); }
    else { location.href = 'pinamar-propiedades-v2.html'; }
  });
})();
