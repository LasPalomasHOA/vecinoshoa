import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Reservacion, TipoHuesped } from '../../types';
import { 
  KeyRound, 
  Clock, 
  LogOut, 
  Building2, 
  Tag, 
  Car, 
  CheckCircle, 
  Eye, 
  Filter, 
  Edit3, 
  Trash2,
  Phone,
  Plus,
  Users
} from 'lucide-react';

interface FrontDeskViewProps {
  onOpenNewReservation: () => void;
  onEditReservation: (res: Reservacion) => void;
  onViewReservationDetail: (res: Reservacion) => void;
  onCheckIn: (res: Reservacion) => void;
}

export const FrontDeskView: React.FC<FrontDeskViewProps> = ({
  onOpenNewReservation,
  onEditReservation,
  onViewReservationDetail,
  onCheckIn
}) => {
  const { 
    reservaciones, 
    propiedades, 
    searchQuery, 
    checkOutReservacion, 
    deleteReservacion,
    getPropiedadById,
    getHuespedById,
    edificios
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tipoFilter, setTipoFilter] = useState<string>('ALL');
  const [edificioFilter, setEdificioFilter] = useState<string>('ALL');

  const filteredReservations = reservaciones.filter(res => {
    const prop = getPropiedadById(res.propiedad_id);
    const huesped = getHuespedById(res.huesped_id);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = res.codigo?.toLowerCase().includes(q) || `${res.id}`.includes(q);
      const matchProp = prop?.nombre.toLowerCase().includes(q);
      const matchHuesped = huesped ? `${huesped.nombres} ${huesped.apellidos}`.toLowerCase().includes(q) : false;
      const matchAcompanantes = Array.isArray(res.acompanantes) 
        ? res.acompanantes.some(a => a.nombre_completo.toLowerCase().includes(q))
        : false;
      const matchBrazaletes = res.brazaletes?.toLowerCase().includes(q);
      const matchVehiculo = res.vehiculo_info?.toLowerCase().includes(q);
      if (!matchCode && !matchProp && !matchHuesped && !matchAcompanantes && !matchBrazaletes && !matchVehiculo) {
        return false;
      }
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'IN_HOUSE' && res.estado !== 'En Casa (Checked-in)') return false;
      if (statusFilter === 'CHECKED_OUT' && res.estado !== 'Checked-out') return false;
      if (statusFilter === 'PENDING' && res.estado !== 'Pendiente' && res.estado !== 'Confirmada') return false;
    }

    if (tipoFilter !== 'ALL' && res.tipo_huesped !== tipoFilter) return false;

    if (edificioFilter !== 'ALL') {
      if (prop && prop.edificio_id !== parseInt(edificioFilter)) return false;
    }

    return true;
  });

  const inHouseCount = reservaciones.filter(r => r.estado === 'En Casa (Checked-in)').length;
  const pendingCount = reservaciones.filter(r => r.estado === 'Confirmada' || r.estado === 'Pendiente').length;
  const checkedOutCount = reservaciones.filter(r => r.estado === 'Checked-out').length;

  return (
    <div className="space-y-5">
      
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">En Casa (In-House)</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{inHouseCount}</span>
              <span className="text-xs text-teal-700 font-semibold">unidades activas</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-xs">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Llegadas Pendientes</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700">{pendingCount}</span>
              <span className="text-xs text-amber-600 font-semibold">check-ins próximos</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Checked-out</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-700">{checkedOutCount}</span>
              <span className="text-xs text-slate-500 font-medium">salidas registradas</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
            <LogOut className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Condominios</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-900">{propiedades.length}</span>
              <span className="text-xs text-teal-700 font-semibold">Torres A - J</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 min-h-[56px]">
        
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented status buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold h-9">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`h-7.5 px-3 rounded-md transition-colors duration-150 cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-teal-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({reservaciones.length})
            </button>
            <button
              onClick={() => setStatusFilter('IN_HOUSE')}
              className={`h-7.5 px-3 rounded-md transition-colors duration-150 cursor-pointer ${
                statusFilter === 'IN_HOUSE' ? 'bg-teal-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En Casa ({inHouseCount})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`h-7.5 px-3 rounded-md transition-colors duration-150 cursor-pointer ${
                statusFilter === 'PENDING' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('CHECKED_OUT')}
              className={`h-7.5 px-3 rounded-md transition-colors duration-150 cursor-pointer ${
                statusFilter === 'CHECKED_OUT' ? 'bg-slate-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Checked-out ({checkedOutCount})
            </button>
          </div>

          {/* Tipo Selector */}
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200"
          >
            <option value="ALL">Todos los tipos de huéspedes</option>
            <option value="Bloqueo de Dueño">Bloqueo de Dueño</option>
            <option value="Huésped con Cobro (PG)">Huésped con Cobro (PG)</option>
            <option value="Huésped sin Cobro (NPG)">Huésped sin Cobro (NPG)</option>
            <option value="Resort Amenity Usage">Resort Amenity Usage</option>
            <option value="Mantenimiento / Staff">Mantenimiento / Staff</option>
          </select>

          {/* Edificio Selector */}
          <select
            value={edificioFilter}
            onChange={(e) => setEdificioFilter(e.target.value)}
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
          onClick={() => onOpenNewReservation()}
          className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Reservación</span>
        </button>

      </div>

      {/* Main Table */}
      <div className="rounded-xl glass-panel border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 whitespace-nowrap w-20">Folio / ID</th>
                <th className="py-3 px-3 whitespace-nowrap w-28">Propiedad</th>
                <th className="py-3 px-3 whitespace-nowrap w-28">Estadía / Fechas</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[130px]">Huésped Titular</th>
                <th className="py-3 px-3 whitespace-nowrap w-28">Tipo & Pago</th>
                <th className="py-3 px-3 whitespace-nowrap w-24">Estatus</th>
                <th className="py-3 px-3 max-w-[160px]">Brazaletes & Vehículo</th>
                <th className="py-3 px-3 text-right whitespace-nowrap w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No se encontraron reservaciones con los filtros activos.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => {
                  const prop = getPropiedadById(res.propiedad_id);
                  const huesped = getHuespedById(res.huesped_id);
                  const isCheckedIn = res.estado === 'En Casa (Checked-in)';

                  // Clean formatted Tipo badge
                  const getTipoBadge = () => {
                    const tipo = String(res.tipo_huesped || '');
                    if (tipo.includes('Dueño') || tipo.includes('Bloqueo')) {
                      return {
                        label: 'Dueño HOA',
                        className: 'bg-slate-100 text-slate-700 border border-slate-200/80'
                      };
                    }
                    if (tipo.includes('Cobro (PG)') || tipo.includes('PG')) {
                      return {
                        label: 'Huésped (PG)',
                        className: 'bg-sky-50 text-sky-800 border border-sky-200/80'
                      };
                    }
                    if (tipo.includes('sin Cobro') || tipo.includes('NPG')) {
                      return {
                        label: 'Huésped (NPG)',
                        className: 'bg-teal-50 text-teal-800 border border-teal-200/80'
                      };
                    }
                    if (tipo.includes('Renta') || tipo.includes('Streamline')) {
                      return {
                        label: 'Renta / Streamline',
                        className: 'bg-indigo-50 text-indigo-800 border border-indigo-200/80'
                      };
                    }
                    if (tipo.includes('Amenity') || tipo.includes('amenidades')) {
                      return {
                        label: 'Uso Amenidades',
                        className: 'bg-amber-50 text-amber-900 border border-amber-200/80'
                      };
                    }
                    return {
                      label: tipo || 'Estándar',
                      className: 'bg-slate-100 text-slate-700 border border-slate-200'
                    };
                  };

                  // Clean formatted Estatus badge
                  const getEstadoBadge = () => {
                    if (res.estado === 'En Casa (Checked-in)') {
                      return {
                        label: 'En Casa',
                        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold',
                        dotColor: 'bg-emerald-500'
                      };
                    }
                    if (res.estado === 'Confirmada') {
                      return {
                        label: 'Confirmada',
                        className: 'bg-amber-50 text-amber-900 border border-amber-200/80 font-bold',
                        dotColor: 'bg-amber-500'
                      };
                    }
                    if (res.estado === 'Pendiente') {
                      return {
                        label: 'Pendiente',
                        className: 'bg-sky-50 text-sky-800 border border-sky-200/80 font-bold',
                        dotColor: 'bg-sky-500'
                      };
                    }
                    if (res.estado === 'Checked-out') {
                      return {
                        label: 'Checked-out',
                        className: 'bg-slate-100 text-slate-600 border border-slate-200 font-semibold',
                        dotColor: 'bg-slate-400'
                      };
                    }
                    return {
                      label: res.estado,
                      className: 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold',
                      dotColor: 'bg-slate-400'
                    };
                  };

                  const tipoBadge = getTipoBadge();
                  const estadoBadge = getEstadoBadge();

                  // Clean Brazaletes text
                  const hasValidBrazaletes = res.brazaletes && res.brazaletes !== 'x' && res.brazaletes !== 'X';
                  const isBrazaletesPendiente = res.brazaletes === 'Pendiente';

                  // Clean Vehículo text
                  const hasValidVehiculo = res.vehiculo_info && res.vehiculo_info !== 'x' && res.vehiculo_info !== 'X';
                  const isVehiculoPendiente = res.vehiculo_info === 'Pendiente al arribo';

                  return (
                    <tr 
                      key={res.id} 
                      className={`hover:bg-teal-50/40 transition-colors ${
                        isCheckedIn ? 'bg-teal-50/20' : ''
                      }`}
                    >
                      {/* Code */}
                      <td className="py-3 px-3 font-mono font-bold text-teal-700 whitespace-nowrap align-middle">
                        <button
                          onClick={() => onViewReservationDetail(res)}
                          className="hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {res.codigo || res.id}
                        </button>
                      </td>

                      {/* Condo */}
                      <td className="py-3 px-3 whitespace-nowrap align-middle">
                        <span className="font-extrabold text-slate-900 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 shadow-2xs">
                          {prop?.nombre || `ID: ${res.propiedad_id}`}
                        </span>
                      </td>

                      {/* Fechas / Estadía */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap text-slate-700">
                        <div className="font-semibold text-xs text-slate-800">{res.fecha_checkin}</div>
                        <div className="text-[10px] text-slate-400 font-medium">al {res.fecha_checkout}</div>
                      </td>

                      {/* Guest */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                          {huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Sin nombre'}
                        </div>
                        
                        {/* Acompañantes Badge with Tooltip */}
                        {Array.isArray(res.acompanantes) && res.acompanantes.length > 0 && (
                          <div 
                            className="inline-flex items-center gap-1 text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-md font-semibold mt-0.5 cursor-help"
                            title={`Acompañantes: ${res.acompanantes.map(a => `${a.nombre_completo} (${a.tipo})`).join(', ')}`}
                          >
                            <Users className="w-2.5 h-2.5 text-teal-600" />
                            <span>+{res.acompanantes.length} {res.acompanantes.length === 1 ? 'acompañante' : 'acompañantes'}</span>
                          </div>
                        )}

                        {huesped?.telefono && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span>{huesped.telefono}</span>
                          </div>
                        )}
                      </td>

                      {/* Tipo & Pago */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap">
                        <div className="inline-flex flex-col items-start gap-0.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap shadow-2xs ${tipoBadge.className}`}>
                            {tipoBadge.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {res.pago_tipo && res.pago_tipo !== 'Sin pago' ? res.pago_tipo : 'Sin pago'}
                          </span>
                        </div>
                      </td>

                      {/* Estatus */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap shadow-2xs ${estadoBadge.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${estadoBadge.dotColor}`} />
                          {estadoBadge.label}
                        </span>
                      </td>

                      {/* Brazaletes & Vehículo */}
                      <td className="py-3 px-3 max-w-[170px] align-middle">
                        {(() => {
                          const acompList = Array.isArray(res.acompanantes) ? res.acompanantes : [];
                          const totalOccupants = 1 + acompList.length;
                          const deliveredCount = (res.titular_brazalete_entregado ? 1 : (res.estado === 'En Casa (Checked-in)' ? 1 : 0)) + 
                            acompList.filter(a => a.brazalete_entregado).length;
                          const allDelivered = deliveredCount === totalOccupants;
                          const someDelivered = deliveredCount > 0;

                          return (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                  allDelivered 
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                    : someDelivered 
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  <Tag className="w-2.5 h-2.5" />
                                  <span>{deliveredCount}/{totalOccupants} Brazaletes</span>
                                </span>
                              </div>
                              {res.brazaletes && !res.brazaletes.includes('entregados') && (
                                <div className="text-[10px] text-slate-500 mt-0.5 truncate" title={res.brazaletes}>
                                  {res.brazaletes}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {hasValidVehiculo ? (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-1 truncate" title={res.vehiculo_info}>
                            <Car className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className={`truncate ${isVehiculoPendiente ? 'text-slate-400 italic' : ''}`}>
                              {res.vehiculo_info}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 italic text-[10px] mt-0.5">
                            <Car className="w-3 h-3 text-slate-300 shrink-0" />
                            <span>Sin vehículo</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap align-middle">
                        <div className="flex items-center justify-end gap-1">
                          {res.estado !== 'En Casa (Checked-in)' && res.estado !== 'Checked-out' ? (
                            <button
                              onClick={() => onCheckIn(res)}
                              className="h-7 px-2.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors shrink-0"
                              title="Registrar Check-In"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Check-In</span>
                            </button>
                          ) : res.estado === 'En Casa (Checked-in)' ? (
                            <button
                              onClick={() => checkOutReservacion(res.id)}
                              className="h-7 px-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-300 flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors shrink-0"
                              title="Registrar Salida"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Salida</span>
                            </button>
                          ) : null}

                          <button
                            onClick={() => onViewReservationDetail(res)}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                            title="Ver detalles"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditReservation(res)}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('¿Eliminar esta reservación?')) {
                                deleteReservacion(res.id);
                              }
                            }}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
