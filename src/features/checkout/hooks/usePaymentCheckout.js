import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '../../../api/paymentsApi';
import { saveCheckoutContext } from '../utils/checkoutContext';

export const usePaymentCheckout = () =>
  useMutation({
    mutationFn: async ({ reservationId, checkoutContext }) => {
      const response = await paymentsApi.createCheckout(reservationId);
      const checkoutUrl = response?.data?.urlCheckout ?? response?.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error('No se recibió la URL de pago de Stripe.');
      }

      return { reservationId, checkoutContext, checkoutUrl };
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
