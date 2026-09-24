import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SolicitudAcceso } from '../../types';
import { 
  Plus, 
  Filter, 
  Building2
} from 'lucide-react';

interface RequestsViewProps {
  onOpenNewRequest: () => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({ onOpenNewRequest }) => {
  const { 
    solicitudes, 
    propiedades, 
    searchQuery, 
    getPropiedadById, 
    updateSolicitudStatus 
  } = useApp();

  const [estatusFilter, setEstatusFilter] = useState<string>('ALL');
  const [propiedadFilter, setPropiedadFilter] = useState<string>('ALL');

  const filteredSolicitudes = solicitudes.filter(sol => {
    const prop = getPropiedadById(sol.propiedad_id);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSolicitud = sol.solicitud.toLowerCase().includes(q);
      const matchCreador = sol.creador_nombre.toLowerCase().includes(q);
      const matchProcesador = sol.procesador_nombre?.toLowerCase().includes(q);
      const matchProp = prop?.nombre.toLowerCase().includes(q);
      const matchComentario = sol.comentario?.toLowerCase().includes(q);
      if (!matchSolicitud && !matchCreador && !matchProcesador && !matchProp && !matchComentario) return false;
    }

    if (estatusFilter !== 'ALL' && sol.estatus !== estatusFilter) return false;
    if (propiedadFilter !== 'ALL' && sol.propiedad_id !== parseInt(propiedadFilter)) return false;

    return true;
  });

  const getStatusBadge = (estatus: SolicitudAcceso['estatus']) => {
    switch (estatus) {
      case 'Aprobado':
      case 'Completado':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      case 'En Proceso':
        return 'bg-sky-50 text-sky-800 border-sky-300 font-bold';
      case 'Pendiente':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
      case 'Rechazado':
        return 'bg-rose-50 text-rose-800 border-rose-300 font-bold';
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Filters Toolbar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-700" />
            <select
              value={estatusFilter}
              onChange={(e) => setEstatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg form-input font-medium cursor-pointer"
            >
              <option value="ALL">Todos los Estatus ({solicitudes.length})</option>
              <option value="Pendiente">Pendientes</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Aprobado">Aprobados</option>
              <option value="Completado">Completados</option>
              <option value="Rechazado">Rechazados</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={propiedadFilter}
              onChange={(e) => setPropiedadFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg form-input font-medium cursor-pointer"
            >
              <option value="ALL">Todas las Propiedades</option>
              {propiedades.map(p => (
                <option key={p.id} value={p.id}>
                  Condo {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onOpenNewRequest}
          className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Nueva Solicitud / Pase de Trabajo</span>
        </button>

      </div>

      {/* Requests Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Creación</th>
                <th className="py-3 px-4">Propiedad</th>
                <th className="py-3 px-4">Creador / Residente</th>
                <th className="py-3 px-4 max-w-sm">Solicitud / Contratista</th>
                <th className="py-3 px-4">Fecha Esperada</th>
                <th className="py-3 px-4">Procesador</th>
                <th className="py-3 px-4">Comentarios HOA</th>
                <th className="py-3 px-4 text-right">Estatus / Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No hay solicitudes registradas con estos filtros.
                  </td>
                </tr>
              ) : (
                filteredSolicitudes.map(sol => {
                  const prop = getPropiedadById(sol.propiedad_id);

                  return (
                    <tr key={sol.id} className="hover:bg-teal-50/40 transition-colors">
                      {/* Creacion */}
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {sol.created_at}
                      </td>

                      {/* Propiedad */}
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {prop?.nombre || `ID ${sol.propiedad_id}`}
                        </span>
                      </td>

                      {/* Creador */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {sol.creador_nombre}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-slate-800 font-medium leading-relaxed max-w-sm">
                        {sol.solicitud}
                      </td>

                      {/* Fecha Esperada */}
                      <td className="py-3 px-4 font-mono text-teal-800 font-bold whitespace-nowrap">
                        {sol.fecha_esperada}
                      </td>

                      {/* Procesador */}
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {sol.procesador_nombre || 'Pendiente'}
                      </td>

                      {/* Comentario */}
                      <td className="py-3 px-4 text-slate-600 text-[11px] italic">
                        {sol.comentario || 'Sin comentarios'}
                      </td>

                      {/* Estatus selector */}
                      <td className="py-3 px-4 text-right">
                        <select
                          value={sol.estatus}
                          onChange={(e) => updateSolicitudStatus(sol.id, e.target.value as SolicitudAcceso['estatus'])}
                          className={`px-2.5 py-1 text-[11px] rounded-lg border cursor-pointer ${getStatusBadge(sol.estatus)}`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Aprobado">Aprobado</option>
                          <option value="Completado">Completado</option>
                          <option value="Rechazado">Rechazado</option>
                        </select>
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
