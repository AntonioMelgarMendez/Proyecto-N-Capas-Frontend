import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import FeedbackModal from '../../../components/ui/FeedbackModal';
import { maintenanceApi } from '../../../api/maintenanceApi';
import { useLandlordSidebar } from '../hooks/useLandlordSidebar';
import TicketCard from '../../maintenance/components/TicketCard';

const TABS = [
  { id: null, label: 'Todos' },
  { id: 'OPEN', label: 'Abiertos' },
  { id: 'IN_PROGRESS', label: 'En progreso' },
  { id: 'RESOLVED', label: 'Resueltos' },
];

const LandlordTickets = () => {
  const sidebar = useLandlordSidebar();
  const { landlordId } = sidebar;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['landlord-tickets', landlordId, activeTab],
    queryFn: () =>
      maintenanceApi.getByLandlord(landlordId, activeTab).then((r) => r.data ?? []),
    enabled: !!landlordId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, status }) =>
      maintenanceApi.updateStatus(ticketId, status, landlordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-tickets'] });
      setUpdatingId(null);
      setFeedback({ variant: 'success', title: 'Estado actualizado', message: 'El ticket fue actualizado correctamente.' });
    },
    onError: (err) => {
      setUpdatingId(null);
      setFeedback({
        variant: 'error',
        title: 'Error',
        message: err?.message || 'No se pudo actualizar el ticket.',
      });
    },
  });

  const handleStatusChange = (ticketId, status) => {
    setUpdatingId(ticketId);
    statusMutation.mutate({ ticketId, status });
  };

  const tickets = data ?? [];

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
              Tickets de <span className="font-serif italic font-normal text-accent">mantenimiento</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Gestiona las incidencias reportadas por tus inquilinos.</p>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {TABS.map((tab) => (
              <button
                key={tab.label}
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
              <p className="text-sm text-slate-600">No se pudieron cargar los tickets.</p>
              <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-accent hover:underline">
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !isError && tickets.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No hay tickets en esta categoría.</p>
            </div>
          )}

          {!isLoading && !isError && tickets.length > 0 && (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  mode="landlord"
                  onStatusChange={handleStatusChange}
                  updatingId={updatingId}
                />
              ))}
            </div>
          )}
        </div>
      </main>

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

export default LandlordTickets;
