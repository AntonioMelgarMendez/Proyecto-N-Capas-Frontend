import { ImageIcon } from 'lucide-react';
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  STATUS_BADGE_CLASS,
  PRIORITY_BADGE_CLASS,
} from '../constants/ticketStatus';

const TicketCard = ({ ticket, mode = 'tenant', onStatusChange, updatingId }) => {
  const isLandlord = mode === 'landlord';
  const isUpdating = updatingId === ticket.id;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-primary truncate">{ticket.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{ticket.propertyTitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_BADGE_CLASS[ticket.status] ?? ''}`}>
            {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${PRIORITY_BADGE_CLASS[ticket.priority] ?? ''}`}>
            {TICKET_PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
          </span>
        </div>
      </div>

      {ticket.description && (
        <p className="text-sm text-slate-600 leading-relaxed">{ticket.description}</p>
      )}

      {isLandlord && ticket.tenantName && (
        <p className="text-xs text-slate-500">Reportado por: {ticket.tenantName}</p>
      )}

      {ticket.photos?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ticket.photos.map((photo) => (
            <a
              key={photo.id}
              href={photo.photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-16 w-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
            >
              <img src={photo.photoUrl} alt="Evidencia" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}

      {(!ticket.photos || ticket.photos.length === 0) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ImageIcon className="h-3.5 w-3.5" />
          Sin fotos adjuntas
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <span className="text-[11px] text-slate-400">
          {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>

        {isLandlord && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && onStatusChange && (
          <div className="flex flex-wrap gap-2">
            {ticket.status === 'OPEN' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange(ticket.id, 'IN_PROGRESS')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                En progreso
              </button>
            )}
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onStatusChange(ticket.id, 'RESOLVED')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
            >
              Resuelto
            </button>
          </div>
        )}

        {isLandlord && ticket.status === 'RESOLVED' && onStatusChange && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onStatusChange(ticket.id, 'CLOSED')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            Cerrar ticket
          </button>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
