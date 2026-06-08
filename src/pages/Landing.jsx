import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#091124] relative overflow-x-hidden font-sans selection:bg-amber-500 selection:text-white">

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <nav className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#091124] rounded-xl flex items-center justify-center shadow-md shadow-slate-900/10">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg block leading-none">RentPro</span>
            <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase block mt-0.5">Property OS</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/guest" className="text-sm font-medium text-slate-600 hover:text-[#091124] transition-colors hidden sm:block">
            Acceso Inquilino
          </Link>
          <button className="bg-[#091124] hover:bg-[#131f3b] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
            Iniciar sesión
          </button>
        </div>
      </nav>
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 pt-12 md:pt-20 pb-16 space-y-8">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full text-[11px] font-medium text-amber-800 shadow-xs">
          <span>✨</span>
          <span>Arquitectura · Seguridad · Admin</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#091124] max-w-4xl leading-[1.1]">
          La sala de control para el alquiler <span className="text-amber-600 font-serif italic font-normal">moderno</span> de propiedades.
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl leading-relaxed font-normal">
          Gestiona usuarios y roles, emite multas, genera llaves de acceso temporales y orquesta el mantenimiento programado — todo desde una consola segura y elegante.
        </p>
        <div className="pt-2 flex flex-wrap gap-4">
          <button className="bg-[#091124] hover:bg-[#131f3b] text-white font-medium px-6 py-3.5 rounded-xl inline-flex items-center gap-2 transition-all shadow-lg shadow-slate-900/10 group cursor-pointer text-sm">
            Entrar a la consola
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <Link to="/guest" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-6 py-3.5 rounded-xl transition-all text-sm cursor-pointer shadow-xs inline-flex items-center justify-center">
            Acceso de inquilino
          </Link>
        </div>
        <div className="pt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>🔒</span> Cifrado AES-256
          </div>
          <div className="flex items-center gap-1.5">
            <span>🛡️</span> ISO 27001
          </div>
          <div className="flex items-center gap-1.5">
            <span>⚡</span> Uptime 99.99%
          </div>
        </div>

      </main>
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-50/40 rounded-full blur-xl group-hover:bg-amber-100/40 transition-colors" />
            <div className="w-10 h-10 bg-[#091124] rounded-xl flex items-center justify-center text-white mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-13.32 9-8.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-amber-600 font-mono text-xs font-bold uppercase tracking-wider block mb-1">01 Acceso por roles</span>
            <h3 className="text-lg font-bold text-[#091124] mb-2">Acceso por roles</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Administradores, propietarios e inquilinos — cada uno con su superficie.
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-50/40 rounded-full blur-xl group-hover:bg-amber-100/40 transition-colors" />
            <div className="w-10 h-10 bg-[#091124] rounded-xl flex items-center justify-center text-white mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <span className="text-amber-600 font-mono text-xs font-bold uppercase tracking-wider block mb-1">02 PINs temporales</span>
            <h3 className="text-lg font-bold text-[#091124] mb-2">PINs temporales</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Emite y caduca llaves por reserva con trazabilidad completa.
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-50/40 rounded-full blur-xl group-hover:bg-amber-100/40 transition-colors" />
            <div className="w-10 h-10 bg-[#091124] rounded-xl flex items-center justify-center text-white mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-amber-600 font-mono text-xs font-bold uppercase tracking-wider block mb-1">03 Operaciones automáticas</span>
            <h3 className="text-lg font-bold text-[#091124] mb-2">Operaciones automáticas</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Recordatorios de renta y mantenimiento preventivo en piloto automático.
            </p>
          </div>

        </div>
      </section>
      <footer className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 py-8 mt-12 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
        <div>
          © 2026 RentPro · Hecho con cuidado
        </div>
        <div>
          v1.0 — Lovable Cloud
        </div>
      </footer>

    </div>
  );
}

export default Landing;
