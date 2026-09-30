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
  Building2,
  Calendar,
  Layers,
  CheckCircle2
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
  if (!isOpen || !entry) return null;

  const getActionBadge = (accion: BitacoraEntry['accion']) => {
    switch (accion) {
      case 'CREACIÓN':
        return {
          label: 'Creación / Alta',
          icon: PlusCircle,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'EDICIÓN':
        return {
          label: 'Edición / Cambio',
          icon: Edit3,
          badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
          iconBg: 'bg-teal-50 text-teal-600 border-teal-200',
          dot: 'bg-teal-500'
        };
      case 'ELIMINACIÓN':
        return {
          label: 'Eliminación / Baja',
          icon: Trash2,
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
          dot: 'bg-rose-500'
        };
      case 'CHECK-IN':
        return {
          label: 'Check-In Huésped',
          icon: KeyRound,
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
          dot: 'bg-indigo-500'
        };
      case 'CHECK-OUT':
        return {
          label: 'Check-Out / Salida',
          icon: LogOut,
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
          dot: 'bg-purple-500'
        };
      case 'CAMBIO_ESTATUS':
        return {
          label: 'Cambio de Estatus',
          icon: SlidersHorizontal,
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
          dot: 'bg-amber-500'
        };
      default:
        return {
          label: accion,
          icon: FileText,
          badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
          iconBg: 'bg-slate-50 text-slate-600 border-slate-200',
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
    day: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Clean formatted user name (strip trailing redundant role parenthetical if already present)
  const cleanUserName = entry.usuario_nombre
    .replace(/\s*\(Administrador\)/gi, '')
    .replace(/\s*\(Supervisor\)/gi, '')
    .trim();

  const userInitials = cleanUserName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'US';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${badgeInfo.iconBg}`}>
              <ActionIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  {entry.id}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-bold border border-teal-200">
                  {entry.modulo}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Detalle del Registro de Bitácora
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-left text-xs sm:text-sm overflow-y-auto max-h-[75vh]">
          
          {/* User Responsible Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userInitials}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Usuario Responsable
                </p>
                <p className="font-bold text-slate-900 text-sm">
                  {cleanUserName}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {entry.usuario_email}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                entry.usuario_rol === 'Supervisor' 
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-teal-50 text-teal-800 border-teal-200'
              }`}>
                {entry.usuario_rol}
              </span>
            </div>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Acción */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Tipo de Acción
              </span>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border ${badgeInfo.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dot}`} />
                  {badgeInfo.label}
                </span>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Fecha & Hora
              </span>
              <p className="mt-1 font-bold text-slate-800 text-xs capitalize flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formattedDate}, {formattedTime}</span>
              </p>
            </div>

            {/* Entidad / Elemento Afectado */}
            {entry.entidad_nombre && (
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs sm:col-span-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Elemento / Entidad Afectada
                </span>
                <p className="mt-1 font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>{entry.entidad_nombre}</span>
                  {entry.entidad_id && (
                    <span className="text-xs text-slate-400 font-mono font-normal">
                      (ID: #{entry.entidad_id})
                    </span>
                  )}
                </p>
              </div>
            )}

          </div>

          {/* Description Card */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Descripción del Cambio
            </span>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed shadow-2xs">
              {entry.descripcion}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
