import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Inbox } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { useTenantSidebar } from '../../checkout/hooks/useTenantSidebar';
import FeedbackModal from '../../../components/ui/FeedbackModal';
import { maintenanceApi } from '../../../api/maintenanceApi';
import { reservationApi } from '../../../api/reservationApi';
import { useStore } from '../../../store/useStore';
import TicketCard from '../../maintenance/components/TicketCard';
import { TICKET_PRIORITY_LABELS } from '../../maintenance/constants/ticketStatus';

const TenantMaintenance = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tenantId = useStore((s) => s.user?.id);
  const sidebar = useTenantSidebar();
  const [showForm, setShowForm] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [photos, setPhotos] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const { data: reservationsRes } = useQuery({
    queryKey: ['tenant-reservations', tenantId],
    queryFn: () => reservationApi.getTenantReservations(tenantId).then((r) => r.data ?? r ?? []),
    enabled: !!tenantId,
  });

  const { data: ticketsRes, isLoading, isError, refetch } = useQuery({
    queryKey: ['tenant-tickets', tenantId],
    queryFn: () => maintenanceApi.getByTenant(tenantId).then((r) => r.data ?? []),
    enabled: !!tenantId,
  });

  const properties = useMemo(() => {
    const map = new Map();
    (reservationsRes ?? []).forEach((r) => {
      if (r.propertyId && !map.has(r.propertyId)) {
        map.set(r.propertyId, { id: r.propertyId, title: r.propertyTitle ?? `Propiedad #${r.propertyId}` });
      }
    });
    return [...map.values()];
  }, [reservationsRes]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await maintenanceApi.createTicket(tenantId, {
        propertyId: Number(propertyId),
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      });
      const ticket = res.data;
      for (const file of photos) {
        await maintenanceApi.uploadPhoto(ticket.id, file);
      }
      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-tickets'] });
      setShowForm(false);
      setPropertyId('');
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setPhotos([]);
      setFeedback({
        variant: 'success',
        title: 'Incidencia reportada',
        message: 'Tu ticket fue creado. El arrendador lo revisará pronto.',
      });
    },
    onError: (err) => {
      setFeedback({
        variant: 'error',
        title: 'Error al reportar',
        message: err?.message || 'No se pudo crear el ticket.',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!propertyId || !title.trim()) return;
    createMutation.mutate();
  };


  const tickets = ticketsRes ?? [];

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items.map((i) => ({ ...i, active: i.id === 'mantenimiento' }))}
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
      />

      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">Inquilino</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">
              Reportar <span className="font-serif italic font-normal text-accent">incidencias</span>
            </h1>
            <p className="text-sm text-slate-500">Describe el problema y adjunta fotos del daño.</p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo reporte
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Propiedad</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                >
                  <option value="">Selecciona una propiedad</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                {properties.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">Necesitas al menos una reserva para reportar incidencias.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                  placeholder="Ej. Fuga en el baño"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detalla el problema..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Urgencia</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                >
                  {Object.entries(TICKET_PRIORITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fotos del daño</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => setPhotos([...e.target.files])}
                  className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={createMutation.isPending || !propertyId || !title.trim()}
                  className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Enviando...' : 'Enviar reporte'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {isLoading && (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-36 bg-white border border-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-12">
              <p className="text-sm text-slate-600">No se pudieron cargar tus tickets.</p>
              <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-accent hover:underline">
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !isError && tickets.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No tienes incidencias reportadas.</p>
            </div>
          )}

          {!isLoading && !isError && tickets.length > 0 && (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} mode="tenant" />
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

export default TenantMaintenance;
