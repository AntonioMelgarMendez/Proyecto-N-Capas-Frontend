import { apiFetch } from './httpClient';

/**
 * @typedef {Object} TenantReservation
 * @property {number} id
 * @property {number} propertyId
 * @property {string} propertyTitle
 * @property {string} propertyCity
 * @property {string|null} propertyCoverPhoto
 * @property {string} checkInDate
 * @property {string} checkOutDate
 * @property {number} numberOfGuests
 * @property {number} totalAmount
 * @property {string} status
 * @property {string} contractStatus
 * @property {string} pin
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
 * @typedef {Object} ExtensionRequest
 * @property {number} id
 * @property {number} reservationId
 * @property {number} extraDays
 * @property {number} quotedAmount
 * @property {string} status
 * @property {string} requestedAt
 * @property {string|null} resolvedAt
 * @property {number|null} resolvedById
 */

/**
 * @typedef {Object} ExtensionRequestLandlord
 * @property {number} id
 * @property {number} reservationId
 * @property {number} extraDays
 * @property {number} quotedAmount
 * @property {string} status
 * @property {string} requestedAt
 * @property {string|null} resolvedAt
 * @property {number|null} resolvedById
 * @property {string} propertyTitle
 * @property {string} propertyCity
 * @property {string} tenantName
 * @property {string} currentCheckOutDate
 */

/**
 * @typedef {Object} CancellationQuote
 * @property {number} reservationId
 * @property {number} originalPricePaid
 * @property {number} penaltyFee
 * @property {number} refundAmount
 */

export const reservationApi = {
  book: (propertyId, data) =>
    apiFetch(`/reservations/${propertyId}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getCalendar: (propertyId, start, end) =>
    apiFetch(`/reservations/${propertyId}/calendar?start=${start}&end=${end}`),

  quote: (propertyId, data) =>
    apiFetch(`/reservations/${propertyId}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getTenantReservations: (tenantId) =>
    apiFetch(`/reservations/tenant/${tenantId}`),

  getLandlordTenants: (landlordId) =>
    apiFetch(`/reservations/landlord/${landlordId}/tenants`),

  extendQuote: (id, extraDays) =>
    apiFetch(`/reservations/${id}/extend/quote?extraDays=${extraDays}`, { method: 'POST' }),

  extendRequest: (id, extraDays) =>
    apiFetch(`/reservations/${id}/extend/request?extraDays=${extraDays}`, { method: 'POST' }),

  getExtensionRequests: (reservationId) =>
    apiFetch(`/reservations/${reservationId}/extend/requests`),

  getLandlordExtensionRequests: (landlordId, status) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch(`/reservations/extend/landlord/${landlordId}${query}`);
  },

  approveExtension: (requestId, landlordId) =>
    apiFetch(`/reservations/extend/${requestId}/approve?landlordId=${landlordId}`, { method: 'POST' }),

  rejectExtension: (requestId, landlordId) =>
    apiFetch(`/reservations/extend/${requestId}/reject?landlordId=${landlordId}`, { method: 'POST' }),

  cancelQuote: (id) =>
    apiFetch(`/reservations/${id}/cancel/quote`, { method: 'POST' }),

  cancelConfirm: (id) =>
    apiFetch(`/reservations/${id}/cancel/confirm`, { method: 'POST' }),
};
