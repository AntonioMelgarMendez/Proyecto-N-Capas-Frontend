import { Calendar, MapPin, User, Check, X } from 'lucide-react';
import { getExtensionStatusLabel, getExtensionStatusClasses } from '../../guest/constants/extensionStatus';

const ExtensionRequestCard = ({
  request,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}) => {
  const isPending = request.status === 'PENDING';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getExtensionStatusClasses(request.status)}`}>
            {getExtensionStatusLabel(request.status)}
          </span>
          <h3 className="mt-2 text-lg font-bold text-primary">{request.propertyTitle}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {request.propertyCity}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">${Number(request.quotedAmount).toLocaleString()}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Monto cotizado</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span><strong className="text-primary">Inquilino:</strong> {request.tenantName}</span>
        </p>
        <p><strong className="text-primary">Reserva:</strong> R-{request.reservationId}</p>
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span><strong className="text-primary">Check-out actual:</strong> {new Date(request.currentCheckOutDate).toLocaleDateString()}</span>
        </p>
        <p><strong className="text-primary">Días extra:</strong> {request.extraDays}</p>
        <p className="sm:col-span-2 text-xs text-slate-400">
          Solicitud #{request.id} · {new Date(request.requestedAt).toLocaleString('es-ES')}
        </p>
      </div>

      {isPending && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onApprove(request.id)}
            disabled={isApproving || isRejecting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {isApproving ? 'Aprobando...' : 'Aprobar'}
          </button>
          <button
            type="button"
            onClick={() => onReject(request.id)}
            disabled={isApproving || isRejecting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            {isRejecting ? 'Rechazando...' : 'Rechazar'}
          </button>
        </div>
      )}

      {request.status === 'APPROVED' && (
        <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
          Aprobada. Esperando que el inquilino complete el pago en Stripe.
        </p>
      )}
    </div>
  );
};

export default ExtensionRequestCard;
