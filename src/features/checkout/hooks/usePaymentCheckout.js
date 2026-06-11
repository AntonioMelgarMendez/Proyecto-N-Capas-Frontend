import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '../../../api/paymentsApi';
import { reservationApi } from '../../../api/reservationApi';
import { saveCheckoutContext } from '../utils/checkoutContext';
import { MOCK_TENANT_ID } from '../constants';

export const usePaymentCheckout = () =>
  useMutation({
    mutationFn: async ({ reservationId, checkoutContext }) => {
      let targetId = reservationId;

      if (reservationId === 'pending') {
        const resBook = await reservationApi.book(checkoutContext.propertyId, {
          propertyId: checkoutContext.propertyId,
          tenantId: MOCK_TENANT_ID,
          checkInDate: checkoutContext.checkIn,
          checkOutDate: checkoutContext.checkOut,
          numberOfGuests: checkoutContext.numberOfGuests,
          totalAmount: checkoutContext.totalAmount,
          includeCleaning: checkoutContext.includeCleaning,
          includeInsurance: checkoutContext.includeInsurance,
        });

        const booking = resBook?.data ?? resBook;
        if (!booking?.id) {
          throw new Error('No se pudo crear la reserva en el servidor.');
        }
        targetId = booking.id;

        saveCheckoutContext(targetId, {
          ...checkoutContext,
          id: targetId,
          status: booking.status,
        });
      }

      const response = await paymentsApi.createCheckout(targetId);
      const checkoutUrl = response?.data?.urlCheckout ?? response?.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error('No se recibió la URL de pago de Stripe.');
      }

      return { reservationId: targetId, checkoutContext, checkoutUrl };
    },
    onSuccess: ({ reservationId, checkoutContext, checkoutUrl }) => {
      if (checkoutContext && reservationId) {
        saveCheckoutContext(reservationId, {
          ...checkoutContext,
          paymentRedirected: true,
        });
      }

      window.location.href = checkoutUrl;
    },
  });
