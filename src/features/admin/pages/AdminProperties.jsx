import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, BedDouble, Bath, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { adminApi } from '../../../api/adminApi';
import { useAdminSidebar } from '../hooks/useAdminSidebar';

const AdminProperties = () => {
  const sidebar = useAdminSidebar();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState('');

  const { data: propsRes, isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => adminApi.getProperties().then((r) => r.data ?? []),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.togglePropertyAvailability(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-properties'] }),
  });

  const properties = (propsRes ?? []).filter((p) => {
    const matchSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.landlordName?.toLowerCase().includes(search.toLowerCase());
    const matchAvail =
      availFilter === ''
        ? true
        : availFilter === 'available'
        ? p.available
        : !p.available;
    return matchSearch && matchAvail;
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
              Auditoría de <span className="font-serif italic font-normal text-accent">propiedades</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">Revisa y controla la disponibilidad de todas las propiedades.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título, ciudad o arrendador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <select
              value={availFilter}
              onChange={(e) => setAvailFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
            >
              <option value="">Todas</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">No disponibles</option>
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No se encontraron propiedades.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
                    prop.available ? 'border-slate-100' : 'border-red-100 bg-red-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-primary truncate">{prop.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          prop.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {prop.available ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{prop.city}, {prop.country}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{prop.bedrooms} hab.</span>
                        <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{prop.bathrooms} baños</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />máx. {prop.maxGuests}</span>
                      </div>

                      <p className="text-xs text-slate-400">
                        Arrendador: <span className="font-medium text-slate-600">{prop.landlordName ?? '—'}</span>
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-primary">${prop.pricePerNight}</p>
                      <p className="text-xs text-slate-400">/ noche</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => toggleMutation.mutate(prop.id)}
                      disabled={toggleMutation.isPending}
                      className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                        prop.available
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {prop.available
                        ? <><ToggleLeft className="h-3.5 w-3.5" /> Deshabilitar</>
                        : <><ToggleRight className="h-3.5 w-3.5" /> Habilitar</>
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminProperties;
