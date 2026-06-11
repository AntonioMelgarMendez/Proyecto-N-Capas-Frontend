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
  const [viewDate, setViewDate] = useState(new Date());
  const [includeCleaning, setIncludeCleaning] = useState(true);
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  const handleDuration = (m) => {
    setDuration(m);
    setCheckOut(addMonths(checkIn, m));
    // Sincronizar el mes visualizado con la fecha de check-in seleccionada
    setViewDate(new Date(checkIn));
  };
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (date) => {
    // Evitar desfase de zona horaria local al convertir a ISO string
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    const formatted = localDate.toISOString().split('T')[0];
    
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(formatted);
      setCheckOut('');
    } else {
      if (formatted > checkIn) {
        setCheckOut(formatted);
      } else {
        setCheckIn(formatted);
        setCheckOut('');
      }
    }
  };

  const isOccupied = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    const formatted = localDate.toISOString().split('T')[0];
    return occupiedDates.includes(formatted);
  };

  const isPast = (date) => {
    const todayDateStr = today();
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    const formatted = localDate.toISOString().split('T')[0];
    return formatted < todayDateStr;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Días del mes y padding
  const firstDayOfMonth = new Date(year, month, 1);
  let startDayOfWeek = firstDayOfMonth.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Ajustar lunes como primer día

  const numDays = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= numDays; i++) {
    calendarDays.push({
      day: i,
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

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

  const { data: occupiedDates = [] } = useQuery({
    queryKey: ['calendar', id],
    queryFn: () => {
      const start = today();
      const end = addMonths(start, 12);
      return reservationApi.getCalendar(Number(id), start, end).then((r) => r.data ?? r ?? []);
    },
    enabled: !!id,
  });

  const property = propRes ?? null;
  const photos   = photosRes ?? [];
  const reviews  = reviewsRes ?? [];

  const isRangeBlocked = (() => {
    if (!checkIn || !checkOut || occupiedDates.length === 0) return false;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const current = new Date(start);
    while (current < end) {
      const dateString = current.toISOString().split('T')[0];
      if (occupiedDates.includes(dateString)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    return false;
  })();

  /* ── Dynamic Price Quote ── */
  const { data: quoteRes, isLoading: isQuoteLoading } = useQuery({
    queryKey: ['quote', id, checkIn, checkOut, numberOfGuests, includeCleaning, includeInsurance],
    queryFn: () =>
      reservationApi.quote(Number(id), {
        propertyId: Number(id),
        tenantId: MOCK_TENANT_ID,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: numberOfGuests,
        includeCleaning: includeCleaning,
        includeInsurance: includeInsurance,
      }).then((r) => r.data ?? r),
    enabled: !!id && !!checkIn && !!checkOut && !isRangeBlocked,
  });

  /* ── Price breakdown ─────────────────────────────────── */
  const pricePerNight = parseFloat(property?.pricePerNight ?? 0);
  const { nights, subtotal } = calcBooking({ pricePerNight, checkIn, checkOut });
  
  const cleaningFeeVal = includeCleaning ? 75 : 0;
  const insuranceFeeVal = includeInsurance ? 25 * nights : 0;
  const expectedSubtotal = subtotal + cleaningFeeVal + insuranceFeeVal;

  const total = quoteRes?.totalAmount ?? expectedSubtotal;
  const discountVal = expectedSubtotal > total ? (expectedSubtotal - total) : 0;
  const surchargeVal = total > expectedSubtotal ? (total - expectedSubtotal) : 0;

  const handleReserve = () => {
    const context = {
      propertyId: Number(id),
      propertyTitle: property?.title,
      address: property?.address,
      city: property?.city,
      country: property?.country,
      checkIn: checkIn,
      checkOut: checkOut,
      duration,
      subtotal,
      cleaning: includeCleaning ? 75 : 0,
      serviceFee: Math.round(subtotal * 0.05),
      totalAmount: total,
      monthlyPrice: Math.round(pricePerNight * 30),
      numberOfGuests: numberOfGuests,
      includeCleaning: includeCleaning,
      includeInsurance: includeInsurance,
    };

    saveCheckoutContext('pending', context);
    navigate(`/tenant/checkout/pending`, { state: context });
  };

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

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-1">Check-in</p>
                      <p className="text-xs font-semibold text-primary">{checkIn ? checkIn.split('-').reverse().join('/') : 'Seleccionar'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-1">Check-out</p>
                      <p className="text-xs font-semibold text-primary">{checkOut ? checkOut.split('-').reverse().join('/') : 'Seleccionar'}</p>
                    </div>
                  </div>

                  {/* Calendario Mensual Interactivo */}
                  <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">
                        {monthNames[month]} {year}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-500 font-bold"
                        >
                          &larr;
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-500 font-bold"
                        >
                          &rarr;
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
                      <span>LU</span><span>MA</span><span>MI</span><span>JU</span><span>VI</span><span>SÁ</span><span>DO</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {calendarDays.map((d, index) => {
                        const dateStr = d.date.toISOString().split('T')[0];
                        const occupied = isOccupied(d.date);
                        const past = isPast(d.date);
                        const isStart = checkIn === dateStr;
                        const isEnd = checkOut === dateStr;
                        const isBetween = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
                        
                        let dayClass = "h-8 flex items-center justify-center rounded-lg transition-all ";
                        
                        if (past) {
                          dayClass += "text-slate-300 cursor-not-allowed opacity-30";
                        } else if (occupied) {
                          dayClass += "bg-red-50 text-red-500 font-medium line-through cursor-not-allowed relative";
                        } else if (isStart || isEnd) {
                          dayClass += "bg-accent text-primary font-bold shadow-xs";
                        } else if (isBetween) {
                          dayClass += "bg-accent/20 text-primary font-medium";
                        } else if (!d.isCurrentMonth) {
                          dayClass += "text-slate-300 hover:bg-slate-50 cursor-pointer";
                        } else {
                          dayClass += "text-slate-600 hover:bg-slate-100 hover:text-primary cursor-pointer font-medium";
                        }

                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={past || occupied}
                            onClick={() => handleDayClick(d.date)}
                            className={dayClass}
                            title={occupied ? "Ocupado" : undefined}
                          >
                            {d.day}
                            {occupied && (
                              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {isRangeBlocked && (
                    <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
                      ⚠️ Las fechas seleccionadas contienen días no disponibles. Por favor, selecciona otro rango.
                    </div>
                  )}

                  {/* Huéspedes & Opciones */}
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">Huéspedes</p>
                      <select
                        value={numberOfGuests}
                        onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                        className="w-full text-xs font-semibold text-primary focus:outline-none bg-transparent cursor-pointer"
                      >
                        {[...Array(property.maxGuests || 1).keys()].map((n) => (
                          <option key={n + 1} value={n + 1}>
                            {n + 1} {n + 1 === 1 ? 'huésped' : 'huéspedes'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2.5 px-1 py-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary select-none">
                        <input
                          type="checkbox"
                          checked={includeCleaning}
                          onChange={(e) => setIncludeCleaning(e.target.checked)}
                          className="rounded border-slate-300 text-accent focus:ring-accent accent-accent h-4 w-4"
                        />
                        <span>Incluir Limpieza (Tarifa única: $75)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary select-none">
                        <input
                          type="checkbox"
                          checked={includeInsurance}
                          onChange={(e) => setIncludeInsurance(e.target.checked)}
                          className="rounded border-slate-300 text-accent focus:ring-accent accent-accent h-4 w-4"
                        />
                        <span>Incluir Seguro de Estancia ($25 / noche)</span>
                      </label>
                    </div>
                  </div>
 
                  {checkIn && checkOut ? (
                    <>
                      <hr className="border-slate-100" />
     
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-500">
                          <span>Precio base ({nights} noche{nights !== 1 ? 's' : ''})</span>
                          <span className="font-medium text-primary">${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Limpieza</span>
                          <span className="font-medium text-primary">${cleaningFeeVal.toLocaleString()}</span>
                        </div>
                        {includeInsurance && (
                          <div className="flex justify-between text-slate-500">
                            <span>Seguro de estancia ($25 × {nights} noches)</span>
                            <span className="font-medium text-primary">${insuranceFeeVal.toLocaleString()}</span>
                          </div>
                        )}
                        {discountVal > 0 && (
                          <div className="flex justify-between text-emerald-600 text-xs font-semibold">
                            <span>Descuento por larga estadía (10%)</span>
                            <span>-${discountVal.toLocaleString()}</span>
                          </div>
                        )}
                        {surchargeVal > 0 && (
                          <div className="flex justify-between text-amber-600 text-xs font-semibold">
                            <span>Recargo por huéspedes extra</span>
                            <span>+${surchargeVal.toLocaleString()}</span>
                          </div>
                        )}
                        <hr className="border-slate-100 my-1" />
                        <div className="flex justify-between font-bold text-primary">
                          <span>Total {isQuoteLoading && <span className="text-xs font-normal text-slate-400 animate-pulse">(Calculando...)</span>}</span>
                          <span className={isQuoteLoading ? 'opacity-50' : ''}>
                            ${total.toLocaleString()}
                          </span>
                        </div>
                      </div>
 
                      <button
                        type="button"
                        onClick={handleReserve}
                        disabled={isRangeBlocked}
                        className="w-full min-h-[52px] rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary/90 transition-colors shadow-md py-3 disabled:opacity-50"
                      >
                        Reservar ahora
                      </button>
 
                      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                        Pago seguro · Sin cargos por adelantado
                      </p>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs font-semibold text-slate-400">
                      Selecciona fecha de entrada y salida en el calendario para continuar.
                    </div>
                  )}
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
