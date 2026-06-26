const BASE = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

/**
 * Parses a Spring Boot error response body.
 * Spring returns { timestamp, status, error, message, details } or validation errors.
 */
const parseErrorBody = (bodyText) => {
  if (!bodyText) return null;
  try {
    const json = JSON.parse(bodyText);
    return json.message || json.error || null;
  } catch {
    return bodyText;
  }
};

const PUBLIC_PATHS = ['/tenant/catalog', '/tenant/property'];

const handleUnauthorized = () => {
  const isPublicPage = PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));
  if (isPublicPage) return;
  localStorage.removeItem('token');
  localStorage.removeItem('rent-pro-auth');
  window.location.replace('/');
};

export const apiFetch = async (path, options = {}) => {
  const { allow404 = false, headers, ...rest } = options;

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: getAuthHeaders(headers),
  });

  if (res.status === 401) {
    const hasSession = !!localStorage.getItem('token');
    if (hasSession) {
      handleUnauthorized();
      throw new ApiError('Sesión expirada. Por favor inicia sesión de nuevo.', 401);
    }
    const bodyText = await res.text().catch(() => '');
    const message = parseErrorBody(bodyText) ?? 'Credenciales incorrectas.';
    throw new ApiError(message, 401);
  }

  if (allow404 && res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    const message = parseErrorBody(bodyText) ?? res.statusText;
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return res.json();
  }

  return res;
};

export const apiFetchBlob = async (path) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: getAuthHeaders(),
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError('Sesión expirada. Por favor inicia sesión de nuevo.', 401);
  }

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    const message = parseErrorBody(bodyText) ?? res.statusText;
    throw new ApiError(message, res.status);
  }

  return res.blob();
};
