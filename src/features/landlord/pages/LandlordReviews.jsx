import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { LayoutGrid, House, Inbox, Wrench, Star } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import ReviewCard from '../../catalog/components/ReviewCard';
import { propertyApi } from '../../../api/propertyApi';
import { reviewApi } from '../../../api/reviewApi';

const MOCK_LANDLORD_ID = 1;

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-right text-slate-500">{star}</span>
      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-5 text-right text-slate-400">{count}</span>
    </div>
  );
};

const LandlordReviews = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterPropId, setFilterPropId] = useState('all');

  /* ── Fetch properties ───────────────────────────────────── */
  const { data: propsData, isLoading: propsLoading } = useQuery({
    queryKey: ['properties', 'landlord', MOCK_LANDLORD_ID],
    queryFn: () => propertyApi.getByLandlord(MOCK_LANDLORD_ID).then((r) => r.data ?? []),
  });

  const properties = propsData ?? [];

  /* ── Fetch reviews for each property in parallel ────────── */
  const reviewQueries = useQueries({
    queries: properties.map((p) => ({
      queryKey: ['reviews', 'property', p.id],
      queryFn: () => reviewApi.getByProperty(p.id).then((r) => r.data ?? []),
    })),
  });

  /* ── Combine & attach property title ────────────────────── */
  const allReviews = reviewQueries.flatMap((q, i) =>
    (q.data ?? []).map((r) => ({
      ...r,
      propertyTitle: properties[i]?.title ?? '',
      propertyId: properties[i]?.id,
    }))
  );

  const filteredReviews =
    filterPropId === 'all'
      ? allReviews
      : allReviews.filter((r) => String(r.propertyId) === filterPropId);

  /* ── Stats ──────────────────────────────────────────────── */
  const total = allReviews.length;
  const avg =
    total > 0
      ? (allReviews.reduce((s, r) => s + parseFloat(r.rating ?? 0), 0) / total).toFixed(1)
      : null;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allReviews.filter((r) => Math.round(parseFloat(r.rating)) === star).length,
  }));

  const isLoading = propsLoading || reviewQueries.some((q) => q.isLoading);

  /* ── Sidebar ────────────────────────────────────────────── */
  const sidebarItems = [
    { id: 'dashboard',     label: 'Dashboard',       icon: LayoutGrid, action: () => navigate('/landlord') },
    { id: 'propiedades',   label: 'Mis Propiedades', icon: House,      action: () => navigate('/landlord/properties') },
    { id: 'solicitudes',   label: 'Solicitudes',     icon: Inbox,      action: () => navigate('/landlord/requests') },
    { id: 'mantenimiento', label: 'Mantenimiento',   icon: Wrench,     action: () => navigate('/landlord/tickets') },
    { id: 'reviews',       label: 'Reseñas',         icon: Star, active: true, action: () => {} },
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
        <div className="max-w-5xl space-y-6">

          {/* Header */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Reputación</span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Mis <span className="font-serif italic font-normal text-accent">reseñas</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isLoading
                ? 'Cargando...'
                : `${total} reseña${total !== 1 ? 's' : ''} · ${properties.length} propiedad${properties.length !== 1 ? 'es' : ''}`}
            </p>
          </div>

          {/* Stats row */}
          {!isLoading && total > 0 && (
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">

              {/* Rating summary card */}
              <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                <div className="text-center shrink-0">
                  <p className="text-4xl sm:text-5xl font-bold text-primary leading-none">{avg}</p>
                  <div className="flex justify-center gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= Math.round(parseFloat(avg))
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{total} reseñas</p>
                </div>
                <div className="flex-1 space-y-2">
                  {dist.map(({ star, count }) => (
                    <RatingBar key={star} star={star} count={count} total={total} />
                  ))}
                </div>
              </div>

              {/* Property filter card */}
              <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Filtrar por propiedad
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterPropId('all')}
                    className={`h-7 px-3 rounded-full text-xs font-medium transition ${
                      filterPropId === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Todas ({total})
                  </button>
                  {properties.map((p) => {
                    const propCount = allReviews.filter((r) => r.propertyId === p.id).length;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setFilterPropId(String(p.id))}
                        className={`h-7 px-3 rounded-full text-xs font-medium transition ${
                          filterPropId === String(p.id)
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p.title} ({propCount})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Skeleton */}
          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-white border border-slate-100 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && total === 0 && (
            <div className="flex flex-col items-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-base font-semibold text-slate-600">Sin reseñas aún</p>
              <p className="text-sm text-slate-400 mt-1">
                Las reseñas de tus inquilinos aparecerán aquí una vez completen una estadía
              </p>
            </div>
          )}

          {/* Reviews grid */}
          {!isLoading && filteredReviews.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-4">
                {filteredReviews.length} reseña{filteredReviews.length !== 1 ? 's' : ''}
                {filterPropId !== 'all' && (
                  <span className="ml-1">
                    en{' '}
                    <span className="font-medium text-primary">
                      {properties.find((p) => String(p.id) === filterPropId)?.title}
                    </span>
                  </span>
                )}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredReviews.map((r) => (
                  <div key={r.id}>
                    {filterPropId === 'all' && (
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                        {r.propertyTitle}
                      </p>
                    )}
                    <ReviewCard review={r} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default LandlordReviews;
