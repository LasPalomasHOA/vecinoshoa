import React from 'react';
import { useApp } from '../../context/AppContext';
import { Reservacion } from '../../types';
import { 
  X, 
  User, 
  Calendar, 
  Tag, 
  Car, 
  CheckCircle2, 
  LogOut, 
  Phone, 
  Mail, 
  Shield 
} from 'lucide-react';

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservacion | null;
  onEdit: (res: Reservacion) => void;
  onCheckIn: (res: Reservacion) => void;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onEdit,
  onCheckIn
}) => {
  const { getPropiedadById, getHuespedById, getOwnerByPropiedadId, getEdificioById, checkOutReservacion } = useApp();

  if (!isOpen || !reservation) return null;

  const prop = getPropiedadById(reservation.propiedad_id);
  const edificio = prop ? getEdificioById(prop.edificio_id) : undefined;
  const huesped = getHuespedById(reservation.huesped_id);
  const owner = prop ? getOwnerByPropiedadId(prop.id) : undefined;

  const isCheckedIn = reservation.estado === 'En Casa (Checked-in)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/20 font-bold">
                FOLIO #{reservation.codigo || reservation.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isCheckedIn ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'
              }`}>
                {reservation.estado}
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              Condominio {prop?.nombre} <span className="text-sm font-normal text-teal-100">({edificio?.nombre})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Guest and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Guest Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                <User className="w-4 h-4 text-teal-700" /> Huésped / Titular
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'No especificado'}
                </p>
                {huesped?.telefono && (
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {huesped.telefono}
                  </p>
                )}
                {huesped?.email && (
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" /> {huesped.email}
                  </p>
                )}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                <span className="text-slate-500">Tipo:</span>
                <span className="font-semibold text-teal-800">{reservation.tipo_huesped}</span>
              </div>
            </div>

            {/* Dates Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                <Calendar className="w-4 h-4 text-sky-700" /> Periodo de Estadía
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Check-in</span>
                  <span className="font-mono text-slate-900 font-bold">{reservation.fecha_checkin}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Check-out</span>
                  <span className="font-mono text-slate-900 font-bold">{reservation.fecha_checkout}</span>
                </div>
              </div>
              <div className="pt-1 flex justify-between text-xs">
                <span className="text-slate-500">Ocupantes:</span>
                <span className="font-bold text-slate-800">{reservation.numero_ocupantes} personas ({reservation.numero_autos} autos)</span>
              </div>
            </div>

          </div>

          {/* Brazaletes & Vehículo Highlight Strip */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-teal-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-teal-700" /> Control de Acceso & Brazaletes
              </span>
              <span className="text-teal-800 font-medium">
                Pago: <strong>{reservation.pago_tipo || 'Sin pago'}</strong>
              </span>
            </div>
            <p className="text-sm font-bold text-teal-950">
              {reservation.brazaletes || 'Sin brazaletes asignados'}
            </p>
            {reservation.vehiculo_info && (
              <p className="text-xs text-slate-700 flex items-center gap-1.5 pt-1 border-t border-teal-200/60">
                <Car className="w-3.5 h-3.5 text-slate-500" />
                Vehículo registrado: {reservation.vehiculo_info}
              </p>
            )}
          </div>

          {/* Owner details */}
          {owner && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="text-slate-500">Propietario del Condo:</span>
                  <p className="font-bold text-slate-800">{owner.nombre} {owner.apellido} ({owner.email})</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                Dueño HOA
              </span>
            </div>
          )}

          {/* Notes */}
          {reservation.notas && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-600">Notas:</span>
              <p className="text-slate-800">{reservation.notas}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/80">
          <button
            onClick={() => {
              onClose();
              onEdit(reservation);
            }}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
          >
            Editar Datos
          </button>

          <div className="flex items-center gap-2">
            {!isCheckedIn && reservation.estado !== 'Checked-out' ? (
              <button
                onClick={() => {
                  onClose();
                  onCheckIn(reservation);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Entrada (Check-In)</span>
              </button>
            ) : isCheckedIn ? (
              <button
                onClick={() => {
                  checkOutReservacion(reservation.id);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
              >
                Registrar Salida (Check-Out)
              </button>
            ) : null}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
