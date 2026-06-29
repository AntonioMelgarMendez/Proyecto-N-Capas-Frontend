import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '../../../api/paymentsApi';

export const useReservationCheckout = () =>
  useMutation({
    mutationFn: async (reservationId) => {
      const response = await paymentsApi.createCheckout(reservationId);
      const checkoutUrl = response?.data?.urlCheckout ?? response?.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error('No se recibió la URL de pago de Stripe.');
      }

      return checkoutUrl;
    },
    onSuccess: (checkoutUrl) => {
      window.location.href = checkoutUrl;
    },
  });
