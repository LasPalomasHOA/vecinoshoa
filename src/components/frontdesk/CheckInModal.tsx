import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Reservacion } from '../../types';
import { CheckCircle2, X, Tag, Car, Key } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservacion | null;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  reservation
}) => {
  const { checkInReservacion, getPropiedadById, getHuespedById } = useApp();

  const [brazaletes, setBrazaletes] = useState(reservation?.brazaletes || '');
  const [vehiculoInfo, setVehiculoInfo] = useState(reservation?.vehiculo_info || '');

  if (!isOpen || !reservation) return null;

  const prop = getPropiedadById(reservation.propiedad_id);
  const huesped = getHuespedById(reservation.huesped_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkInReservacion(
      reservation.id, 
      brazaletes || `Asignado (${reservation.numero_ocupantes} brazaletes)`,
      vehiculoInfo
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-100 bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Registro de Entrada (Check-In)</h2>
              <p className="text-xs text-emerald-800 font-semibold">Condominio {prop?.nombre || reservation.propiedad_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Huésped Titular:</span>
              <span className="font-bold text-slate-900">{huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Periodo:</span>
              <span className="font-mono text-teal-800 font-bold">{reservation.fecha_checkin} al {reservation.fecha_checkout}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Ocupantes:</span>
              <span className="font-bold text-slate-800">{reservation.numero_ocupantes} personas</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-teal-700" />
              Asignar Brazaletes de Alberca / Amenidades *
            </label>
            <input
              type="text"
              required
              value={brazaletes}
              onChange={(e) => setBrazaletes(e.target.value)}
              placeholder="ej. Azul Marino 9367-9368 o Verde 2401-2404"
              className="w-full px-3.5 py-2 rounded-lg form-input text-xs text-teal-900 font-bold"
            />
            <p className="text-[10px] text-slate-500 mt-1">Registra los colores y números de serie para el control de acceso.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-slate-600" />
              Vehículo y Placas (Pase de Estacionamiento)
            </label>
            <input
              type="text"
              value={vehiculoInfo}
              onChange={(e) => setVehiculoInfo(e.target.value)}
              placeholder="ej. Corbatin 38516 Ford F150 Blue AJM5429"
              className="w-full px-3.5 py-2 rounded-lg form-input text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Check-In</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
