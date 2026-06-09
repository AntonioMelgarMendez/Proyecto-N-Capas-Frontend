import { apiFetch, apiFetchBlob } from './httpClient';

export const identityApi = {
  getUser: (userId) =>
    apiFetch(`/identity/user/${userId}`, { allow404: true }),

  upload: ({ userId, file, documentType, documentNumber, expiryDate }) => {
    const form = new FormData();
    form.append('userId', String(userId));
    form.append('documentType', documentType);
    form.append('documentNumber', documentNumber);
    form.append('expiryDate', expiryDate);
    form.append('file', file);
    return apiFetch('/identity/upload', {
      method: 'POST',
      body: form,
    });
  },

  downloadBlob: (userId) => apiFetchBlob(`/identity/download/${userId}`),
};
