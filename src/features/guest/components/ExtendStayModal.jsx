import { Calendar } from 'lucide-react';
import { getExtensionStatusLabel } from '../constants/extensionStatus';

const ExtendStayModal = ({
  isOpen,
  onClose,
  reservation,
  extraDays,
  setExtraDays,
  quoteQuery,
  activeExtensionRequest,
  onSubmitRequest,
  isSubmittingRequest,
  payExtensionMutation,
}) => {
  if (!isOpen || !reservation) return null;

  const hasActiveRequest = !!activeExtensionRequest;
  const canSubmitRequest = !hasActiveRequest && !isSubmittingRequest;
  const canPay = activeExtensionRequest?.status === 'APPROVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#091124]">Extender estancia</h3>
            <p className="text-xs text-slate-400">Añade meses a tu contrato en {reservation.propertyTitle}</p>
          </div>
        </div>

        {hasActiveRequest && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-[#091124] mb-1">Solicitud #{activeExtensionRequest.id}</p>
            <p>Estado: {getExtensionStatusLabel(activeExtensionRequest.status)}</p>
            {activeExtensionRequest.status === 'PENDING' && (
              <p className="mt-2 text-slate-500">El arrendador debe aprobar antes de pagar.</p>
            )}
            {activeExtensionRequest.status === 'APPROVED' && (
              <p className="mt-2 text-slate-500">
                Monto aprobado: ${Number(activeExtensionRequest.quotedAmount).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {!canPay && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Duración extra (meses)</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((months) => (
                  <button
                    key={months}
                    type="button"
                    disabled={hasActiveRequest}
                    onClick={() => setExtraDays(months * 30)}
                    className={`py-2 rounded-xl text-xs font-bold border transition disabled:opacity-50 ${
                      extraDays === months * 30
                        ? 'border-accent bg-[#fdf6e8] text-[#091124]'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {months} {months === 1 ? 'Mes' : 'Meses'}
                  </button>
                ))}
              </div>
            </div>

            {quoteQuery.isLoading ? (
              <div className="text-center py-4 text-xs font-medium text-slate-400 animate-pulse">
                Calculando tarifa...
              </div>
            ) : quoteQuery.data && !hasActiveRequest ? (
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between font-medium text-slate-500">
                  <span>Precio base por noche</span>
                  <span>${quoteQuery.data.pricePerNight?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-500">
                  <span>Monto base ({extraDays} días)</span>
                  <span>${quoteQuery.data.baseAmount?.toLocaleString()}</span>
                </div>
                {quoteQuery.data.extensionFeeTotal > 0 && (
                  <div className="flex justify-between font-medium text-slate-500">
                    <span>Recargo de extensión</span>
                    <span>+${quoteQuery.data.extensionFeeTotal?.toLocaleString()}</span>
                  </div>
                )}
                {quoteQuery.data.discountAmount > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span>Descuento aplicado</span>
                    <span>-${quoteQuery.data.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
                {quoteQuery.data.surchargeAmount > 0 && (
                  <div className="flex justify-between font-semibold text-amber-600">
                    <span>Otros recargos</span>
                    <span>+${quoteQuery.data.surchargeAmount?.toLocaleString()}</span>
                  </div>
                )}
                <hr className="border-slate-200" />
                <div className="flex justify-between font-bold text-sm text-[#091124]">
                  <span>Total estimado</span>
                  <span>${quoteQuery.data.extensionSubtotal?.toLocaleString()}</span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Cerrar
          </button>

          {canPay ? (
            <button
              type="button"
              onClick={() => payExtensionMutation.mutate(activeExtensionRequest.id)}
              disabled={payExtensionMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-[#091124] text-white text-xs font-bold hover:bg-[#121f3d] transition disabled:opacity-50"
            >
              {payExtensionMutation.isPending ? 'Redirigiendo...' : 'Pagar extensión'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmitRequest}
              disabled={!canSubmitRequest || !quoteQuery.data || isSubmittingRequest}
              className="flex-1 py-2.5 rounded-xl bg-[#091124] text-white text-xs font-bold hover:bg-[#121f3d] transition disabled:opacity-50"
            >
              {isSubmittingRequest ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtendStayModal;
