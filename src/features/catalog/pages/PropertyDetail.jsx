import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, MapPin, BedDouble, Bath, Users, Star,
  ShieldCheck, LayoutGrid, Search, Calendar, Key, Wrench,
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import PhotoGallery from '../components/PhotoGallery';
import ReviewCard from '../components/ReviewCard';
import { propertyApi } from '../../../api/propertyApi';
import { reviewApi } from '../../../api/reviewApi';

const today = () => new Date().toISOString().split('T')[0];
const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};
const diffDays = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));

const DURATIONS = [1, 3, 6, 12];

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [duration, setDuration] = useState(1);
  const [checkIn, setCheckIn]   = useState(today());
  const [checkOut, setCheckOut] = useState(addMonths(today(), 1));

  const handleDuration = (m) => { setDuration(m); setCheckOut(addMonths(checkIn, m)); };
  const handleCheckIn  = (d) => { setCheckIn(d);  setCheckOut(addMonths(d, duration)); };

  /* ── Queries ─────────────────────────────────────────── */
  const { data: propRes, isLoading, isError } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyApi.getById(id).then((r) => r.data),
  });

  const { data: photosRes } = useQuery({
    queryKey: ['photos', id],
    queryFn: () => propertyApi.getPhotos(id).then((r) => r.data ?? []),
    enabled: !!id,
  });

  const { data: reviewsRes } = useQuery({
    queryKey: ['reviews', 'property', id],
    queryFn: () => reviewApi.getByProperty(id).then((r) => r.data ?? []),
    enabled: !!id,
  });

  const property = propRes ?? null;
  const photos   = photosRes ?? [];
  const reviews  = reviewsRes ?? [];

  /* ── Price breakdown ─────────────────────────────────── */
  const pricePerNight = parseFloat(property?.pricePerNight ?? 0);
  const nights        = diffDays(checkIn, checkOut);
  const subtotal      = Math.round(pricePerNight * nights);
  const cleaning      = nights > 0 ? 75 : 0;
  const serviceFee    = Math.round(subtotal * 0.05);
  const total         = subtotal + cleaning + serviceFee;

  /* ── Sidebar ─────────────────────────────────────────── */
  const sidebarItems = [
    { id: 'inicio',        label: 'Inicio',        icon: LayoutGrid, action: () => navigate('/guest') },
    { id: 'catalogo',      label: 'Catálogo',      icon: Search,     active: true, action: () => navigate('/tenant/catalog') },
    { id: 'reservas',      label: 'Mis Reservas',  icon: Calendar,   action: () => navigate('/tenant/reservations') },
    { id: 'llave',         label: 'Mi Llave',      icon: Key,        action: () => navigate('/tenant/key') },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench,     action: () => navigate('/tenant/maintenance') },
  ];

  /* ── Render helpers ──────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="bg-bg-main min-h-screen">
        <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        <main className={`transition-all duration-300 p-6 md:p-8 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-24 bg-slate-100 rounded" />
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-4">
                <div className="aspect-[16/10] bg-slate-100 rounded-xl" />
                <div className="h-8 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
              <div className="h-80 bg-slate-100 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="bg-bg-main min-h-screen">
        <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        <main className={`transition-all duration-300 p-6 md:p-8 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="text-center py-24">
            <p className="text-base font-semibold text-slate-600">Propiedad no encontrada</p>
            <Link to="/tenant/catalog" className="mt-4 inline-block text-sm text-accent hover:underline">
              ← Volver al catálogo
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const rating = property.averageRating ? parseFloat(property.averageRating).toFixed(1) : null;

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <main className={`transition-all duration-300 p-6 md:p-8 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="space-y-6 max-w-7xl">

          {/* Back */}
          <Link
            to="/tenant/catalog"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors -ml-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>

          {/* Two-column layout */}
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">

            {/* ── Left column ───────────────────────────── */}
            <div className="space-y-6">

              {/* Gallery */}
              <PhotoGallery photos={photos} propertyId={id} />

              {/* Title & rating */}
              <div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">{property.title}</h1>
                    <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {property.address && <span>{property.address}, </span>}
                      <span>{property.city}, {property.country}</span>
                    </div>
                  </div>
                  {rating && (
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-sm font-semibold text-primary flex-shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {rating}
                      <span className="text-xs text-slate-400 font-normal">({reviews.length})</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-5 flex flex-wrap gap-5 text-sm text-primary">
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="h-4 w-4 text-accent" />
                    {property.bedrooms} hab.
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="h-4 w-4 text-accent" />
                    {property.bathrooms} baños
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-accent" />
                    {property.maxGuests} huéspedes máx.
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Description */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Descripción</h2>
                <p className="leading-relaxed text-slate-700 text-sm">
                  {property.description || 'Sin descripción disponible.'}
                </p>
              </div>

              <hr className="border-slate-100" />

              {/* Landlord */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Propietario</h2>
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-slate-700 text-white text-sm font-bold flex-shrink-0">
                    {(property.landlordName ?? 'P').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{property.landlordName ?? 'Propietario'}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-accent" /> Verificado
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Reseñas
                  </h2>
                  {reviews.length > 0 && (
                    <span className="text-xs text-slate-400">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</span>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Sin reseñas aún.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {reviews.map((r) => (
                      <ReviewCard key={r.id} review={r} />
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ── Right column (sticky booking card) ────── */}
            <div>
              <div className="rounded-xl overflow-hidden shadow-xl sticky top-6">

                {/* Price header */}
                <div className="p-6 bg-primary text-white">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-accent">
                      ${parseFloat(property.pricePerNight).toLocaleString()}
                    </span>
                    <span className="text-sm text-white/70">/ noche</span>
                  </div>
                  <p className="mt-1 text-xs text-white/60">Cancelación gratuita hasta 7 días antes</p>
                </div>

                {/* Booking form */}
                <div className="space-y-4 p-6 bg-white">
                  {/* Duration selector */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Duración (meses)</p>
                    <div className="grid grid-cols-4 gap-2">
                      {DURATIONS.map((m) => (
                        <button
                          key={m}
                          onClick={() => handleDuration(m)}
                          className={`py-2 rounded-md border text-sm font-semibold transition ${
                            duration === m
                              ? 'border-accent bg-accent/10 text-primary'
                              : 'border-slate-200 text-slate-400 hover:text-primary hover:border-slate-300'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md border border-slate-200 p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Check-in</p>
                      <input
                        type="date"
                        value={checkIn}
                        min={today()}
                        onChange={(e) => handleCheckIn(e.target.value)}
                        className="w-full text-xs font-semibold text-primary focus:outline-none cursor-pointer"
                      />
                    </div>
                    <div className="rounded-md border border-slate-200 p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Check-out</p>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full text-xs font-semibold text-primary focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Price breakdown */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>${pricePerNight.toLocaleString()} × {nights} noche{nights !== 1 ? 's' : ''}</span>
                      <span className="text-primary">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Limpieza</span>
                      <span className="text-primary">${cleaning}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Tarifa de servicio</span>
                      <span className="text-primary">${serviceFee.toLocaleString()}</span>
                    </div>
                    <hr className="border-slate-100 my-2" />
                    <div className="flex justify-between font-bold text-primary">
                      <span>Total</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    className="w-full h-11 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    Reservar ahora
                  </button>

                  <p className="text-center text-[11px] text-slate-400">
                    Pago seguro · Sin cargos por adelantado
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;
