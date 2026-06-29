import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { House, Key, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/authApi';

const ROLES = [
  { id: 'INQUILINO',  label: 'Inquilino',   sub: 'Quiero alquilar',      icon: Key   },
  { id: 'ARRENDADOR', label: 'Propietario', sub: 'Tengo propiedades', icon: House  },
];

function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole]               = useState('INQUILINO');
  const [fullname, setFullname]       = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register(fullname.trim(), email.trim(), password, phone.trim(), role);
      navigate('/', { replace: true, state: { registered: true } });
    } catch (err) {
      setError(err.message ?? 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.12] mb-4">
            Únete como{' '}
            <span className="font-serif italic font-normal text-accent">propietario</span>
            {' '}o inquilino.
          </h1>
          <p className="text-white/45 text-sm leading-relaxed max-w-sm">
            Crea tu cuenta en minutos y empieza a gestionar reservas, pagos y contratos desde un solo lugar.
          </p>
        </div>

        <p className="relative text-[11px] text-white/25 mt-8">© 2026 RentPro</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12 overflow-y-auto">
        <div className="w-full max-w-md">

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-primary">
              Crear{' '}
              <span className="font-serif italic font-normal text-accent">cuenta</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">Completa los datos para empezar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                Quiero registrarme como
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ id, label, sub, icon: Icon }) => {
                  const active = role === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRole(id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-3 transition-all ${
                        active
                          ? 'border-accent bg-amber-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-accent' : 'text-slate-400'}`} />
                      <p className={`text-xs font-bold ${active ? 'text-primary' : 'text-slate-500'}`}>{label}</p>
                      <p className="text-[10px] text-slate-400">{sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Nombre completo</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Juan Pérez"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-primary placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Correo electrónico</label>
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
              <label className="block text-sm font-semibold text-primary mb-1">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+503 7000-0000"
                required
                autoComplete="tel"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-primary placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  autoComplete="new-password"
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

            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm text-primary placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/" className="text-accent font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default RegisterPage;
