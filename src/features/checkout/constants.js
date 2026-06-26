export const CHECKOUT_STEPS = ['Verificación KYC', 'Pago', 'Contrato', 'Confirmado'];

export const PAID_STATUSES = ['PAID', 'COMPLETED'];

export const KYC_DOCUMENT_TYPES = [
  { value: 'DUI', label: 'DUI' },
  { value: 'PASSPORT', label: 'Pasaporte' },
];

export const minKycExpiryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};
