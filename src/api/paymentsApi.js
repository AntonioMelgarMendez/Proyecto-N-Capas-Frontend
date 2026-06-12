import { apiFetch } from './httpClient';

export const paymentsApi = {
  createCheckout: (reservationId) =>
    apiFetch(`/payments/checkout/${reservationId}`, { method: 'POST' }),

  createExtensionCheckout: (extensionRequestId) =>
    apiFetch(`/payments/checkout/extension/${extensionRequestId}`, { method: 'POST' }),

  cancelCheckout: (reservationId) =>
    apiFetch(`/payments/cancel/${reservationId}`, { method: 'POST' }),

  refundDeposit: (reservationId, amount) => {
    const query = amount != null ? `?amount=${amount}` : '';
    return apiFetch(`/payments/refund/${reservationId}${query}`, { method: 'POST' });
  },

  getStatus: (reservationId) =>
    apiFetch(`/payments/status/${reservationId}`),

  confirmSession: (sessionId) =>
    apiFetch(`/payments/confirm-session/${sessionId}`, { method: 'POST' }),
};
