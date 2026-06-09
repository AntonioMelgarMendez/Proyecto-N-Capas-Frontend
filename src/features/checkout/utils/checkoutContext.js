export const saveCheckoutContext = (reservationId, context) => {
  sessionStorage.setItem(`checkout:${reservationId}`, JSON.stringify(context));
};

export const loadCheckoutContext = (reservationId) => {
  try {
    const raw = sessionStorage.getItem(`checkout:${reservationId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
