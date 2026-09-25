import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, KeyRound, Clock, Building2, Sparkles, ShieldCheck } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { reservaciones, propiedades, solicitudes } = useApp();

  const inHouseCount = reservaciones.filter(r => r.estado === 'En Casa (Checked-in)').length;
  const pendingCheckins = reservaciones.filter(r => r.estado === 'Confirmada' || r.estado === 'Pendiente').length;
  const pendingRequests = solicitudes.filter(s => s.estatus === 'Pendiente' || s.estatus === 'En Proceso').length;

  return (
    <div className="relative mb-6 rounded-xl overflow-hidden border border-white/80 bg-gradient-to-r from-white/90 via-white/75 to-teal-50/50 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] no-print print:hidden">

      {/* Background Soft Resort Refraction with Light Ambience */}
      <img
        src="/las_palomas_resort.jpg"
        alt="Las Palomas Seaside"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-10 filter blur-[2px] pointer-events-none"
      />

      {/* Subtle Specular Ambient Lighting */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-teal-300/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-emerald-300/15 blur-3xl pointer-events-none" />

      {/* Glass Highlight Top Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-teal-500/60 via-emerald-400/80 to-sky-400/60" />

      {/* Main Glass Workspace */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">

        {/* Left: Branding & Resort Header */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white/85 backdrop-blur-md text-teal-800 border border-teal-200/60 shadow-2xs">
              <MapPin className="w-3 h-3 text-teal-600" /> Puerto Peñasco, Sonora
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50/90 text-emerald-800 border border-emerald-200/60 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operaciones HOA 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 leading-tight">
            Las Palomas Seaside Golf Community
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-xl">
            Portal administrativo y de recepción. Control de condominios, propietarios, calendario de ocupación timeline y autorizaciones de acceso.
          </p>
        </div>

        {/* Right: Integrated Glassmorphic Operational Capsule */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">

          {/* Glass Card: En Casa */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/85 backdrop-blur-md border border-white/90 shadow-2xs hover:bg-white transition-all hover:border-emerald-300">
            <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                En Casa
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900">{inHouseCount}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">activas</span>
              </div>
            </div>
          </div>

          {/* Glass Card: Llegadas */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/85 backdrop-blur-md border border-white/90 shadow-2xs hover:bg-white transition-all hover:border-amber-300">
            <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Llegadas
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-amber-700">{pendingCheckins}</span>
                <span className="text-[10px] text-amber-700 font-semibold">pendientes</span>
              </div>
            </div>
          </div>

          {/* Glass Card: Condos */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-lg bg-white/85 backdrop-blur-md border border-white/90 shadow-2xs hover:bg-white transition-all hover:border-teal-300">
            <div className="w-9 h-9 rounded-md bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Condos
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-teal-900">{propiedades.length}</span>
                <span className="text-[10px] text-teal-700 font-semibold">Torres A-J</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
