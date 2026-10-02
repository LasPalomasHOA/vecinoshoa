import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Propiedad } from '../../types';
import { compareCondoNames } from '../../utils/sortUtils';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  Building2,
  Plus,
  Zap,
  Droplet,
  SlidersHorizontal,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface PropertiesViewProps {
  onOpenNewProperty: () => void;
  onEditProperty: (prop: Propiedad) => void;
  onOpenBuildingsManager: () => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  onOpenNewProperty,
  onEditProperty,
  onOpenBuildingsManager
}) => {
  const {
    propiedades,
    edificios,
    grupos,
    searchQuery,
    getEdificioById,
    getGrupoById,
    getOwnerByPropiedadId,
    deletePropiedad
  } = useApp();

  const [selectedEdificio, setSelectedEdificio] = useState<string>('ALL');
  const [selectedGrupo, setSelectedGrupo] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [propertyToDelete, setPropertyToDelete] = useState<Propiedad | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedEdificio, selectedGrupo, pageSize]);

  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const edFilter = selectedEdificio === 'ALL' ? null : parseInt(selectedEdificio, 10);
    const grpFilter = selectedGrupo === 'ALL' ? null : parseInt(selectedGrupo, 10);

    return propiedades.filter(prop => {
      if (edFilter !== null && prop.edificio_id !== edFilter) return false;
      if (grpFilter !== null && prop.grupo_id !== grpFilter) return false;

      if (q) {
        const edName = prop.edificio_nombre || getEdificioById(prop.edificio_id)?.nombre || '';
        const ownerName = prop.owner_nombre ? `${prop.owner_nombre} ${prop.owner_apellido || ''}` : '';
        const ownerEmail = prop.owner_email || '';
        
        const matchName = prop.nombre.toLowerCase().includes(q);
        const matchEd = edName.toLowerCase().includes(q);
        const matchOwner = ownerName.toLowerCase().includes(q) || ownerEmail.toLowerCase().includes(q);
        const matchImpuesto = prop.id_impuesto?.toLowerCase().includes(q);
        const matchMedidor = prop.medidor_electricidad?.toLowerCase().includes(q);
        const matchCoprop = prop.copropietarios?.toLowerCase().includes(q);

        if (!matchName && !matchEd && !matchOwner && !matchImpuesto && !matchMedidor && !matchCoprop) {
          return false;
        }
      }

      return true;
    });
  }, [propiedades, searchQuery, selectedEdificio, selectedGrupo, getEdificioById]);

  // Pagination calculations
  const totalItems = filteredProperties.length;
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProperties = useMemo(() => {
    if (pageSize === -1) return filteredProperties;
    const start = (safePage - 1) * pageSize;
    return filteredProperties.slice(start, start + pageSize);
  }, [filteredProperties, safePage, pageSize]);

  // Clean formatted Grupo badge helper
  const getGrupoBadge = (grupoNombre?: string) => {
    const g = String(grupoNombre || '');
    if (g.includes('POOL') || g.includes('Rental Pool')) {
      return {
        label: 'Rental Pool (POOL)',
        className: 'bg-sky-50 text-sky-800 border border-sky-200/80 font-semibold'
      };
    }
    if (g.includes('NR') || g.includes('No Rental') || g.includes('Uso Propio')) {
      return {
        label: 'No Rental (NR)',
        className: 'bg-slate-100 text-slate-700 border border-slate-200/80 font-semibold'
      };
    }
    if (g.includes('PREMIUM') || g.includes('Premium')) {
      return {
        label: 'Premium Residences',
        className: 'bg-amber-50 text-amber-900 border border-amber-200/80 font-semibold'
      };
    }
    return {
      label: grupoNombre || 'General',
      className: 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold'
    };
  };

  return (
    <div className="space-y-5">

      {/* Filters Toolbar */}
      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 min-h-[56px]">

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <select
              value={selectedEdificio}
              onChange={(e) => setSelectedEdificio(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200"
            >
              <option value="ALL">Todas las Torres ({edificios.length})</option>
              {edificios.map(ed => (
                <option key={ed.id} value={ed.id}>
                  {ed.nombre.startsWith('Torre') ? ed.nombre : `Torre ${ed.nombre}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={selectedGrupo}
              onChange={(e) => setSelectedGrupo(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200"
            >
              <option value="ALL">Todos los Grupos HOA</option>
              {grupos.map(g => (
                <option key={g.id} value={g.id}>
                  Grupo {g.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 h-9">
            <button
              onClick={() => setViewMode('table')}
              className={`h-7.5 px-2.5 rounded-md text-xs font-semibold transition-colors duration-150 flex items-center gap-1 cursor-pointer ${viewMode === 'table' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Vista en Tabla"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`h-7.5 px-2.5 rounded-md text-xs font-semibold transition-colors duration-150 flex items-center gap-1 cursor-pointer ${viewMode === 'cards' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Vista en Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenBuildingsManager}
            className="h-9 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-teal-700" />
            <span>Administrar Torres</span>
          </button>

          <button
            onClick={onOpenNewProperty}
            className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Agregar Propiedad</span>
          </button>
        </div>

      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="rounded-xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 whitespace-nowrap w-44">Condominio</th>
                  <th className="py-3 px-3.5 whitespace-nowrap w-36">Distribución</th>
                  <th className="py-3 px-3.5 whitespace-nowrap min-w-[170px]">Propietario</th>
                  <th className="py-3 px-3.5 whitespace-nowrap w-36">Grupo</th>
                  <th className="py-3 px-3.5 whitespace-nowrap w-40">Medidores (Luz/Agua)</th>
                  <th className="py-3 px-3.5 whitespace-nowrap w-24">Estatus</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap w-28">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProperties.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No se encontraron condominios con estos filtros.
                    </td>
                  </tr>
                ) : (
                  paginatedProperties.map(prop => {
                    const edNombre = prop.edificio_nombre || getEdificioById(prop.edificio_id)?.nombre;
                    const owner = prop.owner_nombre ? {
                      id: prop.owner_id || 0,
                      nombre: prop.owner_nombre,
                      apellido: prop.owner_apellido || '',
                      email: prop.owner_email || '',
                      rol: 'Dueño' as const,
                      idioma: 'es',
                      status: 'Active' as const
                    } : getOwnerByPropiedadId(prop.id);
                    const grupoNombre = prop.grupo_nombre || getGrupoById(prop.grupo_id)?.nombre;
                    const grupoBadge = getGrupoBadge(grupoNombre);

                    return (
                      <tr key={prop.id} className="hover:bg-teal-50/40 transition-colors group">

                        {/* Name & Torre */}
                        <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                          <span className="font-extrabold text-sm text-teal-800">
                            {prop.nombre}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            {edNombre ? (edNombre.startsWith('Torre') ? edNombre : `Torre ${edNombre}`) : `Torre ${prop.edificio_id}`} • Piso {prop.piso}
                          </span>
                        </td>

                        {/* Layout */}
                        <td className="py-3 px-3.5 align-middle whitespace-nowrap text-slate-700">
                          <div>
                            <span className="font-bold">{prop.dormitorios}</span> rec • <span className="font-bold">{prop.banos}</span> baños
                          </div>
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            Capacidad: {prop.capacidad_personas} pers.
                          </span>
                        </td>

                        {/* Owner & Email & Copropietarios */}
                        <td className="py-3 px-3.5 align-middle max-w-[240px]">
                          {owner ? (
                            <div>
                              <span className="font-bold text-slate-900 block truncate">{owner.nombre} {owner.apellido}</span>
                              <span className="text-[10px] text-slate-500 font-mono block truncate">{owner.email || '—'}</span>
                              {prop.copropietarios && (
                                <span className="text-[9.5px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 mt-0.5 block truncate" title={`Copropietarios: ${prop.copropietarios}`}>
                                  👥 {prop.copropietarios}
                                </span>
                              )}
                            </div>
                          ) : prop.copropietarios ? (
                            <div>
                              <span className="text-slate-400 italic text-[11px] block">Sin asignar</span>
                              <span className="text-[9.5px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 mt-0.5 block truncate" title={`Copropietarios: ${prop.copropietarios}`}>
                                👥 {prop.copropietarios}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Sin asignar</span>
                          )}
                        </td>

                        {/* Grupo */}
                        <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap shadow-2xs ${grupoBadge.className}`}
                            title={grupoNombre}
                          >
                            {grupoBadge.label}
                          </span>
                        </td>

                        {/* Medidores */}
                        <td className="py-3 px-3.5 align-middle whitespace-nowrap text-slate-600 text-[11px]">
                          <div className="flex items-center gap-1 text-[10px] font-mono">
                            <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{prop.medidor_electricidad || 'N/A'}</span>
                          </div>
                          {prop.medidor_agua && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 mt-0.5">
                              <Droplet className="w-3 h-3 text-sky-500 shrink-0" />
                              <span>{prop.medidor_agua}</span>
                            </div>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {prop.estado}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right align-middle whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditProperty(prop)}
                              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3 h-3 text-slate-500" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => {
                                setPropertyToDelete(prop);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1 rounded-md hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                              title="Eliminar condominio"
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
      ) : (
        /* Cards Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProperties.map(prop => {
            const edNombre = prop.edificio_nombre || getEdificioById(prop.edificio_id)?.nombre;
            const owner = prop.owner_nombre ? {
              id: prop.owner_id || 0,
              nombre: prop.owner_nombre,
              apellido: prop.owner_apellido || '',
              email: prop.owner_email || '',
              rol: 'Dueño' as const,
              idioma: 'es',
              status: 'Active' as const
            } : getOwnerByPropiedadId(prop.id);
            const grupoNombre = prop.grupo_nombre || getGrupoById(prop.grupo_id)?.nombre;

            return (
              <div key={prop.id} className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-teal-300 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900">{prop.nombre}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 border border-teal-200 text-teal-800">
                        {edNombre ? (edNombre.startsWith('Torre') ? edNombre : `Torre ${edNombre}`) : `Torre ${prop.edificio_id}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Piso {prop.piso} • Capacidad: {prop.capacidad_personas} personas</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap shadow-2xs ${getGrupoBadge(grupoNombre).className}`}>
                    {getGrupoBadge(grupoNombre).label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Distribución</span>
                    <span className="font-semibold text-slate-800">{prop.dormitorios} Rec • {prop.banos} Baños</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Medidores</span>
                    <span className="font-mono text-xs text-slate-700">⚡{prop.medidor_electricidad || 'N/A'} • 💧{prop.medidor_agua || 'N/A'}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-1 text-teal-800 font-bold mb-0.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Propietario</span>
                  </div>
                  {owner ? (
                    <div>
                      <p className="font-bold text-slate-900">{owner.nombre} {owner.apellido}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{owner.email}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Sin asignar</span>
                  )}
                  {prop.copropietarios && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/60">
                      <span className="text-[10px] font-semibold text-teal-800 block">👥 Copropietarios:</span>
                      <p className="text-[10px] text-slate-600 line-clamp-2" title={prop.copropietarios}>
                        {prop.copropietarios}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onEditProperty(prop)}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setPropertyToDelete(prop);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                    title="Eliminar condominio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 font-medium">
          Mostrando <span className="font-bold text-slate-800">{totalItems === 0 ? 0 : pageSize === -1 ? 1 : (safePage - 1) * pageSize + 1}</span> a <span className="font-bold text-slate-800">{pageSize === -1 ? totalItems : Math.min(safePage * pageSize, totalItems)}</span> de <span className="font-bold text-slate-800">{totalItems}</span> condominios
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="h-8 px-2 text-xs rounded-lg form-input font-medium border-slate-200 cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>Todos ({totalItems})</option>
            </select>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 font-semibold text-slate-700 select-none">
                Página {safePage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Property Modal with Motivo */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPropertyToDelete(null);
        }}
        title="Eliminar Condominio"
        itemType="Condominio"
        itemName={propertyToDelete?.nombre || ''}
        details={[
          { 
            label: 'Torre', 
            value: propertyToDelete ? (getEdificioById(propertyToDelete.edificio_id)?.nombre || `ID #${propertyToDelete.edificio_id}`) : 'N/A' 
          },
          { 
            label: 'Propietario', 
            value: propertyToDelete ? (getOwnerByPropiedadId(propertyToDelete.id)?.nombre || 'Sin asignar') : 'N/A' 
          }
        ]}
        placeholder="Escribe el motivo por el cual se da de baja este condominio (ej. Desincorporación, duplicado, corrección de inventario)..."
        onConfirm={async (motivo) => {
          if (propertyToDelete) {
            await deletePropiedad(propertyToDelete.id, motivo);
          }
        }}
      />

    </div>
  );
};
