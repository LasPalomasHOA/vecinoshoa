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
    <div className="flex flex-wrap items-center justify-between gap-4 py-2.5 px-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs">
      {/* Types and Status Groups */}
      <div className="flex flex-wrap items-center gap-5">
        
        {/* Type Indicators (Solid Color Squares) */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#5c7c93] shadow-2xs shrink-0" />
            <span className="text-slate-800 font-bold text-[11px]">Bloqueo de Dueño</span>
            {counts?.dueno !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {counts.dueno}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#2196F3] shadow-2xs shrink-0" />
            <span className="text-slate-800 font-bold text-[11px]">Huésped con Cobro (PG)</span>
            {counts?.pg !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                {counts.pg}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#00897B] shadow-2xs shrink-0" />
            <span className="text-slate-800 font-bold text-[11px]">Huésped sin Cobro (NPG)</span>
            {counts?.npg !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
                {counts.npg}
              </span>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="hidden sm:block h-4 w-px bg-slate-200" />

        {/* Status Indicators (Top Bars / Lines) */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="w-6 h-1 rounded-full bg-[#F4511E] shadow-2xs shrink-0" />
            </div>
            <span className="text-slate-800 font-bold text-[11px]">Pendiente</span>
            {counts?.pendiente !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-200">
                {counts.pendiente}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="w-6 h-1 rounded-full bg-[#8BC34A] shadow-2xs shrink-0" />
            </div>
            <span className="text-slate-800 font-bold text-[11px]">Entrada Registrada</span>
            {counts?.checkedIn !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-lime-50 text-lime-800 border border-lime-200">
                {counts.checkedIn}
              </span>
            )}
          </div>
        </div>

      </div>

      <div className="text-[11px] text-teal-800/90 font-semibold hidden lg:flex items-center gap-1.5 bg-teal-50/80 px-2.5 py-1 rounded-lg border border-teal-100">
        <span>💡 Tip: Haz click en 2 días para reservar un rango de fechas</span>
      </div>
    </div>
  );
};
