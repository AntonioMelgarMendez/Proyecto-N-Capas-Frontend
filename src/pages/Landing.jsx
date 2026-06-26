import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';

const STATS = [
  ['1,284', 'USUARIOS'],
  ['312',   'ALQUILERES'],
  ['99.99%','UPTIME'],
];

function Landing() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col p-10 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

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

        <div className="relative mt-auto pb-4">
          <div className="inline-flex items-center gap-2 border border-white/15 rounded-full px-3 py-1 text-[11px] text-white/50 mb-6">
            Acceso seguro
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.12] mb-4">
            Gestiona tu portafolio de{' '}
            <span className="font-serif italic font-normal text-accent">propiedades</span>
            {' '}en un solo lugar.
          </h1>

          <p className="text-white/45 text-sm leading-relaxed max-w-sm mb-10">
            Reservas, pagos, contratos y mantenimiento — todo centralizado y seguro para propietarios e inquilinos.
          </p>

          <div className="flex gap-3">
            {STATS.map(([value, label]) => (
              <div key={label} className="flex-1 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-[10px] tracking-widest text-white/35 font-semibold uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-white/25 mt-8">© 2026 RentPro</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary">
              Bienvenido de{' '}
              <span className="font-serif italic font-normal text-accent">vuelta</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">Ingresa tus credenciales para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-primary placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm text-primary placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isLoading ? 'Verificando...' : 'Iniciar sesión'}
              {!isLoading && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>

          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-accent font-semibold hover:underline">
              Regístrate
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Landing;
