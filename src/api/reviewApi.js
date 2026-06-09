const BASE = import.meta.env.VITE_API_URL;
const json = (r) => r.json();

export const reviewApi = {
  create: (data) =>
    fetch(`${BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  getByProperty: (propertyId) => fetch(`${BASE}/reviews/property/${propertyId}`).then(json),
  getByUser:     (userId)     => fetch(`${BASE}/reviews/user/${userId}`).then(json),
};
