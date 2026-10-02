import React from 'react';
import { Send, Mail, AlertTriangle, ShieldCheck, RefreshCw, X, Users, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center gap-3.5 ${
          !isTestMode ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100'
        }`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
            !isTestMode 
              ? 'bg-teal-600 text-white border-teal-700 shadow-xs' 
              : 'bg-amber-600 text-white border-amber-700 shadow-xs'
          }`}>
            <Send className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              Confirmar Emisión de Comunicado
            </h3>
            <p className="text-xs text-slate-600">
              {!isTestMode 
                ? 'Despacho masivo vía servidor oficial de correo electrónico' 
                : 'Modo seguro: se guardará en bitácora sin disparar correos'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Asunto:</span>
              <span className="font-bold text-slate-900 text-sm">{asunto}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/70">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Audiencia / Criterio:</span>
                <span className="font-bold text-slate-800">{criterioDetalle}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Total Propietarios:</span>
                <span className="font-black text-teal-800 text-sm">{destinatarios.length} personas</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">Tipo de Despacho:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] border ${
                !isTestMode 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {!isTestMode ? '✉️ Envío Real a Bandejas (SMTP Gmail)' : '🛡️ Registro Simulado Interno'}
              </span>
            </div>
          </div>

          {/* Destinatarios List Sample */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Lista de Destinatarios ({destinatarios.length}):</span>
              </span>
              <span className="text-[10px] text-slate-400">Desplázate para ver todos</span>
            </div>

            <div className="max-h-36 overflow-y-auto p-2 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              {destinatarios.map((d, i) => (
                <div key={d.usuario_id || i} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-slate-100 text-[11px]">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-800 truncate block">
                      {d.nombre} {d.apellido}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate block">{d.email}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-teal-700 px-1.5 py-0.5 rounded bg-teal-50 border border-teal-100 shrink-0">
                    {d.condominios?.[0]?.propiedad_nombre || 'Condómino'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Alert */}
          {!isTestMode ? (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-2.5 text-teal-900">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <p className="font-bold">Emisión Oficial Directa</p>
                <p className="text-teal-800">
                  Los correos serán transmitidos inmediatamente desde <strong>{remitenteEmail}</strong> con acuse de recibo y registro automático en la bitácora general de actividades.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <p className="font-bold">Modo Simulado Activo</p>
                <p className="text-amber-800">
                  Ningún correo electrónico saldrá a internet. El registro quedará archivado como comunicado simulado para fines de prueba.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSending}
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
              !isTestMode
                ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-700/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-700/20'
            }`}
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Despachando correos...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{!isTestMode ? `Confirmar y Enviar (${destinatarios.length})` : `Confirmar Simulación (${destinatarios.length})`}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
