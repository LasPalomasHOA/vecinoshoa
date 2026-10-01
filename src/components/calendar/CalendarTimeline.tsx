import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Reservacion, Propiedad } from '../../types';
import { compareCondoNames } from '../../utils/sortUtils';
import { CalendarLegend } from './CalendarLegend';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight,
  Calendar as CalendarIcon, 
  Building2, 
  Plus, 
  Search, 
  Sparkles, 
  BedDouble, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Layers
} from 'lucide-react';

interface CalendarTimelineProps {
  onSelectReservation: (res: Reservacion) => void;
  onNewReservation: (propiedadId?: number, fechaCheckin?: string, fechaCheckout?: string) => void;
}

interface SelectionState {
  propiedadId: number;
  startDate: string;
  hoverDate: string | null;
}

interface MonthInfo {
  monthIndex: number; // 0-11
  year: number;
  name: string;
  daysCount: number;
  startIndex: number; // offset in daysInView
}

interface DayInfo {
  dayNumber: number;
  dayOfWeek: string;
  dateStr: string; // YYYY-MM-DD
  isWeekend: boolean;
  isToday: boolean;
  monthIndex: number;
  monthName: string;
  year: number;
  isFirstDayOfMonth: boolean;
  isLastDayOfMonth: boolean;
  globalIndex: number;
}

