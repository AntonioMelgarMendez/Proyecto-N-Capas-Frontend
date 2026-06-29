import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { House, Inbox, Wrench, Star, BarChart3, AlertTriangle, CalendarClock } from 'lucide-react';
import { useStore } from '../../../store/useStore';

export const useLandlordSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const landlordId = useStore((s) => s.user?.id);

  const items = [
    { id: 'propiedades', label: 'Mis Propiedades', icon: House,     active: location.pathname.startsWith('/landlord/properties'), action: () => navigate('/landlord/properties') },
    { id: 'requests',    label: 'Solicitudes',     icon: Inbox,     active: location.pathname === '/landlord/requests',           action: () => navigate('/landlord/requests') },
    { id: 'tickets',     label: 'Mantenimiento',   icon: Wrench,    active: location.pathname === '/landlord/tickets',            action: () => navigate('/landlord/tickets') },
    { id: 'analytics',   label: 'Analítica',       icon: BarChart3, active: location.pathname === '/landlord/analytics',          action: () => navigate('/landlord/analytics') },
    { id: 'reviews',     label: 'Reseñas',         icon: Star,          active: location.pathname === '/landlord/reviews',  action: () => navigate('/landlord/reviews') },
    { id: 'fines',       label: 'Multas',          icon: AlertTriangle, active: location.pathname === '/landlord/fines',      action: () => navigate('/landlord/fines') },
    { id: 'preventive',  label: 'Preventivo',      icon: CalendarClock, active: location.pathname === '/landlord/preventive', action: () => navigate('/landlord/preventive') },
  ];

  return {
    landlordId,
    isCollapsed,
    setIsCollapsed,
    items,
    mainClass: (collapsed) =>
      `h-screen overflow-y-auto transition-all duration-300 p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-8 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`,
  };
};
