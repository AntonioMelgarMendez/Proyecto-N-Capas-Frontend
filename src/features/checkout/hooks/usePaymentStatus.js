import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../../../api/paymentsApi';
import { PAID_STATUSES } from '../constants';
import { getPaymentStatusFromResponse } from '../utils/paymentStatus';

export const usePaymentStatus = (reservationId, sessionId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    paymentsApi.confirmSession(sessionId)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['payment-status', reservationId] });
      })
      .catch(() => {});
  }, [sessionId, reservationId, queryClient]);

  return useQuery({
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
};
