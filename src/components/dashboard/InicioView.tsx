import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Reservacion, TipoHuesped } from '../../types';
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
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Plus,
  QrCode,
  Eye,
  ShieldCheck,
  Percent,
  CalendarDays,
  FileCheck,
  ChevronRight,
  Activity,
  Layers
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
    getHuespedById,
    getEdificioById
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

  // Helper date parsing
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

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
      
      {/* 1. Header / Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-7 shadow-sm border border-teal-800/60 relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Panel Ejecutivo de Gestión HOA</span>
              <span className="text-teal-400/60">•</span>
              <span className="capitalize">{todayFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bienvenido, {currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Administrador'}
            </h1>
            <p className="text-teal-100/80 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
              Resumen ejecutivo de ocupación en tiempo real, estadísticas mensuales, proyección anual y control de flujos de huéspedes en Las Palomas Resort.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigateTab('frontdesk')}
              className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer backdrop-blur-xs"
            >
              <KeyRound className="w-4 h-4 text-teal-300" />
              <span>Ir a Front Desk</span>
            </button>

            <button
              onClick={onOpenNewReservation}
              className="h-10 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-black text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Reservación</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Period Filter Selector Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-700" />
          <span className="text-xs font-bold text-slate-800">Filtrar Resumen por Período:</span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Segmented Period Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedPeriod('current_month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedPeriod === 'current_month'
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Este Mes ({monthNames[selectedMonth]})
            </button>
            <button
              onClick={() => setSelectedPeriod('current_year')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedPeriod === 'current_year'
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📈 Todo el Año ({selectedYear})
            </button>
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedPeriod === 'all'
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 Todo el Histórico
            </button>
          </div>

          {/* Month Selector if month mode */}
          {selectedPeriod === 'current_month' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="h-9 px-3 text-xs rounded-lg form-input font-bold border-slate-200 cursor-pointer text-teal-900"
            >
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx}>{m} {selectedYear}</option>
              ))}
            </select>
          )}

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-9 px-3 text-xs rounded-lg form-input font-bold border-slate-200 cursor-pointer text-slate-800"
          >
            {[2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>Año {y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Executive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ocupación Actual */}
        <div className="p-5 rounded-2xl glass-card border border-slate-200/90 relative overflow-hidden group hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ocupación en Vivo</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{currentOccupancyRate}%</span>
            <span className="text-xs font-bold text-teal-700">({inHouseReservations.length} de {totalCondos} condos)</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-500 to-teal-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, currentOccupancyRate)}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between font-medium">
            <span>{totalCondos - inHouseReservations.length} condominios libres</span>
            <span className="text-teal-700 font-bold">Tiempo Real</span>
          </div>
        </div>

        {/* Card 2: Reservaciones en el Período */}
        <div className="p-5 rounded-2xl glass-card border border-slate-200/90 relative overflow-hidden group hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {selectedPeriod === 'current_month' ? `Estadías en ${monthNames[selectedMonth]}` : selectedPeriod === 'current_year' ? `Estadías en ${selectedYear}` : 'Estadías Históricas'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-950">{totalPeriodStays}</span>
            <span className="text-xs font-bold text-sky-700">reservaciones</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5 font-semibold">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>{totalPeriodGuests} huéspedes registrados</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            Promedio: {totalPeriodStays > 0 ? (totalPeriodGuests / totalPeriodStays).toFixed(1) : 0} personas por reserva
          </div>
        </div>

        {/* Card 3: Llegadas Pendientes */}
        <div className="p-5 rounded-2xl glass-card border border-slate-200/90 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Próximos Check-Ins</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-950">{pendingReservations.length}</span>
            <span className="text-xs font-bold text-amber-700">por arribar</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Confirmadas o en proceso de arribo</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            Revisar brazaletes y folios en Front Desk
          </div>
        </div>

        {/* Card 4: Solicitudes de Acceso */}
        <div className="p-5 rounded-2xl glass-card border border-slate-200/90 relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Solicitudes de Acceso</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-950">
              {solicitudes.filter(s => s.estatus === 'Pendiente' || s.estatus === 'En Proceso').length}
            </span>
            <span className="text-xs font-bold text-indigo-700">pendientes</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center gap-1 font-semibold">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>{solicitudes.length} solicitudes totales registradas</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            Trabajadores, proveedores y visitas
          </div>
        </div>

      </div>

      {/* 4. Two Column Layout: Ocupación por Torres + Distribución de Huéspedes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Ocupación por Torres & Edificios */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                <span>Ocupación por Torres (Torres A - J)</span>
              </h2>
              <p className="text-[11px] text-slate-400">Estado de condominios ocupados vs disponibles en vivo</p>
            </div>
            <button
              onClick={() => onNavigateTab('properties')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Propiedades</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {towerOccupancy.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hay torres registradas.</p>
            ) : (
              towerOccupancy.map(t => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                      Torre {t.nombre}
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {t.occupied} de {t.total} condos ({t.percent}%)
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        t.percent > 75 
                          ? 'bg-emerald-600' 
                          : t.percent > 40 
                          ? 'bg-teal-600' 
                          : t.percent > 0 
                          ? 'bg-sky-500' 
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
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              <span>Distribución por Tipo de Estadía</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Desglose en el período seleccionado ({totalPeriodStays} reservaciones)
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(guestTypeDistribution).map(([tipo, count]) => {
              const pct = totalPeriodStays > 0 ? Math.round((count / totalPeriodStays) * 100) : 0;
              return (
                <div key={tipo} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800">{tipo}</div>
                    <div className="text-[10px] text-slate-400">{count} reservaciones ({pct}%)</div>
                  </div>
                  <span className="font-mono font-black text-sm text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/80">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. Gráfico de Tendencia Mensual (Año en Curso) */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-700" />
              <span>Flujo de Ocupación Mensual - Año {selectedYear}</span>
            </h2>
            <p className="text-[11px] text-slate-400">Total de llegadas y reservaciones mes por mes</p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
            {monthlyTrend.reduce((acc, m) => acc + m.count, 0)} Reservas en {selectedYear}
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-12 gap-2 pt-6 pb-2 items-end min-h-[160px]">
          {monthlyTrend.map(m => {
            const barHeightPct = Math.max(12, Math.round((m.count / maxMonthCount) * 100));
            const isCurrentMonth = m.monthIdx === currentMonthIdx && selectedYear === currentYear;

            return (
              <div key={m.monthIdx} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                {/* Tooltip on hover */}
                <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                  {m.count} res.
                </div>

                {/* Bar */}
                <div className="w-full max-w-[36px] bg-slate-100 h-28 rounded-lg overflow-hidden flex items-end">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isCurrentMonth
                        ? 'bg-gradient-to-t from-teal-700 to-teal-500 shadow-sm'
                        : m.count > 0
                        ? 'bg-slate-700 group-hover:bg-teal-600'
                        : 'bg-slate-200'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>

                {/* Month Name */}
                <span className={`text-[10px] font-bold uppercase ${
                  isCurrentMonth ? 'text-teal-700 font-extrabold' : 'text-slate-500'
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
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Próximas Llegadas (Check-Ins)</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{upcomingArrivals.length} pendientes</span>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingArrivals.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No hay llegadas pendientes.</p>
            ) : (
              upcomingArrivals.map(res => {
                const prop = getPropiedadById(res.propiedad_id);
                const huesped = getHuespedById(res.huesped_id);

                return (
                  <div key={res.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{prop?.nombre || `Unidad ${res.propiedad_id}`}</span>
                        <span className="text-[10px] font-normal text-slate-500">
                          {huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Sin nombre'}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>Arribo: {res.fecha_checkin}</span>
                        <span className="text-slate-400">• Folio #{res.codigo || res.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenQrPass(res)}
                        className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                        title="Generar Pase QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onViewReservationDetail(res)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Ver Detalles"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Next Departures */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-rose-800">
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Próximas Salidas (Check-Outs)</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{upcomingDepartures.length} en casa</span>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingDepartures.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No hay salidas programadas en casa.</p>
            ) : (
              upcomingDepartures.map(res => {
                const prop = getPropiedadById(res.propiedad_id);
                const huesped = getHuespedById(res.huesped_id);

                return (
                  <div key={res.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{prop?.nombre || `Unidad ${res.propiedad_id}`}</span>
                        <span className="text-[10px] font-normal text-slate-500">
                          {huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Sin nombre'}
                        </span>
                      </div>
                      <div className="text-[10px] text-rose-800 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-rose-600" />
                        <span>Salida: {res.fecha_checkout}</span>
                        <span className="text-slate-400">• Folio #{res.codigo || res.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenQrPass(res)}
                        className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                        title="Generar Pase QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onViewReservationDetail(res)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Ver Detalles"
                      >
                        <Eye className="w-3.5 h-3.5" />
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
