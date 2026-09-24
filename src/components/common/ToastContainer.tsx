import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-emerald-900/10'
              : toast.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-amber-900/10'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-rose-900/10'
              : 'bg-white border-slate-300 text-slate-900 shadow-slate-900/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-600 shrink-0" />}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-black/5 rounded text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
