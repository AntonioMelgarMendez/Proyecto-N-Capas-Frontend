import { apiFetch } from './httpClient';

export const contractApi = {
  getByReservation: (reservationId) =>
    apiFetch(`/contracts/${reservationId}`, { allow404: true }),

  sign: (reservationId, data) =>
    apiFetch(`/contracts/sign/${reservationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};
