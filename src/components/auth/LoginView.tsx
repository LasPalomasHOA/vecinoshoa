import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  HelpCircle, 
  X,
  AlertCircle,
  Sun,
  MoonStar,
  Waves
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const LoginView: React.FC = () => {
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('admin@laspalomas.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Saludo e icono dinámico según la hora del día
  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { 
        text: '¡Buenos días!', 
        icon: Sun, 
        color: 'text-amber-700 bg-amber-50/90 border-amber-200' 
      };
    }
    if (hour >= 12 && hour < 19) {
      return { 
        text: '¡Buenas tardes!', 
        icon: Sun, 
        color: 'text-teal-800 bg-teal-50/90 border-teal-200' 
      };
    }
    return { 
      text: '¡Buenas noches!', 
      icon: MoonStar, 
      color: 'text-indigo-800 bg-indigo-50/90 border-indigo-200' 
    };
  };

  const greeting = getGreetingData();
  const GreetingIcon = greeting.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico o usuario');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor ingresa tu contraseña');
      return;
    }

    const res = await login(email, password, rememberMe);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Background ambient lighting & soft gradients */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-teal-200/40 via-sky-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] bg-gradient-to-tl from-teal-100/50 via-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* LEFT SECTION: Resort Showcase Visual & Brand Identity */}
      <div className="lg:w-7/12 relative hidden md:flex flex-col justify-between p-8 lg:p-12 xl:p-14 overflow-hidden border-r border-slate-200/80 bg-slate-900">
        
        {/* Background Resort Image with Luminous & Warm Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/resort-bg.jpg" 
            alt="Las Palomas Seaside Golf Community" 
            className="w-full h-full object-cover object-center scale-100 filter brightness-95 contrast-105 transition-transform duration-1000 ease-out"
          />
          {/* Subtle gradient overlay to keep resort visible while ensuring typography readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-900/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/20" />
        </div>

        {/* Top Header / Resort Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="Las Palomas HOA" 
              className="h-12 w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-transform hover:scale-105"
            />
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 max-w-xl my-auto py-10">
          <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            Gestión Integral de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-sky-200 to-amber-100">
              Las Palomas Resort
            </span>
          </h1>

          <p className="mt-4 text-slate-200 text-sm lg:text-base leading-relaxed font-normal text-balance drop-shadow-md">
            Plataforma centralizada para la administración de condominios, control de ocupación timeline tipo Gantt, recepción de huéspedes, brazaletes y autorizaciones de acceso.
          </p>
        </div>

        {/* Bottom Location indicator */}
        <div className="relative z-10 flex items-center text-xs text-slate-200/90 pt-4">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-teal-300" />
            <p className="font-medium">Sandy Beach • Puerto Peñasco, Sonora, México</p>
          </div>
        </div>

      </div>

      {/* RIGHT SECTION: Interactive Login Form (Clean, Modern Light Luxury Theme) */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 relative z-10 bg-white/95 backdrop-blur-xl shadow-2xl lg:shadow-none">
        
        {/* Mobile Header Logo */}
        <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <img 
            src={logoImg} 
            alt="Las Palomas HOA" 
            className="h-8 w-auto object-contain"
          />
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            HOA Portal
          </span>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          
          {/* Header Title & Dynamic Greeting */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${greeting.color}`}>
                <GreetingIcon className="w-3.5 h-3.5" />
                <span>{greeting.text}</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Iniciar Sesión
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Ingresa al panel administrativo y de control de Las Palomas HOA.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-900">Error de autenticación</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
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
                  placeholder="admin@laspalomas.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-600 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/15 shadow-xs transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="text-[11px] font-semibold text-teal-600 hover:text-teal-800 hover:underline transition-colors cursor-pointer"
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-600 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/15 shadow-xs transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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
                  className="w-4 h-4 rounded border-slate-300 bg-white text-teal-600 focus:ring-teal-500 focus:ring-offset-white cursor-pointer accent-teal-600"
                />
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  Recordar mi sesión en este equipo
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <p>© 2026 Las Palomas HOA</p>
          <p>Portal Administrativo v2.6</p>
        </div>

      </div>

      {/* MODAL: Ayuda / Recuperación de Contraseña (Light Luxury Theme) */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center mb-4 shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900">Recuperación de Acceso</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Por políticas de seguridad y confidencialidad de Las Palomas HOA, la restauración de contraseñas es gestionada por el departamento de administración.
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
              <p className="font-bold text-teal-800 uppercase tracking-wide text-[11px]">Canales de Asistencia Oficial:</p>
              <div className="space-y-1.5 text-slate-600">
                <p>
                  📧 <strong className="text-slate-800">Email:</strong> soporte@laspalomasresort.net
                </p>
                <p>
                  📞 <strong className="text-slate-800">Conmutador HOA:</strong> Extensión 104 o 105
                </p>
                <p>
                  🏢 <strong className="text-slate-800">Oficinas:</strong> Módulo de Administración HOA Torre Diamante
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
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


