import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface DispatchProgressModalProps {
  isOpen: boolean;
  totalDestinatarios: number;
  asunto: string;
  isTestMode: boolean;
  isSuccess?: boolean;
}

export const DispatchProgressModal: React.FC<DispatchProgressModalProps> = ({
  isOpen,
  totalDestinatarios,
  asunto,
  isTestMode,
  isSuccess = false
}) => {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setProgress(10);
      return;
    }

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isSuccess) {
      setProgress(100);
    }
  }, [isSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-5">
        
        {/* State Icon */}
        <div className="flex justify-center">
          {!isSuccess ? (
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">
            {!isSuccess
              ? (isTestMode ? 'Guardando comunicado...' : `Enviando a ${totalDestinatarios} propietarios...`)
              : 'Comunicado emitido correctamente'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto truncate">
            {asunto}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-700 rounded-full transition-all duration-300"
              style={{ width: `${isSuccess ? 100 : progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{isTestMode ? 'Modo de registro interno' : 'Despachando correos'}</span>
            <span>{isSuccess ? '100%' : `${progress}%`}</span>
          </div>
        </div>

        {/* Bottom Hint */}
        <p className="text-[11px] text-slate-400">
          {!isSuccess
            ? 'Por favor espera mientras finaliza el proceso de entrega.'
            : 'Redirigiendo al historial de envíos...'}
        </p>

      </div>
    </div>
  );
};
