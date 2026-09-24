import React from 'react';

interface CalendarLegendProps {
  counts?: {
    dueno?: number;
    pg?: number;
    npg?: number;
    pendiente?: number;
    checkedIn?: number;
  };
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({ counts }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-4 rounded-xl glass-card border border-slate-200/90 text-xs">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
          Leyenda de Ocupación:
        </span>
        
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-gradient-to-br from-slate-600 to-slate-700 shadow-xs border border-slate-800 shrink-0" />
          <span className="text-slate-700 font-semibold text-[11px]">Bloqueo de Dueño</span>
          {counts?.dueno !== undefined && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {counts.dueno}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-gradient-to-br from-sky-500 to-sky-700 shadow-xs border border-sky-800 shrink-0" />
          <span className="text-slate-700 font-semibold text-[11px]">Huésped Cobro (PG)</span>
          {counts?.pg !== undefined && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
              {counts.pg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-gradient-to-br from-teal-500 to-teal-700 shadow-xs border border-teal-800 shrink-0" />
          <span className="text-slate-700 font-semibold text-[11px]">Huésped sin Cobro (NPG)</span>
          {counts?.npg !== undefined && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
              {counts.npg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 shadow-xs border border-amber-700 shrink-0" />
          <span className="text-slate-700 font-semibold text-[11px]">Pendiente</span>
          {counts?.pendiente !== undefined && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
              {counts.pendiente}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xs border border-emerald-800 shrink-0" />
          <span className="text-slate-700 font-semibold text-[11px]">En Casa (Checked-in)</span>
          {counts?.checkedIn !== undefined && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {counts.checkedIn}
            </span>
          )}
        </div>
      </div>

      <div className="text-[11px] text-teal-800/90 font-semibold hidden md:flex items-center gap-1.5 bg-teal-50/80 px-2.5 py-1 rounded-lg border border-teal-100">
        <span>💡 Tip: Haz click en 2 días para reservar un rango de fechas</span>
      </div>
    </div>
  );
};
