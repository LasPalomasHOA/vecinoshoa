import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SolicitudAcceso } from '../../types';
import { DeleteRequestModal } from './DeleteRequestModal';
import { 
  Plus, 
  Building2,
  Calendar,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Edit,
  Trash2
} from 'lucide-react';

interface RequestsViewProps {
  onOpenNewRequest: () => void;
  onEditRequest?: (sol: SolicitudAcceso) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({ onOpenNewRequest, onEditRequest }) => {
  const { 
    solicitudes, 
    propiedades, 
    searchQuery, 
    getPropiedadById, 
    updateSolicitudStatus,
    deleteSolicitud
  } = useApp();

  const [requestToDelete, setRequestToDelete] = useState<SolicitudAcceso | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [estatusFilter, setEstatusFilter] = useState<string>('ALL');
  const [propiedadFilter, setPropiedadFilter] = useState<string>('ALL');

  const aprobadosCount = solicitudes.filter(s => s.estatus === 'Aprobado' || s.estatus !== 'Permanente').length;
  const permanentesCount = solicitudes.filter(s => s.estatus === 'Permanente').length;

  const filteredSolicitudes = solicitudes.filter(sol => {
    const prop = getPropiedadById(sol.propiedad_id);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSolicitud = (sol.solicitud || '').toLowerCase().includes(q);
      const matchCreador = (sol.creador_nombre || '').toLowerCase().includes(q);
      const matchProcesador = (sol.procesador_nombre || '').toLowerCase().includes(q);
      const matchProp = (prop?.nombre || '').toLowerCase().includes(q);
      const matchComentario = (sol.comentario || '').toLowerCase().includes(q);
      if (!matchSolicitud && !matchCreador && !matchProcesador && !matchProp && !matchComentario) return false;
    }

    if (estatusFilter !== 'ALL') {
      if (estatusFilter === 'Permanente' && sol.estatus !== 'Permanente') return false;
      if (estatusFilter === 'Aprobado' && sol.estatus === 'Permanente') return false;
    }
    if (propiedadFilter !== 'ALL' && sol.propiedad_id !== parseInt(propiedadFilter)) return false;

    return true;
  });

  const getStatusBadge = (estatus: SolicitudAcceso['estatus'] | string) => {
    switch (estatus) {
      case 'Permanente':
        return 'bg-purple-50 text-purple-800 border-purple-300 font-bold';
      case 'Aprobado':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
    }
  };

