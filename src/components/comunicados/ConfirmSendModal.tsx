import React from 'react';
import { X } from 'lucide-react';
import { DestinatarioComunicado, TipoSeleccionComunicado, CategoriaComunicado } from '../../types';

interface ConfirmSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSending: boolean;
  asunto: string;
  categoria: CategoriaComunicado;
  criterio: TipoSeleccionComunicado;
  criterioDetalle: string;
  destinatarios: DestinatarioComunicado[];
  isTestMode: boolean;
  remitenteNombre: string;
  remitenteEmail: string;
}

export const ConfirmSendModal: React.FC<ConfirmSendModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSending,
  asunto,
  categoria,
  criterio,
  criterioDetalle,
  destinatarios,
  isTestMode,
  remitenteNombre,
  remitenteEmail
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Confirmar envío de comunicado
            </h3>
            <p className="text-xs text-slate-500">
              Verifica los destinatarios antes de continuar
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Details list */}
          <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
            <div className="p-3 flex justify-between gap-2">
              <span className="text-slate-500">Asunto</span>
              <span className="font-medium text-slate-900 text-right max-w-xs truncate">{asunto}</span>
            </div>

            <div className="p-3 flex justify-between gap-2">
              <span className="text-slate-500">Audiencia</span>
              <span className="font-medium text-slate-800 text-right">{criterioDetalle}</span>
            </div>

            <div className="p-3 flex justify-between gap-2">
              <span className="text-slate-500">Total destinatarios</span>
              <span className="font-semibold text-teal-800">{destinatarios.length} propietarios</span>
            </div>

            <div className="p-3 flex justify-between gap-2">
              <span className="text-slate-500">Modo de entrega</span>
              <span className="font-medium text-slate-800">
                {!isTestMode ? 'Correo electrónico' : 'Simulación interna'}
              </span>
            </div>
          </div>

          {/* Recipients scroll area */}
          <div>
            <span className="block font-medium text-slate-700 mb-1.5">
              Lista de propietarios a notificar:
            </span>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 p-1 space-y-1 bg-slate-50/50">
              {destinatarios.map((d, i) => (
                <div key={d.usuario_id || i} className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-100 text-[11px]">
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-slate-800 truncate block">
                      {d.nombre} {d.apellido}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate block">{d.email}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 shrink-0">
                    {d.condominios?.[0]?.propiedad_nombre || 'Condómino'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSending}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 transition-colors cursor-pointer"
          >
            Enviar comunicado ({destinatarios.length})
          </button>
        </div>

      </div>
    </div>
  );
};
