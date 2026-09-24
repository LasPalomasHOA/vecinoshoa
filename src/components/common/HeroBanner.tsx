import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, KeyRound, Clock, Building2, Sparkles, Activity } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { reservaciones, propiedades, solicitudes } = useApp();

  const inHouseCount = reservaciones.filter(r => r.estado === 'En Casa (Checked-in)').length;
  const pendingCheckins = reservaciones.filter(r => r.estado === 'Confirmada' || r.estado === 'Pendiente').length;
  const pendingRequests = solicitudes.filter(s => s.estatus === 'Pendiente' || s.estatus === 'En Proceso').length;

  return (
    <div className="relative rounded-2xl overflow-hidden mb-6 border border-slate-200/80 shadow-md bg-slate-900 text-white group no-print print:hidden">
      
      {/* Background Resort Image with Subtle Movement */}
      <img
        src="/las_palomas_resort.jpg"
        alt="Las Palomas Seaside Golf Community"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-overlay filter blur-[0.5px] group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      
      {/* Color overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-950/95 via-slate-950/80 to-teal-900/60" />

      {/* Decorative glass glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 backdrop-blur-xs">
              <MapPin className="w-3 h-3" /> Puerto Peñasco, Sonora
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-teal-200/90 font-semibold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/10">
              <Activity className="w-2.5 h-2.5 text-emerald-400" /> Operaciones HOA 2026
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Las Palomas Seaside Golf Community
          </h1>
          <p className="text-xs md:text-sm text-teal-100/90 max-w-xl font-medium leading-relaxed">
            Portal administrativo y de recepción. Control de condominios, propietarios, calendario de ocupación timeline y autorizaciones de acceso.
          </p>
        </div>

        {/* Live Glass Counters */}
        <div className="flex items-center gap-3 shrink-0">
          
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[100px] shadow-lg transition-all hover:bg-white/15 hover:border-teal-300/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 block flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> En Casa
            </span>
            <span className="text-2xl font-black text-white mt-0.5 block">{inHouseCount}</span>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[100px] shadow-lg transition-all hover:bg-white/15 hover:border-amber-300/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200 block flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-300" /> Llegadas
            </span>
            <span className="text-2xl font-black text-amber-200 mt-0.5 block">{pendingCheckins}</span>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[100px] shadow-lg transition-all hover:bg-white/15 hover:border-sky-300/40 hidden sm:block">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-200 block flex items-center justify-center gap-1">
              <Building2 className="w-3 h-3 text-sky-300" /> Condos
            </span>
            <span className="text-2xl font-black text-white mt-0.5 block">{propiedades.length}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
