import React, { useEffect, useState } from 'react';
import { Send, Mail, CheckCircle2, ShieldCheck, RefreshCw, Layers, Building } from 'lucide-react';
import { DestinatarioComunicado } from '../../types';

interface DispatchProgressModalProps {
  isOpen: boolean;
  totalDestinatarios: number;
  asunto: string;
  isTestMode: boolean;
  isSuccess?: boolean;
}

const PHASES = [
  'Inicializando conexión segura con servidor de correo...',
  'Generando mensajes personalizados para cada propietario...',
  'Despachando notificaciones y aplicando firmas oficiales...',
  'Verificando confirmaciones de entrega y acuses...',
  'Registrando folio oficial en bitácora general de acuerdos...'
];

export const DispatchProgressModal: React.FC<DispatchProgressModalProps> = ({
  isOpen,
  totalDestinatarios,
  asunto,
  isTestMode,
  isSuccess = false
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [simulatedPercent, setSimulatedPercent] = useState(15);

  useEffect(() => {
    if (!isOpen) {
      setPhaseIndex(0);
      setSimulatedPercent(15);
      return;
    }

    // Advance phases smoothly
    const interval = setInterval(() => {
      setPhaseIndex(prev => (prev < PHASES.length - 1 ? prev + 1 : prev));
      setSimulatedPercent(prev => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 18) + 8;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isSuccess) {
      setSimulatedPercent(100);
    }
  }, [isSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden p-7 sm:p-9 text-center space-y-6 animate-scale-up">
        
        {/* Animated Icon / Radar */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          {!isSuccess ? (
            <>
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" />
              <div className="absolute inset-1 rounded-full bg-teal-500/10 animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-600/30">
                <Send className="w-8 h-8 animate-bounce" />
              </div>
            </>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-scale-up">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Title & Subject */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
            <Building className="w-3.5 h-3.5 text-teal-600" />
            <span>Las Palomas Seaside Golf Community</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {!isSuccess ? 'Despachando Comunicado Oficial' : '¡Comunicado Emitido con Éxito!'}
          </h3>

          <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto truncate">
            Asunto: <span className="font-bold text-slate-900">{asunto}</span>
          </p>
        </div>

        {/* Progress Bar & Counter */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
          
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 flex items-center gap-1.5">
              {!isSuccess ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                  <span>Procesando entregas...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Entregas finalizadas</span>
                </>
              )}
            </span>
            <span className="text-teal-800 font-mono">
              {totalDestinatarios} propietarios objetivo
            </span>
          </div>

          {/* Bar */}
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSuccess
                  ? 'bg-emerald-500 w-full'
                  : 'bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-400'
              }`}
              style={{ width: `${isSuccess ? 100 : Math.min(simulatedPercent, 95)}%` }}
            />
          </div>

          {/* Current Phase Message */}
          <div className="min-h-[20px] flex items-center justify-center">
            <p className="text-[11px] text-slate-500 font-medium animate-pulse">
              {!isSuccess ? PHASES[phaseIndex] : 'Registrado en bitácora e historial de acuerdos.'}
            </p>
          </div>

        </div>

        {/* Do Not Close Alert */}
        {!isSuccess ? (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center justify-center gap-2 text-amber-900 text-[11px]">
            <span className="font-bold">⚠️ Atención:</span>
            <span>Por favor no cierres ni recargues esta ventana mientras se completa el proceso.</span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 flex items-center justify-center gap-2 text-emerald-900 text-[11px] font-bold">
            <span>Redirigiendo automáticamente al historial...</span>
          </div>
        )}

      </div>
    </div>
  );
};
