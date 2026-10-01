import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  itemType?: string;
  itemName: string;
  details?: Array<{ label: string; value: React.ReactNode }>;
  onConfirm: (motivo: string) => void | Promise<void>;
  placeholder?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = 'Esta acción quedará registrada en la bitácora de auditoría',
  itemType,
  itemName,
  details = [],
  onConfirm,
  placeholder = 'Escribe detalladamente el motivo de la baja o eliminación...'
}) => {
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onConfirm(motivo.trim());
      onClose();
    } catch (err) {
      console.error('Error al confirmar eliminación:', err);
    } finally {
      setIsSubmitting(false);
    }
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
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-rose-700 font-medium">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">
                {itemType ? `${itemType}:` : 'Elemento:'}
              </span>
              <span className="font-extrabold text-slate-900">{itemName}</span>
            </div>

            {details.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50">
                <span className="font-bold text-slate-500">{d.label}:</span>
                <span className="font-medium text-slate-700 text-right">{d.value}</span>
              </div>
            ))}
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
              placeholder={placeholder}
              className="w-full px-3.5 py-2.5 rounded-lg form-input text-xs leading-relaxed focus:border-rose-500 focus:ring-rose-500/20"
              autoFocus
            />
            <p className="text-[11px] text-slate-500 mt-1">
              El motivo se guardará permanentemente en el historial de Bitácora.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!motivo.trim() || isSubmitting}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-rose-700/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Eliminando...' : 'Confirmar Eliminación'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
