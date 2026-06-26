import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle, CheckCircle2, Clock, XCircle, MessageSquare,
  Plus, X, User,
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { fineApi } from '../../../api/fineApi';
import { reservationApi } from '../../../api/reservationApi';
import { useLandlordSidebar } from '../../landlord/hooks/useLandlordSidebar';

const INFRACTION_LABELS = {
  NOISE_VIOLATION:    'Ruido excesivo',
  PROPERTY_DAMAGE:    'Daño a la propiedad',
  UNAUTHORIZED_GUEST: 'Huésped no autorizado',
  SMOKING_VIOLATION:  'Política de tabaco',
  PET_VIOLATION:      'Política de mascotas',
  LATE_PAYMENT:       'Pago tardío',
  CURFEW_VIOLATION:   'Toque de queda',
  OTHER:              'Otro',
};

const STATUS_CONFIG = {
  PENDING:   { label: 'Pendiente', color: 'bg-amber-100 text-amber-700',  icon: Clock         },
  PAID:      { label: 'Pagada',    color: 'bg-green-100 text-green-700',  icon: CheckCircle2  },
  OVERDUE:   { label: 'Vencida',   color: 'bg-red-100 text-red-700',      icon: AlertTriangle },
  CANCELLED: { label: 'Cancelada', color: 'bg-slate-100 text-slate-500',  icon: XCircle       },
  DISPUTED:  { label: 'Disputada', color: 'bg-blue-100 text-blue-700',    icon: MessageSquare },
};

const STATUS_OPTIONS = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'DISPUTED'];

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
};

const EMPTY_FORM = { userId: '', infractionType: 'NOISE_VIOLATION', amount: '', description: '' };

const LandlordFines = () => {
  const sidebar = useLandlordSidebar();
  const { landlordId } = sidebar;
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);

  const { data: finesRes, isLoading } = useQuery({
    queryKey: ['all-fines'],
    queryFn: () => fineApi.getAllFines().then((r) => r.data ?? []),
  });

  const { data: tenantsRes } = useQuery({
    queryKey: ['landlord-tenants', landlordId],
    queryFn: () => reservationApi.getLandlordTenants(landlordId).then((r) => r.data ?? []),
    enabled: !!landlordId,
  });

  const inquilinos = (tenantsRes ?? []).filter((u) => u.active !== false);

  const createMutation = useMutation({
    mutationFn: () =>
      fineApi.createFine({
        userId: Number(form.userId),
        infractionType: form.infractionType,
        amount: parseFloat(form.amount),
        description: form.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-fines'] });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setFormError(null);
    },
    onError: (err) => setFormError(err.message ?? 'Error al crear la multa.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ fineId, status }) => fineApi.updateStatus(fineId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-fines'] }),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.userId || !form.amount || !form.description) {
      setFormError('Completa todos los campos requeridos.');
      return;
    }
    createMutation.mutate();
  };

  const fines = finesRes ?? [];

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items.map((i) => ({ ...i, active: i.id === 'fines' }))}
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
      />
      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <div className="w-full max-w-5xl mx-auto">

          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Gestión</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary">
                Multas y <span className="font-serif italic font-normal text-accent">sanciones</span>
              </h1>
              <p className="mt-1 text-sm text-slate-400">Emite y gestiona multas por infracciones de los inquilinos.</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setFormError(null); }}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Nueva multa
            </button>
          </div>

          {/* Create fine form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-primary">Emitir nueva multa</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Inquilino</label>
                  <select
                    value={form.userId}
                    onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                    required
                  >
                    <option value="">Seleccionar inquilino...</option>
                    {inquilinos.map((u) => (
                      <option key={u.id} value={u.id}>{u.fullName} — {u.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de infracción</label>
                  <select
                    value={form.infractionType}
                    onChange={(e) => setForm((f) => ({ ...f, infractionType: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                  >
                    {Object.entries(INFRACTION_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Monto ($)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Detalle la infracción..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                    required
                  />
                </div>

                {formError && (
                  <p className="sm:col-span-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                <div className="sm:col-span-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {createMutation.isPending ? 'Emitiendo...' : 'Emitir multa'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : fines.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm">No hay multas registradas.</div>
          ) : (
            <div className="space-y-3">
              {fines.map((fine) => (
                <div key={fine.fineId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-primary">
                          {INFRACTION_LABELS[fine.infractionType] ?? fine.infractionType}
                        </p>
                        <StatusBadge status={fine.status} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                        <User className="h-3 w-3" /> {fine.userFullName ?? '—'}
                      </div>
                      <p className="text-sm text-slate-500">{fine.description}</p>
                      <p className="mt-2 text-xs text-slate-400">Infracción: {formatDate(fine.infractionDate)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <p className="text-xl font-bold text-primary">${Number(fine.amount).toFixed(2)}</p>
                      <select
                        value={fine.status}
                        onChange={(e) => statusMutation.mutate({ fineId: fine.fineId, status: e.target.value })}
                        disabled={statusMutation.isPending}
                        className="text-xs rounded-lg border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent/30 bg-white disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default LandlordFines;
