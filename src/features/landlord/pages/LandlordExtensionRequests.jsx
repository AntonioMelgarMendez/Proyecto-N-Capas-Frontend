import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import FeedbackModal from '../../../components/ui/FeedbackModal';
import { reservationApi } from '../../../api/reservationApi';
import { useLandlordSidebar } from '../hooks/useLandlordSidebar';
import ExtensionRequestCard from '../components/ExtensionRequestCard';

const TABS = [
  { id: 'PENDING', label: 'Pendientes' },
  { id: 'APPROVED', label: 'Aprobadas' },
  { id: 'history', label: 'Historial' },
];

const LandlordExtensionRequests = () => {
  const sidebar = useLandlordSidebar();
  const { landlordId } = sidebar;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [actionId, setActionId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const statusFilter = activeTab === 'history' ? null : activeTab;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['landlord-extension-requests', landlordId, statusFilter],
    queryFn: () =>
      reservationApi.getLandlordExtensionRequests(landlordId, statusFilter).then((r) => r.data ?? []),
    enabled: !!landlordId,
  });

  const requests = (data ?? []).filter((req) => {
    if (activeTab !== 'history') return true;
    return req.status === 'PAID' || req.status === 'REJECTED' || req.status === 'EXPIRED';
  });

  const approveMutation = useMutation({
    mutationFn: (requestId) => reservationApi.approveExtension(requestId, landlordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-extension-requests'] });
      setActionId(null);
      setConfirmAction(null);
      setFeedback({
        variant: 'success',
        title: 'Solicitud aprobada',
        message: 'El inquilino ya puede pagar la extensión desde sus reservas.',
      });
    },
    onError: (err) => {
      setActionId(null);
      setConfirmAction(null);
      setFeedback({
        variant: 'error',
        title: 'Error al aprobar',
        message: err?.message || 'No se pudo aprobar la solicitud.',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId) => reservationApi.rejectExtension(requestId, landlordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-extension-requests'] });
      setActionId(null);
      setConfirmAction(null);
      setFeedback({
        variant: 'success',
        title: 'Solicitud rechazada',
        message: 'La extensión fue rechazada y el inquilino será notificado al revisar sus reservas.',
      });
    },
    onError: (err) => {
      setActionId(null);
      setConfirmAction(null);
      setFeedback({
        variant: 'error',
        title: 'Error al rechazar',
        message: err?.message || 'No se pudo rechazar la solicitud.',
      });
    },
  });

  const handleApprove = (requestId) => {
    setConfirmAction({ type: 'approve', requestId });
  };

  const handleReject = (requestId) => {
    setConfirmAction({ type: 'reject', requestId });
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    setActionId(confirmAction.requestId);
    if (confirmAction.type === 'approve') {
      approveMutation.mutate(confirmAction.requestId);
    } else {
      rejectMutation.mutate(confirmAction.requestId);
    }
  };

  const isConfirmPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items}
        role="PROPIETARIO"
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
      />

      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Arrendador</span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-primary">
              Solicitudes de <span className="font-serif italic font-normal text-accent">extensión</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Aprueba o rechaza extensiones de estadía de tus inquilinos.</p>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-40 bg-white border border-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-12">
              <p className="text-sm text-slate-600">No se pudieron cargar las solicitudes.</p>
              <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-accent hover:underline">
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !isError && requests.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No hay solicitudes en esta categoría.</p>
            </div>
          )}

          {!isLoading && !isError && requests.length > 0 && (
            <div className="space-y-4">
              {requests.map((request) => (
                <ExtensionRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isApproving={actionId === request.id && confirmAction?.type === 'approve' && approveMutation.isPending}
                  isRejecting={actionId === request.id && confirmAction?.type === 'reject' && rejectMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'approve' ? 'Aprobar extensión' : 'Rechazar extensión'}
        message={
          confirmAction?.type === 'approve'
            ? 'El inquilino podrá pagar la extensión una vez aprobada.'
            : 'Esta acción rechazará la solicitud de extensión del inquilino.'
        }
        confirmLabel={confirmAction?.type === 'approve' ? 'Aprobar' : 'Rechazar'}
        cancelLabel="Cancelar"
        variant={confirmAction?.type === 'reject' ? 'danger' : 'default'}
        isPending={isConfirmPending}
        onConfirm={handleConfirmAction}
        onCancel={() => !isConfirmPending && setConfirmAction(null)}
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

export default LandlordExtensionRequests;
