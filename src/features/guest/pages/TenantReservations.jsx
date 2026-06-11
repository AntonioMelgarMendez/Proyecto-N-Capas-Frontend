import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Search, Calendar, Key, Wrench } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { reservationApi } from '../../../api/reservationApi';
import { MOCK_TENANT_ID } from '../../checkout/constants';

// Modular Sub-components
import TenantReservationCard from '../components/TenantReservationCard';
import ExtendStayModal from '../components/ExtendStayModal';
import CancelReservationModal from '../components/CancelReservationModal';

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

  // Extension Query
  const quoteExtensionMutation = useQuery({
    queryKey: ['extend-quote', selectedRes?.id, extraDays],
    queryFn: () => reservationApi.extendQuote(selectedRes.id, extraDays).then((r) => r.data ?? r),
    enabled: !!selectedRes && modalType === 'extend' && extraDays > 0,
  });

  // Extension Action
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

  // Cancellation Query
  const quoteCancellationQuery = useQuery({
    queryKey: ['cancel-quote', selectedRes?.id],
    queryFn: () => reservationApi.cancelQuote(selectedRes.id).then((r) => r.data ?? r),
    enabled: !!selectedRes && modalType === 'cancel',
  });

  // Cancellation Action
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

  const filterReservations = (list) => {
    if (activeTab === 'Todas') return list;
    if (activeTab === 'Activas') return list.filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN');
    if (activeTab === 'Pendientes') return list.filter(r => r.status === 'PENDING' || r.status === 'PENDING_PAYMENT');
    if (activeTab === 'Finalizadas') return list.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED');
    return list;
  };

  const sidebarItems = [
    { id: 'inicio', label: 'Inicio', icon: LayoutGrid, action: () => navigate('/guest') },
    { id: 'catalogo', label: 'Catálogo', icon: Search, action: () => navigate('/tenant/catalog') },
    { id: 'reservas', label: 'Mis Reservas', icon: Calendar, active: true, action: () => navigate('/tenant/reservations') },
    { id: 'llave', label: 'Mi Llave', icon: Key, action: () => navigate('/tenant/key') },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench, action: () => navigate('/tenant/maintenance') },
  ];

  const filteredList = filterReservations(reservations);

  const handleOpenExtend = (res) => {
    setSelectedRes(res);
    setModalType('extend');
  };

  const handleOpenCancel = (res) => {
    setSelectedRes(res);
    setModalType('cancel');
  };

  const handleDownloadContract = (res) => {
    alert(`Descargando contrato en formato PDF para la reserva R-${res.id}...`);
  };

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

          {/* Tabs Filter Bar */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {['Todas', 'Activas', 'Pendientes', 'Finalizadas'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab
                    ? 'bg-[#091124] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#091124]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List Content */}
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
              {filteredList.map((res) => (
                <TenantReservationCard
                  key={res.id}
                  res={res}
                  isPinVisible={!!visiblePins[res.id]}
                  onTogglePin={togglePin}
                  onExtend={handleOpenExtend}
                  onCancel={handleOpenCancel}
                  onDownloadContract={handleDownloadContract}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Extension Stay Modal overlay */}
      <ExtendStayModal
        isOpen={selectedRes && modalType === 'extend'}
        onClose={closeModal}
        reservation={selectedRes}
        extraDays={extraDays}
        setExtraDays={setExtraDays}
        quoteQuery={quoteExtensionMutation}
        payMutation={payExtensionMutation}
      />

      {/* Cancellation Modal overlay */}
      <CancelReservationModal
        isOpen={selectedRes && modalType === 'cancel'}
        onClose={closeModal}
        reservation={selectedRes}
        quoteQuery={quoteCancellationQuery}
        confirmMutation={confirmCancellationMutation}
      />

    </div>
  );
};

export default TenantReservations;
