import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Reservacion, Propiedad } from '../../types';
import { CalendarLegend } from './CalendarLegend';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Building2, 
  Plus, 
  Search,
  Sparkles,
  BedDouble,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  HelpCircle,
  ChevronDown
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

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // September (0-indexed: 8 = Sept)
  const [selectedEdificioId, setSelectedEdificioId] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');

  // Interactive 2-day selection state
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredPropId, setHoveredPropId] = useState<number | null>(null);

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

  const daysInMonth = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const dayOfWeek = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
      const dayOfWeekNum = dateObj.getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dayNumber: day,
        dayOfWeek: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1, 3),
        dateStr,
        isWeekend,
        isToday: dateStr === '2026-09-23'
      });
    }
    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelection(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelection(null);
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8);
    setSelection(null);
  };

  const filteredProperties = useMemo(() => {
    return propiedades.filter(prop => {
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
    });
  }, [propiedades, selectedEdificioId, localSearch, getEdificioById]);

  // Statistics for the visible month
  const monthStats = useMemo(() => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    const monthReservations = reservaciones.filter(res => {
      const cin = new Date(res.fecha_checkin);
      const cout = new Date(res.fecha_checkout);
      return cin <= monthEnd && cout >= monthStart;
    });

    let totalNightsBooked = 0;
    const counts = {
      dueno: 0,
      pg: 0,
      npg: 0,
      pendiente: 0,
      checkedIn: 0
    };

    let checkInsToday = 0;

    monthReservations.forEach(res => {
      if (res.tipo_huesped === 'Bloqueo de Dueño') counts.dueno++;
      else if (res.tipo_huesped === 'Huésped con Cobro (PG)') counts.pg++;
      else if (res.tipo_huesped === 'Huésped sin Cobro (NPG)') counts.npg++;
      
      if (res.estado === 'Pendiente') counts.pendiente++;
      if (res.estado === 'En Casa (Checked-in)') counts.checkedIn++;

      if (res.fecha_checkin === '2026-09-23') {
        checkInsToday++;
      }

      const cin = new Date(res.fecha_checkin);
      const cout = new Date(res.fecha_checkout);
      const effectiveStart = cin < monthStart ? monthStart : cin;
      const effectiveEnd = cout > monthEnd ? monthEnd : cout;
      const nights = Math.max(0, Math.round((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)));
      totalNightsBooked += nights;
    });

    const totalAvailableRoomNights = filteredProperties.length * daysInMonth.length;
    const occupancyRate = totalAvailableRoomNights > 0 
      ? Math.min(100, Math.round((totalNightsBooked / totalAvailableRoomNights) * 100))
      : 0;

    return {
      totalReservations: monthReservations.length,
      totalNightsBooked,
      occupancyRate,
      checkInsToday,
      counts
    };
  }, [reservaciones, currentYear, currentMonth, filteredProperties, daysInMonth]);

  const getReservationColor = (res: Reservacion) => {
    if (res.estado === 'En Casa (Checked-in)') return 'res-bar-checkedin';
    if (res.tipo_huesped === 'Bloqueo de Dueño') return 'res-bar-owner';
    if (res.tipo_huesped === 'Huésped con Cobro (PG)') return 'res-bar-pg';
    if (res.tipo_huesped === 'Huésped sin Cobro (NPG)') return 'res-bar-npg';
    if (res.estado === 'Pendiente') return 'res-bar-pending';
    return 'res-bar-npg';
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
  const handleCellMouseEnter = (propId: number, dateStr: string, dayNum: number) => {
    setHoveredDay(dayNum);
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

  return (
    <div className="space-y-4 relative">
      
      {/* 4 Compact Glass KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ocupación del Mes</p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-teal-800">{monthStats.occupancyRate}%</span>
              <span className="text-[11px] text-teal-600 font-semibold">{monthNames[currentMonth]}</span>
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
              <span className="text-xl font-black text-slate-900">{monthStats.totalNightsBooked}</span>
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
              <span className="text-xl font-black text-amber-700">{monthStats.checkInsToday}</span>
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

      {/* Top Controls Toolbar */}
      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 min-h-[56px]">
        
        {/* Month Selector */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={handlePrevMonth}
              title="Mes anterior"
              className="h-7.5 w-7.5 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="px-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-teal-700" />
              <span className="font-extrabold text-xs text-slate-900 tracking-wide uppercase">
                {monthNames[currentMonth]} {currentYear}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              title="Mes siguiente"
              className="h-7.5 w-7.5 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className={`h-9 px-3.5 rounded-lg font-bold text-xs border transition-colors duration-150 cursor-pointer ${
              currentMonth === 8 && currentYear === 2026
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200'
            }`}
          >
            Hoy (23 Sep)
          </button>
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
              className="h-9 pl-8 pr-3 text-xs rounded-lg form-input w-44"
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
              className="h-9 px-3 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200"
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

      {/* Legend with interactive counters */}
      <CalendarLegend counts={monthStats.counts} />

      {/* Selection Help Banner when active */}
      {selection && (
        <div className="px-4 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-between text-xs text-teal-950 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
            <span className="font-bold">
              Modo Selección: Seleccionando para {selectionPreview?.prop?.nombre}
            </span>
            <span className="text-teal-800 hidden sm:inline">
              • Fecha de Check-in: <strong className="underline">{formatReadableDate(selection.startDate)}</strong>. Haz click en el día de salida (Check-out).
            </span>
          </div>
          <button
            onClick={() => setSelection(null)}
            className="text-teal-800 hover:text-teal-950 font-bold underline text-[11px] flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Cancelar selección (Esc)
          </button>
        </div>
      )}

      {/* Timeline Gantt Grid */}
      <div 
        className="rounded-xl glass-panel overflow-hidden border border-slate-200/90 shadow-sm"
        onMouseLeave={() => {
          setHoveredDay(null);
          setHoveredPropId(null);
        }}
      >
        <div className="overflow-x-auto max-h-[620px] scrollbar-thin">
          <div className="min-w-[1120px]">
            
            {/* Header Row */}
            <div className="sticky top-0 z-30 glass-header border-b border-slate-200">
              <div 
                className="grid text-center"
                style={{
                  gridTemplateColumns: `140px repeat(${daysInMonth.length}, minmax(36px, 1fr))`
                }}
              >
                
                {/* Condo header */}
                <div className="sticky left-0 z-40 bg-white/95 backdrop-blur-md px-3.5 py-2.5 font-bold text-xs text-slate-800 border-r border-slate-200 flex items-center justify-between shadow-xs">
                  <span>UNIDAD</span>
                  <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {filteredProperties.length}
                  </span>
                </div>

                {/* Day columns */}
                {daysInMonth.map((day) => {
                  const isHoveredCol = hoveredDay === day.dayNumber;

                  return (
                    <div
                      key={day.dayNumber}
                      className={`py-1.5 px-0.5 text-[11px] border-r border-slate-200/80 transition-colors select-none ${
                        day.isToday
                          ? 'bg-teal-600 text-white font-black shadow-sm ring-1 ring-teal-500'
                          : day.isWeekend
                          ? isHoveredCol ? 'bg-teal-100/70 text-slate-900 font-bold' : 'bg-slate-100/60 text-slate-600 font-semibold'
                          : isHoveredCol ? 'bg-teal-100/60 text-slate-900 font-bold' : 'text-slate-600 font-semibold'
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

            {/* Property Rows */}
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
                        gridTemplateColumns: `140px repeat(${daysInMonth.length}, minmax(36px, 1fr))`
                      }}
                    >
                      {/* Sticky Condo column */}
                      <div className={`sticky left-0 z-20 px-3.5 py-2 border-r border-slate-200 flex items-center justify-between transition-colors shadow-xs ${
                        isSelectedProp
                          ? 'bg-teal-100/90 backdrop-blur-md text-teal-950 font-bold'
                          : isHoveredRow
                          ? 'bg-slate-50/95 backdrop-blur-md'
                          : 'bg-white/95 backdrop-blur-md'
                      }`}>
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
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-teal-100 text-teal-700 transition-all active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Day Grid & Reservation bars */}
                      <div 
                        className="relative h-11 items-center grid"
                        style={{
                          gridColumn: `2 / span ${daysInMonth.length}`,
                          gridTemplateColumns: `repeat(${daysInMonth.length}, minmax(36px, 1fr))`
                        }}
                      >
                        
                        {/* Day clickable slots */}
                        {daysInMonth.map((day) => {
                          const isStartDay = isSelectedProp && selection?.startDate === day.dateStr;
                          const isHoverDay = isSelectedProp && selection?.hoverDate === day.dateStr;
                          
                          // Check if cell is in range
                          let isInRange = false;
                          if (isSelectedProp && selection) {
                            const minD = selection.startDate <= (selection.hoverDate || selection.startDate) ? selection.startDate : (selection.hoverDate || selection.startDate);
                            const maxD = selection.startDate >= (selection.hoverDate || selection.startDate) ? selection.startDate : (selection.hoverDate || selection.startDate);
                            isInRange = day.dateStr >= minD && day.dateStr <= maxD;
                          }

                          const isHoveredCol = hoveredDay === day.dayNumber;

                          return (
                            <div
                              key={day.dayNumber}
                              onClick={() => handleCellClick(prop.id, day.dateStr)}
                              onMouseEnter={() => handleCellMouseEnter(prop.id, day.dateStr, day.dayNumber)}
                              className={`h-full border-r border-slate-100/90 cursor-pointer transition-all relative select-none flex items-center justify-center ${
                                isStartDay
                                  ? 'bg-teal-500/30 ring-2 ring-teal-500 z-10'
                                  : isInRange
                                  ? 'bg-teal-400/20'
                                  : day.isToday
                                  ? 'bg-teal-50/60'
                                  : day.isWeekend
                                  ? isHoveredCol ? 'bg-teal-100/40' : 'bg-slate-50/50'
                                  : isHoveredCol ? 'bg-teal-50/50' : 'hover:bg-teal-100/30'
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

                              {isStartDay && (
                                <span className="absolute -top-1 px-1 py-0.2 rounded bg-teal-700 text-white font-black text-[8px] uppercase tracking-tight z-30 shadow-xs pointer-events-none">
                                  Entrada
                                </span>
                              )}
                            </div>
                          );
                        })}

                        {/* Interactive Range Selection Preview Bar */}
                        {isSelectedProp && selection && (
                          (() => {
                            const d1 = selection.startDate;
                            const d2 = selection.hoverDate || selection.startDate;
                            const checkinStr = d1 <= d2 ? d1 : d2;
                            const checkoutStr = d1 <= d2 ? d2 : d1;
                            
                            const inDay = parseInt(checkinStr.split('-')[2], 10);
                            const outDay = parseInt(checkoutStr.split('-')[2], 10);
                            
                            const startCol = Math.max(inDay, 1);
                            const nights = Math.max(1, outDay - inDay);

                            const totalDays = daysInMonth.length;
                            const leftPct = ((startCol - 1) / totalDays) * 100;
                            const widthPct = (nights / totalDays) * 100;
                            const hasConflict = !!selectionPreview?.conflict;

                            return (
                              <div
                                style={{
                                  left: `calc(${leftPct}% + 1px)`,
                                  width: `calc(${widthPct}% - 2px)`,
                                }}
                                className={`absolute inset-y-1 z-20 rounded-lg border-2 border-dashed backdrop-blur-xs flex items-center justify-center px-2 pointer-events-none shadow-soft-glow ${
                                  hasConflict
                                    ? 'border-rose-500 bg-rose-500/25 text-rose-950 animate-pulse'
                                    : 'border-teal-500 bg-teal-500/25 text-teal-950 animate-pulse-glow'
                                }`}
                              >
                                <span className="text-[10px] font-black truncate whitespace-nowrap drop-shadow-xs">
                                  {hasConflict
                                    ? `⚠️ Fechas ocupadas (${nights} ${nights === 1 ? 'noche' : 'noches'})`
                                    : `✨ ${nights} ${nights === 1 ? 'noche' : 'noches'} (${formatReadableDate(checkinStr)} → ${formatReadableDate(checkoutStr)})`}
                                </span>
                              </div>
                            );
                          })()
                        )}

                        {/* Existing Reservation Bars spanning nights without overlap on turnover day */}
                        {propReservations.map((res) => {
                          const checkinParts = res.fecha_checkin.split('-').map(Number);
                          const checkoutParts = res.fecha_checkout.split('-').map(Number);

                          if (checkinParts.length < 3 || checkoutParts.length < 3) return null;

                          const cinDate = new Date(checkinParts[0], checkinParts[1] - 1, checkinParts[2]);
                          const coutDate = new Date(checkoutParts[0], checkoutParts[1] - 1, checkoutParts[2]);

                          const mStart = new Date(currentYear, currentMonth, 1);
                          const mEnd = new Date(currentYear, currentMonth + 1, 0);

                          if (coutDate < mStart || cinDate > mEnd) return null;

                          // Compute visible day bounds in current month
                          let visibleStartDay = 1;
                          if (cinDate >= mStart) {
                            visibleStartDay = checkinParts[2];
                          }

                          let visibleEndDay = daysInMonth.length + 1;
                          if (coutDate <= mEnd) {
                            visibleEndDay = checkoutParts[2];
                          }

                          const startCol = Math.max(1, Math.min(visibleStartDay, daysInMonth.length));
                          const endCol = Math.max(startCol, Math.min(visibleEndDay, daysInMonth.length + 1));
                          const nightsInMonth = Math.max(1, endCol - startCol);

                          const totalDays = daysInMonth.length;
                          const leftPct = ((startCol - 1) / totalDays) * 100;
                          const widthPct = (nightsInMonth / totalDays) * 100;

                          const huesped = getHuespedById(res.huesped_id);
                          const guestName = huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Huésped';

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
                              title={`${res.tipo_huesped} | ${guestName} (${res.fecha_checkin} al ${res.fecha_checkout}) | Estado: ${res.estado} | Brazaletes: ${res.brazaletes || 'N/A'}`}
                            >
                              <span className="text-[10px] font-extrabold truncate whitespace-nowrap drop-shadow-xs">
                                {guestName} {res.numero_ocupantes > 1 ? `+${res.numero_ocupantes - 1}` : ''}
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
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
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
              className={`px-4 py-1.5 rounded-lg font-bold text-xs shadow-md flex items-center gap-1.5 transition-all ${
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
