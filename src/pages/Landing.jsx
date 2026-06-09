import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, House, Key } from 'lucide-react';

const ROLES = [
  { id: 'admin',    label: 'Administrador', sub: 'Control total',   icon: ShieldCheck, path: '/guest' },
  { id: 'landlord', label: 'Propietario',   sub: 'Tus propiedades', icon: House,       path: '/landlord/properties' },
  { id: 'tenant',   label: 'Inquilino',     sub: 'Tu alquiler',     icon: Key,         path: '/tenant/catalog' },
];

const STATS = [
  ['1,284', 'USUARIOS'],
  ['312',   'ALQUILERES'],
  ['99.99%','UPTIME'],
];

function Landing() {
  const navigate = useNavigate();
  const [role, setRole]         = useState('admin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(ROLES.find((r) => r.id === role).path);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col p-10 overflow-hidden">

        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg text-white leading-none">RentPro</p>
            <p className="text-[10px] tracking-widest text-white/40 font-semibold uppercase mt-0.5">Property OS</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative mt-auto pb-4">
          <div className="inline-flex items-center gap-2 border border-white/15 rounded-full px-3 py-1 text-[11px] text-white/50 mb-6">
            🔒 Acceso seguro
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.12] mb-4">
            Acceso seguro para cada{' '}
            <span className="font-serif italic font-normal text-accent">rol</span>
            {' '}de tu portafolio.
          </h1>

          <p className="text-white/45 text-sm leading-relaxed max-w-sm mb-10">
            Paneles por rol, PINs cifrados y un registro de auditoría completo — diseñado para gestores que cuidan cada detalle de seguridad.
          </p>

          {/* Stats */}
          <div className="flex gap-3">
            {STATS.map(([value, label]) => (
              <div key={label} className="flex-1 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-[10px] tracking-widest text-white/35 font-semibold uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-[11px] text-white/25 mt-8">© 2026 RentPro · ISO 27001 · GDPR</p>
      </div>

      {/* ── Right panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary">
              Bienvenido de{' '}
              <span className="font-serif italic font-normal text-accent">vuelta</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">Selecciona tu rol y accede para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role selector */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
                Acceder como
              </p>
              <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-3">
                {ROLES.map(({ id, label, sub, icon: Icon }) => {
                  const active = role === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRole(id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-3 min-[400px]:py-4 min-[400px]:px-2 transition-all ${
                        active
                          ? 'border-accent bg-amber-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-accent' : 'text-slate-400'}`} />
                      <p className={`text-xs font-bold leading-tight ${active ? 'text-primary' : 'text-slate-500'}`}>
                        {label}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight">{sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-primary placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-primary placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Iniciar sesión
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Demo · cualquier credencial funciona · JWT simulado en cliente.
          </p>

        </div>
      </div>

    </div>
  );
}

export default Landing;
