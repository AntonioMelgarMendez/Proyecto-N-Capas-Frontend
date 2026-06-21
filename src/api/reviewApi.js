import { apiFetch } from './httpClient';

export const reviewApi = {
  create: (data) =>
    apiFetch('/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getByProperty: (propertyId) => apiFetch(`/reviews/property/${propertyId}`),
  getByUser: (userId) => apiFetch(`/reviews/user/${userId}`),
};
