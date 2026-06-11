import { ShieldAlert, Info } from 'lucide-react';

const CancelReservationModal = ({
  isOpen,
  onClose,
  reservation,
  quoteQuery,
  confirmMutation,
}) => {
  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-rose-50 text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#091124]">Cancelar Reserva</h3>
            <p className="text-xs text-slate-400">Proceso de cancelación para R-{reservation.id}</p>
          </div>
        </div>

        {quoteQuery.isLoading ? (
          <div className="text-center py-4 text-xs font-medium text-slate-400 animate-pulse">
            Calculando política de cancelación...
          </div>
        ) : quoteQuery.data ? (
          <div className="space-y-4">
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-xs space-y-2 text-rose-700 leading-relaxed">
              <p className="font-semibold flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                Política de reembolso
              </p>
              <p>Monto de la reserva: <strong>${reservation.totalAmount.toLocaleString()}</strong></p>
              <p>Retención por política: <strong>${quoteQuery.data.penaltyFee?.toLocaleString() ?? '$0'}</strong></p>
              <p>Reembolso neto estimado: <strong className="text-emerald-700 font-bold">${quoteQuery.data.refundAmount?.toLocaleString() ?? '$0'}</strong></p>
            </div>
            <p className="text-xs text-slate-500 leading-normal">
              Al confirmar la cancelación, las fechas bloqueadas se liberarán inmediatamente. El reembolso se procesará a la misma tarjeta de crédito/débito.
            </p>
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Cerrar
          </button>
          <button
            onClick={() => confirmMutation.mutate()}
            disabled={confirmMutation.isPending || !quoteQuery.data}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition disabled:opacity-50"
          >
            {confirmMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelación'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReservationModal;
