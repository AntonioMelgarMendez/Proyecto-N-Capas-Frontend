import { apiFetch } from './httpClient';

export const authApi = {
  /**
   * POST /api/auth/login
   * Returns GeneralResponse<LoginResponseDTO> with token, userId, role, etc.
   */
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  /**
   * POST /api/auth/register
   * roleName: 'INQUILINO' | 'ARRENDADOR'
   */
  register: (fullname, email, password, phone, roleName = 'INQUILINO') =>
    apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, password, phone, roleName }),
    }),
};
