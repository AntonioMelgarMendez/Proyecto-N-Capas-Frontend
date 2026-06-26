import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, CalendarCheck, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { adminApi } from '../../../api/adminApi';
import { useAdminSidebar } from '../hooks/useAdminSidebar';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-start gap-4">
    <div className={`rounded-xl p-3 ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-primary">{value ?? '—'}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  </div>
);

const QuickLink = ({ label, description, path, navigate }) => (
  <button
    onClick={() => navigate(path)}
    className="group text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-accent hover:shadow-md transition-all"
  >
    <p className="font-semibold text-primary group-hover:text-accent transition-colors">{label}</p>
    <p className="mt-1 text-sm text-slate-400">{description}</p>
    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
      Ir <ArrowRight className="h-3 w-3" />
    </div>
  </button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const sidebar = useAdminSidebar();

  const { data: statsRes, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data ?? r),
  });

  const stats = statsRes ?? {};

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items}
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
      />
      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <div className="w-full max-w-6xl mx-auto">

          <div className="mb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Administración</span>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary">
              Panel <span className="font-serif italic font-normal text-accent">general</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">Visión global de la plataforma RentPro.</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              <StatCard
                icon={Users}
                label="Total usuarios"
                value={stats.totalUsers}
                sub={`${stats.activeUsers ?? 0} activos`}
                color="bg-blue-500"
              />
              <StatCard
                icon={Building2}
                label="Propiedades"
                value={stats.totalProperties}
                sub={`${stats.availableProperties ?? 0} disponibles`}
                color="bg-emerald-500"
              />
              <StatCard
                icon={CalendarCheck}
                label="Reservas totales"
                value={stats.totalReservations}
                color="bg-violet-500"
              />
              <StatCard
                icon={TrendingUp}
                label="Usuarios activos"
                value={stats.activeUsers}
                sub={`de ${stats.totalUsers ?? 0} registrados`}
                color="bg-amber-500"
              />
              <StatCard
                icon={ShieldCheck}
                label="Propiedades disponibles"
                value={stats.availableProperties}
                sub={`de ${stats.totalProperties ?? 0} totales`}
                color="bg-rose-500"
              />
            </div>
          )}

          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickLink
              label="Gestionar usuarios"
              description="Ver, activar o desactivar cuentas de usuarios."
              path="/admin/users"
              navigate={navigate}
            />
            <QuickLink
              label="Auditar propiedades"
              description="Revisar todas las propiedades y su disponibilidad."
              path="/admin/properties"
              navigate={navigate}
            />
            <QuickLink
              label="Verificación KYC"
              description="Revisar documentos de identidad pendientes."
              path="/admin/kyc"
              navigate={navigate}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
