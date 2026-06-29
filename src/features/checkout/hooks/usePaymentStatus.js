import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../../../api/paymentsApi';
import { PAID_STATUSES } from '../constants';
import { getPaymentStatusFromResponse } from '../utils/paymentStatus';

export const usePaymentStatus = (reservationId, sessionId) => {
  const queryClient = useQueryClient();
  const [confirmError, setConfirmError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    setConfirmError(null);
    paymentsApi.confirmSession(sessionId)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['payment-status', reservationId] });
      })
      .catch((err) => {
        setConfirmError(err?.message || 'No se pudo confirmar el pago con Stripe.');
      });
  }, [sessionId, reservationId, queryClient]);

  const statusQuery = useQuery({
    queryKey: ['payment-status', reservationId],
    queryFn: () => paymentsApi.getStatus(reservationId),
    enabled: !!reservationId,
    refetchInterval: (query) => {
      const status = getPaymentStatusFromResponse(query.state.data);
      if (status && PAID_STATUSES.includes(status)) {
        return false;
      }
      return 2000;
    },
  });

  return {
    ...statusQuery,
    confirmError,
  };
};
