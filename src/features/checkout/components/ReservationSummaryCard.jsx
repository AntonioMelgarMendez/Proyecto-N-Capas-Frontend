import { MapPin, Building2 } from 'lucide-react';
import { formatShortDate } from '../../catalog/utils/booking';

const ReservationSummaryCard = ({ property, coverPhoto, checkIn, checkOut, duration, subtotal, cleaning, serviceFee, total, monthlyPrice }) => (
  <div className="lg:sticky lg:top-6 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
    <div className="relative aspect-[3/2] bg-slate-100 overflow-hidden">
      {coverPhoto ? (
        <img src={coverPhoto} alt={property?.title} className="absolute inset-0 w-full h-full object-cover object-center" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-slate-700">
          <Building2 className="h-12 w-12 text-accent/60" />
        </div>
      )}
    </div>

    <div className="p-5 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-primary">{property?.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {property?.city}, {property?.country}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-in</p>
          <p className="mt-1 text-sm font-semibold text-primary">{formatShortDate(checkIn)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-out</p>
          <p className="mt-1 text-sm font-semibold text-primary">{formatShortDate(checkOut)}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
        <div className="flex justify-between text-slate-500">
          <span>${monthlyPrice?.toLocaleString()} × {duration} mes{duration !== 1 ? 'es' : ''}</span>
          <span className="text-primary">${subtotal?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Limpieza</span>
          <span className="text-primary">${cleaning}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Tarifa de servicio</span>
          <span className="text-primary">${serviceFee?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-primary pt-2 border-t border-slate-100">
          <span>Total</span>
          <span className="text-accent">${total?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  </div>
);

export default ReservationSummaryCard;
