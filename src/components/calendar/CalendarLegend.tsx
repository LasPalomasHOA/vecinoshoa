import React from 'react';

interface CalendarLegendProps {
  counts?: {
    npg?: number;
    amenity?: number;
    dueno?: number;
    pg?: number;
    pendiente?: number;
    checkedIn?: number;
  };
  dayColWidth?: number;
  onDayColWidthChange?: (width: number) => void;
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({ 
  counts,
  dayColWidth = 40,
  onDayColWidthChange
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-2.5 px-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs">
      {/* Types and Status Groups */}
      <div className="flex flex-wrap items-center gap-5">
        
        {/* Type Indicators (Solid Color Squares) */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#00897B] shadow-2xs shrink-0" />
            <span className="text-slate-800 font-bold text-[11px]">Huésped sin Cobro (NPG)</span>
            {counts?.npg !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
                {counts.npg}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#7c3aed] shadow-2xs shrink-0" />
            <span className="text-slate-800 font-bold text-[11px]">Resort Amenity Usage</span>
            {counts?.amenity !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                {counts.amenity}
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

      {/* Density / Day Width Selector (Replaced Tip as requested) */}
      {onDayColWidthChange && (
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => onDayColWidthChange(32)}
            title="Vista compacta (más días visibles)"
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              dayColWidth === 32
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Compacto
          </button>
          <button
            type="button"
            onClick={() => onDayColWidthChange(40)}
            title="Vista normal"
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              dayColWidth === 40
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => onDayColWidthChange(52)}
            title="Vista amplia"
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              dayColWidth === 52
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Amplio
          </button>
        </div>
      )}
    </div>
  );
};
