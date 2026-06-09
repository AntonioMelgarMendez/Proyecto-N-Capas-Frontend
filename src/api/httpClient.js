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

export const apiFetch = async (path, options = {}) => {
  const { allow404 = false, headers, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: getAuthHeaders(headers),
  });

  if (allow404 && res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(body || res.statusText, res.status);
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

  if (!res.ok) {
    throw new ApiError(res.statusText, res.status);
  }

  return res.blob();
};
