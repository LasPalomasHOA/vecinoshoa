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
  FileSpreadsheet, 
  X,
  Calendar,
  Layers
} from 'lucide-react';

export const BitacoraView: React.FC = () => {
  const { 
    bitacora, 
    searchQuery: globalSearch, 
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
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [bitacora, effectiveSearch, actionFilter, moduleFilter, userFilter, timeFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = bitacora.length;
    const creaciones = bitacora.filter(b => b.accion === 'CREACIÓN').length;
    const ediciones = bitacora.filter(b => b.accion === 'EDICIÓN' || b.accion === 'CAMBIO_ESTATUS').length;
    const eliminaciones = bitacora.filter(b => b.accion === 'ELIMINACIÓN').length;
    const checkins = bitacora.filter(b => b.accion === 'CHECK-IN' || b.accion === 'CHECK-OUT').length;

    return { total, creaciones, ediciones, eliminaciones, checkins };
  }, [bitacora]);

  // Handle Export to Excel
  const handleExportExcel = () => {
    if (filteredBitacora.length === 0) return;

    const title = 'Bitácora de Auditoría y Control – Gestión Residencial';
    const subtitle = 'Las Palomas Seaside Golf Community';
    const exportDate = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let tableRowsHtml = '';
    filteredBitacora.forEach((entry, index) => {
      const cellClass = index % 2 === 0 ? 'td-odd' : 'td-even';
      const formattedDate = new Date(entry.timestamp).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      tableRowsHtml += `
        <tr>
          <td class="${cellClass}" style="mso-number-format:'\\@'; font-weight: bold;">${entry.id}</td>
          <td class="${cellClass}" style="mso-number-format:'\\@';">${formattedDate}</td>
          <td class="${cellClass}">${entry.usuario_nombre}</td>
          <td class="${cellClass}">${entry.usuario_email}</td>
          <td class="${cellClass}">${entry.usuario_rol}</td>
          <td class="${cellClass}" style="font-weight: bold;">${entry.accion}</td>
          <td class="${cellClass}">${entry.modulo}</td>
          <td class="${cellClass}">${entry.entidad_nombre || 'N/A'}</td>
          <td class="${cellClass}">${entry.descripcion}</td>
        </tr>
      `;
    });

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Bitacora Auditoria</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; }
            table { border-collapse: collapse; width: 100%; }
            .report-title { font-size: 14pt; font-weight: bold; text-align: center; color: #0f172a; padding: 6px; }
            .report-subtitle { font-size: 11pt; font-weight: bold; text-align: center; color: #0d9488; padding: 2px; }
            .report-dates { font-size: 9pt; text-align: center; color: #64748b; padding: 2px; }
            .th-cell {
              background-color: #0f766e;
              color: #ffffff;
              font-weight: bold;
              font-size: 10pt;
              text-align: left;
              padding: 8px 10px;
              border: 1pt solid #0d9488;
            }
            .td-odd {
              background-color: #F0FDFA;
              color: #0f172a;
              font-size: 9pt;
              padding: 6px 10px;
              border-bottom: 0.5pt solid #E2E8F0;
              vertical-align: middle;
            }
            .td-even {
              background-color: #FFFFFF;
              color: #0f172a;
              font-size: 9pt;
              padding: 6px 10px;
              border-bottom: 0.5pt solid #E2E8F0;
              vertical-align: middle;
            }
          </style>
        </head>
        <body>
          <table>
            <colgroup>
              <col width="120" />
              <col width="140" />
              <col width="160" />
              <col width="180" />
              <col width="120" />
              <col width="120" />
              <col width="130" />
              <col width="180" />
              <col width="380" />
            </colgroup>
            <tr>
              <td colspan="9" class="report-title">${title}</td>
            </tr>
            <tr>
              <td colspan="9" class="report-subtitle">${subtitle}</td>
            </tr>
            <tr>
              <td colspan="9" class="report-dates">Generado el: ${exportDate} | Registros: ${filteredBitacora.length}</td>
            </tr>
            <tr>
              <td colspan="9" style="height: 12px;"></td>
            </tr>
            <thead>
              <tr>
                <th class="th-cell">ID Evento</th>
                <th class="th-cell">Fecha y Hora</th>
                <th class="th-cell">Usuario</th>
                <th class="th-cell">Correo</th>
                <th class="th-cell">Rol</th>
                <th class="th-cell">Acción</th>
                <th class="th-cell">Módulo</th>
                <th class="th-cell">Elemento / Unidad</th>
                <th class="th-cell">Descripción de Auditoría</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="9" style="height: 10px;"></td>
              </tr>
              <tr>
                <td colspan="5" style="font-size: 9pt; color: #64748b; font-style: italic; padding: 6px; border-top: 1pt solid #cbd5e1;">Total de eventos exportados: ${filteredBitacora.length}</td>
                <td colspan="4" style="font-size: 9pt; color: #64748b; text-align: right; font-style: italic; padding: 6px; border-top: 1pt solid #cbd5e1;">Las Palomas HOA — Sistema de Gestión Residencial</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF', excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `Bitacora_Gestion_Residencial_LasPalomas_${dateStr}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenDetail = (entry: BitacoraEntry) => {
    setSelectedEntry(entry);
    setIsDetailOpen(true);
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
            onClick={handleExportExcel}
            disabled={filteredBitacora.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Descargar reporte oficial en formato Excel (.xls)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar a Excel</span>
          </button>

          <button
            onClick={limpiarBitacora}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/90 transition-all cursor-pointer"
            title="Recargar registros de la base de datos"
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
          <p className="text-2xl font-black text-indigo-800 mt-1.5">{stats.checkins}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Check-In / Check-Out</p>
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
              { id: 'CHECK-OUT', label: 'Check-Out' },
              { id: 'CAMBIO_ESTATUS', label: 'Estatus' }
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
                        <div className="text-slate-800 font-medium text-xs leading-relaxed">
                          {(() => {
                            const desc = entry.descripcion || '';
                            const match = desc.match(/(?:(?:\. |\n|\s+)Motivo:\s*)([\s\S]+)$/i);
                            if (match) {
                              const mainPart = desc.slice(0, match.index).trim();
                              const motivo = match[1].trim();
                              return (
                                <div className="space-y-0.5">
                                  <p className="line-clamp-1 text-slate-900 font-semibold">{mainPart}</p>
                                  <p className="text-[11px] text-rose-700 font-bold truncate">
                                    Motivo: <span className="font-normal text-slate-600">{motivo}</span>
                                  </p>
                                </div>
                              );
                            }
                            return <p className="line-clamp-2 whitespace-pre-line">{desc}</p>;
                          })()}
                        </div>
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
                    {(() => {
                      const desc = entry.descripcion || '';
                      const match = desc.match(/(?:(?:\. |\n|\s+)Motivo:\s*)([\s\S]+)$/i);
                      if (match) {
                        const mainPart = desc.slice(0, match.index).trim();
                        const motivo = match[1].trim();
                        return (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-900 leading-relaxed">{mainPart}</p>
                            <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80 text-xs">
                              <span className="font-bold text-rose-800 block mb-0.5">Motivo:</span>
                              <span className="text-slate-700 font-medium whitespace-pre-line">{motivo}</span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <p className="text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                          {desc}
                        </p>
                      );
                    })()}
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
