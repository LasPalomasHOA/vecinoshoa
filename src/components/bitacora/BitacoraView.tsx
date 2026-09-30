import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BitacoraEntry, ModuloBitacora } from '../../types';
import { BitacoraDetailModal } from './BitacoraDetailModal';
import { 
  ClipboardList, 
  Search, 
  Download, 
  RotateCcw, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  KeyRound, 
  LogOut, 
  SlidersHorizontal, 
  Shield, 
  Clock, 
  User, 
  Eye, 
  MessageSquarePlus, 
  X,
  Calendar,
  Layers
} from 'lucide-react';

export const BitacoraView: React.FC = () => {
  const { 
    bitacora, 
    searchQuery: globalSearch, 
    agregarNotaBitacora, 
    limpiarBitacora,
    usuarios 
  } = useApp();
  const { currentUser } = useAuth();

  // Local filter states
  const [localSearch, setLocalSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Modals state
  const [selectedEntry, setSelectedEntry] = useState<BitacoraEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteModule, setNoteModule] = useState<ModuloBitacora>('Sistema');

  // Combined search term
  const effectiveSearch = (localSearch || globalSearch).toLowerCase().trim();

  // Filtered bitácora entries
  const filteredBitacora = useMemo(() => {
    return bitacora.filter(entry => {
      // Free text search
      if (effectiveSearch) {
        const matchDesc = entry.descripcion.toLowerCase().includes(effectiveSearch);
        const matchUser = `${entry.usuario_nombre} ${entry.usuario_email} ${entry.usuario_rol}`.toLowerCase().includes(effectiveSearch);
        const matchEntity = (entry.entidad_nombre || '').toLowerCase().includes(effectiveSearch);
        const matchModule = entry.modulo.toLowerCase().includes(effectiveSearch);
        const matchAction = entry.accion.toLowerCase().includes(effectiveSearch);
        const matchId = entry.id.toLowerCase().includes(effectiveSearch);

        if (!matchDesc && !matchUser && !matchEntity && !matchModule && !matchAction && !matchId) {
          return false;
        }
      }

      // Action Filter
      if (actionFilter !== 'ALL' && entry.accion !== actionFilter) {
        return false;
      }

      // Module Filter
      if (moduleFilter !== 'ALL' && entry.modulo !== moduleFilter) {
        return false;
      }

      // User Filter
      if (userFilter !== 'ALL' && entry.usuario_email !== userFilter && entry.usuario_nombre !== userFilter) {
        return false;
      }

      // Time Filter
      if (timeFilter !== 'ALL') {
        const entryTime = new Date(entry.timestamp).getTime();
        const now = Date.now();
        if (timeFilter === 'TODAY') {
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          if (entryTime < oneDayAgo) return false;
        } else if (timeFilter === 'WEEK') {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (entryTime < sevenDaysAgo) return false;
        }
      }

      return true;
    });
  }, [bitacora, effectiveSearch, actionFilter, moduleFilter, userFilter, timeFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = bitacora.length;
    const creaciones = bitacora.filter(b => b.accion === 'CREACIÓN').length;
    const ediciones = bitacora.filter(b => b.accion === 'EDICIÓN' || b.accion === 'CAMBIO_ESTATUS').length;
    const eliminaciones = bitacora.filter(b => b.accion === 'ELIMINACIÓN').length;
    const checkins = bitacora.filter(b => b.accion === 'CHECK-IN' || b.accion === 'CHECK-OUT').length;
    const supervisorNotes = bitacora.filter(b => b.accion === 'NOTA_SUPERVISOR').length;

    return { total, creaciones, ediciones, eliminaciones, checkins, supervisorNotes };
  }, [bitacora]);

  // Handle Export to CSV
  const handleExportCSV = () => {
    if (filteredBitacora.length === 0) return;

    const headers = ['ID', 'Fecha y Hora', 'Usuario', 'Email', 'Rol', 'Acción', 'Módulo', 'Descripción', 'Entidad Afectada'];
    const rows = filteredBitacora.map(entry => [
      entry.id,
      new Date(entry.timestamp).toLocaleString('es-MX'),
      `"${entry.usuario_nombre.replace(/"/g, '""')}"`,
      entry.usuario_email,
      entry.usuario_rol,
      entry.accion,
      entry.modulo,
      `"${entry.descripcion.replace(/"/g, '""')}"`,
      `"${(entry.entidad_nombre || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bitacora_auditoria_laspalomas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenDetail = (entry: BitacoraEntry) => {
    setSelectedEntry(entry);
    setIsDetailOpen(true);
  };

  const handleSaveSupervisorNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    agregarNotaBitacora(noteContent, noteModule);
    setNoteContent('');
    setIsNoteModalOpen(false);
  };

  const getActionBadge = (accion: BitacoraEntry['accion']) => {
    switch (accion) {
      case 'CREACIÓN':
        return {
          label: 'Creación',
          icon: PlusCircle,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 font-bold',
          iconColor: 'text-emerald-600',
          dot: 'bg-emerald-500'
        };
      case 'EDICIÓN':
        return {
          label: 'Edición',
          icon: Edit3,
          badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/90 font-bold',
          iconColor: 'text-teal-600',
          dot: 'bg-teal-500'
        };
      case 'ELIMINACIÓN':
        return {
          label: 'Eliminación',
          icon: Trash2,
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/90 font-bold',
          iconColor: 'text-rose-600',
          dot: 'bg-rose-500'
        };
      case 'CHECK-IN':
        return {
          label: 'Check-In',
          icon: KeyRound,
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/90 font-bold',
          iconColor: 'text-indigo-600',
          dot: 'bg-indigo-500'
        };
      case 'CHECK-OUT':
        return {
          label: 'Check-Out',
          icon: LogOut,
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/90 font-bold',
          iconColor: 'text-purple-600',
          dot: 'bg-purple-500'
        };
      case 'CAMBIO_ESTATUS':
        return {
          label: 'Estatus',
          icon: SlidersHorizontal,
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/90 font-bold',
          iconColor: 'text-amber-600',
          dot: 'bg-amber-500'
        };
      case 'NOTA_SUPERVISOR':
        return {
          label: 'Nota Supervisor',
          icon: Shield,
          badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/90 font-bold',
          iconColor: 'text-sky-600',
          dot: 'bg-sky-500'
        };
      default:
        return {
          label: accion,
          icon: ClipboardList,
          badgeClass: 'bg-slate-50 text-slate-700 border-slate-200 font-bold',
          iconColor: 'text-slate-600',
          dot: 'bg-slate-500'
        };
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (mins < 1) return 'Hace un momento';
    if (mins < 60) return `Hace ${mins} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return new Date(timestamp).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              <Shield className="w-3.5 h-3.5" />
              Auditoría & Trazabilidad
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • {stats.total} eventos registrados
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bitácora de Gestión Residencial
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Historial de eventos y cambios en condominios, reservaciones, solicitudes de acceso y usuarios.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Nota de Supervisor</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredBitacora.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Descargar reporte en formato CSV"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={limpiarBitacora}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/90 transition-all cursor-pointer"
            title="Recargar registros"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Total Events */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Eventos</span>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{stats.total}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">En bitácora activa</p>
        </div>

        {/* Creaciones */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Creaciones</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-1.5">{stats.creaciones}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Nuevos registros</p>
        </div>

        {/* Ediciones */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Ediciones</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-800 mt-1.5">{stats.ediciones}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Modificaciones</p>
        </div>

        {/* Eliminaciones */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Eliminaciones</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-800 mt-1.5">{stats.eliminaciones}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Bajas realizadas</p>
        </div>

        {/* Operaciones */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Operaciones</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-800 mt-1.5">{stats.checkins + stats.supervisorNotes}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Check-In/Out & Notas</p>
        </div>

      </div>

      {/* Filter Toolbar Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en bitácora por usuario, condo (A 101), acción..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-8 text-xs rounded-xl form-input shadow-2xs border-slate-200"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'CREACIÓN', label: 'Creaciones' },
              { id: 'EDICIÓN', label: 'Ediciones' },
              { id: 'ELIMINACIÓN', label: 'Eliminaciones' },
              { id: 'CHECK-IN', label: 'Check-In' },
              { id: 'CAMBIO_ESTATUS', label: 'Estatus' },
              { id: 'NOTA_SUPERVISOR', label: 'Notas' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActionFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  actionFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle (Table / Timeline) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tabla Detallada
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Línea de Tiempo
            </button>
          </div>

        </div>

        {/* Secondary Filters: Module, User, Time */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Module Filter */}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="h-8 px-2.5 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200"
              >
                <option value="ALL">Todos los Módulos</option>
                <option value="Reservaciones">Reservaciones</option>
                <option value="Propiedades">Propiedades & Torres</option>
                <option value="Usuarios">Residentes & Personal</option>
                <option value="Torres">Torres / Edificios</option>
                <option value="Solicitudes de Acceso">Solicitudes de Acceso</option>
                <option value="Sistema">Sistema & Seguridad</option>
              </select>
            </div>

            {/* User Filter */}
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="h-8 px-2.5 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200"
              >
                <option value="ALL">Todos los Usuarios</option>
                <option value="admin@laspalomas.com">Francisco Amado (Admin)</option>
                <option value="supervisor@laspalomas.com">Carlos Méndez (Supervisor)</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.email}>
                    {u.nombre} {u.apellido} ({u.rol})
                  </option>
                ))}
              </select>
            </div>

            {/* Time Filter */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="h-8 px-2.5 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200"
              >
                <option value="ALL">Todo el Historial</option>
                <option value="TODAY">Últimas 24 Horas</option>
                <option value="WEEK">Últimos 7 Días</option>
              </select>
            </div>

          </div>

          {/* Active Results count / Reset */}
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span>Mostrando <strong>{filteredBitacora.length}</strong> de <strong>{bitacora.length}</strong> registros</span>
            {(actionFilter !== 'ALL' || moduleFilter !== 'ALL' || userFilter !== 'ALL' || timeFilter !== 'ALL' || localSearch) && (
              <button
                onClick={() => {
                  setActionFilter('ALL');
                  setModuleFilter('ALL');
                  setUserFilter('ALL');
                  setTimeFilter('ALL');
                  setLocalSearch('');
                }}
                className="text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Main Content Area */}
      {filteredBitacora.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No se encontraron movimientos registrados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No hay eventos en la bitácora que coincidan con los criterios o filtros seleccionados.
          </p>
          <button
            onClick={() => {
              setActionFilter('ALL');
              setModuleFilter('ALL');
              setUserFilter('ALL');
              setTimeFilter('ALL');
              setLocalSearch('');
            }}
            className="px-4 py-2 bg-teal-50 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
          >
            Restablecer todos los filtros
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Fecha & Hora</th>
                  <th className="py-3.5 px-3">Acción</th>
                  <th className="py-3.5 px-3">Módulo</th>
                  <th className="py-3.5 px-4">Usuario Responsable</th>
                  <th className="py-3.5 px-4">Descripción del Movimiento</th>
                  <th className="py-3.5 px-3">Entidad</th>
                  <th className="py-3.5 px-4 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBitacora.map((entry) => {
                  const badge = getActionBadge(entry.accion);
                  const BadgeIcon = badge.icon;
                  const dateObj = new Date(entry.timestamp);

                  return (
                    <tr 
                      key={entry.id}
                      onClick={() => handleOpenDetail(entry)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {dateObj.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} • {formatRelativeTime(entry.timestamp)}
                          </span>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border ${badge.badgeClass}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Module */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                          {entry.modulo}
                        </span>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 ring-1 ring-teal-200">
                            {entry.usuario_nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                              {entry.usuario_nombre}
                            </p>
                            <p className="text-[10px] text-teal-700 font-semibold">
                              {entry.usuario_rol}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-slate-800 font-medium line-clamp-2 text-xs leading-relaxed">
                          {entry.descripcion}
                        </p>
                      </td>

                      {/* Entity / Target */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {entry.entidad_nombre ? (
                          <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/80 text-[11px]">
                            {entry.entidad_nombre}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Action Detail Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(entry);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-teal-600 group-hover:text-white text-slate-700 font-bold text-[11px] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TIMELINE VIEW */
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {filteredBitacora.map((entry) => {
            const badge = getActionBadge(entry.accion);
            const BadgeIcon = badge.icon;
            const dateObj = new Date(entry.timestamp);

            return (
              <div 
                key={entry.id}
                onClick={() => handleOpenDetail(entry)}
                className="relative bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Timeline node icon */}
                <div className={`absolute -left-[31px] top-5 w-6 h-6 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${badge.dot}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs border ${badge.badgeClass}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {entry.modulo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{dateObj.toLocaleString('es-MX')} ({formatRelativeTime(entry.timestamp)})</span>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {entry.descripcion}
                    </p>
                    {entry.entidad_nombre && (
                      <p className="text-xs text-slate-500">
                        Entidad afectada: <strong className="text-slate-800">{entry.entidad_nombre}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {entry.usuario_nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-bold text-slate-800 leading-tight">{entry.usuario_nombre}</p>
                      <p className="text-[10px] text-teal-700 font-semibold">{entry.usuario_rol}</p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Nueva Nota de Supervisor */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Shield className="w-5 h-5 text-teal-600" />
                <span>Registrar Nota de Auditoría</span>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupervisorNote} className="space-y-4 mt-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Módulo / Área de Inspección
                </label>
                <select
                  value={noteModule}
                  onChange={(e) => setNoteModule(e.target.value as ModuloBitacora)}
                  className="w-full h-9 px-3 text-xs rounded-xl form-input border-slate-200 font-medium cursor-pointer"
                >
                  <option value="Sistema">Sistema & Seguridad General</option>
                  <option value="Reservaciones">Front Desk & Reservaciones</option>
                  <option value="Propiedades">Condominios & Torres</option>
                  <option value="Usuarios">Residentes & Personal</option>
                  <option value="Solicitudes de Acceso">Solicitudes & Pases de Trabajo</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Observación / Nota del Supervisor
                </label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Ej: Se realizó conteo de brazaletes de temporada en caseta de seguridad y se verificaron los marbetes vehiculares sin incidencias."
                  required
                  className="w-full p-3 text-xs rounded-xl form-input border-slate-200 resize-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-700 shrink-0" />
                <p>
                  Esta nota se registrará con la firma digital de <strong>{currentUser?.nombre} {currentUser?.apellido}</strong> ({currentUser?.rol}).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 cursor-pointer"
                >
                  Guardar en Bitácora
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detalle de Auditoría */}
      <BitacoraDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedEntry(null);
        }}
        entry={selectedEntry}
      />

    </div>
  );
};
