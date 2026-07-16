// Pinamar Propiedades — carga del sprite de iconos de marca
// Inyecta /icons-marca.svg (oculto) al principio del <body> para que
// cualquier <svg class="icono"><use href="#icono-x"/></svg> en la página
// pueda referenciarlo. Se necesita este paso porque <use> entre archivos
// distintos no funciona de forma confiable en todos los navegadores;
// inyectando el sprite en el propio documento, sí.
//
// Uso: agregar <script src="/icons-marca.js"></script> justo antes de
// </body> (o al principio, si los iconos se usan en el <head> visualmente
// poco probable) en cualquier página que use la clase "icono".
(function () {
  fetch('/icons-marca.svg')
    .then(function (r) { return r.text(); })
    .then(function (svg) {
      var div = document.createElement('div');
      div.setAttribute('aria-hidden', 'true');
      div.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      div.innerHTML = svg;
      document.body.insertBefore(div, document.body.firstChild);
    })
    .catch(function (e) { console.warn('icons-marca: no se pudo cargar el sprite', e); });
})();
