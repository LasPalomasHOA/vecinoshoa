import React from 'react';
import { BitacoraEntry } from '../../types';
import { 
  X, 
  Clock, 
  User, 
  Shield, 
  FileText, 
  Trash2, 
  PlusCircle, 
  Edit3, 
  KeyRound, 
  LogOut, 
  SlidersHorizontal,
  Copy,
  Check
} from 'lucide-react';

interface BitacoraDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: BitacoraEntry | null;
}

export const BitacoraDetailModal: React.FC<BitacoraDetailModalProps> = ({
  isOpen,
  onClose,
  entry
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !entry) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionBadge = (accion: BitacoraEntry['accion']) => {
    switch (accion) {
      case 'CREACIÓN':
        return {
          label: 'Creación / Registro',
          icon: PlusCircle,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500'
        };
      case 'EDICIÓN':
        return {
          label: 'Edición / Cambio',
          icon: Edit3,
          className: 'bg-teal-50 text-teal-700 border-teal-200/80',
          dot: 'bg-teal-500'
        };
      case 'ELIMINACIÓN':
        return {
          label: 'Eliminación / Baja',
          icon: Trash2,
          className: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dot: 'bg-rose-500'
        };
      case 'CHECK-IN':
        return {
          label: 'Check-In Huésped',
          icon: KeyRound,
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500'
        };
      case 'CHECK-OUT':
        return {
          label: 'Check-Out / Salida',
          icon: LogOut,
          className: 'bg-purple-50 text-purple-700 border-purple-200/80',
          dot: 'bg-purple-500'
        };
      case 'CAMBIO_ESTATUS':
        return {
          label: 'Cambio de Estatus',
          icon: SlidersHorizontal,
          className: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500'
        };
      case 'NOTA_SUPERVISOR':
        return {
          label: 'Nota de Supervisor',
          icon: Shield,
          className: 'bg-sky-50 text-sky-800 border-sky-200/80',
          dot: 'bg-sky-500'
        };
      default:
        return {
          label: accion,
          icon: FileText,
          className: 'bg-slate-50 text-slate-700 border-slate-200/80',
          dot: 'bg-slate-500'
        };
    }
  };

  const badgeInfo = getActionBadge(entry.accion);
  const ActionIcon = badgeInfo.icon;

  const dateObj = new Date(entry.timestamp);
  const formattedDate = dateObj.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-inner">
              <ActionIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-300 uppercase tracking-wider">
                  {entry.id}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-200 font-semibold border border-white/10">
                  {entry.modulo}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Detalle de Auditoría & Bitácora
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left text-xs sm:text-sm">
          
          {/* Action & Date Status Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border shadow-2xs ${badgeInfo.className}`}>
                <span className={`w-2 h-2 rounded-full ${badgeInfo.dot}`} />
                {badgeInfo.label}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Módulo: <strong className="text-slate-900">{entry.modulo}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span className="capitalize">{formattedDate}</span>
            </div>
          </div>

          {/* User Responsible Information */}
          <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/50 space-y-2">
            <p className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-700" />
              Usuario que Realizó el Cambio
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs">
                  {entry.usuario_nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight text-sm">
                    {entry.usuario_nombre}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {entry.usuario_email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                  entry.usuario_rol === 'Supervisor' 
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : entry.usuario_rol === 'Administrador'
                    ? 'bg-teal-100 text-teal-900 border-teal-300'
                    : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}>
                  🛡️ Rol: {entry.usuario_rol}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Descripción de la Operación
            </label>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm leading-relaxed font-medium shadow-2xs">
              {entry.descripcion}
            </div>
          </div>

          {/* Target Entity / Metadata */}
          {entry.entidad_nombre && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-medium">Elemento / Entidad Afectada:</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{entry.entidad_nombre}</span>
              </div>
              {entry.entidad_id && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block font-medium">ID Interno de Registro:</span>
                  <span className="font-bold text-slate-800 font-mono text-sm mt-0.5 block">#{entry.entidad_id}</span>
                </div>
              )}
            </div>
          )}

          {/* Additional details / JSON Payload Comparison */}
          {entry.detalles && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Metadatos & Datos del Cambio
                </label>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Changes list if present */}
              {entry.detalles.cambios && entry.detalles.cambios.length > 0 && (
                <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-100 text-teal-900 text-xs space-y-1">
                  <p className="font-bold text-teal-950">Campos Modificados:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-teal-800">
                    {entry.detalles.cambios.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Device / Client Info */}
              {entry.detalles.dispositivo && (
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
                  <span className="font-medium">Origen / Dispositivo:</span>
                  <span className="font-mono text-slate-800 text-[11px]">{entry.detalles.dispositivo}</span>
                </div>
              )}

              {/* Raw Details Box */}
              <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800 shadow-inner">
                <pre>{JSON.stringify(entry.detalles, null, 2)}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Registro inmutable de trazabilidad Las Palomas HOA
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Cerrar Detalle
          </button>
        </div>

      </div>
    </div>
  );
};
