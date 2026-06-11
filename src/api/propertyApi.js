
const BASE = import.meta.env.VITE_API_URL;
const json = (r) => r.json();

export const propertyApi = {
  getAll: () => fetch(`${BASE}/properties`).then(json),
  getAvailable: () => fetch(`${BASE}/properties/available`).then(json),
  getById: (id) => fetch(`${BASE}/properties/${id}`).then(json),
  getByLandlord: (id) => fetch(`${BASE}/properties/landlord/${id}`).then(json),
  getByCity: (city) => fetch(`${BASE}/properties/city/${encodeURIComponent(city)}`).then(json),

  create: (data) =>
    fetch(`${BASE}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  update: (id, data) =>
    fetch(`${BASE}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  delete: (id) => fetch(`${BASE}/properties/${id}`, { method: 'DELETE' }).then(json),

  addRule: (propertyId, description) =>
    fetch(`${BASE}/properties/${propertyId}/rules?description=${encodeURIComponent(description)}`, {
      method: 'POST',
    }).then(json),

  deleteRule: (ruleId) =>
    fetch(`${BASE}/properties/rules/${ruleId}`, { method: 'DELETE' }).then(json),

  uploadPhoto: (propertyId, file, isPrimary = false) => {
    const form = new FormData();
    form.append('file', file);
    return fetch(`${BASE}/properties/${propertyId}/photos?isPrimary=${isPrimary}`, {
      method: 'POST',
      body: form,
    }).then(json);
  },

  getPhotos: (propertyId) => fetch(`${BASE}/properties/${propertyId}/photos`).then(json),
  deletePhoto: (photoId) => fetch(`${BASE}/properties/photos/${photoId}`, { method: 'DELETE' }).then(json),
};