  return (
    <div className="space-y-5">
      
      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pases Aprobados</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-800">{aprobadosCount}</span>
              <span className="text-xs text-emerald-700 font-semibold">autorizados</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pases Permanentes</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-800">{permanentesCount}</span>
              <span className="text-xs text-purple-700 font-semibold">acceso continuo</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pases</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-900">{solicitudes.length}</span>
              <span className="text-xs text-teal-700 font-semibold">registrados</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-xs">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filters Toolbar */}
      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 min-h-[56px]">
        
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented status buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold h-9">
            <button
              onClick={() => setEstatusFilter('ALL')}
              className={`h-7.5 px-3 rounded-md transition-colors duration-150 cursor-pointer ${
                estatusFilter === 'ALL' ? 'bg-white text-teal-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({solicitudes.length})
            </button>
            <button
              onClick={() => setEstatusFilter('Aprobado')}
              className={`h-7.5 px-3 rounded-md transition-colors duration-150 cursor-pointer ${
                estatusFilter === 'Aprobado' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aprobados ({aprobadosCount})
            </button>
            <button
              onClick={() => setEstatusFilter('Permanente')}
              className={`h-7.5 px-3 rounded-md transition-colors duration-150 cursor-pointer ${
                estatusFilter === 'Permanente' ? 'bg-purple-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Permanentes ({permanentesCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={propiedadFilter}
              onChange={(e) => setPropiedadFilter(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200"
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
          className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo Pase de Trabajo</span>
        </button>

      </div>

      {/* Requests Table */}
      <div className="rounded-xl glass-panel border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 whitespace-nowrap w-28">Propiedad</th>
                <th className="py-3 px-4 whitespace-nowrap w-44">Solicitante</th>
                <th className="py-3 px-4 min-w-[200px]">Detalle / Trabajo</th>
                <th className="py-3 px-4 whitespace-nowrap w-36">Fecha Acceso</th>
                <th className="py-3 px-4 min-w-[200px]">Gestión HOA & Caseta</th>
                <th className="py-3 px-4 text-center whitespace-nowrap w-36">Estatus</th>
                <th className="py-3 px-4 text-right whitespace-nowrap w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No hay solicitudes registradas con estos filtros.
                  </td>
                </tr>
              ) : (
                filteredSolicitudes.map(sol => {
                  const prop = getPropiedadById(sol.propiedad_id);
                  const fechaCreacion = sol.created_at ? sol.created_at.split('T')[0] : '—';
                  const hasValidComentario = sol.comentario && sol.comentario.trim() !== '' && sol.comentario.toLowerCase() !== 'x';
                  const hasValidSolicitud = sol.solicitud && sol.solicitud.trim() !== '' && sol.solicitud.toLowerCase() !== 'x';

                  return (
                    <tr key={sol.id} className="hover:bg-teal-50/40 transition-colors">
                      
                      {/* Propiedad */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md font-extrabold text-xs bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs whitespace-nowrap">
                          {prop?.nombre || `ID ${sol.propiedad_id}`}
                        </span>
                      </td>

                      {/* Solicitante */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs truncate max-w-[160px]" title={sol.creador_nombre || 'Propietario'}>
                          {sol.creador_nombre || 'Propietario'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Residente / Solicitante
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1 rounded-md bg-teal-50 text-teal-700 mt-0.5 shrink-0">
                            <Wrench className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 leading-relaxed" title={sol.solicitud}>
                              {hasValidSolicitud ? sol.solicitud : 'Pase de acceso general / Mantenimiento'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Fecha Acceso y Creación */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-1.5 font-mono text-teal-800 font-bold text-xs">
                          <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{sol.fecha_esperada}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          Sol: {fechaCreacion}
                        </div>
                      </td>

                      {/* Procesador y Comentarios */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-1.5 text-slate-800 text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span className="truncate" title={sol.procesador_nombre || 'Recepción HOA'}>
                            {sol.procesador_nombre || 'Recepción HOA'}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] italic mt-0.5 leading-snug line-clamp-2" title={hasValidComentario ? sol.comentario : 'Sin notas adicionales'}>
                          {hasValidComentario ? sol.comentario : 'Sin notas adicionales'}
                        </div>
                      </td>

                      {/* Estatus selector */}
                      <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                        <select
                          value={sol.estatus === 'Permanente' ? 'Permanente' : 'Aprobado'}
                          onChange={(e) => updateSolicitudStatus(sol.id, e.target.value as SolicitudAcceso['estatus'])}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-2xs cursor-pointer transition-colors ${getStatusBadge(sol.estatus)}`}
                        >
                          <option value="Aprobado">Aprobado</option>
                          <option value="Permanente">Permanente</option>
                        </select>
                      </td>

                      {/* Actions (Edit & Delete) */}
                      <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditRequest && onEditRequest(sol)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Editar pase de acceso"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRequestToDelete(sol);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                            title="Eliminar pase de acceso"
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

      {/* Delete Request Modal with Motivo */}
      <DeleteRequestModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRequestToDelete(null);
        }}
        solicitud={requestToDelete}
        propiedad={requestToDelete ? getPropiedadById(requestToDelete.propiedad_id) : undefined}
        onConfirm={(motivo) => {
          if (requestToDelete) {
            deleteSolicitud(requestToDelete.id, motivo);
          }
        }}
      />

    </div>
  );
};
