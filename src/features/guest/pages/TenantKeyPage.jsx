import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Key, Eye, EyeOff, MapPin, Calendar, Clock } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { reservationApi } from '../../../api/reservationApi';
import { useStore } from '../../../store/useStore';
import { useTenantSidebar } from '../../checkout/hooks/useTenantSidebar';

const ACTIVE_STATUSES = ['CONFIRMED', 'CHECKED_IN'];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-SV', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

const daysRemaining = (checkOutDate) => {
  if (!checkOutDate) return null;
  const diff = new Date(checkOutDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const StatusBadge = ({ status }) => {
  const map = {
    CONFIRMED: { label: 'Confirmada', cls: 'bg-blue-100 text-blue-700' },
    CHECKED_IN: { label: 'En estancia', cls: 'bg-green-100 text-green-700' },
    PENDING_PAYMENT: { label: 'Pago pendiente', cls: 'bg-amber-100 text-amber-700' },
    COMPLETED: { label: 'Completada', cls: 'bg-slate-100 text-slate-500' },
    CANCELLED: { label: 'Cancelada', cls: 'bg-red-100 text-red-500' },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
  );
};

const TenantKeyPage = () => {
  const tenantId = useStore((s) => s.user?.id);
  const sidebar = useTenantSidebar();
  const [visiblePins, setVisiblePins] = useState({});

  const { data: reservationsRaw, isLoading } = useQuery({
    queryKey: ['tenant-reservations', tenantId],
    queryFn: () => reservationApi.getTenantReservations(tenantId).then((r) => r.data ?? r ?? []),
    enabled: !!tenantId,
  });

  const reservations = reservationsRaw ?? [];
  const active = reservations.filter((r) => ACTIVE_STATUSES.includes(r.status));
  const others = reservations.filter((r) => !ACTIVE_STATUSES.includes(r.status));

  const togglePin = (id) =>
    setVisiblePins((prev) => ({ ...prev, [id]: !prev[id] }));

  const PinCard = ({ reservation }) => {
    const shown = visiblePins[reservation.id];
    const days = daysRemaining(reservation.checkOutDate);
    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50 font-semibold uppercase tracking-widest">PIN de acceso</p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-3xl font-mono font-bold tracking-[0.3em] ${shown ? 'text-accent' : 'text-white/20 select-none'}`}>
                {shown ? (reservation.pin ?? '——') : '● ● ● ●'}
              </span>
              <button
                type="button"
                onClick={() => togglePin(reservation.id)}
                className="text-white/50 hover:text-white transition-colors"
                aria-label={shown ? 'Ocultar PIN' : 'Mostrar PIN'}
              >
                {shown ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Key size={36} className="text-white/10" />
        </div>

        <div className="px-6 py-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-primary">{reservation.propertyTitle}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {reservation.propertyCity}
              </p>
            </div>
            <StatusBadge status={reservation.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Check-in</p>
              <p className="text-sm font-semibold text-primary mt-0.5">{formatDate(reservation.checkInDate)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Check-out</p>
              <p className="text-sm font-semibold text-primary mt-0.5">{formatDate(reservation.checkOutDate)}</p>
            </div>
          </div>

          {days !== null && reservation.status === 'CHECKED_IN' && (
            <div className="flex items-center gap-2 text-sm text-slate-500 pt-1">
              <Clock size={14} />
              <span>
                {days === 0 ? 'Último día de estancia' : `${days} día${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`}
              </span>
            </div>
          )}

          {shown && (
            <p className="text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
              Usa este PIN para acceder a la propiedad. No lo compartas con nadie ajeno a tu reserva.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items.map((i) => ({ ...i, active: i.id === 'llave' }))}
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
      />

      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Mi Llave</h1>
          <p className="text-slate-500 text-sm mt-1">PINs de acceso para tus reservas activas.</p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="rounded-2xl bg-white border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-24 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-14 bg-slate-100 rounded-xl" />
                    <div className="h-14 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : active.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {active.map((r) => <PinCard key={r.id} reservation={r} />)}
            </div>

            {others.length > 0 && (
              <>
                <h2 className="text-base font-semibold text-slate-500 mb-4">Reservas anteriores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {others.map((r) => (
                    <div key={r.id} className="bg-white border border-slate-100 rounded-xl px-5 py-4 flex items-center justify-between opacity-60">
                      <div>
                        <p className="font-medium text-sm text-primary">{r.propertyTitle}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} /> {formatDate(r.checkInDate)} – {formatDate(r.checkOutDate)}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Key size={28} className="text-slate-300" />
            </div>
            <div>
              <p className="font-semibold text-primary">Sin reservas activas</p>
              <p className="text-sm text-slate-400 mt-1">
                Tus PINs de acceso aparecerán aquí cuando tengas una reserva confirmada.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TenantKeyPage;
