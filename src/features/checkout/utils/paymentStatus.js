export const getPaymentStatusFromResponse = (res) =>
  res?.data?.paymentStatus ?? res?.paymentStatus ?? res?.data?.status ?? res?.status;
