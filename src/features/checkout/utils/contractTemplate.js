import { formatShortDate } from '../../catalog/utils/booking';

const formatLongDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatMoney = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
};

/**
 * Builds a default rental contract when the API does not provide content.
 * @param {Object} data
 * @returns {string}
 */
export const buildDefaultContractTemplate = (data = {}) => {
  const today = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const reservationId = data.reservationId ?? '—';
  const contractId = data.contractId;
  const propertyTitle = data.propertyTitle ?? 'Propiedad en arrendamiento';
  const location = [data.address, data.city, data.country].filter(Boolean).join(', ') || 'Ubicación registrada en la plataforma';
  const checkIn = formatLongDate(data.checkIn);
  const checkOut = formatLongDate(data.checkOut);
  const guests = data.numberOfGuests ?? 1;
  const subtotal = formatMoney(data.subtotal);
  const cleaning = formatMoney(data.cleaning);
  const serviceFee = formatMoney(data.serviceFee);
  const total = formatMoney(data.totalAmount);
  const signedAt = data.tenantSignatureDate
    ? new Date(data.tenantSignatureDate).toLocaleString('es-ES')
    : null;

  return `CONTRATO DE ARRENDAMIENTO TEMPORAL

Documento generado por RentPro — ${today}

${contractId ? `N.º de contrato: ${contractId}\n` : ''}N.º de reserva: ${reservationId}

────────────────────────────────────────

I. PARTES

ARRENDADOR: Propietario registrado en RentPro, representado a través de la plataforma.
ARRENDATARIO: Inquilino verificado (KYC) con reserva activa N.º ${reservationId}.

II. OBJETO

El ARRENDADOR cede en arrendamiento temporal al ARRENDATARIO el inmueble:

  • Denominación: ${propertyTitle}
  • Ubicación: ${location}

El uso será exclusivamente RESIDENCIAL durante el periodo pactado.

III. VIGENCIA

  • Fecha de entrada (check-in): ${checkIn}
  • Fecha de salida (check-out): ${checkOut}
  • Huéspedes autorizados: ${guests}

IV. CONTRAPRESTACIÓN ECONÓMICA

El ARRENDATARIO se obliga a pagar las siguientes cantidades por el periodo contratado:

  • Subtotal de estadía: ${subtotal}
  • Tarifa de limpieza: ${cleaning}
  • Tarifa de servicio: ${serviceFee}
  • TOTAL PAGADO: ${total}

El pago fue procesado mediante pasarela segura (Stripe) previo a la firma de este contrato.

V. OBLIGACIONES DEL ARRENDATARIO

1. Mantener el inmueble en buen estado de conservación.
2. Respetar las normas de convivencia y capacidad máxima de huéspedes.
3. No subarrendar ni ceder el uso sin autorización expresa.
4. Comunicar daños o incidencias a través de la plataforma.

VI. FIRMA DIGITAL

${signedAt
    ? `El ARRENDATARIO firmó electrónicamente este contrato el ${signedAt}.`
    : 'El ARRENDATARIO declara haber leído, comprendido y aceptado las cláusulas anteriores, y procederá a la firma digital para su formalización.'}

Este documento tiene validez como acuerdo de arrendamiento temporal gestionado por RentPro.

────────────────────────────────────────
RentPro · Contrato de arrendamiento temporal`;
};

export const resolveContractContent = (content, data) => {
  if (content?.trim()) return content.trim();
  return buildDefaultContractTemplate(data);
};
