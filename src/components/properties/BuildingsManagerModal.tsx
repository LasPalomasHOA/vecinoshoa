import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, X, Plus, Trash2 } from 'lucide-react';

interface BuildingsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuildingsManagerModal: React.FC<BuildingsManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { edificios, addEdificio, deleteEdificio, propiedades } = useApp();
  const [newNombre, setNewNombre] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    addEdificio(newNombre.trim());
    setNewNombre('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Administrar Torres / Edificios</h2>
              <p className="text-xs text-slate-500">Catálogo oficial de torres Las Palomas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <form onSubmit={handleAdd} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Agregar una nueva torre / edificio
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                placeholder="ej. K - Marbella o Torre Nueva"
                className="flex-1 px-3 py-2 rounded-lg form-input text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Torres Registradas ({edificios.length})
            </h3>
            
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {edificios.map(ed => {
                const count = propiedades.filter(p => p.edificio_id === ed.id).length;
                return (
                  <div
                    key={ed.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between group hover:border-teal-300 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{ed.nombre}</span>
                      <span className="text-[10px] text-slate-500">{count} condominios</span>
                    </div>
                    <button
                      onClick={() => {
                        if (count > 0) {
                          alert(`No puedes eliminar la torre "${ed.nombre}" porque tiene ${count} condominios asociados.`);
                          return;
                        }
                        deleteEdificio(ed.id);
                      }}
                      className="opacity-40 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-all"
                      title="Eliminar edificio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50/80">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
