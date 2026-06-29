import { apiFetch } from './httpClient';

export const adminApi = {
  getStats: () => apiFetch('/admin/stats'),
  getUsers: () => apiFetch('/admin/users'),
  toggleUserStatus: (id) => apiFetch(`/admin/users/${id}/toggle-status`, { method: 'PATCH' }),
  getProperties: () => apiFetch('/admin/properties'),
  togglePropertyAvailability: (id) =>
    apiFetch(`/admin/properties/${id}/toggle-availability`, { method: 'PATCH' }),
};
