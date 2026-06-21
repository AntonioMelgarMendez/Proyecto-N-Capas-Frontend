import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../../../components/layout/Sidebar';
import { analyticsApi } from '../../../api/analyticsApi';
import { useLandlordSidebar, MOCK_LANDLORD_ID } from '../hooks/useLandlordSidebar';

const toIsoDate = (date) => date.toISOString().split('T')[0];

const defaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { start: toIsoDate(start), end: toIsoDate(end) };
};

const MetricBar = ({ label, value, max, color = 'bg-accent' }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 truncate">{label}</span>
        <span className="font-semibold text-primary ml-2">{typeof value === 'number' ? value.toLocaleString('es-ES') : value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const LandlordAnalytics = () => {
  const sidebar = useLandlordSidebar();
  const initial = defaultRange();
  const [startDate, setStartDate] = useState(initial.start);
  const [endDate, setEndDate] = useState(initial.end);

  const { data: occupancyRes, isLoading: occLoading, isError: occError, refetch: refetchOcc } = useQuery({
    queryKey: ['analytics-occupancy', MOCK_LANDLORD_ID, startDate, endDate],
    queryFn: () => analyticsApi.getOccupancyByLandlord(MOCK_LANDLORD_ID, startDate, endDate).then((r) => r.data ?? []),
    enabled: !!startDate && !!endDate,
  });

  const { data: maintenanceRes, isLoading: maintLoading, isError: maintError, refetch: refetchMaint } = useQuery({
    queryKey: ['analytics-maintenance', MOCK_LANDLORD_ID, startDate, endDate],
    queryFn: () => analyticsApi.getMaintenanceByLandlord(MOCK_LANDLORD_ID, startDate, endDate).then((r) => r.data ?? []),
    enabled: !!startDate && !!endDate,
  });

  const occupancy = occupancyRes ?? [];
  const maintenance = maintenanceRes ?? [];

  const summary = useMemo(() => {
    const totalRevenue = occupancy.reduce((s, m) => s + (parseFloat(m.totalRevenue) || 0), 0);
    const avgOccupancy = occupancy.length
      ? occupancy.reduce((s, m) => s + (parseFloat(m.occupancyPercentage) || 0), 0) / occupancy.length
      : 0;
    const totalTickets = maintenance.reduce((s, m) => s + (m.totalTickets || 0), 0);
    return { totalRevenue, avgOccupancy, totalTickets };
  }, [occupancy, maintenance]);

  const maxRevenue = Math.max(...occupancy.map((m) => parseFloat(m.totalRevenue) || 0), 1);
  const isLoading = occLoading || maintLoading;
  const isError = occError || maintError;

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items}
        role="PROPIETARIO"
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
      />

      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Arrendador</span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-primary">
              Analítica de <span className="font-serif italic font-normal text-accent">negocio</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Ocupación, ingresos y tickets de mantenimiento por propiedad.</p>
          </div>

          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>

          {!isLoading && !isError && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Ingresos totales</p>
                <p className="text-2xl font-bold text-primary mt-1">${summary.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 0 })}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Ocupación promedio</p>
                <p className="text-2xl font-bold text-primary mt-1">{summary.avgOccupancy.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Tickets en periodo</p>
                <p className="text-2xl font-bold text-primary mt-1">{summary.totalTickets}</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 bg-white border border-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600">No se pudieron cargar las métricas.</p>
              <button
                type="button"
                onClick={() => { refetchOcc(); refetchMaint(); }}
                className="mt-3 text-sm font-semibold text-accent hover:underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-primary">Ocupación e ingresos por propiedad</h2>
                </div>
                {occupancy.length === 0 ? (
                  <p className="p-6 text-sm text-slate-500">Sin datos en el rango seleccionado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
                          <th className="px-5 py-3 font-semibold">Propiedad</th>
                          <th className="px-5 py-3 font-semibold">Reservas</th>
                          <th className="px-5 py-3 font-semibold">Días ocupados</th>
                          <th className="px-5 py-3 font-semibold">Ocupación</th>
                          <th className="px-5 py-3 font-semibold">Ingresos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {occupancy.map((row) => (
                          <tr key={row.propertyId}>
                            <td className="px-5 py-3 font-medium text-primary">{row.propertyTitle}</td>
                            <td className="px-5 py-3 text-slate-600">{row.totalReservations}</td>
                            <td className="px-5 py-3 text-slate-600">{row.totalDaysOccupied}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2 min-w-[120px]">
                                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-accent"
                                    style={{ width: `${Math.min(100, row.occupancyPercentage ?? 0)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-600 w-10 text-right">
                                  {(row.occupancyPercentage ?? 0).toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3 font-semibold text-primary">
                              ${parseFloat(row.totalRevenue ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <h2 className="text-sm font-bold text-primary">Ingresos por propiedad</h2>
                {occupancy.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin datos.</p>
                ) : (
                  <div className="space-y-3">
                    {occupancy.map((row) => (
                      <MetricBar
                        key={row.propertyId}
                        label={row.propertyTitle}
                        value={parseFloat(row.totalRevenue ?? 0)}
                        max={maxRevenue}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-primary">Métricas de mantenimiento</h2>
                </div>
                {maintenance.length === 0 ? (
                  <p className="p-6 text-sm text-slate-500">Sin tickets en el rango seleccionado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
                          <th className="px-5 py-3 font-semibold">Propiedad</th>
                          <th className="px-5 py-3 font-semibold">Total</th>
                          <th className="px-5 py-3 font-semibold">Abiertos</th>
                          <th className="px-5 py-3 font-semibold">En progreso</th>
                          <th className="px-5 py-3 font-semibold">Resueltos</th>
                          <th className="px-5 py-3 font-semibold">Cerrados</th>
                          <th className="px-5 py-3 font-semibold">Completados</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {maintenance.map((row) => {
                          const completed = (row.resolvedTickets ?? 0) + (row.closedTickets ?? 0);
                          const completionRate = row.totalTickets > 0
                            ? Math.round((completed / row.totalTickets) * 100)
                            : 0;
                          return (
                          <tr key={row.propertyId}>
                            <td className="px-5 py-3 font-medium text-primary">{row.propertyTitle}</td>
                            <td className="px-5 py-3 text-slate-600">{row.totalTickets}</td>
                            <td className="px-5 py-3 text-amber-700">{row.openTickets}</td>
                            <td className="px-5 py-3 text-blue-700">{row.inProgressTickets}</td>
                            <td className="px-5 py-3 text-emerald-700">{row.resolvedTickets}</td>
                            <td className="px-5 py-3 text-slate-600">{row.closedTickets ?? 0}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2 min-w-[100px]">
                                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{ width: `${Math.min(100, completionRate)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-600">{completionRate}%</span>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default LandlordAnalytics;
