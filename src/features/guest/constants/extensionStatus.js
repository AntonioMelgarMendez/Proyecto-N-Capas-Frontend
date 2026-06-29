export const EXTENSION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'PAID', 'EXPIRED'];

export const ACTIVE_EXTENSION_STATUSES = ['PENDING', 'APPROVED'];

export const getExtensionStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return 'Pendiente de aprobación';
    case 'APPROVED':
      return 'Aprobada — pendiente de pago';
    case 'REJECTED':
      return 'Rechazada';
    case 'PAID':
      return 'Pagada';
    case 'EXPIRED':
      return 'Expirada';
    default:
      return status ?? 'Desconocido';
  }
};

export const getExtensionStatusClasses = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'APPROVED':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'PAID':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

export const getActiveExtensionRequest = (requests = []) =>
  requests.find((r) => ACTIVE_EXTENSION_STATUSES.includes(r.status)) ?? null;

export const getLatestExtensionRequest = (requests = []) => requests[0] ?? null;
