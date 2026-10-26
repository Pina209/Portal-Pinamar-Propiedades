/**
 * nav.js — Pinamar Propiedades
 * CONFIG centralizado: teléfono, email y redes sociales.
 * Para cambiar un dato de contacto en TODO el sitio, se edita solo acá.
 *
 * No debe contener HTML ni nada que no sea JavaScript válido.
 */

window.CONFIG = {
  whatsapp: '',                          // sin celular asignado todavía. Cuando haya uno: '549XXXXXXXXXX' (formato internacional sin '+')
  telefono: '542254489313',              // teléfono fijo (Pinamar), formato internacional sin '+'
  telefonoDisplay: '+54 2254 48-9313',
  email: 'pinamarpropiedades.ar@gmail.com',
  instagram: '',                         // completar cuando estén creadas las cuentas (URL completa)
  facebook: '',
  linkedin: '',
  sitioWeb: 'https://www.pinamarpropiedades.com.ar',
};

/**
 * Link de contacto con mensaje prearmado.
 * Si hay WhatsApp configurado usa wa.me; si no, abre un email con el mensaje.
 * Uso: window.open(CONFIG.linkWhatsapp('Hola, quiero info sobre...'))
 */
window.CONFIG.linkWhatsapp = function (mensaje) {
  if (window.CONFIG.whatsapp) {
    const base = `https://wa.me/${window.CONFIG.whatsapp}`;
    return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
  }
  return `mailto:${window.CONFIG.email}` + (mensaje ? `?subject=${encodeURIComponent('Consulta desde el portal')}&body=${encodeURIComponent(mensaje)}` : '');
};
