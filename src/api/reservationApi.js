import { apiFetch } from './httpClient';

export const reservationApi = {
  book: (propertyId, data) =>
    apiFetch(`/reservations/${propertyId}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getCalendar: (propertyId, start, end) =>
    apiFetch(`/reservations/${propertyId}/calendar?start=${start}&end=${end}`),
};
