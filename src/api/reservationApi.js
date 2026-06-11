import { apiFetch } from './httpClient';

/**
 * @typedef {Object} TenantReservation
 * @property {number} id - ID de la reserva (R-id)
 * @property {number} propertyId - ID de la propiedad
 * @property {string} propertyTitle - Nombre de la propiedad
 * @property {string} propertyCity - Ciudad de la propiedad
 * @property {string|null} propertyCoverPhoto - URL de la foto de portada
 * @property {string} checkInDate - Fecha de entrada (YYYY-MM-DD)
 * @property {string} checkOutDate - Fecha de salida (YYYY-MM-DD)
 * @property {number} numberOfGuests - Cantidad de huéspedes
 * @property {number} totalAmount - Costo total de la reserva
 * @property {'PENDING'|'PENDING_PAYMENT'|'CONFIRMED'|'CHECKED_IN'|'COMPLETED'|'CANCELLED'} status - Estado de la reserva
 * @property {'Firmado'|'Pendiente'} contractStatus - Estado del contrato
 * @property {string} pin - PIN de cerradura digital
 */

/**
 * @typedef {Object} ExtensionQuote
 * @property {number} id
 * @property {number} extraDays
 * @property {number} pricePerNight
 * @property {number} baseAmount
 * @property {number} extensionFeePerNight
 * @property {number} extensionFeeTotal
 * @property {number} discountAmount
 * @property {number} surchargeAmount
 * @property {number} extensionSubtotal
 */

/**
 * @typedef {Object} CancellationQuote
 * @property {number} cancellationFee - Tarifa de retención
 * @property {number} refundAmount - Monto neto a reembolsar
 */

export const reservationApi = {
  /**
   * Realiza la creación de una reserva (Book)
   * @param {number} propertyId 
   * @param {Object} data 
   * @returns {Promise<any>}
   */
  book: (propertyId, data) =>
    apiFetch(`/reservations/${propertyId}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  /**
   * Obtiene el calendario de días ocupados de una propiedad
   * @param {number} propertyId 
   * @param {string} start 
   * @param {string} end 
   * @returns {Promise<string[]>}
   */
  getCalendar: (propertyId, start, end) =>
    apiFetch(`/reservations/${propertyId}/calendar?start=${start}&end=${end}`),

  /**
   * Obtiene una cotización dinámica de precio de reserva
   * @param {number} propertyId 
   * @param {Object} data 
   * @returns {Promise<any>}
   */
  quote: (propertyId, data) =>
    apiFetch(`/reservations/${propertyId}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  /**
   * Obtiene el listado de reservas asociadas a un inquilino
   * @param {number} tenantId 
   * @returns {Promise<{ data: TenantReservation[] }>}
   */
  getTenantReservations: (tenantId) =>
    apiFetch(`/reservations/tenant/${tenantId}`),

  /**
   * Obtiene una cotización para extender la estadía
   * @param {number} id - ID de la reserva
   * @param {number} extraDays 
   * @returns {Promise<{ data: ExtensionQuote }>}
   */
  extendQuote: (id, extraDays) =>
    apiFetch(`/reservations/${id}/extend/quote?extraDays=${extraDays}`, { method: 'POST' }),

  /**
   * Realiza el pago y confirmación de una extensión de estadía
   * @param {number} id - ID de la reserva
   * @param {number} extraDays 
   * @returns {Promise<any>}
   */
  extendPay: (id, extraDays) =>
    apiFetch(`/reservations/${id}/extend/pay?extraDays=${extraDays}`, { method: 'POST' }),

  /**
   * Obtiene una cotización detallada de la política de reembolso por cancelación
   * @param {number} id - ID de la reserva
   * @returns {Promise<{ data: CancellationQuote }>}
   */
  cancelQuote: (id) =>
    apiFetch(`/reservations/${id}/cancel/quote`, { method: 'POST' }),

  /**
   * Confirma la cancelación definitiva de una reserva
   * @param {number} id - ID de la reserva
   * @returns {Promise<any>}
   */
  cancelConfirm: (id) =>
    apiFetch(`/reservations/${id}/cancel/confirm`, { method: 'POST' }),
};
