import { MapPin, CalendarCheck2, FileText, Key, Calendar, XCircle } from 'lucide-react';
import IconButton from '../../../components/ui/IconButton';

const TenantReservationCard = ({
  res,
  isPinVisible,
  onTogglePin,
  onExtend,
  onCancel,
  onDownloadContract,
}) => {
  const getStatusLabelAndColors = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'CHECKED_IN':
        return { label: 'Activo', bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', dot: 'bg-emerald-500' };
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return { label: 'Pendiente', bg: 'bg-amber-50 text-amber-600 border border-amber-100', dot: 'bg-amber-500' };
      case 'COMPLETED':
        return { label: 'Finalizada', bg: 'bg-slate-50 text-slate-600 border border-slate-100', dot: 'bg-slate-500' };
      case 'CANCELLED':
        return { label: 'Cancelada', bg: 'bg-rose-50 text-rose-600 border border-rose-100', dot: 'bg-rose-500' };
      default:
        return { label: status, bg: 'bg-slate-50 text-slate-600 border border-slate-100', dot: 'bg-slate-500' };
    }
  };

  const calculateMonths = (inDate, outDate) => {
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const months = (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth();
    return Math.max(1, months);
  };

  const statusMeta = getStatusLabelAndColors(res.status);
  const months = calculateMonths(res.checkInDate, res.checkOutDate);
  const monthlyAvg = Math.round(res.totalAmount / months);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
      {/* Image Area */}
      <div className="relative h-48 md:h-full w-full bg-slate-100 min-h-[160px]">
        <img
          src={res.propertyCoverPhoto || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
          alt={res.propertyTitle}
          className="w-full h-full object-cover"
        />
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm ${statusMeta.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
          {statusMeta.label}
        </span>
      </div>

      {/* Information and Actions */}
      <div className="p-6 flex flex-col justify-between gap-4">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          {/* Info details */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">R-{res.id}</span>
            <h2 className="text-xl font-extrabold text-[#091124] tracking-tight">{res.propertyTitle}</h2>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{res.propertyCity}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-medium text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <CalendarCheck2 className="h-3.5 w-3.5 text-slate-400" />
                Check-in: <strong className="text-slate-700">{new Date(res.checkInDate).toLocaleDateString()}</strong>
              </span>
              <span className="flex items-center gap-1">
                <CalendarCheck2 className="h-3.5 w-3.5 text-slate-400" />
                Check-out: <strong className="text-slate-700">{new Date(res.checkOutDate).toLocaleDateString()}</strong>
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Contrato: <strong className={res.contractStatus === 'Firmado' ? 'text-emerald-600' : 'text-amber-600'}>{res.contractStatus}</strong>
              </span>
              {res.status === 'CONFIRMED' && (
                <span className="flex items-center gap-1">
                  <Key className="h-3.5 w-3.5 text-slate-400" />
                  PIN: <strong className="text-slate-700 font-mono tracking-wider">{isPinVisible ? res.pin : '••••••'}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Price Area */}
          <div className="text-left lg:text-right shrink-0">
            <p className="text-2xl font-black text-[#091124]">${res.totalAmount.toLocaleString()}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              ${monthlyAvg.toLocaleString()} x {months} {months === 1 ? 'MES' : 'MESES'}
            </p>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Buttons Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {(res.status === 'CONFIRMED' || res.status === 'CHECKED_IN') && (
            <IconButton
              icon={Calendar}
              onClick={() => onExtend(res)}
              variant="primary"
              iconSize={14}
            >
              Extender estancia
            </IconButton>
          )}
          {(res.status === 'CONFIRMED' || res.status === 'PENDING' || res.status === 'PENDING_PAYMENT') && (
            <IconButton
              icon={XCircle}
              onClick={() => onCancel(res)}
              variant="danger-outline"
              iconSize={14}
            >
              Cancelar
            </IconButton>
          )}
          {res.status === 'CONFIRMED' && (
            <IconButton
              icon={Key}
              onClick={() => onTogglePin(res.id)}
              variant="outline"
              iconSize={14}
            >
              {isPinVisible ? 'Ocultar PIN' : 'Ver PIN'}
            </IconButton>
          )}
          <IconButton
            icon={FileText}
            onClick={() => onDownloadContract(res)}
            variant="ghost"
            iconSize={14}
          >
            Descargar contrato
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default TenantReservationCard;
