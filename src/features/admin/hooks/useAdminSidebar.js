import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, Building2, ShieldCheck } from 'lucide-react';

export const useAdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const items = [
    {
      id: 'dashboard',
      label: 'Panel General',
      icon: LayoutGrid,
      active: location.pathname === '/admin/dashboard',
      action: () => navigate('/admin/dashboard'),
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      active: location.pathname === '/admin/users',
      action: () => navigate('/admin/users'),
    },
    {
      id: 'properties',
      label: 'Propiedades',
      icon: Building2,
      active: location.pathname === '/admin/properties',
      action: () => navigate('/admin/properties'),
    },
    {
      id: 'kyc',
      label: 'Verificación KYC',
      icon: ShieldCheck,
      active: location.pathname === '/admin/kyc',
      action: () => navigate('/admin/kyc'),
    },
  ];

  return {
    isCollapsed,
    setIsCollapsed,
    items,
    mainClass: (collapsed) =>
      `h-screen overflow-y-auto transition-all duration-300 p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-8 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`,
  };
};
