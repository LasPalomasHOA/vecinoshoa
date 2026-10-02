import React from 'react';
import {
  Users,
  Building2,
  Layers,
  Hash,
  CheckSquare,
  Search,
  Check,
  Building,
  AlertCircle
} from 'lucide-react';
import {
  DestinatarioComunicado,
  TipoSeleccionComunicado,
  Propiedad,
  Edificio
} from '../../types';

interface AudienceSelectorProps {
  criterio: TipoSeleccionComunicado;
  setCriterio: (criterio: TipoSeleccionComunicado) => void;
  generalSelected: boolean;
  setGeneralSelected: (val: boolean) => void;
  selectedTorres: number[];
  setSelectedTorres: React.Dispatch<React.SetStateAction<number[]>>;
  selectedPisos: number[];
  setSelectedPisos: React.Dispatch<React.SetStateAction<number[]>>;
  rangoDesde: string;
  setRangoDesde: (val: string) => void;
  rangoHasta: string;
  setRangoHasta: (val: string) => void;
  excludedUserIds: Set<number>;
  setExcludedUserIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  manualSelectedUserIds: Set<number>;
  setManualSelectedUserIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  todosDestinatarios: DestinatarioComunicado[];
  destinatariosCalculados: DestinatarioComunicado[];
  recipientSearch: string;
  setRecipientSearch: (val: string) => void;
  edificios: Edificio[];
  propiedades: Propiedad[];
  pisosDisponibles: number[];
  onToggleRecipient: (userId: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  criterio,
  setCriterio,
  generalSelected,
  setGeneralSelected,
  selectedTorres,
  setSelectedTorres,
  selectedPisos,
  setSelectedPisos,
  rangoDesde,
  setRangoDesde,
  rangoHasta,
  setRangoHasta,
  excludedUserIds,
  setExcludedUserIds,
  manualSelectedUserIds,
  setManualSelectedUserIds,
  todosDestinatarios,
  destinatariosCalculados,
  recipientSearch,
  setRecipientSearch,
  edificios,
  propiedades,
  pisosDisponibles,
  onToggleRecipient,
  onSelectAll,
  onDeselectAll
}) => {
  const totalDueños = todosDestinatarios.length;
  const countCalculados = destinatariosCalculados.length;
  const coveragePercent = totalDueños > 0 ? Math.round((countCalculados / totalDueños) * 100) : 0;

  const destinatariosVisibles = React.useMemo(() => {
    const baseList = criterio === 'PERSONALIZADO' ? todosDestinatarios : destinatariosCalculados;
    if (!recipientSearch.trim()) return baseList;

    const q = recipientSearch.toLowerCase().trim();
    return baseList.filter(d => {
      const matchName = `${d.nombre} ${d.apellido}`.toLowerCase().includes(q);
      const matchEmail = d.email.toLowerCase().includes(q);
      const matchCondos = d.condominios.some(c => 
        c.propiedad_nombre.toLowerCase().includes(q) || c.edificio_nombre.toLowerCase().includes(q)
      );
      return matchName || matchEmail || matchCondos;
    });
  }, [criterio, todosDestinatarios, destinatariosCalculados, recipientSearch]);

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
      
      {/* Title & Audience Progress */}
      <div className="border-b border-slate-100 pb-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Segmentación de Audiencia</h2>
              <p className="text-[11px] text-slate-500">Define los destinatarios objetivo del aviso</p>
            </div>
          </div>

          <div className="text-right">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
              countCalculados > 0
                ? 'bg-teal-50 text-teal-800 border-teal-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {countCalculados} de {totalDueños} ({coveragePercent}%)
            </span>
          </div>
        </div>

        {/* Coverage Visual Bar */}
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Cobertura de la comunidad</span>
            <span>{countCalculados} propietarios seleccionados</span>
          </div>
        </div>
      </div>

      {/* Selector de Modo de Segmentación */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setCriterio('GENERAL')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            criterio === 'GENERAL'
              ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold shadow-2xs'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Users className="w-4 h-4 text-teal-700" />
            {criterio === 'GENERAL' && <Check className="w-3.5 h-3.5 text-teal-600" />}
          </div>
          <span className="text-xs font-bold">General</span>
          <span className="text-[10px] text-slate-500 font-normal">Toda la comunidad</span>
        </button>

        <button
          type="button"
          onClick={() => setCriterio('TORRE')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            criterio === 'TORRE'
              ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold shadow-2xs'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Building2 className="w-4 h-4 text-teal-700" />
            {criterio === 'TORRE' && <Check className="w-3.5 h-3.5 text-teal-600" />}
          </div>
          <span className="text-xs font-bold">Por Torre</span>
          <span className="text-[10px] text-slate-500 font-normal">Edificios específicos</span>
        </button>

        <button
          type="button"
          onClick={() => setCriterio('PISO')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            criterio === 'PISO'
              ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold shadow-2xs'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Layers className="w-4 h-4 text-teal-700" />
            {criterio === 'PISO' && <Check className="w-3.5 h-3.5 text-teal-600" />}
          </div>
          <span className="text-xs font-bold">Por Piso</span>
          <span className="text-[10px] text-slate-500 font-normal">Niveles específicos</span>
        </button>

        <button
          type="button"
          onClick={() => setCriterio('RANGO')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            criterio === 'RANGO'
              ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold shadow-2xs'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Hash className="w-4 h-4 text-teal-700" />
            {criterio === 'RANGO' && <Check className="w-3.5 h-3.5 text-teal-600" />}
          </div>
          <span className="text-xs font-bold">Rango Condos</span>
          <span className="text-[10px] text-slate-500 font-normal">Del 101 al 110</span>
        </button>

        <button
          type="button"
          onClick={() => setCriterio('PERSONALIZADO')}
          className={`col-span-2 sm:col-span-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            criterio === 'PERSONALIZADO'
              ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold shadow-2xs'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-teal-700 shrink-0" />
            <div>
              <span className="text-xs font-bold block">Personalizado</span>
              <span className="text-[10px] text-slate-500 font-normal">Elegir dueño por dueño</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold">
            {manualSelectedUserIds.size} elegidos
          </span>
        </button>
      </div>

      {/* Sub-Panel de Configuración de Criterio */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
        
        {/* 1. GENERAL */}
        {criterio === 'GENERAL' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Toda la comunidad ({totalDueños} propietarios)</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                generalSelected ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {generalSelected ? `${countCalculados} seleccionados` : '0 seleccionados'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setGeneralSelected(true);
                  setExcludedUserIds(new Set());
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  generalSelected
                    ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Seleccionar toda la comunidad ({totalDueños})</span>
              </button>

              {generalSelected && (
                <button
                  type="button"
                  onClick={() => {
                    setGeneralSelected(false);
                    setExcludedUserIds(new Set());
                  }}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {generalSelected 
                ? 'Todos los condóminos están incluidos. Puedes excluir a personas específicas en la lista de abajo.'
                : 'Ningún condómino está marcado. Haz clic en el botón superior para seleccionarlos a todos.'}
            </p>
          </div>
        )}

        {/* 2. POR TORRE */}
        {criterio === 'TORRE' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Selecciona las torres a incluir:</label>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="text-teal-700 hover:underline font-bold cursor-pointer"
                >
                  Todas
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={onDeselectAll}
                  className="text-slate-500 hover:underline font-bold cursor-pointer"
                >
                  Ninguna
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {edificios.map(ed => {
                const isChecked = selectedTorres.includes(ed.id);
                const condoCount = propiedades.filter(p => p.edificio_id === ed.id).length;
                return (
                  <button
                    key={ed.id}
                    type="button"
                    onClick={() => {
                      setSelectedTorres(prev => 
                        isChecked ? prev.filter(id => id !== ed.id) : [...prev, ed.id]
                      );
                    }}
                    className={`p-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="truncate font-semibold">{ed.nombre}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isChecked ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {condoCount} condos
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. POR PISO */}
        {criterio === 'PISO' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Selecciona los pisos / niveles:</label>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="text-teal-700 hover:underline font-bold cursor-pointer"
                >
                  Todos
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={onDeselectAll}
                  className="text-slate-500 hover:underline font-bold cursor-pointer"
                >
                  Ninguno
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {pisosDisponibles.map(piso => {
                const isChecked = selectedPisos.includes(piso);
                return (
                  <button
                    key={piso}
                    type="button"
                    onClick={() => {
                      setSelectedPisos(prev => 
                        isChecked ? prev.filter(p => p !== piso) : [...prev, piso]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    Piso {piso}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. RANGO */}
        {criterio === 'RANGO' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Rango numérico de condominios:</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block mb-1">Desde unidad:</span>
                <input
                  type="text"
                  placeholder="ej. 101"
                  value={rangoDesde}
                  onChange={(e) => setRangoDesde(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg form-input text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block mb-1">Hasta unidad:</span>
                <input
                  type="text"
                  placeholder="ej. 205"
                  value={rangoHasta}
                  onChange={(e) => setRangoHasta(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg form-input text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. PERSONALIZADO */}
        {criterio === 'PERSONALIZADO' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-bold">Selección individual:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="text-[11px] text-teal-700 hover:underline font-bold cursor-pointer"
                >
                  Seleccionar todos ({totalDueños})
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={onDeselectAll}
                  className="text-[11px] text-slate-500 hover:underline font-bold cursor-pointer"
                >
                  Limpiar selección
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Busca abajo cualquier condómino por nombre, departamento o correo para marcarlo.
            </p>
          </div>
        )}

      </div>

      {/* Lista Interactiva de Destinatarios */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            {criterio === 'PERSONALIZADO'
              ? `Propietarios (${manualSelectedUserIds.size} elegidos de ${totalDueños})`
              : `Destinatarios Filtrados (${countCalculados})`}
          </span>
          
          {criterio !== 'PERSONALIZADO' && countCalculados > 0 && (
            <button
              type="button"
              onClick={() => setExcludedUserIds(new Set())}
              className="text-[11px] text-teal-700 hover:underline font-semibold cursor-pointer"
            >
              Restablecer exclusiones
            </button>
          )}
        </div>

        {/* Search within recipients */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              criterio === 'PERSONALIZADO'
                ? "Buscar por nombre, condo (ej. 101), torre o correo..."
                : "Filtrar en destinatarios seleccionados..."
            }
            value={recipientSearch}
            onChange={(e) => setRecipientSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl form-input shadow-2xs"
          />
        </div>

        {/* Scrollable list */}
        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-1 bg-slate-50/50">
          {destinatariosVisibles.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-1">
              <AlertCircle className="w-5 h-5 mx-auto text-slate-300" />
              {criterio === 'GENERAL' && !generalSelected && (
                <div>Haz clic en <strong>"Seleccionar toda la comunidad"</strong> arriba para incluir a los propietarios.</div>
              )}
              {criterio === 'TORRE' && selectedTorres.length === 0 && (
                <div>Selecciona al menos una torre arriba para incluir a sus propietarios.</div>
              )}
              {criterio === 'PISO' && selectedPisos.length === 0 && (
                <div>Selecciona al menos un piso arriba para incluir a sus propietarios.</div>
              )}
              {criterio === 'RANGO' && !rangoDesde && !rangoHasta && (
                <div>Ingresa el rango de condominios arriba (ej. 101 al 110).</div>
              )}
              {recipientSearch.trim() && (
                <div>No se encontraron coincidencias para <strong>"{recipientSearch}"</strong>.</div>
              )}
            </div>
          ) : (
            destinatariosVisibles.map(dest => {
              const isSelected = criterio === 'PERSONALIZADO'
                ? manualSelectedUserIds.has(dest.usuario_id)
                : !excludedUserIds.has(dest.usuario_id);

              return (
                <div
                  key={dest.usuario_id}
                  onClick={() => onToggleRecipient(dest.usuario_id)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-white border-teal-300 ring-1 ring-teal-500/20 shadow-2xs'
                      : 'bg-white/80 border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className={`font-bold truncate block ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                        {dest.nombre} {dest.apellido}
                      </span>
                      <p className="text-[11px] font-mono text-slate-400 truncate">{dest.email}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {dest.condominios.map((c, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-teal-50 border border-teal-100 text-teal-800 font-semibold">
                            {c.propiedad_nombre} ({c.edificio_nombre})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    isSelected ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isSelected ? 'Incluido' : 'Excluido'}
                  </span>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
