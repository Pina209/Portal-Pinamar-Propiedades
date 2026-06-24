/**
 * nav.js — Pinamar Propiedades
 * CONFIG centralizado: WhatsApp, redes sociales, contacto institucional.
 *
 * Este archivo se incluye en casi todas las páginas del portal.
 * No debe contener HTML ni nada que no sea JavaScript válido —
 * un solo error de sintaxis acá puede afectar a cualquier script
 * que se cargue después de este en la misma página.
 */

window.CONFIG = {
  whatsapp: '5491122548913',          // formato internacional sin '+' ni espacios, listo para wa.me
  whatsappDisplay: '+54 911 2254 89313',
  email: 'info@pinamarpropiedades.com.ar',
  instagram: 'https://instagram.com/pinamarpropiedades',
  facebook: 'https://facebook.com/pinamarpropiedades',
  linkedin: '',
  sitioWeb: 'https://www.pinamarpropiedades.com.ar',
};

/**
 * Genera un link de WhatsApp con mensaje prearmado.
 * Uso: window.open(CONFIG.linkWhatsapp('Hola, quiero info sobre...'))
 */
window.CONFIG.linkWhatsapp = function (mensaje) {
  const base = `https://wa.me/${window.CONFIG.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
};
