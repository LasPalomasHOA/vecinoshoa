import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Propiedad } from '../../types';
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
  User
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

  const filteredProperties = propiedades.filter(prop => {
    const edificio = getEdificioById(prop.edificio_id);
    const owner = getOwnerByPropiedadId(prop.id);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = prop.nombre.toLowerCase().includes(q);
      const matchEd = edificio?.nombre.toLowerCase().includes(q);
      const matchOwner = owner ? `${owner.nombre} ${owner.apellido}`.toLowerCase().includes(q) || owner.email.toLowerCase().includes(q) : false;
      const matchImpuesto = prop.id_impuesto?.toLowerCase().includes(q);
      const matchMedidor = prop.medidor_electricidad?.toLowerCase().includes(q);
      if (!matchName && !matchEd && !matchOwner && !matchImpuesto && !matchMedidor) return false;
    }

    if (selectedEdificio !== 'ALL' && prop.edificio_id !== parseInt(selectedEdificio)) {
      return false;
    }

    if (selectedGrupo !== 'ALL' && prop.grupo_id !== parseInt(selectedGrupo)) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Filters Toolbar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <select
              value={selectedEdificio}
              onChange={(e) => setSelectedEdificio(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg form-input font-medium cursor-pointer"
            >
              <option value="ALL">Todas las Torres ({edificios.length})</option>
              {edificios.map(ed => (
                <option key={ed.id} value={ed.id}>
                  Torre {ed.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={selectedGrupo}
              onChange={(e) => setSelectedGrupo(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg form-input font-medium cursor-pointer"
            >
              <option value="ALL">Todos los Grupos HOA</option>
              {grupos.map(g => (
                <option key={g.id} value={g.id}>
                  Grupo {g.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Vista en Tabla"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'cards' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Vista en Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenBuildingsManager}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-teal-700" />
            <span>Administrar Torres</span>
          </button>

          <button
            onClick={onOpenNewProperty}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Agregar Propiedad</span>
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
                  <th className="py-3 px-4">Condominio</th>
                  <th className="py-3 px-4">Edificio / Torre</th>
                  <th className="py-3 px-4">Distribución</th>
                  <th className="py-3 px-4">Propietario</th>
                  <th className="py-3 px-4">Email Propietario</th>
                  <th className="py-3 px-4">Cuota HOA</th>
                  <th className="py-3 px-4">Grupo</th>
                  <th className="py-3 px-4">Medidores (Luz/Agua)</th>
                  <th className="py-3 px-4">Estatus</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                      No se encontraron condominios con estos filtros.
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map(prop => {
                    const ed = getEdificioById(prop.edificio_id);
                    const owner = getOwnerByPropiedadId(prop.id);
                    const grupo = getGrupoById(prop.grupo_id);

                    return (
                      <tr key={prop.id} className="hover:bg-teal-50/40 transition-colors group">
                        
                        {/* Name */}
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-sm text-teal-800">
                            {prop.nombre}
                          </span>
                          <span className="block text-[10px] text-slate-500">Piso {prop.piso} • {prop.area || 'Estándar'}</span>
                        </td>

                        {/* Torre */}
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {ed?.nombre || `Torre ${prop.edificio_id}`}
                        </td>

                        {/* Layout */}
                        <td className="py-3 px-4 text-slate-700">
                          <span className="font-bold">{prop.dormitorios}</span> rec • <span className="font-bold">{prop.banos}</span> baños
                          <span className="block text-[10px] text-slate-500">Capacidad: {prop.capacidad_personas} pers.</span>
                        </td>

                        {/* Owner */}
                        <td className="py-3 px-4">
                          {owner ? (
                            <span className="font-bold text-slate-900">{owner.nombre} {owner.apellido}</span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Sin asignar</span>
                          )}
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {owner?.email || '—'}
                        </td>

                        {/* Cuota HOA */}
                        <td className="py-3 px-4 font-mono font-bold text-teal-700">
                          ${prop.cuota_hoa || 420} {prop.moneda}
                        </td>

                        {/* Grupo */}
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            grupo?.nombre === 'POOL'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {grupo?.nombre || 'NR'}
                          </span>
                        </td>

                        {/* Medidores */}
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          <div className="flex items-center gap-1 text-[10px] font-mono">
                            <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{prop.medidor_electricidad || 'N/A'}</span>
                          </div>
                          {prop.medidor_agua && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                              <Droplet className="w-3 h-3 text-sky-500 shrink-0" />
                              <span>{prop.medidor_agua}</span>
                            </div>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {prop.estado}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditProperty(prop)}
                              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3 text-slate-500" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar el condominio ${prop.nombre}?`)) {
                                  deletePropiedad(prop.id);
                                }
                              }}
                              className="p-1 rounded-md hover:bg-rose-50 text-rose-600 transition-colors"
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
      ) : (
        /* Cards Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map(prop => {
            const ed = getEdificioById(prop.edificio_id);
            const owner = getOwnerByPropiedadId(prop.id);
            const grupo = getGrupoById(prop.grupo_id);

            return (
              <div key={prop.id} className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-teal-300 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900">{prop.nombre}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 border border-teal-200 text-teal-800">
                        {ed?.nombre}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Piso {prop.piso} • Capacidad: {prop.capacidad_personas} personas</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    grupo?.nombre === 'POOL' ? 'bg-sky-50 text-sky-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {grupo?.nombre || 'NR'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Distribución</span>
                    <span className="font-semibold text-slate-800">{prop.dormitorios} Rec • {prop.banos} Baños</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Cuota HOA</span>
                    <span className="font-mono font-bold text-teal-800">${prop.cuota_hoa || 420} USD</span>
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
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onEditProperty(prop)}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletePropiedad(prop.id)}
                    className="p-1 rounded-lg hover:bg-rose-50 text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
