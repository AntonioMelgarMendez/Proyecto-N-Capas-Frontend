import { ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ items = [], role = 'INQUILINO', isCollapsed = false, onToggle }) => {
  return (
    <aside className={`h-screen bg-primary text-white shadow-xl fixed left-0 top-0 flex flex-col z-20 transition-all duration-300 ${isCollapsed ? 'w-20 px-3 py-5 items-center' : 'w-64 p-5'}`}>
      <div className={`flex items-center gap-3 mb-8 pb-6 border-b border-gray-800 w-full ${isCollapsed ? 'justify-center px-0' : 'px-1'}`}>
        <div className="w-11 h-11 bg-accent rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        {!isCollapsed && (
          <div className="transition-all duration-300 opacity-100 whitespace-nowrap">
            <span className="font-bold tracking-tight text-xl block leading-none">RentPro</span>
            <span className="text-[10px] tracking-widest text-slate-400 font-bold uppercase block mt-1">{role}</span>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="text-[10px] tracking-widest text-slate-400 font-bold uppercase mb-4 px-2 whitespace-nowrap transition-all duration-300 opacity-100">
          MI CUENTA
        </div>
      )}

      <nav className="flex flex-col gap-2 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full flex items-center rounded-xl transition-all duration-200 font-medium cursor-pointer ${
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
              } ${
                isActive
                  ? 'border border-accent text-accent bg-[#0d1e4e]/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/20'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="transition-all duration-300 opacity-100 whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {onToggle && (
        <div className="mt-auto pt-6 w-full flex justify-center">
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/40 border border-gray-800 hover:bg-slate-800/80 hover:text-accent transition-all cursor-pointer text-slate-300"
            title={isCollapsed ? 'Expandir' : 'Colapsar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;


