import { apiFetch } from './httpClient';

export const paymentsApi = {
  createCheckout: (reservationId) =>
    apiFetch(`/payments/checkout/${reservationId}`, { method: 'POST' }),

  getStatus: (reservationId) =>
    apiFetch(`/payments/status/${reservationId}`),

  confirmSession: (sessionId) =>
    apiFetch(`/payments/confirm-session/${sessionId}`, { method: 'POST' }),
};
