import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  HelpCircle, 
  X,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const LoginView: React.FC = () => {
  const { login, quickLoginAs, isLoading } = useAuth();

  const [email, setEmail] = useState('admin@laspalomas.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);

  // Saludo dinámico según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 19) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico o usuario');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor ingresa tu contraseña de acceso');
      return;
    }

    const res = await login(email, password, rememberMe);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleSelectDemo = (index: number) => {
    setSelectedDemoIndex(index);
    const demo = DEMO_ACCOUNTS[index];
    setEmail(demo.usuario.email);
    setPassword(demo.passwordDefault);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* LEFT SECTION: Resort Showcase Visual & Brand Identity */}
      <div className="lg:w-7/12 relative hidden md:flex flex-col justify-between p-8 lg:p-14 overflow-hidden border-r border-slate-800/80">
        
        {/* Background Resort Image with Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/las_palomas_resort.jpg" 
            alt="Las Palomas Seaside Golf Community" 
            className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950" />
        </div>

        {/* Top Header / Resort Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="Las Palomas HOA" 
              className="h-9 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Sistema Operativo 2026</span>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 max-w-xl my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Portal Administrativo & Front Desk
          </div>

          <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Gestión Integral de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-300 to-teal-100">
              Las Palomas Resort
            </span>
          </h1>

          <p className="mt-4 text-slate-300 text-sm lg:text-base leading-relaxed font-normal text-balance">
            Plataforma centralizada para la administración de condominios, control de ocupación timeline, recepción de huéspedes, brazaletes y autorizaciones de acceso.
          </p>

          {/* Value props bullets */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Timeline en Vivo</p>
                <p className="text-[11px] text-slate-400">Ocupación tipo Gantt</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Torres & Catálogo</p>
                <p className="text-[11px] text-slate-400">Fase 1 y Fase 2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Location & Weather indicator */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/80">
          <p className="font-medium">📍 Sandy Beach, Puerto Peñasco, Sonora, México</p>
          <p className="font-mono text-[11px] text-teal-400">HOA SECURE PORTAL</p>
        </div>

      </div>

      {/* RIGHT SECTION: Interactive Login Form */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative z-10 bg-slate-900/95 backdrop-blur-xl">
        
        {/* Mobile Header Logo */}
        <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="bg-white p-2 rounded-xl">
            <img 
              src={logoImg} 
              alt="Las Palomas HOA" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20">
            HOA Portal
          </span>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          
          {/* Header Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">{getGreeting()}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Iniciar Sesión
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Ingresa tus credenciales autorizadas para acceder al sistema.
            </p>
          </div>

          {/* Quick Access Roles Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                Perfiles de Acceso Rápido Demo:
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account, idx) => {
                const isSelected = selectedDemoIndex === idx;
                return (
                  <button
                    key={account.usuario.id}
                    type="button"
                    onClick={() => handleSelectDemo(idx)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-500 text-teal-200 ring-1 ring-teal-500/50 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-white truncate">{account.badgeLabel}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">
                      {account.usuario.nombre} {account.usuario.apellido}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Error de inicio de sesión</p>
                <p className="text-[11px] text-rose-300/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Correo Electrónico o Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="ejemplo@laspalomas.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-teal-600 focus:ring-teal-500 focus:ring-offset-slate-900 cursor-pointer accent-teal-600"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Recordar mi sesión en este equipo
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Entrar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Footer Security Notice */}
        <div className="pt-6 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 text-center sm:text-left">
          <div className="flex items-center gap-1.5 text-teal-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Acceso Seguro Encriptado SSL</span>
          </div>
          <p>© 2026 Las Palomas HOA. Versión 2.6</p>
        </div>

      </div>

      {/* MODAL: Ayuda / Recuperación de Contraseña */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-white">Recuperación de Acceso</h3>
            <p className="text-xs text-slate-400 mt-1">
              Por políticas de seguridad de Las Palomas HOA, el restablecimiento de contraseñas de personal y propietarios se realiza mediante la administración central.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-2 text-xs">
              <p className="font-semibold text-teal-300">Canales de Soporte Oficial:</p>
              <p className="text-slate-300">
                📧 <strong>Email:</strong> soporte@laspalomasresort.net
              </p>
              <p className="text-slate-300">
                📞 <strong>Conmutador HOA:</strong> Extensión 104 o 105
              </p>
              <p className="text-slate-300">
                🏢 <strong>Oficinas:</strong> Módulo de Administración HOA Torre Diamante
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
