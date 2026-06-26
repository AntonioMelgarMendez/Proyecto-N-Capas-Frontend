import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';

/**
 * Decodes JWT payload without signature verification.
 * Used only to read the expiration claim client-side.
 */
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const ROLE_FALLBACKS = {
  ADMIN: '/admin/dashboard',
  ARRENDADOR: '/landlord/properties',
  INQUILINO: '/tenant/catalog',
};

/**
 * Protects routes by authentication and optional role restriction.
 * Clears stale auth state if the token is expired.
 *
 * @param {{ allowedRoles?: string[] }} props
 */
const PrivateRoute = ({ allowedRoles }) => {
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const clearAuth = useStore((s) => s.clearAuth);

  if (!user || !token) {
    return <Navigate to="/" replace />;
  }

  if (isTokenExpired(token)) {
    clearAuth();
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_FALLBACKS[user.role] ?? '/'} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
