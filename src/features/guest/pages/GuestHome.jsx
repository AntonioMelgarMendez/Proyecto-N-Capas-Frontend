import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, Key, Wrench, ArrowRight, AlertTriangle } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { reservationApi } from '../../../api/reservationApi';
import { useStore } from '../../../store/useStore';
import { useTenantSidebar } from '../../checkout/hooks/useTenantSidebar';
import { useRentReminder } from '../hooks/useRentReminder';
import RentReminderToast from '../components/RentReminderToast';

const STATUS_LABELS = {
  CONFIRMED: { label: 'Confirmada', cls: 'bg-blue-100 text-blue-700' },
  CHECKED_IN: { label: 'En estancia', cls: 'bg-green-100 text-green-700' },
  PENDING_PAYMENT: { label: 'Pago pendiente', cls: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Completada', cls: 'bg-slate-100 text-slate-500' },
  CANCELLED: { label: 'Cancelada', cls: 'bg-red-100 text-red-500' },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const GuestHome = () => {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const tenantId = user?.id;
  const sidebar = useTenantSidebar();

  const { data: reservationsRaw, isLoading } = useQuery({
    queryKey: ['tenant-reservations', tenantId],
    queryFn: () => reservationApi.getTenantReservations(tenantId).then((r) => r.data ?? r ?? []),
    enabled: !!tenantId,
  });

  const allReservations = reservationsRaw ?? [];
  const reservations = allReservations.slice(0, 3);
  const { reminders } = useRentReminder(allReservations);

  const quickLinks = [
    { icon: Search,        label: 'Buscar propiedades', path: '/tenant/catalog' },
    { icon: Calendar,      label: 'Mis reservas',        path: '/tenant/reservations' },
    { icon: Key,           label: 'Mi llave digital',    path: '/tenant/key' },
    { icon: Wrench,        label: 'Mantenimiento',       path: '/tenant/maintenance' },
    { icon: AlertTriangle, label: 'Mis multas',          path: '/tenant/fines' },
  ];

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items.map((i) => ({ ...i, active: i.id === 'inicio' }))}
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
      />
      <main className={sidebar.mainClass(sidebar.isCollapsed)}>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            Bienvenido{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona tus reservas y accede a servicios rápidos.</p>
        </header>

        {/* Rent reminders */}
        <RentReminderToast reminders={reminders} />

        {/* Recent reservations */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-primary">Reservas recientes</h2>
            <button
              onClick={() => navigate('/tenant/reservations')}
              className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline"
            >
              Ver todas <ArrowRight size={12} />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : reservations.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-sm">No tienes reservas todavía.</p>
              <button
                onClick={() => navigate('/tenant/catalog')}
                className="mt-3 text-sm text-accent font-semibold hover:underline"
              >
                Explorar propiedades
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reservations.map((r) => {
                const { label, cls } = STATUS_LABELS[r.status] ?? { label: r.status, cls: 'bg-slate-100 text-slate-500' };
                return (
                  <button
                    key={r.id}
                    onClick={() => navigate('/tenant/reservations')}
                    className="bg-white border border-slate-100 rounded-2xl p-5 text-left hover:border-accent/40 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="font-semibold text-sm text-primary leading-tight line-clamp-1">{r.propertyTitle}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cls}`}>{label}</span>
                    </div>
                    <p className="text-xs text-slate-400">{r.propertyCity}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(r.checkInDate)} – {formatDate(r.checkOutDate)}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver detalle <ArrowRight size={12} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick links */}
        <section>
          <h2 className="text-base font-semibold text-primary mb-4">Accesos rápidos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center gap-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-accent hover:shadow-md transition-all"
              >
                <Icon size={22} className="text-primary" />
                <span className="text-xs font-semibold text-slate-600 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default GuestHome;
