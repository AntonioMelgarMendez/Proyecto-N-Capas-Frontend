import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldX, User, FileText } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { adminApi } from '../../../api/adminApi';
import { useAdminSidebar } from '../hooks/useAdminSidebar';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AdminKyc = () => {
  const sidebar = useAdminSidebar();

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data ?? []),
  });

  const tenants = (usersRes ?? []).filter((u) => u.roleName === 'INQUILINO');
  const verified = tenants.filter((u) => u.verified);
  const pending = tenants.filter((u) => !u.verified);

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items}
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
      />
      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <div className="w-full max-w-5xl mx-auto">

          <div className="mb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Administración</span>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary">
              Verificación <span className="font-serif italic font-normal text-accent">KYC</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">Estado de verificación de identidad de los inquilinos.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="rounded-xl p-3 bg-green-500">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Verificados</p>
                <p className="text-2xl font-bold text-primary">{verified.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="rounded-xl p-3 bg-amber-500">
                <ShieldX className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Sin verificar</p>
                <p className="text-2xl font-bold text-primary">{pending.length}</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No hay inquilinos registrados.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Inquilino</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500 hidden md:table-cell">Registro</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">KYC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tenants.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-primary">{user.fullName}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400 hidden md:table-cell">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4 text-center">
                        {user.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                            <ShieldCheck className="h-3 w-3" /> Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                            <FileText className="h-3 w-3" /> Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminKyc;
