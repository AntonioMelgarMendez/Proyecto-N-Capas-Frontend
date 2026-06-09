import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, House, Inbox, Wrench, Star, Plus } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import PropertyLandlordCard from '../components/PropertyLandlordCard';
import { propertyApi } from '../../../api/propertyApi';

// Temporal hasta que el módulo de auth esté listo
const MOCK_LANDLORD_ID = 1;

const SkeletonCard = () => (
  <div className="rounded-xl bg-white overflow-hidden border border-slate-100 animate-pulse">
    <div className="aspect-[16/10] bg-slate-100" />
    <div className="p-5 space-y-3">
      <div className="h-7 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
      <div className="flex gap-2 pt-1">
        <div className="flex-1 h-8 bg-slate-100 rounded-md" />
        <div className="w-20 h-8 bg-slate-100 rounded-md" />
        <div className="w-8 h-8 bg-slate-100 rounded-md" />
      </div>
    </div>
  </div>
);

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, title }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['properties', 'landlord', MOCK_LANDLORD_ID],
    queryFn: () => propertyApi.getByLandlord(MOCK_LANDLORD_ID).then((r) => r.data ?? []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => propertyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', 'landlord', MOCK_LANDLORD_ID] });
      setConfirmDelete(null);
    },
  });

  const properties  = data ?? [];
  const activeCount = properties.filter((p) => p.isAvailable).length;

  const handleDeleteRequest = (id, title) => setConfirmDelete({ id, title });
  const handleDeleteConfirm = () => deleteMutation.mutate(confirmDelete.id);

  const sidebarItems = [
    { id: 'dashboard',    label: 'Dashboard',         icon: LayoutGrid, action: () => navigate('/landlord') },
    { id: 'propiedades',  label: 'Mis Propiedades',   icon: House,      active: true, action: () => {} },
    { id: 'solicitudes',  label: 'Solicitudes',        icon: Inbox,      action: () => navigate('/landlord/requests') },
    { id: 'mantenimiento',label: 'Mantenimiento',      icon: Wrench,     action: () => navigate('/landlord/tickets') },
    { id: 'reviews',      label: 'Reseñas',            icon: Star,       action: () => navigate('/landlord/reviews') },
  ];

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebarItems}
        role="PROPIETARIO"
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      <main className={`transition-all duration-300 p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Catálogo</span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Mis <span className="font-serif italic font-normal text-accent">propiedades</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isLoading ? 'Cargando...' : `${properties.length} alojamiento${properties.length !== 1 ? 's' : ''} · ${activeCount} publicado${activeCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            to="/landlord/properties/new"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nueva propiedad
          </Link>
        </div>

        {/* Error */}
        {isError && (
          <div className="text-center py-24">
            <p className="text-base font-semibold text-slate-600">Error al cargar propiedades</p>
            <p className="text-sm text-slate-400 mt-1">Verifica que el backend esté corriendo</p>
            <button onClick={refetch} className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
              Reintentar
            </button>
          </div>
        )}

        {/* Skeleton */}
        {isLoading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && (
          properties.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-base font-semibold text-slate-600">No tienes propiedades aún</p>
              <p className="text-sm text-slate-400 mt-1">Crea tu primera propiedad para comenzar</p>
              <Link
                to="/landlord/properties/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nueva propiedad
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <PropertyLandlordCard
                  key={p.id}
                  property={p}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )
        )}
      </main>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-primary">¿Eliminar propiedad?</h3>
            <p className="text-sm text-slate-500 mt-2">
              Se eliminará <span className="font-semibold text-primary">"{confirmDelete.title}"</span> permanentemente. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 h-9 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;
