export const DURATIONS = [1, 3, 6, 12];

export const today = () => new Date().toISOString().split('T')[0];

export const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

export const diffDays = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));

export const calcBooking = ({ pricePerNight, checkIn, checkOut }) => {
  const nights = diffDays(checkIn, checkOut);
  const subtotal = Math.round(pricePerNight * nights);
  const cleaning = nights > 0 ? 75 : 0;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + cleaning + serviceFee;
  return { nights, subtotal, cleaning, serviceFee, total };
};

export const formatShortDate = (dateStr) => {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' });
};