export const CalendarTimeline: React.FC<CalendarTimelineProps> = ({
  onSelectReservation,
  onNewReservation
}) => {
  const { 
    propiedades, 
    reservaciones, 
    edificios, 
    getHuespedById,
    getEdificioById,
    checkReservationOverlap
  } = useApp();

  // Range and View Mode State
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // September (0-indexed: 8 = Sept)
  const [viewMode, setViewMode] = useState<'3months' | '1month'>('3months'); // Default 3 months
  const [dayColWidth, setDayColWidth] = useState<number>(40); // 32 (Compacto), 40 (Normal), or 52 (Amplio) px
  
  const [selectedEdificioId, setSelectedEdificioId] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');

  // Interactive 2-day selection state
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);
  const [hoveredPropId, setHoveredPropId] = useState<number | null>(null);

  // Dual Scroll Synchronization Refs
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingTop = useRef<boolean>(false);
  const isSyncingBottom = useRef<boolean>(false);

  const condoColWidth = 150; // px

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Cancel selection on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelection(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Days and Months in view (1 month or 3 consecutive months)
  const { daysInView, monthsInView } = useMemo(() => {
    const monthsCount = viewMode === '3months' ? 3 : 1;
    const days: DayInfo[] = [];
    const months: MonthInfo[] = [];
    
    let currentOffset = 0;
    
    for (let m = 0; m < monthsCount; m++) {
      const targetMonthVal = currentMonth + m;
      const mIdx = ((targetMonthVal % 12) + 12) % 12;
      const yr = currentYear + Math.floor(targetMonthVal / 12);
      
      const daysInThisMonth = new Date(yr, mIdx + 1, 0).getDate();
      
      months.push({
        monthIndex: mIdx,
        year: yr,
        name: monthNames[mIdx],
        daysCount: daysInThisMonth,
        startIndex: currentOffset
      });
      
      for (let d = 1; d <= daysInThisMonth; d++) {
        const dateObj = new Date(yr, mIdx, d);
        const dayOfWeek = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
        const dayOfWeekNum = dateObj.getDay();
        const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;
        const dateStr = `${yr}-${String(mIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        days.push({
          dayNumber: d,
          dayOfWeek: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1, 3),
          dateStr,
          isWeekend,
          isToday: dateStr === '2026-09-23',
          monthIndex: mIdx,
          monthName: monthNames[mIdx],
          year: yr,
          isFirstDayOfMonth: d === 1,
          isLastDayOfMonth: d === daysInThisMonth,
          globalIndex: currentOffset + d - 1
        });
      }
      
      currentOffset += daysInThisMonth;
    }
    
    return { daysInView: days, monthsInView: months };
  }, [currentYear, currentMonth, viewMode]);

  // Total width of the timeline grid
  const totalGridWidth = useMemo(() => {
    return condoColWidth + (daysInView.length * dayColWidth);
  }, [daysInView.length, dayColWidth]);

  // Synchronized horizontal scrolling between Top Scrollbar and Main Grid
  const handleTopScroll = useCallback(() => {
    if (isSyncingTop.current) {
      isSyncingTop.current = false;
      return;
    }
    if (tableScrollRef.current && topScrollRef.current) {
      isSyncingBottom.current = true;
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  }, []);

  const handleTableScroll = useCallback(() => {
    if (isSyncingBottom.current) {
      isSyncingBottom.current = false;
      return;
    }
    if (topScrollRef.current && tableScrollRef.current) {
      isSyncingTop.current = true;
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  }, []);

  // Quick Scroll to Month Start
  const handleScrollToMonth = (startIndex: number) => {
    if (tableScrollRef.current) {
      const targetX = startIndex * dayColWidth;
      tableScrollRef.current.scrollTo({
        left: targetX,
        behavior: 'smooth'
      });
    }
  };

  // Quick Scroll to Today
  const handleScrollToToday = () => {
    if (viewMode === '1month' && currentMonth !== 8) {
      setCurrentMonth(8);
      setCurrentYear(2026);
    }
    setTimeout(() => {
      if (tableScrollRef.current) {
        const todayIdx = daysInView.findIndex(d => d.isToday);
        if (todayIdx !== -1) {
          const containerW = tableScrollRef.current.clientWidth || 800;
          const targetX = Math.max(0, (todayIdx * dayColWidth) - (containerW / 2) + (dayColWidth / 2));
          tableScrollRef.current.scrollTo({
            left: targetX,
            behavior: 'smooth'
          });
        }
      }
    }, 50);
  };

  // Initial auto-scroll to today
  useEffect(() => {
    const timer = setTimeout(() => {
      const todayIdx = daysInView.findIndex(d => d.isToday);
      if (todayIdx !== -1 && tableScrollRef.current) {
        const containerW = tableScrollRef.current.clientWidth || 800;
        const targetX = Math.max(0, (todayIdx * dayColWidth) - (containerW / 3));
        tableScrollRef.current.scrollTo({
          left: targetX,
          behavior: 'smooth'
        });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [currentMonth, currentYear, viewMode]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handlePrevQuarter = () => {
    const newMonth = currentMonth - 3;
    if (newMonth < 0) {
      setCurrentMonth(newMonth + 12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(newMonth);
    }
  };

  const handleNextQuarter = () => {
    const newMonth = currentMonth + 3;
    if (newMonth > 11) {
      setCurrentMonth(newMonth - 12);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(newMonth);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8);
    handleScrollToToday();
  };

  // Filtered properties (Sorted naturally: A-101 before A-1001, A then B then C)
  const filteredProperties = useMemo(() => {
    return propiedades
      .filter(prop => {
        if (selectedEdificioId !== 'ALL' && prop.edificio_id !== parseInt(selectedEdificioId)) {
          return false;
        }
        if (localSearch) {
          const q = localSearch.toLowerCase();
          const matchProp = prop.nombre.toLowerCase().includes(q);
          const ed = getEdificioById(prop.edificio_id);
          const matchEd = ed?.nombre.toLowerCase().includes(q);
          if (!matchProp && !matchEd) return false;
        }
        return true;
      })
      .sort((a, b) => compareCondoNames(a.nombre, b.nombre));
  }, [propiedades, selectedEdificioId, localSearch, getEdificioById]);

  // Statistics for the visible range (3 months or 1 month)
  const rangeStats = useMemo(() => {
    if (daysInView.length === 0) {
      return {
        totalReservations: 0,
        totalNightsBooked: 0,
        occupancyRate: 0,
        checkInsToday: 0,
        counts: { npg: 0, amenity: 0, dueno: 0, pg: 0, pendiente: 0, checkedIn: 0 }
      };
    }

    const firstDateStr = daysInView[0].dateStr;
    const lastDateStr = daysInView[daysInView.length - 1].dateStr;
    const viewStart = new Date(firstDateStr + 'T00:00:00');
    const viewEnd = new Date(lastDateStr + 'T23:59:59');

    const visibleReservations = reservaciones.filter(res => {
      const cin = new Date(res.fecha_checkin + 'T12:00:00');
      const cout = new Date(res.fecha_checkout + 'T12:00:00');
      return cin <= viewEnd && cout >= viewStart;
    });

    let totalNightsBooked = 0;
    const counts = {
      npg: 0,
      amenity: 0,
      dueno: 0,
      pg: 0,
      pendiente: 0,
      checkedIn: 0
    };

    let checkInsToday = 0;

    visibleReservations.forEach(res => {
      const tipo = String(res.tipo_huesped || '');
      if (tipo.includes('Amenidad') || tipo.includes('Amenity')) counts.amenity++;
      else counts.npg++;
      
      if (res.estado === 'Pendiente') counts.pendiente++;
      if (res.estado === 'En Casa (Checked-in)') counts.checkedIn++;

      if (res.fecha_checkin === '2026-09-23') {
        checkInsToday++;
      }

      const cin = new Date(res.fecha_checkin + 'T12:00:00');
      const cout = new Date(res.fecha_checkout + 'T12:00:00');
      const effectiveStart = cin < viewStart ? viewStart : cin;
      const effectiveEnd = cout > viewEnd ? viewEnd : cout;
      const nights = Math.max(0, Math.round((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)));
      totalNightsBooked += nights;
    });

    const totalAvailableRoomNights = filteredProperties.length * daysInView.length;
    const occupancyRate = totalAvailableRoomNights > 0 
      ? Math.min(100, Math.round((totalNightsBooked / totalAvailableRoomNights) * 100))
      : 0;

    return {
      totalReservations: visibleReservations.length,
      totalNightsBooked,
      occupancyRate,
      checkInsToday,
      counts
    };
  }, [reservaciones, daysInView, filteredProperties]);

  const getReservationColor = (res: Reservacion) => {
    // 1. Solid background color by Tipo de Huésped
    let bgClass = 'bg-[#00897B] text-white'; // default NPG
    const tipo = res.tipo_huesped || '';

    if (tipo.includes('Amenidad') || tipo.includes('Amenity')) {
      bgClass = 'bg-[#7c3aed] text-white';
    } else {
      bgClass = 'bg-[#00897B] text-white';
    }

    // 2. Top accent status border by Estatus (Pendiente vs Entrada Registrada)
    let statusBorder = 'border-t-[3.5px] border-[#F4511E]'; // default Pendiente (Naranja)
    if (res.estado === 'En Casa (Checked-in)') {
      statusBorder = 'border-t-[3.5px] border-[#8BC34A]'; // Entrada Registrada (Verde Lima)
    } else if (res.estado === 'Checked-out') {
      statusBorder = 'border-t-[3.5px] border-slate-300/80';
    }

    return `${bgClass} ${statusBorder}`;
  };

  // Helper for cell clicks
  const handleCellClick = (propId: number, dateStr: string) => {
    if (!selection || selection.propiedadId !== propId) {
      // 1st click: Start date selection
      setSelection({
        propiedadId: propId,
        startDate: dateStr,
        hoverDate: dateStr
      });
    } else {
      // 2nd click: Finish range selection and open reservation modal
      const d1 = selection.startDate;
      const d2 = dateStr;
      let checkin = d1 <= d2 ? d1 : d2;
      let checkout = d1 <= d2 ? d2 : d1;

      // If exact same day clicked twice, create a 1-night stay
      if (d1 === d2) {
        try {
          const d = new Date(d1 + 'T12:00:00');
          d.setDate(d.getDate() + 1);
          checkout = d.toISOString().split('T')[0];
        } catch {
          checkout = d1;
        }
      }

      setSelection(null);
      onNewReservation(propId, checkin, checkout);
    }
  };

  // Helper for hovering over cells during selection
  const handleCellMouseEnter = (propId: number, dateStr: string) => {
    setHoveredDateStr(dateStr);
    setHoveredPropId(propId);
    if (selection && selection.propiedadId === propId) {
      setSelection(prev => (prev ? { ...prev, hoverDate: dateStr } : null));
    }
  };

  // Compute active preview range data
  const selectionPreview = useMemo(() => {
    if (!selection) return null;
    const prop = propiedades.find(p => p.id === selection.propiedadId);
    const ed = prop ? getEdificioById(prop.edificio_id) : undefined;
    
    const d1 = selection.startDate;
    const d2 = selection.hoverDate || selection.startDate;
    let checkin = d1 <= d2 ? d1 : d2;
    let checkout = d1 <= d2 ? d2 : d1;

    if (checkin === checkout) {
      try {
        const d = new Date(checkin + 'T12:00:00');
        d.setDate(d.getDate() + 1);
        checkout = d.toISOString().split('T')[0];
      } catch {
        // fallback
      }
    }

    let nights = 1;
    try {
      const startObj = new Date(checkin + 'T12:00:00');
      const endObj = new Date(checkout + 'T12:00:00');
      nights = Math.max(1, Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)));
    } catch {
      nights = 1;
    }

    const conflict = checkReservationOverlap(selection.propiedadId, checkin, checkout);

    return {
      prop,
      ed,
      checkin,
      checkout,
      nights,
      conflict,
      isSameDay: checkin === checkout
    };
  }, [selection, propiedades, getEdificioById, checkReservationOverlap]);

  // Format date readable
  const formatReadableDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const day = parts[2];
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${day} ${monthNames[monthIdx]?.slice(0, 3)}`;
  };

  // Helper for distinct month header badge colors
  const getMonthAccentBg = (monthIdx: number) => {
    const palettes = [
      'bg-teal-50/90 text-teal-900 border-teal-200/90',
      'bg-sky-50/90 text-sky-900 border-sky-200/90',
      'bg-emerald-50/90 text-emerald-900 border-emerald-200/90',
      'bg-indigo-50/90 text-indigo-900 border-indigo-200/90'
    ];
    return palettes[monthIdx % palettes.length];
  };

  return (
    <div className="space-y-4 relative">
      
      {/* 4 Compact Glass KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {viewMode === '3months' ? 'Ocupación Trimestral' : 'Ocupación del Mes'}
            </p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-teal-800">{rangeStats.occupancyRate}%</span>
              <span className="text-[11px] text-teal-600 font-semibold truncate">
                {viewMode === '3months' 
                  ? `${monthsInView.map(m => m.name.slice(0, 3)).join(' - ')}`
                  : monthNames[currentMonth]}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Noches Reservadas</p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{rangeStats.totalNightsBooked}</span>
              <span className="text-[11px] text-slate-500 font-medium">noches totales</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
            <BedDouble className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Llegadas Hoy (23 Sep)</p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-amber-700">{rangeStats.checkInsToday}</span>
              <span className="text-[11px] text-amber-600 font-semibold">check-ins</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unidades Visibles</p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{filteredProperties.length}</span>
              <span className="text-[11px] text-slate-500 font-medium">de {propiedades.length} condos</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Main Control Toolbar */}
      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 min-h-[56px]">
        
        {/* Month Selector & Range Steppers */}
        <div className="flex items-center gap-2 flex-wrap">
          
          <div className="h-9 flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {viewMode === '3months' && (
              <button
                onClick={handlePrevQuarter}
                title="Retroceder 1 trimestre (3 meses)"
                className="h-7.5 w-7.5 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handlePrevMonth}
              title="Mes anterior"
              className="h-7.5 w-7.5 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="px-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-teal-700 shrink-0" />
              <span className="font-extrabold text-xs text-slate-900 tracking-wide uppercase whitespace-nowrap">
                {viewMode === '3months' 
                  ? `${monthsInView[0]?.name.slice(0, 3)} - ${monthsInView[monthsInView.length - 1]?.name.slice(0, 3)} ${monthsInView[0]?.year}`
                  : `${monthNames[currentMonth]} ${currentYear}`}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              title="Mes siguiente"
              className="h-7.5 w-7.5 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {viewMode === '3months' && (
              <button
                onClick={handleNextQuarter}
                title="Avanzar 1 trimestre (3 meses)"
                className="h-7.5 w-7.5 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleToday}
            className={`h-9 px-3.5 rounded-lg font-bold text-xs border transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
              currentMonth === 8 && currentYear === 2026
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200'
            }`}
          >
            <span>Hoy (23 Sep)</span>
          </button>

          {/* View Mode Toggle (1 Month vs 3 Months) */}
          <div className="h-9 flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('1month')}
              className={`h-7.5 px-2.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === '1month'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1 Mes
            </button>
            <button
              onClick={() => setViewMode('3months')}
              className={`h-7.5 px-2.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === '3months'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3 Meses</span>
            </button>
          </div>
        </div>

        {/* Filters and CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar condo (A 101)..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="h-9 pl-8 pr-3 text-xs rounded-lg form-input w-40 sm:w-44"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <select
              value={selectedEdificioId}
              onChange={(e) => setSelectedEdificioId(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200 max-w-[170px]"
            >
              <option value="ALL">Todas las Torres (A - J)</option>
              {edificios.map(ed => (
                <option key={ed.id} value={ed.id}>
                  Torre {ed.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onNewReservation()}
            className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Reservar</span>
          </button>
        </div>

      </div>

      {/* Legend with interactive counters & Compacto / Normal / Amplio Density Selector */}
      <CalendarLegend 
        counts={rangeStats.counts} 
        dayColWidth={dayColWidth}
        onDayColWidthChange={setDayColWidth}
      />

      {/* TIMELINE CONTAINER WITH DEDICATED TOP SCROLLBAR */}
      <div 
        className="rounded-xl glass-panel overflow-hidden border border-slate-200/90 shadow-sm"
        onMouseLeave={() => {
          setHoveredDateStr(null);
          setHoveredPropId(null);
        }}
      >
        {/* SYNCHRONIZED TOP SCROLLBAR TRACK */}
        <div 
          ref={topScrollRef}
          onScroll={handleTopScroll}
          className="top-scrollbar overflow-x-auto overflow-y-hidden bg-slate-100/90 border-b border-slate-200"
          style={{ height: '12px' }}
        >
          <div style={{ width: `${totalGridWidth}px`, height: '1px' }} />
        </div>

        {/* MAIN TIMELINE GANTT GRID CONTAINER (Bottom horizontal scrollbar hidden) */}
        <div 
          ref={tableScrollRef}
          onScroll={handleTableScroll}
          className="overflow-x-auto max-h-[640px] no-horizontal-scrollbar no-scrollbar relative"
        >
          <div style={{ minWidth: `${totalGridWidth}px` }}>
            
            {/* STICKY TWO-TIER HEADER (Month tier + Day tier) */}
            <div className="sticky top-0 z-30 shadow-xs">
              
              {/* TIER 1: Month Super-Header */}
              <div 
                className="grid text-center border-b border-slate-200 select-none"
                style={{
                  gridTemplateColumns: `${condoColWidth}px repeat(${daysInView.length}, ${dayColWidth}px)`
                }}
              >
                {/* Pinned Condo Header Corner */}
                <div 
                  className="sticky left-0 z-40 bg-slate-50/95 backdrop-blur-md px-3.5 py-1.5 font-extrabold text-[11px] text-slate-700 border-r border-slate-200 flex items-center justify-between"
                  style={{ width: `${condoColWidth}px` }}
                >
                  <span className="tracking-wider uppercase">PERIODO</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {daysInView.length}d
                  </span>
                </div>

                {/* Month Spans */}
                {monthsInView.map((m) => (
                  <div
                    key={`${m.year}-${m.monthIndex}`}
                    style={{
                      gridColumn: `span ${m.daysCount}`
                    }}
                    className={`py-1.5 px-3 text-xs font-black uppercase tracking-wider flex items-center justify-between border-r-2 border-slate-300 ${getMonthAccentBg(m.monthIndex)}`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 opacity-70" />
                      <span className="font-extrabold tracking-wide">{m.name} {m.year}</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-white/90 text-slate-700 shadow-2xs border border-slate-200/80">
                        {m.daysCount} días
                      </span>
                    </div>
                    <button
                      onClick={() => handleScrollToMonth(m.startIndex)}
                      className="text-[10px] font-bold text-teal-800 hover:text-teal-950 bg-white/90 hover:bg-white px-2 py-0.5 rounded-md border border-teal-200 transition-all cursor-pointer shadow-2xs"
                    >
                      Enfocar mes
                    </button>
                  </div>
                ))}
              </div>

              {/* TIER 2: Day Columns Header */}
              <div 
                className="grid text-center glass-header border-b border-slate-200 select-none"
                style={{
                  gridTemplateColumns: `${condoColWidth}px repeat(${daysInView.length}, ${dayColWidth}px)`
                }}
              >
                {/* Pinned Condo column header */}
                <div 
                  className="sticky left-0 z-40 bg-white/95 backdrop-blur-md px-3.5 py-2 font-bold text-xs text-slate-800 border-r border-slate-200 flex items-center justify-between shadow-xs"
                  style={{ width: `${condoColWidth}px` }}
                >
                  <span>UNIDAD</span>
                  <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {filteredProperties.length}
                  </span>
                </div>

                {/* Day columns */}
                {daysInView.map((day) => {
                  const isHoveredCol = hoveredDateStr === day.dateStr;

                  return (
                    <div
                      key={day.dateStr}
                      className={`py-1.5 px-0.5 text-[11px] border-r transition-colors select-none ${
                        day.isFirstDayOfMonth && day.globalIndex > 0 ? 'border-l-2 border-slate-300 ' : ''
                      } ${
                        day.isToday
                          ? 'bg-teal-600 text-white font-black shadow-sm ring-1 ring-teal-500 border-r-teal-600'
                          : day.isWeekend
                          ? isHoveredCol ? 'bg-teal-100/70 text-slate-900 font-bold border-r-slate-200' : 'bg-slate-100/70 text-slate-600 font-semibold border-r-slate-200/80'
                          : isHoveredCol ? 'bg-teal-100/60 text-slate-900 font-bold border-r-slate-200' : 'text-slate-600 font-semibold border-r-slate-200/80'
                      }`}
                    >
                      <div className={`text-[9px] uppercase tracking-tighter ${day.isToday ? 'text-teal-100' : 'text-slate-400'}`}>
                        {day.dayOfWeek}
                      </div>
                      <div className={`text-xs mt-0.5 ${day.isToday ? 'text-white font-black' : 'text-slate-800'}`}>
                        {day.dayNumber}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* PROPERTY ROWS */}
            <div className="divide-y divide-slate-100/90 bg-white/60">
              {filteredProperties.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-medium">
                  No hay unidades registradas con estos filtros.
                </div>
              ) : (
                filteredProperties.map((prop) => {
                  const ed = getEdificioById(prop.edificio_id);
                  const propReservations = reservaciones.filter(r => r.propiedad_id === prop.id);
                  const isSelectedProp = selection?.propiedadId === prop.id;
                  const isHoveredRow = hoveredPropId === prop.id;

                  return (
                    <div
                      key={prop.id}
                      className={`grid items-center relative transition-colors group ${
                        isSelectedProp
                          ? 'bg-teal-50/50'
                          : isHoveredRow
                          ? 'bg-teal-50/20'
                          : 'hover:bg-slate-50/70'
                      }`}
                      style={{
                        gridTemplateColumns: `${condoColWidth}px repeat(${daysInView.length}, ${dayColWidth}px)`
                      }}
                    >
                      {/* Sticky Condo column */}
                      <div 
                        className={`sticky left-0 z-20 px-3.5 py-2 border-r border-slate-200 flex items-center justify-between transition-colors shadow-xs ${
                          isSelectedProp
                            ? 'bg-teal-100/90 backdrop-blur-md text-teal-950 font-bold'
                            : isHoveredRow
                            ? 'bg-slate-50/95 backdrop-blur-md'
                            : 'bg-white/95 backdrop-blur-md'
                        }`}
                        style={{ width: `${condoColWidth}px` }}
                      >
                        <div className="min-w-0 pr-1">
                          <span className="font-extrabold text-xs text-slate-900 block truncate">
                            {prop.nombre}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium truncate block">
                            Torre {ed?.nombre.replace('Torre ', '')}
                          </span>
                        </div>
                        <button
                          onClick={() => onNewReservation(prop.id)}
                          title={`Crear nueva reservación en ${prop.nombre}`}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-teal-100 text-teal-700 transition-all active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Day Grid & Reservation bars across 3 Months */}
                      <div 
                        className="relative h-11 items-center grid"
                        style={{
                          gridColumn: `2 / span ${daysInView.length}`,
                          gridTemplateColumns: `repeat(${daysInView.length}, ${dayColWidth}px)`
                        }}
                      >
                        
                        {/* Day clickable slots */}
                        {daysInView.map((day) => {
                          let isInRange = false;
                          if (isSelectedProp && selection) {
                            const minD = selection.startDate <= (selection.hoverDate || selection.startDate) ? selection.startDate : (selection.hoverDate || selection.startDate);
                            const maxD = selection.startDate >= (selection.hoverDate || selection.startDate) ? selection.startDate : (selection.hoverDate || selection.startDate);
                            isInRange = day.dateStr >= minD && day.dateStr <= maxD;
                          }

                          const isHoveredCol = hoveredDateStr === day.dateStr;

                          return (
                            <div
                              key={day.dateStr}
                              onClick={() => handleCellClick(prop.id, day.dateStr)}
                              onMouseEnter={() => handleCellMouseEnter(prop.id, day.dateStr)}
                              className={`h-full border-r cursor-pointer transition-all relative select-none flex items-center justify-center ${
                                day.isFirstDayOfMonth && day.globalIndex > 0 ? 'border-l-2 border-slate-300 ' : ''
                              } ${
                                isInRange
                                  ? 'bg-teal-50/50'
                                  : day.isToday
                                  ? 'bg-teal-50/60 border-r-slate-100/90'
                                  : day.isWeekend
                                  ? isHoveredCol ? 'bg-teal-100/40 border-r-slate-200' : 'bg-slate-50/50 border-r-slate-100/90'
                                  : isHoveredCol ? 'bg-teal-50/50 border-r-slate-200' : 'hover:bg-teal-100/30 border-r-slate-100/90'
                              }`}
                              title={
                                selection && selection.propiedadId === prop.id
                                  ? `Click para finalizar reservación el ${day.dateStr}`
                                  : `Click para iniciar reservación en ${prop.nombre} el ${day.dateStr}`
                              }
                            >
                              {/* Dot indicator on hover if empty */}
                              {isHoveredRow && isHoveredCol && !isSelectedProp && (
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 pointer-events-none" />
                              )}
                            </div>
                          );
                        })}

                        {/* Interactive Range Selection Preview Bar spanning across months */}
                        {isSelectedProp && selection && (
                          (() => {
                            const d1 = selection.startDate;
                            const d2 = selection.hoverDate || selection.startDate;
                            const checkinStr = d1 <= d2 ? d1 : d2;
                            const checkoutStr = d1 <= d2 ? d2 : d1;
                            
                            const totalDays = daysInView.length;
                            const firstDate = daysInView[0].dateStr;
                            const lastDate = daysInView[totalDays - 1].dateStr;

                            if (checkoutStr < firstDate || checkinStr > lastDate) {
                              return null;
                            }

                            let startIdx = daysInView.findIndex(d => d.dateStr === checkinStr);
                            if (startIdx === -1) startIdx = 0;

                            let endIdx = daysInView.findIndex(d => d.dateStr === checkoutStr);
                            if (endIdx === -1) endIdx = totalDays;

                            const nightsInView = Math.max(1, endIdx - startIdx);
                            const leftPct = (startIdx / totalDays) * 100;
                            const widthPct = (nightsInView / totalDays) * 100;
                            const hasConflict = !!selectionPreview?.conflict;

                            return (
                              <div
                                style={{
                                  left: `calc(${leftPct}% + 1px)`,
                                  width: `calc(${widthPct}% - 2px)`,
                                }}
                                className={`absolute inset-y-1 z-20 rounded-lg border-2 border-dashed flex items-center justify-center px-2 pointer-events-none transition-all ${
                                  hasConflict
                                    ? 'border-rose-500 bg-rose-500/20 text-rose-900'
                                    : 'border-teal-700/70 bg-teal-800/15 text-teal-950 font-bold'
                                }`}
                              >
                                <span className="text-[10px] font-black truncate whitespace-nowrap">
                                  {hasConflict
                                    ? `Ocupado (${selectionPreview?.nights}n)`
                                    : `${selectionPreview?.nights} ${selectionPreview?.nights === 1 ? 'noche' : 'noches'} (${formatReadableDate(checkinStr)} → ${formatReadableDate(checkoutStr)})`}
                                </span>
                              </div>
                            );
                          })()
                        )}

                        {/* Existing Reservation Bars spanning nights across multi-month view */}
                        {propReservations.map((res) => {
                          const totalDays = daysInView.length;
                          const viewStartStr = daysInView[0].dateStr;
                          const viewEndStr = daysInView[totalDays - 1].dateStr;

                          // Check if reservation overlaps visible 3-month range
                          if (res.fecha_checkout <= viewStartStr || res.fecha_checkin > viewEndStr) {
                            return null;
                          }

                          let startIdx = daysInView.findIndex(d => d.dateStr === res.fecha_checkin);
                          if (startIdx === -1) {
                            startIdx = 0; // Started prior to visible start
                          }

                          let endIdx = daysInView.findIndex(d => d.dateStr === res.fecha_checkout);
                          if (endIdx === -1) {
                            endIdx = totalDays; // Ends after visible range
                          }

                          const nightsInView = Math.max(1, endIdx - startIdx);
                          const leftPct = (startIdx / totalDays) * 100;
                          const widthPct = (nightsInView / totalDays) * 100;

                          const huesped = getHuespedById(res.huesped_id);
                          const guestName = huesped?.nombres || 'Huésped';
                          const acompList = Array.isArray(res.acompanantes) ? res.acompanantes.filter(a => a.id !== 'titular') : [];
                          const acompNames = acompList.length > 0 ? ` | Acompañantes Habitación: ${acompList.map((a, i) => a.nombre_completo || `Acompañante ${i + 1}`).join(', ')}` : '';
                          const amenityList = Array.isArray(res.acompanantes_amenidades) ? res.acompanantes_amenidades : [];
                          const amenityNames = amenityList.length > 0 ? ` | Solo Amenidades: ${amenityList.map((a, i) => a.nombre_completo || `Acompañante ${i + 1}`).join(', ')}` : '';

                          return (
                            <div
                              key={res.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectReservation(res);
                              }}
                              style={{
                                left: `calc(${leftPct}% + 1px)`,
                                width: `calc(${widthPct}% - 2px)`,
                              }}
                              className={`absolute inset-y-1 z-10 rounded-lg px-2.5 flex items-center cursor-pointer transition-all hover:brightness-110 hover:shadow-md hover:z-20 overflow-hidden ${getReservationColor(res)}`}
                              title={`${res.tipo_huesped} | Titular: ${guestName}${acompNames}${amenityNames} | (${res.fecha_checkin} al ${res.fecha_checkout}) | Estado: ${res.estado} | Brazaletes: ${res.brazaletes || 'N/A'}`}
                            >
                              <span className="text-[10px] font-extrabold truncate whitespace-nowrap drop-shadow-xs">
                                {guestName} {acompList.length > 0 ? `(+${acompList.length})` : res.numero_ocupantes > 1 ? `(+${res.numero_ocupantes - 1})` : ''}
                                {amenityList.length > 0 ? ` [🏊+${amenityList.length}]` : ''}
                              </span>
                            </div>
                          );
                        })}

                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Floating Glass Ribbon when date selection is in progress */}
      {selection && selectionPreview && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-floating rounded-xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-2xl w-[92%] animate-slide-up border ${
          selectionPreview.conflict ? 'border-rose-500/50 bg-rose-50/90' : 'border-teal-500/40'
        }`}>
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center shrink-0 shadow-md ${
              selectionPreview.conflict ? 'bg-rose-600 shadow-rose-700/30' : 'bg-teal-600 shadow-teal-700/30'
            }`}>
              {selectionPreview.conflict ? <AlertCircle className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  {selectionPreview.prop?.nombre}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  (Torre {selectionPreview.ed?.nombre})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-teal-900 font-bold mt-0.5">
                <span>{formatReadableDate(selectionPreview.checkin)}</span>
                <span>→</span>
                <span>{formatReadableDate(selectionPreview.checkout)}</span>
                <span className="text-[11px] font-extrabold px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  {selectionPreview.nights} {selectionPreview.nights === 1 ? 'noche' : 'noches'}
                </span>
                {selectionPreview.conflict && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    ⚠️ Fechas Ocupadas
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelection(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar (Esc)
            </button>
            <button
              disabled={!!selectionPreview.conflict}
              onClick={() => {
                if (selectionPreview.conflict) return;
                const propId = selection.propiedadId;
                const cin = selectionPreview.checkin;
                const cout = selectionPreview.checkout;
                setSelection(null);
                onNewReservation(propId, cin, cout);
              }}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                selectionPreview.conflict
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-700/25 active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{selectionPreview.conflict ? 'Fechas No Disponibles' : 'Confirmar Rango'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
