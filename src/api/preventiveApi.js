import { apiFetch } from './httpClient';

export const preventiveApi = {
  getByLandlord: (landlordId) =>
    apiFetch(`/preventive-tasks/landlord/${landlordId}`),

  create: (data) =>
    apiFetch('/preventive-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateStatus: (id, status) =>
    apiFetch(`/preventive-tasks/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    }),

  delete: (id) =>
    apiFetch(`/preventive-tasks/${id}`, { method: 'DELETE' }),
};
