import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Reservacion } from '../../types';
import {
  TrendingUp,
  Users,
  Calendar,
  Building2,
  KeyRound,
  Clock,
  LogOut,
  CheckCircle2,
  Sparkles,
  Plus,
  QrCode,
  Eye,
  Percent,
  CalendarDays,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
  MapPin
} from 'lucide-react';

interface InicioViewProps {
  onOpenNewReservation: () => void;
  onViewReservationDetail: (res: Reservacion) => void;
  onOpenQrPass: (res: Reservacion) => void;
  onNavigateTab: (tab: any) => void;
}

export const InicioView: React.FC<InicioViewProps> = ({
  onOpenNewReservation,
  onViewReservationDetail,
  onOpenQrPass,
  onNavigateTab
}) => {
  const {
    reservaciones,
    propiedades,
    edificios,
    solicitudes,
    getPropiedadById,
    getHuespedById
  } = useApp();

  const { currentUser } = useAuth();

  // Selected Year & Month Filters for Analysis
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth(); // 0 to 11

  const [selectedPeriod, setSelectedPeriod] = useState<'current_month' | 'current_year' | 'all'>('current_month');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // 1. Calculations for CURRENT IN-HOUSE & TODAY
  const inHouseReservations = useMemo(() => 
    reservaciones.filter(r => r.estado === 'En Casa (Checked-in)'),
    [reservaciones]
  );

  const pendingReservations = useMemo(() => 
    reservaciones.filter(r => r.estado === 'Confirmada' || r.estado === 'Pendiente'),
    [reservaciones]
  );

  const totalCondos = propiedades.length || 1;
  const currentOccupancyRate = Math.round((inHouseReservations.length / totalCondos) * 100);

  // 2. Calculations for Filtered Period (Month / Year / All)
  const periodReservations = useMemo(() => {
    return reservaciones.filter(res => {
      if (!res.fecha_checkin) return false;
      const [rYear, rMonth] = res.fecha_checkin.split('-').map(Number);

      if (selectedPeriod === 'current_month') {
        return rYear === selectedYear && (rMonth - 1) === selectedMonth;
      }
      if (selectedPeriod === 'current_year') {
        return rYear === selectedYear;
      }
      return true;
    });
  }, [reservaciones, selectedPeriod, selectedYear, selectedMonth]);

  // Metrics for the selected period
  const totalPeriodStays = periodReservations.length;
  const totalPeriodGuests = periodReservations.reduce((acc, r) => 
    acc + (r.numero_ocupantes || (1 + (r.acompanantes?.length || 0))), 0
  );

  // Stays by Type of Guest
  const guestTypeDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      'Dueño HOA': 0,
      'Huésped con Cobro (PG)': 0,
      'Huésped sin Cobro (NPG)': 0,
      'Renta / Streamline': 0,
      'Amenidades / Staff': 0
    };

    periodReservations.forEach(r => {
      const tipo = String(r.tipo_huesped || '');
      if (tipo.includes('Dueño') || tipo.includes('Bloqueo')) counts['Dueño HOA']++;
      else if (tipo.includes('Cobro (PG)') || tipo.includes('PG')) counts['Huésped con Cobro (PG)']++;
      else if (tipo.includes('sin Cobro') || tipo.includes('NPG')) counts['Huésped sin Cobro (NPG)']++;
      else if (tipo.includes('Renta') || tipo.includes('Streamline')) counts['Renta / Streamline']++;
      else counts['Amenidades / Staff']++;
    });

    return counts;
  }, [periodReservations]);

  // Occupancy per Tower / Building
  const towerOccupancy = useMemo(() => {
    return edificios.map(ed => {
      const towerProps = propiedades.filter(p => p.edificio_id === ed.id);
      const activeInTower = inHouseReservations.filter(r => {
        const p = getPropiedadById(r.propiedad_id);
        return p?.edificio_id === ed.id;
      }).length;

      const totalInTower = towerProps.length || 1;
      const percent = Math.round((activeInTower / totalInTower) * 100);

      return {
        id: ed.id,
        nombre: ed.nombre,
        total: towerProps.length,
        occupied: activeInTower,
        percent: Math.min(100, percent)
      };
    });
  }, [edificios, propiedades, inHouseReservations, getPropiedadById]);

  // Month-by-month Trend for the Year
  const monthlyTrend = useMemo(() => {
    const months = Array(12).fill(0).map((_, i) => ({
      name: monthNames[i].substring(0, 3),
      fullName: monthNames[i],
      monthIdx: i,
      count: 0,
      guests: 0
    }));

    reservaciones.forEach(r => {
      if (!r.fecha_checkin) return;
      const [y, m] = r.fecha_checkin.split('-').map(Number);
      if (y === selectedYear && m >= 1 && m <= 12) {
        months[m - 1].count++;
        months[m - 1].guests += r.numero_ocupantes || (1 + (r.acompanantes?.length || 0));
      }
    });

    return months;
  }, [reservaciones, selectedYear]);

  const maxMonthCount = Math.max(...monthlyTrend.map(m => m.count), 1);

  // Upcoming Check-ins and Check-outs
  const upcomingArrivals = useMemo(() => {
    return [...reservaciones]
      .filter(r => r.estado === 'Confirmada' || r.estado === 'Pendiente')
      .sort((a, b) => (a.fecha_checkin || '').localeCompare(b.fecha_checkin || ''))
      .slice(0, 5);
  }, [reservaciones]);

  const upcomingDepartures = useMemo(() => {
    return [...reservaciones]
      .filter(r => r.estado === 'En Casa (Checked-in)')
      .sort((a, b) => (a.fecha_checkout || '').localeCompare(b.fecha_checkout || ''))
      .slice(0, 5);
  }, [reservaciones]);

  // Today formatted
  const todayFormatted = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Header / Luxury Resort Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm no-print print:hidden">
        
        {/* Background Real Resort Beach Photo with High Visibility */}
        <img
          src="/las_palomas_resort.jpg"
          alt="Las Palomas Seaside"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-85 pointer-events-none"
        />

        {/* Directional Soft Glass Overlay: clear readability on text left, vivid photo on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/20 pointer-events-none" />

        <div className="relative z-10 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left: Resort Branding & Title */}
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-md bg-white text-teal-900 border border-teal-300 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-teal-700" /> Puerto Peñasco, Sonora
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Operaciones HOA 2026
              </span>
              <span className="text-xs text-slate-700 font-bold capitalize hidden sm:inline">• {todayFormatted}</span>
            </div>

            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-950 leading-tight">
              Las Palomas Seaside Golf Community
              {currentUser && (
                <span className="text-base sm:text-lg font-bold text-teal-800 block sm:inline sm:ml-2">
                  — Bienvenido, {currentUser.nombre} {currentUser.apellido}
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed max-w-xl">
              Portal administrativo y de recepción. Control de condominios, propietarios, estadísticas de ocupación y autorizaciones de acceso.
            </p>
          </div>

          {/* Right: Integrated Action Buttons & Operational Capsules */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            
            {/* 3 Glass Live Stat Cards */}
            <div className="flex items-center gap-2">
              
              {/* En Casa Card */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 shadow-sm hover:border-emerald-500 transition-all">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                  <KeyRound className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-600 block leading-tight">
                    En Casa
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-950">{inHouseReservations.length}</span>
                    <span className="text-xs text-emerald-800 font-black">activas</span>
                  </div>
                </div>
              </div>

              {/* Llegadas Card */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 shadow-sm hover:border-amber-500 transition-all">
                <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                  <Clock className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-600 block leading-tight">
                    Llegadas
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-amber-900">{pendingReservations.length}</span>
                    <span className="text-xs text-amber-800 font-black">pendientes</span>
                  </div>
                </div>
              </div>

              {/* Condos Card */}
              <div className="hidden sm:flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 shadow-sm hover:border-teal-500 transition-all">
                <div className="w-9 h-9 rounded-lg bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-800 shrink-0">
                  <Building2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-600 block leading-tight">
                    Condos
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-teal-950">{propiedades.length}</span>
                    <span className="text-xs text-teal-800 font-black">Torres A-J</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('frontdesk')}
                className="h-10 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-teal-700 stroke-[2.5]" />
                <span>Front Desk</span>
              </button>

              <button
                onClick={onOpenNewReservation}
                className="h-10 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nueva Reserva</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 2. Unified Period & Date Navigator */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Period Mode Switch */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setSelectedPeriod('current_month')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPeriod === 'current_month'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200/60'
                : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-teal-700 stroke-[2.5]" />
            <span>Por Mes</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPeriod('current_year')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPeriod === 'current_year'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200/60'
                : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-700 stroke-[2.5]" />
            <span>Por Año</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPeriod('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPeriod === 'all'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200/60'
                : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-700 stroke-[2.5]" />
            <span>Histórico Total</span>
          </button>
        </div>

        {/* Right: Date Navigator Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {selectedPeriod === 'current_month' && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(y => y - 1);
                  } else {
                    setSelectedMonth(m => m - 1);
                  }
                }}
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs font-bold"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="relative">
                <select
                  value={`${selectedYear}-${selectedMonth}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split('-').map(Number);
                    setSelectedYear(y);
                    setSelectedMonth(m);
                  }}
                  className="h-8 pl-3 pr-8 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-950 cursor-pointer shadow-2xs focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {[2025, 2026, 2027].flatMap(y =>
                    monthNames.map((name, mIdx) => (
                      <option key={`${y}-${mIdx}`} value={`${y}-${mIdx}`}>
                        {name} {y}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(y => y + 1);
                  } else {
                    setSelectedMonth(m => m + 1);
                  }
                }}
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs font-bold"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {(selectedMonth !== currentMonthIdx || selectedYear !== currentYear) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear(currentYear);
                    setSelectedMonth(currentMonthIdx);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-950 border border-teal-300 text-xs font-black transition-colors cursor-pointer ml-1"
                >
                  Mes Actual
                </button>
              )}
            </div>
          )}

          {selectedPeriod === 'current_year' && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedYear(y => y - 1)}
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs font-bold"
                title="Año anterior"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-950 cursor-pointer shadow-2xs focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>Año {y}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setSelectedYear(y => y + 1)}
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs font-bold"
                title="Año siguiente"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {selectedYear !== currentYear && (
                <button
                  type="button"
                  onClick={() => setSelectedYear(currentYear)}
                  className="h-8 px-2.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-950 border border-teal-300 text-xs font-black transition-colors cursor-pointer ml-1"
                >
                  Año Actual
                </button>
              )}
            </div>
          )}

          {selectedPeriod === 'all' && (
            <div className="h-9 px-3.5 rounded-xl bg-teal-50 border border-teal-300 text-teal-950 text-xs font-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Mostrando historial completo ({reservaciones.length} reservaciones)</span>
            </div>
          )}
        </div>

      </div>

      {/* 3. Executive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ocupación Actual */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-teal-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Ocupación en Vivo</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <Percent className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950">{currentOccupancyRate}%</span>
            <span className="text-xs font-black text-teal-800">({inHouseReservations.length} de {totalCondos} condos)</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, currentOccupancyRate)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-700 flex items-center justify-between font-bold">
            <span>{totalCondos - inHouseReservations.length} condominios libres</span>
            <span className="text-teal-800 font-black">Tiempo Real</span>
          </div>
        </div>

        {/* Card 2: Reservaciones en el Período */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-sky-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {selectedPeriod === 'current_month' ? `Estadías en ${monthNames[selectedMonth]}` : selectedPeriod === 'current_year' ? `Estadías en ${selectedYear}` : 'Estadías Históricas'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-800 font-bold">
              <CalendarDays className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950">{totalPeriodStays}</span>
            <span className="text-xs font-black text-sky-800">reservaciones</span>
          </div>
          <div className="mt-3 text-xs text-slate-800 flex items-center gap-1.5 font-bold">
            <Users className="w-4 h-4 text-sky-700" />
            <span>{totalPeriodGuests} huéspedes registrados</span>
          </div>
          <div className="mt-1 text-xs text-slate-600 font-semibold">
            Promedio: {totalPeriodStays > 0 ? (totalPeriodGuests / totalPeriodStays).toFixed(1) : 0} personas por reserva
          </div>
        </div>

        {/* Card 3: Llegadas Pendientes */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Próximos Check-Ins</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-950">{pendingReservations.length}</span>
            <span className="text-xs font-black text-amber-800">por arribar</span>
          </div>
          <div className="mt-3 text-xs text-slate-800 flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Confirmadas o en proceso de arribo</span>
          </div>
          <div className="mt-1 text-xs text-slate-600 font-semibold">
            Revisar brazaletes y folios en Front Desk
          </div>
        </div>

        {/* Card 4: Solicitudes de Acceso */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Solicitudes de Acceso</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-800 font-bold">
              <FileCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-950">
              {solicitudes.filter(s => s.estatus === 'Pendiente' || s.estatus === 'En Proceso').length}
            </span>
            <span className="text-xs font-black text-indigo-800">pendientes</span>
          </div>
          <div className="mt-3 text-xs text-slate-800 flex items-center gap-1.5 font-bold">
            <Activity className="w-4 h-4 text-indigo-700" />
            <span>{solicitudes.length} solicitudes totales registradas</span>
          </div>
          <div className="mt-1 text-xs text-slate-600 font-semibold">
            Trabajadores, proveedores y visitas
          </div>
        </div>

      </div>

      {/* 4. Two Column Layout: Ocupación por Torres + Distribución de Huéspedes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Ocupación por Torres & Edificios */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-800" />
                <span>Ocupación por Torres (Torres A - J)</span>
              </h2>
              <p className="text-xs text-slate-600 font-medium">Estado de condominios ocupados vs disponibles en vivo</p>
            </div>
            <button
              onClick={() => onNavigateTab('properties')}
              className="text-xs font-extrabold text-teal-800 hover:text-teal-950 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Propiedades</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {towerOccupancy.length === 0 ? (
              <p className="text-xs text-slate-600 py-4 text-center">No hay torres registradas.</p>
            ) : (
              towerOccupancy.map(t => (
                <div key={t.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-950 flex items-center gap-1.5 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                      Torre {t.nombre}
                    </span>
                    <span className="font-black text-slate-900 text-xs">
                      {t.occupied} de {t.total} condos ({t.percent}%)
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden border border-slate-300">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        t.percent > 75 
                          ? 'bg-emerald-600' 
                          : t.percent > 40 
                          ? 'bg-teal-600' 
                          : t.percent > 0 
                          ? 'bg-sky-600' 
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${t.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 Cols: Desglose por Tipo de Huésped */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-800" />
              <span>Distribución por Tipo de Estadía</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Desglose en el período seleccionado ({totalPeriodStays} reservaciones)
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(guestTypeDistribution).map(([tipo, count]) => {
              const pct = totalPeriodStays > 0 ? Math.round((count / totalPeriodStays) * 100) : 0;
              return (
                <div key={tipo} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-black text-slate-950 text-sm">{tipo}</div>
                    <div className="text-xs text-slate-600 font-bold">{count} reservaciones ({pct}%)</div>
                  </div>
                  <span className="font-mono font-black text-sm text-teal-950 bg-teal-100 px-3 py-1 rounded-lg border border-teal-300">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. Gráfico de Tendencia Mensual (Año en Curso) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-800" />
              <span>Flujo de Ocupación Mensual - Año {selectedYear}</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">Total de llegadas y reservaciones mes por mes</p>
          </div>
          <span className="text-xs font-black text-teal-950 bg-teal-100 px-3 py-1 rounded-md border border-teal-300">
            {monthlyTrend.reduce((acc, m) => acc + m.count, 0)} Reservas en {selectedYear}
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-12 gap-2 pt-6 pb-2 items-end min-h-[170px]">
          {monthlyTrend.map(m => {
            const barHeightPct = Math.max(12, Math.round((m.count / maxMonthCount) * 100));
            const isCurrentMonth = m.monthIdx === currentMonthIdx && selectedYear === currentYear;

            return (
              <div key={m.monthIdx} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                {/* Tooltip on hover */}
                <div className="text-xs font-black text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-2 py-0.5 rounded border border-slate-300 shadow-sm">
                  {m.count} res.
                </div>

                {/* Bar */}
                <div className="w-full max-w-[36px] bg-slate-100 h-28 rounded-lg overflow-hidden flex items-end border border-slate-200">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isCurrentMonth
                        ? 'bg-teal-700 shadow-sm'
                        : m.count > 0
                        ? 'bg-slate-700 group-hover:bg-teal-600'
                        : 'bg-slate-300'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>

                {/* Month Name */}
                <span className={`text-xs font-black uppercase ${
                  isCurrentMonth ? 'text-teal-800 font-black underline' : 'text-slate-700'
                }`}>
                  {m.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Upcoming Arrivals & Departures Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Next Arrivals */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Próximas Llegadas (Check-Ins)</span>
            </h3>
            <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{upcomingArrivals.length} pendientes</span>
          </div>

          <div className="divide-y divide-slate-200">
            {upcomingArrivals.length === 0 ? (
              <p className="text-xs text-slate-600 py-6 text-center">No hay llegadas pendientes.</p>
            ) : (
              upcomingArrivals.map(res => {
                const prop = getPropiedadById(res.propiedad_id);
                const huesped = getHuespedById(res.huesped_id);

                return (
                  <div key={res.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-black text-slate-950 text-sm flex items-center gap-2">
                        <span>{prop?.nombre || `Unidad ${res.propiedad_id}`}</span>
                        <span className="text-xs font-bold text-slate-700">
                          {huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Sin nombre'}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-900 font-extrabold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Arribo: {res.fecha_checkin}</span>
                        <span className="text-slate-600">• Folio #{res.codigo || res.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenQrPass(res)}
                        className="p-2 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-950 border border-teal-300 transition-colors cursor-pointer font-bold"
                        title="Generar Pase QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onViewReservationDetail(res)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer font-bold"
                        title="Ver Detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Next Departures */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-xs font-black text-rose-950 flex items-center gap-1.5 uppercase tracking-wider">
              <LogOut className="w-4 h-4 text-rose-700" />
              <span>Próximas Salidas (Check-Outs)</span>
            </h3>
            <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{upcomingDepartures.length} en casa</span>
          </div>

          <div className="divide-y divide-slate-200">
            {upcomingDepartures.length === 0 ? (
              <p className="text-xs text-slate-600 py-6 text-center">No hay salidas programadas en casa.</p>
            ) : (
              upcomingDepartures.map(res => {
                const prop = getPropiedadById(res.propiedad_id);
                const huesped = getHuespedById(res.huesped_id);

                return (
                  <div key={res.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-black text-slate-950 text-sm flex items-center gap-2">
                        <span>{prop?.nombre || `Unidad ${res.propiedad_id}`}</span>
                        <span className="text-xs font-bold text-slate-700">
                          {huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Sin nombre'}
                        </span>
                      </div>
                      <div className="text-xs text-rose-900 font-extrabold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-700" />
                        <span>Salida: {res.fecha_checkout}</span>
                        <span className="text-slate-600">• Folio #{res.codigo || res.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenQrPass(res)}
                        className="p-2 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-950 border border-teal-300 transition-colors cursor-pointer font-bold"
                        title="Generar Pase QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onViewReservationDetail(res)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer font-bold"
                        title="Ver Detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default InicioView;

