import { apiFetch } from './httpClient';

export const fineApi = {
  /** GET /api/fines/me — fines del usuario autenticado */
  getMyFines: () => apiFetch('/fines/me'),

  /** GET /api/fines — todas las multas (ADMIN | ARRENDADOR) */
  getAllFines: () => apiFetch('/fines'),

  /**
   * POST /api/fines — crear multa (ADMIN | ARRENDADOR)
   * @param {{ userId, infractionType, amount, description, infractionDate? }} data
   */
  createFine: (data) =>
    apiFetch('/fines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  /** PATCH /api/fines/{id}/status — actualizar estado (ADMIN | ARRENDADOR) */
  updateStatus: (fineId, status) =>
    apiFetch(`/fines/${fineId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fineStatus: status }),
    }),
};
