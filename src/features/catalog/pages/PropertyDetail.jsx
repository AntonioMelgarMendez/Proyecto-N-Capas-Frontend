import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, MapPin, BedDouble, Bath, Users, Star,
  ShieldCheck, LayoutGrid, Search, Calendar, Key, Wrench,
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import PhotoGallery from '../components/PhotoGallery';
import ReviewCard from '../components/ReviewCard';
import { propertyApi } from '../../../api/propertyApi';
import { reviewApi } from '../../../api/reviewApi';
import { today, addMonths, calcBooking, DURATIONS } from '../utils/booking';
import { reservationApi } from '../../../api/reservationApi';
import { MOCK_TENANT_ID } from '../../checkout/constants';
import { saveCheckoutContext } from '../../checkout/utils/checkoutContext';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const backLinkClassName = `fixed top-0 right-0 z-30 inline-flex h-14 items-center gap-2 px-4 text-sm font-medium text-slate-500 hover:text-primary transition-colors lg:static lg:z-auto lg:h-auto lg:px-0 lg:mt-4 lg:mb-10 ${
    isMobileMenuOpen ? 'hidden lg:inline-flex' : 'inline-flex'
  }`;
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
  const { nights, subtotal, cleaning, serviceFee, total } = calcBooking({ pricePerNight, checkIn, checkOut });

  const createReservation = useMutation({
    mutationFn: () =>
      reservationApi.book(Number(id), {
        propertyId: Number(id),
        tenantId: MOCK_TENANT_ID,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: 1,
        totalAmount: total,
        includeCleaning: true,
        includeInsurance: false,
      }),
    onSuccess: (res) => {
      const booking = res?.data ?? res;
      const newId = booking?.id;
      if (!newId) return;

      const context = {
        propertyId: Number(id),
        propertyTitle: property?.title,
        address: property?.address,
        city: property?.city,
        country: property?.country,
        checkIn: booking.checkInDate ?? checkIn,
        checkOut: booking.checkOutDate ?? checkOut,
        duration,
        subtotal,
        cleaning,
        serviceFee,
        totalAmount: booking.totalAmount ?? total,
        monthlyPrice: Math.round(pricePerNight * 30),
        numberOfGuests: booking.numberOfGuests ?? 1,
        status: booking.status,
      };

      saveCheckoutContext(newId, context);
      navigate(`/tenant/checkout/${newId}`, { state: context });
    },
  });

  const handleReserve = () => createReservation.mutate();

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
        <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} onMobileOpenChange={setIsMobileMenuOpen} />
        <main className={`transition-all duration-300 p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <Link to="/tenant/catalog" className={backLinkClassName}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div className="animate-pulse space-y-6 mt-4">
            <div className="hidden lg:block h-6 w-24 bg-slate-100 rounded" />
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
        <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} onMobileOpenChange={setIsMobileMenuOpen} />
        <main className={`transition-all duration-300 p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <Link to="/tenant/catalog" className={backLinkClassName}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div className="text-center py-24">
            <p className="text-base font-semibold text-slate-600">Propiedad no encontrada</p>
          </div>
        </main>
      </div>
    );
  }

  const hasRating = property.averageRating != null && property.averageRating > 0;
  const ratingValue = hasRating ? parseFloat(property.averageRating).toFixed(1) : null;
  const monthlyPrice = Math.round(pricePerNight * 30);

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} onMobileOpenChange={setIsMobileMenuOpen} />

      <main className={`transition-all duration-300 p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="w-full">

          <Link to="/tenant/catalog" className={backLinkClassName}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(44%,560px)] lg:gap-8 lg:items-start lg:max-h-[calc(100vh-7rem)]">

            <div className="space-y-6 lg:overflow-y-auto lg:scrollbar-hide lg:pr-2 lg:max-h-[calc(100vh-7rem)] lg:pb-6">
              <PhotoGallery photos={photos} large />

              <div className="space-y-3">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {property.bedrooms} Hab.
                </span>

                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary leading-tight">{property.title}</h1>
                  <div className="flex items-center gap-1.5 shrink-0 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-sm font-bold text-[#091124] shadow-sm">
                    <Star className={`h-4 w-4 ${hasRating ? 'fill-amber-400 text-amber-400' : 'fill-slate-300 text-slate-300'}`} />
                    {hasRating && (
                      <>
                        <span>{ratingValue}</span>
                        {reviews.length > 0 && (
                          <span className="text-slate-400 font-normal text-xs">({reviews.length})</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>
                    {property.city}, {property.country}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 font-medium pt-1">
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="h-[18px] w-[18px] text-slate-400" strokeWidth={1.5} />
                    {property.bedrooms} hab.
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bath className="h-[18px] w-[18px] text-slate-400" strokeWidth={1.5} />
                    {property.bathrooms} baños
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-[18px] w-[18px] text-slate-400" strokeWidth={1.5} />
                    {property.maxGuests} huéspedes máx.
                  </span>
                </div>
              </div>

              <hr className="border-slate-200" />

              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">Descripción</h2>
                <p className="leading-relaxed text-slate-600 text-sm">
                  {property.description || 'Sin descripción disponible.'}
                </p>
              </div>

              <hr className="border-slate-200" />

              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">Propietario</h2>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-slate-700 text-white text-sm font-bold shrink-0">
                    {(property.landlordName ?? 'P').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-primary">{property.landlordName ?? 'Propietario'}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Verificado
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Reseñas</h2>
                  {reviews.length > 0 && (
                    <span className="text-xs text-slate-400">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</span>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-400">Aún no hay reseñas.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {reviews.map((r) => (
                      <ReviewCard key={r.id} review={r} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-lg">

                <div className="px-7 py-6 bg-primary text-white">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-accent">
                      ${monthlyPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-white/70">/ mes</span>
                  </div>
                  <p className="mt-1.5 text-xs text-white/50">
                    Cancelación gratuita hasta 7 días antes
                  </p>
                </div>

                <div className="space-y-5 px-7 py-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2.5">Duración (meses)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DURATIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleDuration(m)}
                          className={`py-2.5 rounded-xl border text-sm font-semibold transition ${
                            duration === m
                              ? 'border-accent bg-[#fdf6e8] text-primary shadow-sm'
                              : 'border-slate-200 bg-white text-slate-400 hover:text-primary hover:border-slate-300'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">Check-in</p>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
                        <input
                          type="date"
                          value={checkIn}
                          min={today()}
                          onChange={(e) => handleCheckIn(e.target.value)}
                          className="w-full min-w-0 text-xs font-semibold text-primary focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">Check-out</p>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
                        <input
                          type="date"
                          value={checkOut}
                          min={checkIn}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full min-w-0 text-xs font-semibold text-primary focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>${pricePerNight.toLocaleString()} × {nights} noche{nights !== 1 ? 's' : ''}</span>
                      <span className="font-medium text-primary">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Limpieza</span>
                      <span className="font-medium text-primary">${cleaning}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Tarifa de servicio</span>
                      <span className="font-medium text-primary">${serviceFee.toLocaleString()}</span>
                    </div>
                    <hr className="border-slate-100 my-1" />
                    <div className="flex justify-between font-bold text-primary">
                      <span>Total</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReserve}
                    disabled={createReservation.isPending}
                    className="w-full min-h-[52px] rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary/90 transition-colors shadow-md py-3 disabled:opacity-50"
                  >
                    {createReservation.isPending ? 'Creando reserva...' : 'Reservar ahora'}
                  </button>

                  <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
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
