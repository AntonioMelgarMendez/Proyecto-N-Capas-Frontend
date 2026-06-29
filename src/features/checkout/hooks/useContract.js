import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractApi } from '../../../api/contractApi';
import { fetchClientIp } from '../utils/clientIp';

const unwrap = (res) => res?.data ?? res;

export const useContract = (reservationId, enabled = true) => {
  const queryClient = useQueryClient();

  const contractQuery = useQuery({
    queryKey: ['contract', reservationId],
    queryFn: () => contractApi.getByReservation(reservationId),
    enabled: !!reservationId && enabled,
    retry: false,
  });

  const contract = contractQuery.data ? unwrap(contractQuery.data) : null;
  const needsSignature = contractQuery.isSuccess && contractQuery.data == null;

  const signMutation = useMutation({
    mutationFn: async (termsAccepted) => {
      const ipAddress = await fetchClientIp();
      return contractApi.sign(reservationId, { ipAddress, termsAccepted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', reservationId] });
    },
  });

  return {
    contractQuery,
    contract,
    needsSignature,
    signMutation,
    isLoading: contractQuery.isLoading,
  };
};
