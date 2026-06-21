import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { LayoutGrid, Search, Calendar, Key, Wrench } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import FeedbackModal from '../../../components/ui/FeedbackModal';
import { reservationApi } from '../../../api/reservationApi';
import { paymentsApi } from '../../../api/paymentsApi';
import { reviewApi } from '../../../api/reviewApi';
import { propertyApi } from '../../../api/propertyApi';
import { MOCK_TENANT_ID } from '../../checkout/constants';
import { canTenantReview, isReviewEligibleStatus } from '../constants/reviewEligibility';
import { getActiveExtensionRequest } from '../constants/extensionStatus';
import { useExtensionCheckout } from '../hooks/useExtensionCheckout';
import { useReservationCheckout } from '../hooks/useReservationCheckout';
import TenantReservationCard from '../components/TenantReservationCard';
import ExtendStayModal from '../components/ExtendStayModal';
import CancelReservationModal from '../components/CancelReservationModal';
import SubmitReviewModal from '../components/SubmitReviewModal';

const TenantReservations = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Todas');
  const [selectedRes, setSelectedRes] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [extraDays, setExtraDays] = useState(30);
  const [visiblePins, setVisiblePins] = useState({});
  const [pendingPaymentId, setPendingPaymentId] = useState(null);
  const [pendingCancelCheckoutId, setPendingCancelCheckoutId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [confirmCancelCheckoutId, setConfirmCancelCheckoutId] = useState(null);

  const reservationCheckout = useReservationCheckout();
  const extensionCheckout = useExtensionCheckout();

  const { data: reservationsRes, isLoading, error } = useQuery({
    queryKey: ['tenant-reservations', MOCK_TENANT_ID],
    queryFn: () => reservationApi.getTenantReservations(MOCK_TENANT_ID).then((r) => r.data ?? r ?? []),
  });

  const reservations = reservationsRes ?? [];

  const extendableIds = useMemo(
    () => reservations.filter((r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN').map((r) => r.id),
    [reservations],
  );

  const reviewablePropertyIds = useMemo(
    () => [...new Set(reservations.filter((r) => isReviewEligibleStatus(r.status)).map((r) => r.propertyId))],
    [reservations],
  );

  const reviewQueries = useQueries({
    queries: reviewablePropertyIds.map((propertyId) => ({
      queryKey: ['reviews', 'property', propertyId],
      queryFn: () => reviewApi.getByProperty(propertyId).then((r) => r.data ?? []),
      enabled: !!propertyId,
    })),
  });

  const reviewedReservationIds = useMemo(() => {
    const ids = new Set();
    reviewQueries.forEach((query) => {
      (query.data ?? []).forEach((review) => {
        if (review.reviewerId === MOCK_TENANT_ID && review.reservationId) {
          ids.add(review.reservationId);
        }
      });
    });
    return ids;
  }, [reviewQueries]);

  const extensionQueries = useQueries({
    queries: extendableIds.map((id) => ({
      queryKey: ['extension-requests', id],
      queryFn: () => reservationApi.getExtensionRequests(id).then((r) => r.data ?? []),
      enabled: !!id,
    })),
  });

  const extensionByReservationId = useMemo(() => {
    const map = {};
    extendableIds.forEach((id, index) => {
      map[id] = extensionQueries[index]?.data ?? [];
    });
    return map;
  }, [extendableIds, extensionQueries]);

  const reviewPropertyQuery = useQuery({
    queryKey: ['property', selectedRes?.propertyId],
    queryFn: () => propertyApi.getById(selectedRes.propertyId).then((r) => r.data),
    enabled: !!selectedRes && modalType === 'review' && !!selectedRes.propertyId,
  });

  const quoteExtensionQuery = useQuery({
    queryKey: ['extend-quote', selectedRes?.id, extraDays],
    queryFn: () => reservationApi.extendQuote(selectedRes.id, extraDays).then((r) => r.data ?? r),
    enabled: !!selectedRes && modalType === 'extend' && extraDays > 0,
  });

  const requestExtensionMutation = useMutation({
    mutationFn: ({ reservationId, extraDays: days }) => reservationApi.extendRequest(reservationId, days),
    onSuccess: (_, { reservationId }) => {
      queryClient.invalidateQueries({ queryKey: ['extension-requests', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-reservations'] });
      setFeedback({
        variant: 'success',
        title: 'Solicitud enviada',
        message: 'Tu solicitud de extensión fue enviada. Espera la aprobación del arrendador.',
      });
    },
    onError: (err) => {
      setFeedback({
        variant: 'error',
        title: 'Error al enviar solicitud',
        message: err?.message || 'No se pudo enviar la solicitud de extensión.',
      });
    },
  });

  const quoteCancellationQuery = useQuery({
    queryKey: ['cancel-quote', selectedRes?.id],
    queryFn: () => reservationApi.cancelQuote(selectedRes.id).then((r) => r.data ?? r),
    enabled: !!selectedRes && modalType === 'cancel',
  });

  const confirmCancellationMutation = useMutation({
    mutationFn: () => reservationApi.cancelConfirm(selectedRes.id),
    onSuccess: (res) => {
      const data = res?.data ?? res;
      queryClient.invalidateQueries({ queryKey: ['tenant-reservations'] });
      closeModal();
      const refunded = data?.amountRefunded;
      setFeedback({
        variant: 'success',
        title: 'Reserva cancelada',
        message: refunded != null
          ? `Reembolso procesado: $${Number(refunded).toLocaleString()}`
          : 'Tu reserva fue cancelada exitosamente.',
      });
    },
    onError: (err) => {
      setFeedback({
        variant: 'error',
        title: 'Error al cancelar',
        message: err?.message || 'No se pudo cancelar la reserva.',
      });
    },
  });

  const cancelCheckoutMutation = useMutation({
    mutationFn: (reservationId) => paymentsApi.cancelCheckout(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-reservations'] });
      setPendingCancelCheckoutId(null);
      setConfirmCancelCheckoutId(null);
      setFeedback({
        variant: 'success',
        title: 'Checkout cancelado',
        message: 'El pago pendiente fue cancelado y las fechas quedaron liberadas.',
      });
    },
    onError: (err) => {
      setPendingCancelCheckoutId(null);
      setConfirmCancelCheckoutId(null);
      setFeedback({
        variant: 'error',
        title: 'Error al cancelar checkout',
        message: err?.message || 'No se pudo cancelar el checkout.',
      });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: ({ rating, comment }) => {
      const landlordId = reviewPropertyQuery.data?.landlordId;
      if (!landlordId) throw new Error('No se pudo obtener el arrendador de la propiedad.');
      if (!isReviewEligibleStatus(selectedRes?.status)) {
        throw new Error('Esta reserva aún no puede reseñarse.');
      }
      if (reviewedReservationIds.has(selectedRes.id)) throw new Error('Ya enviaste una reseña para esta reserva.');

      return reviewApi.create({
        propertyId: selectedRes.propertyId,
        reservationId: selectedRes.id,
        reviewerId: MOCK_TENANT_ID,
        revieweeId: landlordId,
        reviewType: 'TENANT_TO_LANDLORD',
        rating,
        comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      closeModal();
      setFeedback({
        variant: 'success',
        title: 'Reseña publicada',
        message: 'Gracias por compartir tu experiencia.',
      });
    },
    onError: (err) => {
      setFeedback({
        variant: 'error',
        title: 'Error al publicar',
        message: err?.message || 'No se pudo enviar la reseña.',
      });
    },
  });

  const closeModal = () => {
    setSelectedRes(null);
    setModalType(null);
    setExtraDays(30);
  };

  const handleSubmitExtensionRequest = () => {
    if (!selectedRes) return;
    const payload = { reservationId: selectedRes.id, extraDays };
    closeModal();
    requestExtensionMutation.mutate(payload);
  };

  const handleConfirmCancelCheckout = () => {
    if (!confirmCancelCheckoutId) return;
    setPendingCancelCheckoutId(confirmCancelCheckoutId);
    cancelCheckoutMutation.mutate(confirmCancelCheckoutId);
  };

  const handleOpenReview = (res) => {
    if (!canTenantReview(res, reviewedReservationIds)) {
      setFeedback({
        variant: 'info',
        title: 'Reseña no disponible',
        message: !isReviewEligibleStatus(res.status)
          ? 'Esta reserva aún no puede reseñarse.'
          : 'Ya enviaste una reseña para esta reserva.',
      });
      return;
    }
    setSelectedRes(res);
    setModalType('review');
  };

  const handleSubmitReview = ({ rating, comment }) => {
    submitReviewMutation.mutate({ rating, comment });
  };

  const filterReservations = (list) => {
    if (activeTab === 'Todas') return list;
    if (activeTab === 'Activas') return list.filter((r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN');
    if (activeTab === 'Pendientes') return list.filter((r) => r.status === 'PENDING' || r.status === 'PENDING_PAYMENT');
    if (activeTab === 'Finalizadas') return list.filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED');
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

  const handleCompletePayment = (reservationId) => {
    setPendingPaymentId(reservationId);
    reservationCheckout.mutate(reservationId, {
      onSettled: () => setPendingPaymentId(null),
    });
  };

  const handlePayExtension = (extensionRequestId) => {
    extensionCheckout.mutate(extensionRequestId);
  };

  const selectedExtensionRequests = selectedRes ? extensionByReservationId[selectedRes.id] ?? [] : [];
  const selectedActiveExtension = getActiveExtensionRequest(selectedExtensionRequests);

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800">
      <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <main className={`transition-all duration-300 p-6 md:p-8 ml-0 pt-16 lg:pt-8 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase font-sans">Reservas</span>
            <h1 className="text-3xl font-extrabold text-[#091124]">
              Mis <span className="font-serif italic font-normal text-accent lowercase">reservas</span>
            </h1>
            <p className="text-slate-500 text-sm">Gestiona, extiende o cancela tus estancias.</p>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {['Todas', 'Activas', 'Pendientes', 'Finalizadas'].map((tab) => (
              <button
                key={tab}
                type="button"
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
                type="button"
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
                  extensionRequests={extensionByReservationId[res.id] ?? []}
                  isPinVisible={!!visiblePins[res.id]}
                  onTogglePin={(id) => setVisiblePins((prev) => ({ ...prev, [id]: !prev[id] }))}
                  onExtend={(r) => { setSelectedRes(r); setModalType('extend'); }}
                  onCancel={(r) => { setSelectedRes(r); setModalType('cancel'); }}
                  onDownloadContract={() => setFeedback({
                    variant: 'info',
                    title: 'Próximamente',
                    message: 'La descarga del contrato en PDF estará disponible pronto.',
                  })}
                  onCompletePayment={handleCompletePayment}
                  onCancelCheckout={setConfirmCancelCheckoutId}
                  onPayExtension={handlePayExtension}
                  onReview={handleOpenReview}
                  hasReviewed={reviewedReservationIds.has(res.id)}
                  isPaymentPending={pendingPaymentId === res.id && reservationCheckout.isPending}
                  isCancelCheckoutPending={pendingCancelCheckoutId === res.id && cancelCheckoutMutation.isPending}
                  isPayExtensionPending={extensionCheckout.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ExtendStayModal
        isOpen={!!selectedRes && modalType === 'extend'}
        onClose={closeModal}
        reservation={selectedRes}
        extraDays={extraDays}
        setExtraDays={setExtraDays}
        quoteQuery={quoteExtensionQuery}
        activeExtensionRequest={selectedActiveExtension}
        onSubmitRequest={handleSubmitExtensionRequest}
        isSubmittingRequest={requestExtensionMutation.isPending}
        payExtensionMutation={extensionCheckout}
      />

      <CancelReservationModal
        isOpen={!!selectedRes && modalType === 'cancel'}
        onClose={closeModal}
        reservation={selectedRes}
        quoteQuery={quoteCancellationQuery}
        confirmMutation={confirmCancellationMutation}
      />

      <SubmitReviewModal
        key={selectedRes?.id ?? 'review'}
        isOpen={!!selectedRes && modalType === 'review'}
        onClose={closeModal}
        reservation={selectedRes}
        landlordId={reviewPropertyQuery.data?.landlordId}
        isLoadingLandlord={reviewPropertyQuery.isLoading}
        onSubmit={handleSubmitReview}
        isPending={submitReviewMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!confirmCancelCheckoutId}
        title="Cancelar checkout"
        message="Se liberará el calendario de la propiedad y la reserva pendiente de pago quedará cancelada."
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        variant="danger"
        isPending={cancelCheckoutMutation.isPending}
        onConfirm={handleConfirmCancelCheckout}
        onCancel={() => setConfirmCancelCheckoutId(null)}
      />

      <FeedbackModal
        isOpen={!!feedback}
        title={feedback?.title}
        message={feedback?.message}
        variant={feedback?.variant}
        onClose={() => setFeedback(null)}
      />
    </div>
  );
};

export default TenantReservations;
