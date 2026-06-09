import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, LayoutGrid, Calendar, Key, Wrench } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import PropertyCard from '../components/PropertyCard';
import { propertyApi } from '../../../api/propertyApi';

const MAX_PRICE = 5000;

const SkeletonCard = () => (
  <div className="rounded-2xl border bg-white overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-slate-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="flex gap-4">
        <div className="h-3 bg-slate-100 rounded w-16" />
        <div className="h-3 bg-slate-100 rounded w-16" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
      <div className="h-px bg-slate-100" />
      <div className="flex justify-between">
        <div className="h-6 bg-slate-100 rounded w-20" />
        <div className="h-4 bg-slate-100 rounded w-20" />
      </div>
    </div>
  </div>
);

const PropertyCatalog = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['properties', 'available'],
    queryFn: async () => {
      const res = await propertyApi.getAvailable();
      return res.data ?? [];
    },
  });

  const properties = data ?? [];

  const cities = useMemo(
    () => [...new Set(properties.map((p) => p.city))].filter(Boolean).sort(),
    [properties],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return properties.filter((p) => {
      const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q);
      const matchCity = !selectedCity || p.city === selectedCity;
      const matchPrice = parseFloat(p.pricePerNight) <= maxPrice;
      return matchSearch && matchCity && matchPrice;
    });
  }, [properties, search, selectedCity, maxPrice]);

  const hasActiveFilters = search || selectedCity || maxPrice < MAX_PRICE;

  const resetFilters = () => {
    setSearch('');
    setSelectedCity('');
    setMaxPrice(MAX_PRICE);
  };

  const sidebarItems = [
    { id: 'inicio', label: 'Inicio', icon: LayoutGrid, action: () => navigate('/guest') },
    { id: 'catalogo', label: 'Catálogo', icon: Search, active: true, action: () => {} },
    { id: 'reservas', label: 'Mis Reservas', icon: Calendar, action: () => navigate('/tenant/reservations') },
    { id: 'llave', label: 'Mi Llave', icon: Key, action: () => navigate('/tenant/key') },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench, action: () => navigate('/tenant/maintenance') },
  ];

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebarItems}
        role="INQUILINO"
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      <main className={`transition-all duration-300 p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
            Catálogo
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            Encuentra tu próximo{' '}
            <span className="font-serif italic font-normal text-accent">hogar</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading
              ? 'Cargando propiedades...'
              : `${filtered.length} de ${properties.length} propiedades disponibles.`}
          </p>
        </div>

        {/* Filter bar */}
        <div className="rounded-xl  bg-white p-4 md:p-5 mb-6 shadow-sm">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-[1fr_180px_240px_auto]">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por ciudad, nombre…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            {/* City select */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-9 px-3 rounded-md border border-slate-200 bg-transparent text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
            >
              <option value="">Todas las ciudades</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Price range */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-md border border-slate-200 px-3 py-2 sm:py-0 sm:h-9">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:whitespace-nowrap">
                ≤ ${maxPrice.toLocaleString()}
              </span>
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="flex-1 accent-primary cursor-pointer"
              />
            </div>

            {/* Reset */}
            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="h-9 px-4 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Limpiar
            </button>
          </div>
        </div>

        {/* Error state */}
        {isError && (
          <div className="text-center py-24">
            <p className="text-base font-semibold text-slate-600">No se pudo conectar al servidor</p>
            <p className="text-sm text-slate-400 mt-1">Asegúrate de que el backend esté corriendo en localhost:8080</p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Skeleton */}
        {isLoading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && (
          filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-base font-semibold text-slate-600">Sin resultados</p>
              <p className="text-sm text-slate-400 mt-1">
                {hasActiveFilters ? 'Intenta ajustar los filtros.' : 'No hay propiedades disponibles.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default PropertyCatalog;
