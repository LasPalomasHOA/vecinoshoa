import React, { useState, useEffect } from 'react';
import { SolicitudAcceso, Propiedad } from '../../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitud: SolicitudAcceso | null;
  propiedad?: Propiedad;
  onConfirm: (motivo: string) => void;
}

export const DeleteRequestModal: React.FC<DeleteRequestModalProps> = ({
  isOpen,
  onClose,
  solicitud,
  propiedad,
  onConfirm
}) => {
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
    }
  }, [isOpen]);

  if (!isOpen || !solicitud) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) return;
    onConfirm(motivo.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-rose-100 bg-rose-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Eliminar Solicitud de Acceso</h2>
              <p className="text-xs text-rose-700 font-medium">Esta acción quedará registrada en la bitácora</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Condominio:</span>
              <span className="font-extrabold text-teal-900">{propiedad?.nombre || `Propiedad #${solicitud.propiedad_id}`}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Solicitante:</span>
              <span className="font-semibold text-slate-800">{solicitud.creador_nombre || 'Propietario'}</span>
            </div>
            <div className="text-xs pt-1 border-t border-slate-200/60">
              <span className="font-bold text-slate-500 block mb-0.5">Trabajo / Motivo de acceso:</span>
              <p className="font-medium text-slate-700 leading-snug line-clamp-2">{solicitud.solicitud}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Motivo de Eliminación <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Escribe la razón por la cual se cancela o elimina este pase de acceso (ej. Cancelado por el propietario, duplicado, reprogramado)..."
              className="w-full px-3.5 py-2.5 rounded-lg form-input text-xs leading-relaxed focus:border-rose-500 focus:ring-rose-500/20"
              autoFocus
            />
            <p className="text-[11px] text-slate-500 mt-1">
              El motivo se guardará automáticamente en el historial de auditoría y logs del sistema.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!motivo.trim()}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-rose-700/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirmar Eliminación</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
