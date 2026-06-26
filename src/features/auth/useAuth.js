import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useStore } from '../../store/useStore';

const ROLE_PATHS = {
  ADMIN: '/admin/dashboard',
  ARRENDADOR: '/landlord/properties',
  INQUILINO: '/tenant/catalog',
};

/**
 * Encapsulates login and logout logic.
 * After a successful login, stores the session and navigates to the role-based route.
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);
  const clearAuth = useStore((s) => s.clearAuth);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(email, password);
      const data = response?.data ?? response;

      setAuth(data);

      const path = ROLE_PATHS[data.role] ?? '/';
      navigate(path, { replace: true });
    } catch (err) {
      setError(err.message ?? 'Credenciales inválidas. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    navigate('/', { replace: true });
  };

  return { login, logout, isLoading, error };
};
