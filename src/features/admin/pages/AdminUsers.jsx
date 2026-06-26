import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, ShieldCheck, User } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { adminApi } from '../../../api/adminApi';
import { useAdminSidebar } from '../hooks/useAdminSidebar';

const ROLE_COLORS = {
  ADMIN:      'bg-violet-100 text-violet-700',
  ARRENDADOR: 'bg-blue-100 text-blue-700',
  INQUILINO:  'bg-emerald-100 text-emerald-700',
};

const ROLE_LABELS = {
  ADMIN:      'Admin',
  ARRENDADOR: 'Arrendador',
  INQUILINO:  'Inquilino',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AdminUsers = () => {
  const sidebar = useAdminSidebar();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data ?? []),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.toggleUserStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const users = (usersRes ?? []).filter((u) => {
    const matchSearch =
      !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.roleName === roleFilter;
    return matchSearch && matchRole;
  });

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
              Gestión de <span className="font-serif italic font-normal text-accent">usuarios</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">Activa, desactiva o audita las cuentas registradas.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Admin</option>
              <option value="ARRENDADOR">Arrendador</option>
              <option value="INQUILINO">Inquilino</option>
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No se encontraron usuarios.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-widest">Usuario</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-widest">Rol</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-widest hidden md:table-cell">Registro</th>
                    <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-widest">Estado</th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-widest">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
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
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.roleName] ?? 'bg-slate-100 text-slate-600'}`}>
                          {user.roleName === 'ADMIN' && <ShieldCheck className="h-3 w-3" />}
                          {ROLE_LABELS[user.roleName] ?? user.roleName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 hidden md:table-cell">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => toggleMutation.mutate(user.id)}
                          disabled={toggleMutation.isPending || user.roleName === 'ADMIN'}
                          title={user.roleName === 'ADMIN' ? 'No se puede desactivar un admin' : undefined}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            user.active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {user.active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                          {user.active ? 'Desactivar' : 'Activar'}
                        </button>
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

export default AdminUsers;
