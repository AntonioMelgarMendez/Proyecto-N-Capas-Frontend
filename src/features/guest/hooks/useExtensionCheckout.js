import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '../../../api/paymentsApi';

export const useExtensionCheckout = () =>
  useMutation({
    mutationFn: async (extensionRequestId) => {
      const response = await paymentsApi.createExtensionCheckout(extensionRequestId);
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
