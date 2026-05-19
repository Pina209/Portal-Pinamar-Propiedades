/**
 * nav.js — Pinamar Propiedades
 * Navegación central del portal. Incluir en todas las páginas.
 */

const ROUTES = {
  home:         'pinamar-propiedades-v2.html',
  listado:      'listado-propiedades.html',
  ficha:        'ficha-propiedad.html',
  comparador:   'comparador.html',
  zonaCarilo:   'zona-carilo.html',
  perfiles:     'perfiles-zona.html',
  guia:         'guia-invertir.html',
  noticias:     'noticias.html',
  login:        'login-registro.html',
  panelInm:     'panel-inmobiliaria.html',
  panelAdmin:   'panel-admin.html',
  proveedores:  'proveedores-certificados.html',
  ai:           'pinamar-ai.html',
  barrio:       'barrio.html',
  index:        'index-portal.html',
};

function irAListado(tipo)   { window.location.href = ROUTES.listado + (tipo ? '?tipo=' + tipo : '') }
function irAZona(zona)      { window.location.href = ROUTES.listado + (zona ? '?zona=' + zona : '') }
function irAPerfil(perfil)  { window.location.href = ROUTES.perfiles + '#' + perfil }

// Scroll del navbar
(function(){
  const nb = document.getElementById('navbar') || document.querySelector('nav');
  if(!nb) return;
  const onScroll = () => nb.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Marcar link activo
(function(){
  const page = location.pathname.split('/').pop() || ROUTES.home;
  document.querySelectorAll('nav a[href]').forEach(a => {
    const href = a.getAttribute('href').split('?')[0].split('#')[0];
    if(href === page) a.classList.add('nav-active');
  });
})();

// Menú mobile
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-menu');
  if(toggle && menu){
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => menu.classList.remove('open'))
    );
  }
});
