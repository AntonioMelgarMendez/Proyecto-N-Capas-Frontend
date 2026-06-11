import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutGrid, Search, Calendar, Key, Wrench, MapPin,
  CalendarCheck2, XCircle, FileText, Info, ShieldAlert
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { reservationApi } from '../../../api/reservationApi';
import { MOCK_TENANT_ID } from '../../checkout/constants';

const TenantReservations = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Todas');

  // Modals / Actions states
  const [selectedRes, setSelectedRes] = useState(null);
  const [modalType, setModalType] = useState(null); // 'extend' | 'cancel'
  const [extraDays, setExtraDays] = useState(30);
  const [visiblePins, setVisiblePins] = useState({});

  // Fetch reservations
  const { data: reservationsRes, isLoading, error } = useQuery({
    queryKey: ['tenant-reservations', MOCK_TENANT_ID],
    queryFn: () => reservationApi.getTenantReservations(MOCK_TENANT_ID).then((r) => r.data ?? r ?? []),
  });

  const reservations = reservationsRes ?? [];

  // Toggle visible PIN
  const togglePin = (id) => {
    setVisiblePins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Extension Mutation
  const quoteExtensionMutation = useQuery({
    queryKey: ['extend-quote', selectedRes?.id, extraDays],
    queryFn: () => reservationApi.extendQuote(selectedRes.id, extraDays).then((r) => r.data ?? r),
    enabled: !!selectedRes && modalType === 'extend' && extraDays > 0,
  });

  const payExtensionMutation = useMutation({
    mutationFn: () => reservationApi.extendPay(selectedRes.id, extraDays),
    onSuccess: () => {
      queryClient.invalidateQueries(['tenant-reservations']);
      closeModal();
      alert('¡Estancia extendida con éxito!');
    },
    onError: (err) => {
      alert(err?.message || 'Error al procesar el pago de la extensión.');
    }
  });

  // Cancellation Mutation
  const quoteCancellationQuery = useQuery({
    queryKey: ['cancel-quote', selectedRes?.id],
    queryFn: () => reservationApi.cancelQuote(selectedRes.id).then((r) => r.data ?? r),
    enabled: !!selectedRes && modalType === 'cancel',
  });

  const confirmCancellationMutation = useMutation({
    mutationFn: () => reservationApi.cancelConfirm(selectedRes.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tenant-reservations']);
      closeModal();
      alert('Reserva cancelada exitosamente.');
    },
    onError: (err) => {
      alert(err?.message || 'Error al cancelar la reserva.');
    }
  });

  const closeModal = () => {
    setSelectedRes(null);
    setModalType(null);
    setExtraDays(30);
  };

  const getStatusLabelAndColors = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'CHECKED_IN':
        return { label: 'Activo', bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', dot: 'bg-emerald-500' };
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return { label: 'Pendiente', bg: 'bg-amber-50 text-amber-600 border border-amber-100', dot: 'bg-amber-500' };
      case 'COMPLETED':
        return { label: 'Finalizada', bg: 'bg-slate-50 text-slate-600 border border-slate-100', dot: 'bg-slate-500' };
      case 'CANCELLED':
        return { label: 'Cancelada', bg: 'bg-rose-50 text-rose-600 border border-rose-100', dot: 'bg-rose-500' };
      default:
        return { label: status, bg: 'bg-slate-50 text-slate-600 border border-slate-100', dot: 'bg-slate-500' };
    }
  };

  const filterReservations = (list) => {
    if (activeTab === 'Todas') return list;
    if (activeTab === 'Activas') return list.filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN');
    if (activeTab === 'Pendientes') return list.filter(r => r.status === 'PENDING' || r.status === 'PENDING_PAYMENT');
    if (activeTab === 'Finalizadas') return list.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED');
    return list;
  };

  const calculateMonths = (inDate, outDate) => {
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const months = (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth();
    return Math.max(1, months);
  };

  const sidebarItems = [
    { id: 'inicio', label: 'Inicio', icon: LayoutGrid, action: () => navigate('/guest') },
    { id: 'catalogo', label: 'Catálogo', icon: Search, action: () => navigate('/tenant/catalog') },
    { id: 'reservas', label: 'Mis Reservas', icon: Calendar, active: true, action: () => navigate('/tenant/reservations') },
    { id: 'llave', label: 'Mi Llave', icon: Key, action: () => navigate('/tenant/key') },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench, action: () => navigate('/tenant/maintenance') },
  ];

  const filteredList = filterReservations(reservations);

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800">
      <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <main className={`transition-all duration-300 p-6 md:p-8 ml-0 pt-16 lg:pt-8 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase font-sans">Reservas</span>
            <h1 className="text-3xl font-extrabold text-[#091124]">
              Mis <span className="font-serif italic font-normal text-accent lowercase">reservas</span>
            </h1>
            <p className="text-slate-500 text-sm">Gestiona, extiende o cancela tus estancias.</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {['Todas', 'Activas', 'Pendientes', 'Finalizadas'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === tab
                  ? 'bg-[#091124] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#091124]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-44 bg-white border border-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-sm font-medium">
              Error al cargar tus reservas. Por favor, intenta de nuevo más tarde.
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 text-sm font-medium">No se encontraron reservas en esta categoría.</p>
              <button
                onClick={() => navigate('/tenant/catalog')}
                className="px-5 py-2 bg-accent text-[#091124] text-xs font-bold rounded-xl hover:bg-accent/90 transition"
              >
                Explorar catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredList.map((res) => {
                const statusMeta = getStatusLabelAndColors(res.status);
                const isPinVisible = !!visiblePins[res.id];
                const months = calculateMonths(res.checkInDate, res.checkOutDate);
                const monthlyAvg = Math.round(res.totalAmount / months);

                return (
                  <div
                    key={res.id}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]"
                  >
                    {/* Image Area */}
                    <div className="relative h-48 md:h-full w-full bg-slate-100 min-h-[160px]">
                      <img
                        src={res.propertyCoverPhoto || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                        alt={res.propertyTitle}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm ${statusMeta.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Information and Actions */}
                    <div className="p-6 flex flex-col justify-between gap-4">

                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        {/* Info details */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider">R-{res.id}</span>
                          <h2 className="text-xl font-extrabold text-[#091124] tracking-tight">{res.propertyTitle}</h2>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{res.propertyCity}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-medium text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <CalendarCheck2 className="h-3.5 w-3.5 text-slate-400" />
                              Check-in: <strong className="text-slate-700">{new Date(res.checkInDate).toLocaleDateString()}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarCheck2 className="h-3.5 w-3.5 text-slate-400" />
                              Check-out: <strong className="text-slate-700">{new Date(res.checkOutDate).toLocaleDateString()}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-slate-400" />
                              Contrato: <strong className={res.contractStatus === 'Firmado' ? 'text-emerald-600' : 'text-amber-600'}>{res.contractStatus}</strong>
                            </span>
                            {res.status === 'CONFIRMED' && (
                              <span className="flex items-center gap-1">
                                <Key className="h-3.5 w-3.5 text-slate-400" />
                                PIN: <strong className="text-slate-700 font-mono tracking-wider">{isPinVisible ? res.pin : '••••••'}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price Area */}
                        <div className="text-left lg:text-right shrink-0">
                          <p className="text-2xl font-black text-[#091124]">${res.totalAmount.toLocaleString()}</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            ${monthlyAvg.toLocaleString()} x {months} {months === 1 ? 'MES' : 'MESES'}
                          </p>
                        </div>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Buttons Action Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        {(res.status === 'CONFIRMED' || res.status === 'CHECKED_IN') && (
                          <button
                            onClick={() => { setSelectedRes(res); setModalType('extend'); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#091124] text-white hover:bg-[#121f3d] transition-all shadow-xs"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Extender estancia
                          </button>
                        )}
                        {(res.status === 'CONFIRMED' || res.status === 'PENDING' || res.status === 'PENDING_PAYMENT') && (
                          <button
                            onClick={() => { setSelectedRes(res); setModalType('cancel'); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 transition-all"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                        )}
                        {res.status === 'CONFIRMED' && (
                          <button
                            onClick={() => togglePin(res.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all"
                          >
                            <Key className="h-3.5 w-3.5" />
                            {isPinVisible ? 'Ocultar PIN' : 'Ver PIN'}
                          </button>
                        )}
                        <button
                          onClick={() => alert('Descargando contrato en formato PDF...')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-[#091124] hover:bg-slate-50 transition-all"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Descargar contrato
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* EXTEND STAY MODAL */}
      {selectedRes && modalType === 'extend' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#091124]">Extender Estancia</h3>
                <p className="text-xs text-slate-400">Añade meses a tu contrato en {selectedRes.propertyTitle}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Duración Extra (meses)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((months) => (
                    <button
                      key={months}
                      onClick={() => setExtraDays(months * 30)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${extraDays === months * 30
                        ? 'border-accent bg-[#fdf6e8] text-[#091124]'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      {months} {months === 1 ? 'Mes' : 'Meses'}
                    </button>
                  ))}
                </div>
              </div>

              {quoteExtensionMutation.isLoading ? (
                <div className="text-center py-4 text-xs font-medium text-slate-400 animate-pulse">
                  Calculando tarifa...
                </div>
              ) : quoteExtensionMutation.data ? (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between font-medium text-slate-500">
                    <span>Precio base por noche</span>
                    <span>${quoteExtensionMutation.data.pricePerNight?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-500">
                    <span>Monto base ({extraDays} días)</span>
                    <span>${quoteExtensionMutation.data.baseAmount?.toLocaleString()}</span>
                  </div>
                  {quoteExtensionMutation.data.extensionFeeTotal > 0 && (
                    <div className="flex justify-between font-medium text-slate-500">
                      <span>Recargo de extensión (${quoteExtensionMutation.data.extensionFeePerNight}/noche)</span>
                      <span>+${quoteExtensionMutation.data.extensionFeeTotal?.toLocaleString()}</span>
                    </div>
                  )}
                  {quoteExtensionMutation.data.discountAmount > 0 && (
                    <div className="flex justify-between font-semibold text-emerald-600">
                      <span>Descuento aplicado</span>
                      <span>-${quoteExtensionMutation.data.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  {quoteExtensionMutation.data.surchargeAmount > 0 && (
                    <div className="flex justify-between font-semibold text-amber-600">
                      <span>Otros recargos aplicados</span>
                      <span>+${quoteExtensionMutation.data.surchargeAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  <hr className="border-slate-200" />
                  <div className="flex justify-between font-bold text-sm text-[#091124]">
                    <span>Total de la extensión</span>
                    <span>${quoteExtensionMutation.data.extensionSubtotal?.toLocaleString()}</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => payExtensionMutation.mutate()}
                disabled={payExtensionMutation.isPending || !quoteExtensionMutation.data}
                className="flex-1 py-2.5 rounded-xl bg-[#091124] text-white text-xs font-bold hover:bg-[#121f3d] transition disabled:opacity-50"
              >
                {payExtensionMutation.isPending ? 'Procesando...' : 'Confirmar y Pagar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {selectedRes && modalType === 'cancel' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-rose-50 text-rose-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#091124]">Cancelar Reserva</h3>
                <p className="text-xs text-slate-400">Proceso de cancelación para R-{selectedRes.id}</p>
              </div>
            </div>

            {quoteCancellationQuery.isLoading ? (
              <div className="text-center py-4 text-xs font-medium text-slate-400 animate-pulse">
                Calculando política de cancelación...
              </div>
            ) : quoteCancellationQuery.data ? (
              <div className="space-y-4">
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-xs space-y-2 text-rose-700 leading-relaxed">
                  <p className="font-semibold flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" />
                    Política de reembolso
                  </p>
                  <p>Monto de la reserva: <strong>${selectedRes.totalAmount.toLocaleString()}</strong></p>
                  <p>Retención por política: <strong>${quoteCancellationQuery.data.penaltyFee?.toLocaleString() ?? '$0'}</strong></p>
                  <p>Reembolso neto estimado: <strong className="text-emerald-700 font-bold">${quoteCancellationQuery.data.refundAmount?.toLocaleString() ?? '$0'}</strong></p>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Al confirmar la cancelación, las fechas bloqueadas se liberarán inmediatamente. El reembolso se procesará a la misma tarjeta de crédito/débito.
                </p>
              </div>
            ) : null}

            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => confirmCancellationMutation.mutate()}
                disabled={confirmCancellationMutation.isPending || !quoteCancellationQuery.data}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition disabled:opacity-50"
              >
                {confirmCancellationMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TenantReservations;
