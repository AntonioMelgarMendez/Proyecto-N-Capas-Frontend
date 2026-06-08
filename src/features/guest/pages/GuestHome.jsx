import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Search, Calendar, Key, Wrench } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import ReservationCard from '../components/ReservationCard';

const GuestHome = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems = [
    { id: 'inicio',         label: 'Inicio',         icon: LayoutGrid, active: true, action: () => navigate('/guest') },
    { id: 'catalogo',       label: 'Catálogo',       icon: Search,     action: () => navigate('/tenant/catalog') },
    { id: 'reservas',       label: 'Mis Reservas',   icon: Calendar,   action: () => navigate('/tenant/reservations') },
    { id: 'llave',          label: 'Mi Llave',       icon: Key,        action: () => navigate('/tenant/key') },
    { id: 'mantenimiento',  label: 'Mantenimiento',  icon: Wrench,     action: () => navigate('/tenant/maintenance') },
  ];

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar items={sidebarItems} role="INQUILINO" isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className={`transition-all duration-300 p-8 bg-[radial-gradient(circle_at_top_left,_var(--tw-theme_bg_main),transparent)] ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-primary">Bienvenido de nuevo</h1>
          <p className="text-slate-500">Gestiona tus reservas y accede a servicios rápidos.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <ReservationCard title="Reserva en Playa Blanca" date="12 Oct, 2024" location="Sector A - Piscina" status="confirmed" />
          <ReservationCard title="Cabaña del Bosque" date="15 Nov, 2024" location="Zona Norte" status="pending" />
          <ReservationCard title="Vista Mar VIP" date="02 Dic, 2024" location="Edificio Central" status="confirmed" />
        </div>

        <h2 className="text-xl font-bold text-primary mb-6">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔑', label: 'Llaves Digitales' },
            { icon: '📄', label: 'Facturas/Recibos' },
            { icon: '🛡️', label: 'Reporte de Seguridad' },
            { icon: '📞', label: 'Soporte 24/7' }
          ].map((item, idx) => (
            <button key={idx} className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-accent transition-colors group">
              <span className="text-2xl mb-2">{item.icon}</span>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 p-6 bg-gradient-to-r from-primary to-blue-900 rounded-3xl text-white shadow-lg">
          <h3 className="font-bold mb-2">¿Necesitas ayuda técnica?</h3>
          <p className="text-sm opacity-80">Nuestro equipo está disponible 24/7 para asistirte con cualquier inconveniente de acceso.</p>
        </div>
      </main>
    </div>
  );
};

export default GuestHome;
