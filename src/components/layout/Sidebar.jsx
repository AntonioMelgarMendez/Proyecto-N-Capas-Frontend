import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu, X, LogOut, User } from 'lucide-react';
import { useStore } from '../../store/useStore';

const ROLE_LABELS = {
  ADMIN: 'Administrador',
  ARRENDADOR: 'Propietario',
  INQUILINO: 'Inquilino',
};

const Sidebar = ({ items = [], isCollapsed = false, onToggle, onMobileOpenChange }) => {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const clearAuth = useStore((s) => s.clearAuth);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const showLabels = !isCollapsed || isMobileOpen;

  const setMobileOpen = (open) => {
    setIsMobileOpen(open);
    onMobileOpenChange?.(open);
  };

  const handleItemClick = (action) => {
    setMobileOpen(false);
    action();
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/', { replace: true });
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <>
      {!isMobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed top-0 left-0 z-30 flex h-14 w-14 items-center justify-center text-primary lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      )}

      {isMobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`h-screen bg-primary text-white shadow-xl fixed left-0 top-0 flex flex-col z-20 transition-all duration-300 w-64 p-5 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          isCollapsed ? 'lg:w-20 lg:px-3 lg:py-5 lg:items-center' : 'lg:w-64 lg:p-5'
        }`}
      >
        {/* ── Header ── */}
        <div className={`flex items-center gap-3 mb-8 pb-6 border-b border-gray-800 w-full ${isCollapsed && !isMobileOpen ? 'lg:justify-center lg:px-0' : 'px-1'}`}>
          <div className="w-11 h-11 bg-accent rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          {showLabels && (
            <div className="transition-all duration-300 opacity-100 whitespace-nowrap">
              <span className="font-bold tracking-tight text-xl block leading-none">RentPro</span>
              <span className="text-[10px] tracking-widest text-slate-400 font-bold uppercase block mt-1">
                {ROLE_LABELS[user?.role] ?? user?.role ?? '—'}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Section label ── */}
        {showLabels && (
          <div className="text-[10px] tracking-widest text-slate-400 font-bold uppercase mb-4 px-2 whitespace-nowrap transition-all duration-300 opacity-100">
            MI CUENTA
          </div>
        )}

        {/* ── Nav items ── */}
        <nav className="flex flex-col gap-2 w-full">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.action)}
                className={`w-full flex items-center rounded-xl transition-all duration-200 font-medium cursor-pointer ${
                  isCollapsed && !isMobileOpen ? 'lg:justify-center lg:p-3' : 'gap-3 px-4 py-3'
                } ${
                  item.active
                    ? 'border border-accent text-accent bg-[#0d1e4e]/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/20'
                }`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                <Icon size={20} className="shrink-0" />
                {showLabels && (
                  <span className="transition-all duration-300 opacity-100 whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── User + logout ── */}
        <div className={`mt-auto pt-4 border-t border-gray-800 w-full ${isCollapsed && !isMobileOpen ? 'flex flex-col items-center gap-3' : ''}`}>
          {showLabels && user && (
            <div className="flex items-center gap-3 px-2 pb-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-accent">{initials}</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate leading-tight">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {!showLabels && user && (
            <div
              className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mb-2"
              title={user.fullName}
            >
              <span className="text-xs font-bold text-accent">{initials}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl transition-all text-slate-300 hover:text-white hover:bg-red-900/30 cursor-pointer ${
              isCollapsed && !isMobileOpen ? 'lg:justify-center lg:p-3' : 'gap-3 px-4 py-2.5'
            }`}
            title={isCollapsed && !isMobileOpen ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {showLabels && <span className="text-sm font-medium whitespace-nowrap">Cerrar sesión</span>}
          </button>

          {onToggle && (
            <div className="pt-2 w-full hidden lg:flex justify-center">
              <button
                onClick={onToggle}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/40 border border-gray-800 hover:bg-slate-800/80 hover:text-accent transition-all cursor-pointer text-slate-300"
                title={isCollapsed ? 'Expandir' : 'Colapsar'}
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
