/* footer.js — Footer compartido de Pinamar Propiedades
   Uso: <script src="footer.js"></script> justo antes de </body>.
   Para cambiar el footer en TODO el sitio, se edita solo este archivo. */
(function () {
  var script = document.currentScript;
  var WA = '5491122548913';
  var WA_TXT = '+54 9 11 2254-8913';
  if (window.CONFIG && window.CONFIG.whatsapp) { WA = String(window.CONFIG.whatsapp); }

  var css = '\
.pp-ft{background:#0a4535;font-family:"Poppins",sans-serif;color:#fff}\
.pp-ft *{box-sizing:border-box}\
.pp-ft-main{padding:56px 40px 40px}\
.pp-ft-in{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:280px repeat(3,1fr);gap:40px}\
.pp-ft-tag{font-size:12px;color:rgba(255,255,255,.55);line-height:1.6;margin:0}\
.pp-ft-soc{display:flex;gap:8px;margin-top:16px}\
.pp-ft-soc a{font-size:18px;text-decoration:none;padding:6px;border-radius:8px;background:rgba(255,255,255,.08)}\
.pp-ft-soc a:hover{background:rgba(255,255,255,.16)}\
.pp-ft-t{font-size:11px;font-weight:700;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.12em;margin-bottom:12px}\
.pp-ft-l{display:block;font-size:12.5px;color:rgba(255,255,255,.7);text-decoration:none;margin-bottom:9px;line-height:1.4}\
.pp-ft-l:hover{color:#fff}\
.pp-ft-dest{color:#D69B2D!important;font-weight:600}\
.pp-ft-legal{background:rgba(0,0,0,.2);padding:16px 40px}\
.pp-ft-legal .pp-ft-in{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}\
.pp-ft-legal span,.pp-ft-legal a{font-size:11px;color:rgba(255,255,255,.45);text-decoration:none}\
.pp-ft-legal a:hover{color:#fff}\
@media(max-width:900px){.pp-ft-in{grid-template-columns:1fr 1fr;gap:28px}.pp-ft-brand{grid-column:1/-1}}\
@media(max-width:500px){.pp-ft-main,.pp-ft-legal{padding-left:16px;padding-right:16px}.pp-ft-in{grid-template-columns:1fr}}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var html = '<footer class="pp-ft"><div class="pp-ft-main"><div class="pp-ft-in">' +
    '<div class="pp-ft-brand">' +
      '<a href="pinamar-propiedades-v2.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;margin-bottom:14px">' +
        '<svg width="40" height="40" viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
        '<circle cx="60" cy="52" r="46" fill="#F2E9D7" opacity=".15"/><circle cx="35" cy="28" r="7" fill="#D69B2D"/>' +
        '<ellipse cx="38" cy="64" rx="16" ry="10" fill="#D69B2D" opacity=".85"/>' +
        '<polygon points="60,14 68,32 64,32 72,48 66,48 74,64 46,64 54,48 48,48 56,32 52,32" fill="#fff"/>' +
        '<path d="M18 72 Q28 62 38 72 Q48 82 58 72 Q68 62 78 72 Q88 82 102 72 L102 92 L18 92 Z" fill="#16A39C"/></svg>' +
        '<div><div style="font-size:16px;font-weight:800;color:#fff;letter-spacing:.06em">PINAMAR</div>' +
        '<div style="font-size:8px;color:rgba(255,255,255,.5);letter-spacing:.2em;text-transform:uppercase">PROPIEDADES</div></div></a>' +
      '<p class="pp-ft-tag">100% Pinamar. Ecosistema de inteligencia de datos y gestión de activos del Partido de Pinamar.</p>' +
      '<div class="pp-ft-soc">' +
        '<a href="https://instagram.com/pinamarpropiedades" target="_blank" rel="noopener" title="Instagram">📸</a>' +
        '<a href="https://wa.me/' + WA + '" target="_blank" rel="noopener" title="WhatsApp">💬</a>' +
        '<a href="mailto:info@pinamarpropiedades.com.ar" title="Email">✉️</a></div>' +
    '</div>' +
    '<div><div class="pp-ft-t">🏠 Portal</div>' +
      '<a href="quienes-somos.html" class="pp-ft-l">Quiénes somos</a>' +
      '<a href="listado-propiedades.html" class="pp-ft-l">Buscar propiedades</a>' +
      '<a href="comparador.html" class="pp-ft-l">Comparador</a>' +
      '<a href="servicios.html" class="pp-ft-l">Servicios · Gestión 360°</a>' +
      '<a href="pinamar-ai.html" class="pp-ft-l">✨ Pinamar AI</a></div>' +
    '<div><div class="pp-ft-t">📊 Mercado y herramientas</div>' +
      '<a href="perfiles-zona.html" class="pp-ft-l">Perfiles de zona</a>' +
      '<a href="noticias.html" class="pp-ft-l">Informes y relevamientos</a>' +
      '<a href="guia-invertir.html" class="pp-ft-l">Guía de inversión</a>' +
      '<a href="calculadora-hipoteca.html" class="pp-ft-l">Calculadora hipotecaria</a>' +
      '<a href="inmobiliarias.html" class="pp-ft-l">Inmobiliarias certificadas</a>' +
      '<a href="proveedores-certificados.html" class="pp-ft-l">Proveedores</a>' +
      '<a href="barrio.html" class="pp-ft-l">Barrios del Partido</a></div>' +
    '<div><div class="pp-ft-t">🔒 Mi cuenta</div>' +
      '<a href="login-registro.html?tab=login" class="pp-ft-l">Iniciar sesión</a>' +
      '<a href="login-registro.html?tab=registro" class="pp-ft-l">Registrarme</a>' +
      '<div class="pp-ft-t" style="margin-top:18px">📞 Contacto</div>' +
      '<a href="mailto:info@pinamarpropiedades.com.ar" class="pp-ft-l">info@pinamarpropiedades.com.ar</a>' +
      '<a href="https://wa.me/' + WA + '" target="_blank" rel="noopener" class="pp-ft-l">' + WA_TXT + '</a></div>' +
  '</div></div>' +
  '<div class="pp-ft-legal"><div class="pp-ft-in">' +
    '<span>© 2026 Pinamar Propiedades. Todos los derechos reservados.</span>' +
    '<span style="display:flex;gap:16px"><a href="terminos.html">Términos</a><a href="terminos.html#privacidad">Privacidad</a><a href="quienes-somos.html">Quiénes somos</a></span>' +
  '</div></div></footer>';

  script.insertAdjacentHTML('beforebegin', html);
})();
