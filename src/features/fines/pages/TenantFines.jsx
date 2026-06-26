import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock, XCircle, MessageSquare } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { fineApi } from '../../../api/fineApi';
import { useTenantSidebar } from '../../checkout/hooks/useTenantSidebar';

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

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const TenantFines = () => {
  const sidebar = useTenantSidebar();

  const { data: finesRes, isLoading } = useQuery({
    queryKey: ['my-fines'],
    queryFn: () => fineApi.getMyFines().then((r) => r.data ?? []),
  });

  const fines = finesRes ?? [];
  const pending = fines.filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE');

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items.map((i) => ({ ...i, active: i.id === 'multas' }))}
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
        onMobileOpenChange={sidebar.setIsMobileMenuOpen}
      />
      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <div className="w-full max-w-4xl mx-auto">

          <div className="mb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Mi cuenta</span>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary">
              Mis <span className="font-serif italic font-normal text-accent">multas</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">Infracciones y penalizaciones registradas en tu cuenta.</p>
          </div>

          {pending.length > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Tienes {pending.length} multa{pending.length > 1 ? 's' : ''} pendiente{pending.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Total adeudado: ${pending.reduce((s, f) => s + Number(f.amount ?? 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : fines.length === 0 ? (
            <div className="text-center py-20">
              <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Sin multas registradas</p>
              <p className="text-sm text-slate-400 mt-1">Tu cuenta está al día.</p>
            </div>
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
                      <p className="text-sm text-slate-500 mt-1">{fine.description}</p>
                      <div className="flex gap-4 mt-3 text-xs text-slate-400">
                        <span>Infracción: {formatDate(fine.infractionDate)}</span>
                        <span>Emitida por: {fine.generatedByFullName ?? '—'}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-primary">${Number(fine.amount).toFixed(2)}</p>
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

export default TenantFines;
