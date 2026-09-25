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
  Plus
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
      const matchBrazaletes = res.brazaletes?.toLowerCase().includes(q);
      const matchVehiculo = res.vehiculo_info?.toLowerCase().includes(q);
      if (!matchCode && !matchProp && !matchHuesped && !matchBrazaletes && !matchVehiculo) {
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
        
        <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">En Casa (In-House)</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{inHouseCount}</span>
              <span className="text-xs text-teal-700 font-semibold">unidades activas</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-xs">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Llegadas Pendientes</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700">{pendingCount}</span>
              <span className="text-xs text-amber-600 font-semibold">check-ins próximos</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Checked-out</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-700">{checkedOutCount}</span>
              <span className="text-xs text-slate-500 font-medium">salidas registradas</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
            <LogOut className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Condominios</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-900">{propiedades.length}</span>
              <span className="text-xs text-teal-700 font-semibold">Torres A - J</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 min-h-[56px]">
        
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented status buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold h-9">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`h-7.5 px-3 rounded-lg transition-colors duration-150 cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-teal-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({reservaciones.length})
            </button>
            <button
              onClick={() => setStatusFilter('IN_HOUSE')}
              className={`h-7.5 px-3 rounded-lg transition-colors duration-150 cursor-pointer ${
                statusFilter === 'IN_HOUSE' ? 'bg-teal-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En Casa ({inHouseCount})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`h-7.5 px-3 rounded-lg transition-colors duration-150 cursor-pointer ${
                statusFilter === 'PENDING' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('CHECKED_OUT')}
              className={`h-7.5 px-3 rounded-lg transition-colors duration-150 cursor-pointer ${
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
            className="h-9 px-3 text-xs rounded-xl form-input font-medium cursor-pointer border-slate-200"
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
            className="h-9 px-3 text-xs rounded-xl form-input font-medium cursor-pointer border-slate-200"
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
          className="h-9 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Reservación</span>
        </button>

      </div>

      {/* Main Table */}
      <div className="rounded-2xl glass-panel border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Folio / ID</th>
                <th className="py-3 px-4">Propiedad</th>
                <th className="py-3 px-4">Entrada (Check-in)</th>
                <th className="py-3 px-4">Salida (Check-out)</th>
                <th className="py-3 px-4">Huésped Titular</th>
                <th className="py-3 px-4">Tipo & Pago</th>
                <th className="py-3 px-4">Estatus</th>
                <th className="py-3 px-4">Brazaletes & Vehículo</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No se encontraron reservaciones con los filtros activos.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => {
                  const prop = getPropiedadById(res.propiedad_id);
                  const huesped = getHuespedById(res.huesped_id);
                  const isCheckedIn = res.estado === 'En Casa (Checked-in)';

                  return (
                    <tr 
                      key={res.id} 
                      className={`hover:bg-teal-50/40 transition-colors ${
                        isCheckedIn ? 'bg-teal-50/20' : ''
                      }`}
                    >
                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">
                        <button
                          onClick={() => onViewReservationDetail(res)}
                          className="hover:underline flex items-center gap-1"
                        >
                          {res.codigo || res.id}
                        </button>
                      </td>

                      {/* Condo */}
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {prop?.nombre || `ID: ${res.propiedad_id}`}
                        </span>
                      </td>

                      {/* Checkin */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {res.fecha_checkin}
                      </td>

                      {/* Checkout */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {res.fecha_checkout}
                      </td>

                      {/* Guest */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Sin nombre'}
                        </div>
                        {huesped?.telefono && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{huesped.telefono}</span>
                          </div>
                        )}
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          res.tipo_huesped === 'Bloqueo de Dueño'
                            ? 'bg-slate-100 text-slate-800 border border-slate-300'
                            : res.tipo_huesped === 'Huésped con Cobro (PG)'
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : res.tipo_huesped === 'Huésped sin Cobro (NPG)'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}>
                          {res.tipo_huesped}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          {res.pago_tipo || 'Sin pago'}
                        </span>
                      </td>

                      {/* Estatus */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          res.estado === 'En Casa (Checked-in)'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : res.estado === 'Checked-out'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            res.estado === 'En Casa (Checked-in)' ? 'bg-emerald-600' : res.estado === 'Checked-out' ? 'bg-slate-400' : 'bg-amber-500'
                          }`} />
                          {res.estado}
                        </span>
                      </td>

                      {/* Brazaletes */}
                      <td className="py-3 px-4 max-w-xs">
                        {res.brazaletes ? (
                          <div className="flex items-center gap-1 text-teal-800 font-semibold text-[11px]">
                            <Tag className="w-3 h-3 text-teal-600 shrink-0" />
                            <span className="truncate">{res.brazaletes}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Sin asignar</span>
                        )}
                        {res.vehiculo_info && (
                          <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-0.5 truncate">
                            <Car className="w-3 h-3 shrink-0" />
                            <span className="truncate">{res.vehiculo_info}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.estado !== 'En Casa (Checked-in)' && res.estado !== 'Checked-out' ? (
                            <button
                              onClick={() => onCheckIn(res)}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
                              title="Registrar Check-In"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Check-In</span>
                            </button>
                          ) : res.estado === 'En Casa (Checked-in)' ? (
                            <button
                              onClick={() => checkOutReservacion(res.id)}
                              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-300"
                              title="Registrar Salida"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Salida</span>
                            </button>
                          ) : null}

                          <button
                            onClick={() => onViewReservationDetail(res)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditReservation(res)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
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
                            className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition-colors"
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
