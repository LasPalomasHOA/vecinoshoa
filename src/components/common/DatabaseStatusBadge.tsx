import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const DatabaseStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<{
    connected: boolean;
    loading: boolean;
    message: string;
    tables?: Record<string, number>;
  }>({
    connected: false,
    loading: true,
    message: 'Verificando base de datos...',
  });

  const checkDb = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    try {
      const data = await api.health.check();
      setStatus({
        connected: data.connected,
        loading: false,
        message: data.message,
        tables: data.tables,
      });
    } catch (err: any) {
      setStatus({
        connected: false,
        loading: false,
        message: err.message || 'Sin conexión a la API',
      });
    }
  };

  useEffect(() => {
    checkDb();
  }, []);

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/90 border border-slate-200/80 text-[11px]">
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative flex items-center justify-center">
          <Database className={`w-3.5 h-3.5 ${status.connected ? 'text-teal-600' : 'text-amber-600'}`} />
          <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
            status.loading 
              ? 'bg-amber-400 animate-ping' 
              : status.connected 
                ? 'bg-emerald-500' 
                : 'bg-amber-500'
          }`} />
        </div>
        <div className="truncate">
          <p className="font-bold text-slate-800 leading-none">
            {status.loading ? 'Conectando...' : status.connected ? 'PostgreSQL Live' : 'Modo Seguro'}
          </p>
          <p className="text-[9px] text-slate-500 truncate mt-0.5" title={status.message}>
            {status.connected ? 'Supabase / Vercel' : 'Cache local activo'}
          </p>
        </div>
      </div>

      <button
        onClick={checkDb}
        disabled={status.loading}
        title="Probar conexión de base de datos"
        className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${status.loading ? 'animate-spin text-teal-600' : ''}`} />
      </button>
    </div>
  );
};
