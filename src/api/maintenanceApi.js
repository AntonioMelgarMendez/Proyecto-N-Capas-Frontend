import { apiFetch, getAuthHeaders } from './httpClient';

const BASE = import.meta.env.VITE_API_URL;

export const maintenanceApi = {
  createTicket: (tenantId, body) =>
    apiFetch(`/maintenance/tickets?tenantId=${tenantId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  getByTenant: (tenantId, status) => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch(`/maintenance/tickets/tenant/${tenantId}${qs}`);
  },

  getByLandlord: (landlordId, status) => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch(`/maintenance/tickets/landlord/${landlordId}${qs}`);
  },

  updateStatus: (ticketId, status, landlordId) =>
    apiFetch(`/maintenance/tickets/${ticketId}/status?status=${status}&landlordId=${landlordId}`, {
      method: 'PUT',
    }),

  uploadPhoto: async (ticketId, file) => {
    const form = new FormData();
    form.append('photo', file);
    const res = await fetch(`${BASE}/maintenance/tickets/${ticketId}/photos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: form,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(body || res.statusText);
    }
    return res.json();
  },
};
