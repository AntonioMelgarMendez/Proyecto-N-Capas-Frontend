import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { House, Inbox, Wrench, Star } from 'lucide-react';

export const MOCK_LANDLORD_ID = 1;

export const useLandlordSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const items = [
    { id: 'propiedades', label: 'Mis Propiedades', icon: House, active: location.pathname.startsWith('/landlord/properties'), action: () => navigate('/landlord/properties') },
    { id: 'requests', label: 'Solicitudes', icon: Inbox, active: location.pathname === '/landlord/requests', action: () => navigate('/landlord/requests') },
    { id: 'tickets', label: 'Mantenimiento', icon: Wrench, action: () => navigate('/landlord/tickets') },
    { id: 'reviews', label: 'Reseñas', icon: Star, active: location.pathname === '/landlord/reviews', action: () => navigate('/landlord/reviews') },
  ];

  return {
    isCollapsed,
    setIsCollapsed,
    items,
    mainClass: (collapsed) =>
      `transition-all duration-300 p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-0 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`,
  };
};
