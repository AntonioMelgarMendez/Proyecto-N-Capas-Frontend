import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Search, Calendar, Key, Wrench } from 'lucide-react';

export const useTenantSidebar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const backLinkClassName = `fixed top-0 right-0 z-30 inline-flex h-14 items-center gap-2 px-4 text-sm font-medium text-slate-500 hover:text-primary transition-colors lg:static lg:z-auto lg:h-auto lg:px-0 lg:mb-8 ${
    isMobileMenuOpen ? 'hidden lg:inline-flex' : 'inline-flex'
  }`;

  const items = [
    { id: 'inicio', label: 'Inicio', icon: LayoutGrid, action: () => navigate('/guest') },
    { id: 'catalogo', label: 'Catálogo', icon: Search, action: () => navigate('/tenant/catalog') },
    { id: 'reservas', label: 'Mis Reservas', icon: Calendar, action: () => navigate('/tenant/reservations') },
    { id: 'llave', label: 'Mi Llave', icon: Key, action: () => navigate('/tenant/key') },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench, action: () => navigate('/tenant/maintenance') },
  ];

  return {
    isCollapsed,
    setIsCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    backLinkClassName,
    items,
    mainClass: (collapsed) =>
      `transition-all duration-300 p-4 sm:p-6 md:p-8 ml-0 pt-14 lg:pt-0 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`,
  };
};
