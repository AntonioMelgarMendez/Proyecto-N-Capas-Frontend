import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, CheckCircle2, Clock, Loader, X, CalendarDays } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { preventiveApi } from '../../../api/preventiveApi';
import { propertyApi } from '../../../api/propertyApi';
import { useLandlordSidebar } from '../hooks/useLandlordSidebar';

const STATUS_CONFIG = {
  PENDING:     { label: 'Pendiente',   color: 'bg-amber-100 text-amber-700',  icon: Clock        },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-blue-100 text-blue-700',    icon: Loader       },
  DONE:        { label: 'Completada',  color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  CANCELLED:   { label: 'Cancelada',   color: 'bg-slate-100 text-slate-500',  icon: X            },
};

const STATUS_OPTIONS = Object.keys(STATUS_CONFIG);

const formatDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const isOverdue = (dateStr, status) => {
  if (status === 'DONE' || status === 'CANCELLED') return false;
  return new Date(dateStr + 'T00:00:00') < new Date();
};

const EMPTY_FORM = { propertyId: '', title: '', description: '', scheduledDate: '' };

const LandlordPreventive = () => {
  const sidebar = useLandlordSidebar();
  const { landlordId } = sidebar;
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);

  const { data: tasksRes, isLoading } = useQuery({
    queryKey: ['preventive-tasks', landlordId],
    queryFn: () => preventiveApi.getByLandlord(landlordId).then((r) => r.data ?? []),
    enabled: !!landlordId,
  });

  const { data: propsRes } = useQuery({
    queryKey: ['properties', 'landlord', landlordId],
    queryFn: () => propertyApi.getByLandlord(landlordId).then((r) => r.data ?? []),
    enabled: !!landlordId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      preventiveApi.create({
        propertyId: Number(form.propertyId),
        title: form.title,
        description: form.description || undefined,
        scheduledDate: form.scheduledDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventive-tasks', landlordId] });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setFormError(null);
    },
    onError: (err) => setFormError(err.message ?? 'Error al crear la tarea.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => preventiveApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['preventive-tasks', landlordId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => preventiveApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['preventive-tasks', landlordId] }),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.propertyId || !form.title || !form.scheduledDate) {
      setFormError('Propiedad, título y fecha son requeridos.');
      return;
    }
    createMutation.mutate();
  };

  const tasks = tasksRes ?? [];
  const properties = propsRes ?? [];
  const upcoming = tasks.filter((t) => t.status !== 'DONE' && t.status !== 'CANCELLED');
  const completed = tasks.filter((t) => t.status === 'DONE' || t.status === 'CANCELLED');

  const TaskCard = ({ task }) => {
    const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.PENDING;
    const Icon = cfg.icon;
    const overdue = isOverdue(task.scheduledDate, task.status);

    return (
      <div className={`bg-white rounded-2xl border shadow-sm p-5 ${overdue ? 'border-red-200' : 'border-slate-100'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-semibold text-primary">{task.title}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                <Icon className="h-3 w-3" /> {cfg.label}
              </span>
              {overdue && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Vencida</span>
              )}
            </div>
            <p className="text-xs text-accent font-medium mb-1">{task.propertyTitle}</p>
            {task.description && <p className="text-sm text-slate-500">{task.description}</p>}
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
              <CalendarDays className="h-3 w-3" />
              {formatDate(task.scheduledDate)}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <select
              value={task.status}
              onChange={(e) => statusMutation.mutate({ id: task.id, status: e.target.value })}
              disabled={statusMutation.isPending}
              className="text-xs rounded-lg border border-slate-200 px-2 py-1 focus:outline-none bg-white disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <button
              onClick={() => deleteMutation.mutate(task.id)}
              disabled={deleteMutation.isPending}
              className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items}
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
      />
      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <div className="w-full max-w-5xl mx-auto">

          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Gestión</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary">
                Mantenimiento <span className="font-serif italic font-normal text-accent">preventivo</span>
              </h1>
              <p className="mt-1 text-sm text-slate-400">Programa revisiones periódicas para tus propiedades.</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setFormError(null); }}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Nueva tarea
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-primary">Programar tarea</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Propiedad</label>
                  <select
                    value={form.propertyId}
                    onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                    required
                  >
                    <option value="">Seleccionar propiedad...</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha programada</label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Título</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Ej: Revisión eléctrica trimestral"
                    maxLength={120}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Descripción (opcional)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    maxLength={500}
                    placeholder="Detalles de la revisión..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                  />
                </div>

                {formError && (
                  <p className="sm:col-span-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                <div className="sm:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {createMutation.isPending ? 'Guardando...' : 'Guardar tarea'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm">No hay tareas programadas.</div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Próximas ({upcoming.length})
                  </h2>
                  <div className="space-y-3">
                    {upcoming.map((t) => <TaskCard key={t.id} task={t} />)}
                  </div>
                </div>
              )}
              {completed.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Historial ({completed.length})
                  </h2>
                  <div className="space-y-3 opacity-70">
                    {completed.map((t) => <TaskCard key={t.id} task={t} />)}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default LandlordPreventive;
