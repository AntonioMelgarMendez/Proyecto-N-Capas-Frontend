import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, MapPin, CreditCard, Lock,
  LayoutGrid, Search, Calendar, Key, Wrench, Building2,
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { propertyApi } from '../../../api/propertyApi';
import { today, addMonths, calcBooking, formatShortDate } from '../utils/booking';

const STEPS = ['Pago', 'Contrato', 'Verificación KYC', 'Confirmado'];

const inputCls =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-primary placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition';

const PropertyReserve = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const passed = location.state ?? {};
  const [duration] = useState(passed.duration ?? 1);
  const [checkIn] = useState(passed.checkIn ?? today());
  const [checkOut] = useState(passed.checkOut ?? addMonths(today(), passed.duration ?? 1));

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyApi.getById(id).then((r) => r.data),
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['photos', id],
    queryFn: () => propertyApi.getPhotos(id).then((r) => r.data ?? []),
    enabled: !!id,
  });

  const pricePerNight = parseFloat(property?.pricePerNight ?? passed.pricePerNight ?? 0);
  const monthlyPrice = Math.round(pricePerNight * 30);
  const booking = calcBooking({ pricePerNight, checkIn, checkOut });
  const subtotal = passed.subtotal ?? booking.subtotal;
  const cleaning = passed.cleaning ?? booking.cleaning;
  const serviceFee = passed.serviceFee ?? booking.serviceFee;
  const total = passed.total ?? booking.total;

  const coverPhoto = photos[0]?.s3Url;

  const backLinkClassName = `fixed top-0 right-0 z-30 inline-flex h-14 items-center gap-2 px-4 text-sm font-medium text-slate-500 hover:text-primary transition-colors lg:static lg:z-auto lg:h-auto lg:px-0 lg:mb-8 ${
    isMobileMenuOpen ? 'hidden lg:inline-flex' : 'inline-flex'
  }`;

  const sidebarItems = [
    { id: 'inicio', label: 'Inicio', icon: LayoutGrid, action: () => navigate('/guest') },
    { id: 'catalogo', label: 'Catálogo', icon: Search, active: true, action: () => navigate('/tenant/catalog') },
    { id: 'reservas', label: 'Mis Reservas', icon: Calendar, action: () => navigate('/tenant/reservations') },
    { id: 'llave', label: 'Mi Llave', icon: Key, action: () => navigate('/tenant/key') },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench, action: () => navigate('/tenant/maintenance') },
  ];

  const handlePay = (e) => {
    e.preventDefault();
  };

  if (isLoading) {
    return (
      <div className="bg-bg-main min-h-screen">
        <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} onMobileOpenChange={setIsMobileMenuOpen} />
        <main className={`p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <div className="animate-pulse h-8 w-48 bg-slate-100 rounded mb-8" />
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="h-96 bg-slate-100 rounded-2xl" />
            <div className="h-80 bg-slate-100 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-bg-main min-h-screen">
        <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} onMobileOpenChange={setIsMobileMenuOpen} />
        <main className={`p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <p className="text-center py-24 text-slate-600">Propiedad no encontrada</p>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} onMobileOpenChange={setIsMobileMenuOpen} />

      <main className={`transition-all duration-300 p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="w-full max-w-6xl">

          <Link to={`/tenant/property/${id}`} className={backLinkClassName}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>

          <div className="mb-8 lg:mb-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Reserva</span>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-primary">
              Confirma tu <span className="font-serif italic font-normal text-accent">reserva</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
            {STEPS.map((step, i) => (
              <div
                key={step}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  i === 0
                    ? 'border-accent bg-[#fdf6e8] text-primary'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${i === 0 ? 'bg-accent text-primary' : 'bg-slate-100 text-slate-400'}`}>
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(40%,420px)] lg:gap-8 lg:items-start">
            <form onSubmit={handlePay} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-primary">Detalles de pago</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-1.5">Nombre en la tarjeta</label>
                <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Nombre completo" className={inputCls} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-1.5">Número de tarjeta</label>
                <div className="relative">
                  <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" className={inputCls} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 tracking-wider">VISA</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-1.5">Vencimiento</label>
                  <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/AA" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-1.5">CVC</label>
                  <input type="text" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} placeholder="123" className={inputCls} />
                </div>
              </div>

              <p className="flex items-start gap-2 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Pago procesado con cifrado de extremo a extremo. No almacenamos tus datos bancarios.
              </p>

              <button
                type="submit"
                className="w-full min-h-[52px] rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Pagar ${total.toLocaleString()}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="lg:sticky lg:top-6 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="relative aspect-[3/2] bg-slate-100 overflow-hidden">
                {coverPhoto ? (
                  <img src={coverPhoto} alt={property.title} className="absolute inset-0 w-full h-full object-cover object-center" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-slate-700">
                    <Building2 className="h-12 w-12 text-accent/60" />
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-primary">{property.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {property.city}, {property.country}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-in</p>
                    <p className="mt-1 text-sm font-semibold text-primary">{formatShortDate(checkIn)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-out</p>
                    <p className="mt-1 text-sm font-semibold text-primary">{formatShortDate(checkOut)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-slate-500">
                    <span>${monthlyPrice.toLocaleString()} × {duration} mes{duration !== 1 ? 'es' : ''}</span>
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
                  <div className="flex justify-between font-bold text-primary pt-2 border-t border-slate-100">
                    <span>Total</span>
                    <span className="text-accent">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PropertyReserve;
