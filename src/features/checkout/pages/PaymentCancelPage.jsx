import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, XCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '../../../api/paymentsApi';

const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservationId');

  const cancelMutation = useMutation({
    mutationFn: () => paymentsApi.cancelCheckout(reservationId),
  });

  useEffect(() => {
    if (reservationId) {
      cancelMutation.mutate();
    }
  }, [reservationId]);

  const isDone = cancelMutation.isSuccess;
  const isError = cancelMutation.isError;
  const isPending = cancelMutation.isPending || (!isDone && !isError && !!reservationId);

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center shadow-sm">
        {isPending && (
          <>
            <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-primary mb-2">Cancelando checkout...</h1>
            <p className="text-sm text-slate-500">Liberando las fechas de tu reserva.</p>
          </>
        )}

        {isDone && (
          <>
            <XCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-primary mb-2">Pago cancelado</h1>
            <p className="text-sm text-slate-500 mb-6">
              El checkout fue cancelado y la reserva #{reservationId} ya no bloquea el calendario.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to="/tenant/catalog"
                className="inline-flex justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Volver al catálogo
              </Link>
              <Link
                to="/tenant/reservations"
                className="inline-flex justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-primary hover:bg-slate-50"
              >
                Ver mis reservas
              </Link>
            </div>
          </>
        )}

        {(!reservationId || isError) && !isPending && (
          <>
            <XCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-primary mb-2">No se pudo cancelar</h1>
            <p className="text-sm text-slate-500 mb-6">
              {reservationId ? 'Ocurrió un error al liberar la reserva.' : 'Falta el identificador de la reserva.'}
            </p>
            <Link
              to="/guest"
              className="inline-flex justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-primary hover:bg-slate-50"
            >
              Volver al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCancelPage;
