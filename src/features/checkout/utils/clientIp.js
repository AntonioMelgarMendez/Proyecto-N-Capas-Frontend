export const fetchClientIp = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) return '127.0.0.1';
    const data = await res.json();
    return data.ip || '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
};
