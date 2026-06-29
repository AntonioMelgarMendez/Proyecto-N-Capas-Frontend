import { apiFetch, getAuthHeaders } from './httpClient';

const BASE = import.meta.env.VITE_API_URL;

export const propertyApi = {
  getAll: () => apiFetch('/properties'),

  getAvailable: () => apiFetch('/properties/available'),

  getById: (id) => apiFetch(`/properties/${id}`),

  getByLandlord: (id) => apiFetch(`/properties/landlord/${id}`),

  getByCity: (city) => apiFetch(`/properties/city/${encodeURIComponent(city)}`),

  create: (data) =>
    apiFetch('/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiFetch(`/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  delete: (id) => apiFetch(`/properties/${id}`, { method: 'DELETE' }),

  addRule: (propertyId, description) =>
    apiFetch(`/properties/${propertyId}/rules?description=${encodeURIComponent(description)}`, {
      method: 'POST',
    }),

  deleteRule: (ruleId) => apiFetch(`/properties/rules/${ruleId}`, { method: 'DELETE' }),

  /**
   * Multipart upload — does NOT set Content-Type so the browser adds the boundary.
   * Auth header injected manually via getAuthHeaders().
   */
  uploadPhoto: async (propertyId, file, isPrimary = false) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/properties/${propertyId}/photos?isPrimary=${isPrimary}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: form,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      try {
        const json = JSON.parse(body);
        throw new Error(json.message || json.error || body || res.statusText);
      } catch (err) {
        if (err instanceof Error && err.message !== body) throw err;
        throw new Error(body || res.statusText);
      }
    }
    if (res.status === 204) return null;
    return res.json();
  },

  getPhotos: (propertyId) => apiFetch(`/properties/${propertyId}/photos`),

  deletePhoto: (photoId) => apiFetch(`/properties/photos/${photoId}`, { method: 'DELETE' }),
};
