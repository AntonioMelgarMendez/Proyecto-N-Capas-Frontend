import { useMemo } from 'react';

const ACTIVE_STATUSES = new Set(['CONFIRMED', 'CHECKED_IN', 'EXTENDED']);
const DAYS_BEFORE_CHECKIN_ALERT = 3;

/**
 * Derives rent reminders from the tenant's reservation list.
 * Returns up to 3 relevant notices: active stays, imminent check-ins, and upcoming check-outs.
 *
 * @param {Array} reservations - Raw reservation list from the API.
 * @returns {{ reminders: Array<{ type, title, message, reservationId }> }}
 */
export const useRentReminder = (reservations = []) => {
  const reminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = [];

    for (const r of reservations) {
      if (!r.status) continue;

      const checkIn  = new Date(r.checkInDate);
      const checkOut = new Date(r.checkOutDate);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);

      const daysToCheckIn  = Math.ceil((checkIn  - today) / 86_400_000);
      const daysToCheckOut = Math.ceil((checkOut - today) / 86_400_000);

      // Active stay — monthly cycle reminder
      if (ACTIVE_STATUSES.has(r.status) && today >= checkIn && today < checkOut) {
        const monthsElapsed = (today.getFullYear() - checkIn.getFullYear()) * 12
          + (today.getMonth() - checkIn.getMonth());
        const nextDue = new Date(checkIn);
        nextDue.setMonth(nextDue.getMonth() + monthsElapsed + 1);
        const daysToNextDue = Math.ceil((nextDue - today) / 86_400_000);

        if (daysToNextDue <= 5 && daysToNextDue >= 0) {
          result.push({
            type: 'payment',
            title: 'Recordatorio de pago',
            message: `Tu próximo pago de renta en "${r.propertyTitle}" vence en ${daysToNextDue} día${daysToNextDue !== 1 ? 's' : ''}.`,
            reservationId: r.id,
          });
        } else {
          result.push({
            type: 'active',
            title: 'Estancia activa',
            message: `Tienes una estancia activa en "${r.propertyTitle}" hasta el ${new Date(r.checkOutDate).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })}.`,
            reservationId: r.id,
          });
        }
      }

      // Upcoming check-in within alert window
      if (r.status === 'CONFIRMED' && daysToCheckIn >= 0 && daysToCheckIn <= DAYS_BEFORE_CHECKIN_ALERT) {
        result.push({
          type: 'checkin',
          title: daysToCheckIn === 0 ? 'Check-in hoy' : `Check-in en ${daysToCheckIn} día${daysToCheckIn !== 1 ? 's' : ''}`,
          message: `Tu check-in en "${r.propertyTitle}" es el ${checkIn.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })}.`,
          reservationId: r.id,
        });
      }

      // Check-out tomorrow
      if (ACTIVE_STATUSES.has(r.status) && daysToCheckOut === 1) {
        result.push({
          type: 'checkout',
          title: 'Check-out mañana',
          message: `Tu check-out en "${r.propertyTitle}" es mañana. Recuerda entregar las llaves.`,
          reservationId: r.id,
        });
      }
    }

    return result.slice(0, 3);
  }, [reservations]);

  return { reminders };
};
