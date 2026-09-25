import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Reservacion, Acompanante } from '../../types';
import { 
  X, 
  User, 
  Calendar, 
  Tag, 
  Car, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Shield,
  Users,
  Check,
  Clock,
  Edit3
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
  const { 
    reservaciones,
    getPropiedadById, 
    getHuespedById, 
    getOwnerByPropiedadId, 
    getEdificioById, 
    checkOutReservacion,
    updateReservacion,
    showToast
  } = useApp();

  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !reservation) return null;

  // Reactively track the live reservation object from AppContext state
  const currentReservation = reservaciones.find(r => r.id === reservation.id) || reservation;

  const prop = getPropiedadById(currentReservation.propiedad_id);
  const edificio = prop ? getEdificioById(prop.edificio_id) : undefined;
  const huesped = getHuespedById(currentReservation.huesped_id);
  const owner = prop ? getOwnerByPropiedadId(prop.id) : undefined;

  const isCheckedIn = currentReservation.estado === 'En Casa (Checked-in)';

  // Parse occupants: extract titular if stored inside acompanantes
  const rawAcomp = Array.isArray(currentReservation.acompanantes) ? currentReservation.acompanantes : [];
  const titularInAcomp = rawAcomp.find(a => a.id === 'titular');
  const acompList = rawAcomp.filter(a => a.id !== 'titular');

  const titularDelivered = titularInAcomp 
    ? titularInAcomp.brazalete_entregado 
    : (currentReservation.titular_brazalete_entregado ?? isCheckedIn);

  const totalOccupants = 1 + acompList.length;
  const deliveredCount = (titularDelivered ? 1 : 0) + acompList.filter(a => a.brazalete_entregado).length;

  // Handler for individual delivery toggle (instantly persists and updates live view)
  const handleToggleDelivery = async (targetId: string, currentStatus: boolean, personName: string) => {
    try {
      setIsUpdating(true);
      const nextStatus = !currentStatus;
      const now = new Date().toISOString();
      let updatedAcompList: Acompanante[] = [];

      if (targetId === 'titular') {
        const titularItem: Acompanante = {
          id: 'titular',
          nombre_completo: huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Titular',
          tipo: 'Adulto',
          brazalete_entregado: nextStatus,
          fecha_entrega: nextStatus ? now : undefined
        };
        updatedAcompList = [titularItem, ...acompList];
      } else {
        const updatedComps = acompList.map(a => {
          if (a.id === targetId) {
            return {
              ...a,
              brazalete_entregado: nextStatus,
              fecha_entrega: nextStatus ? now : undefined
            };
          }
          return a;
        });

        const titularItem: Acompanante = {
          id: 'titular',
          nombre_completo: huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Titular',
          tipo: 'Adulto',
          brazalete_entregado: titularDelivered,
          fecha_entrega: titularDelivered ? (titularInAcomp?.fecha_entrega || now) : undefined
        };
        updatedAcompList = [titularItem, ...updatedComps];
      }

      const isTitDelivered = targetId === 'titular' ? nextStatus : titularDelivered;
      const compDelivered = updatedAcompList.filter(a => a.id !== 'titular' && a.brazalete_entregado).length;
      const newDeliveredTotal = (isTitDelivered ? 1 : 0) + compDelivered;
      const summary = `${newDeliveredTotal}/${totalOccupants} brazaletes entregados`;

      await updateReservacion(currentReservation.id, {
        acompanantes: updatedAcompList,
        titular_brazalete_entregado: isTitDelivered,
        brazaletes: summary
      });

      showToast(
        `Brazalete de ${personName}: ${nextStatus ? 'Entregado' : 'Pendiente'}`, 
        nextStatus ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast('Error al actualizar entrega de brazalete', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAll = async (deliver: boolean) => {
    try {
      setIsUpdating(true);
      const now = new Date().toISOString();

      const titularItem: Acompanante = {
        id: 'titular',
        nombre_completo: huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Titular',
        tipo: 'Adulto',
        brazalete_entregado: deliver,
        fecha_entrega: deliver ? now : undefined
      };

      const updatedComps = acompList.map(a => ({
        ...a,
        brazalete_entregado: deliver,
        fecha_entrega: deliver ? (a.fecha_entrega || now) : undefined
      }));

      const updatedAcompList = [titularItem, ...updatedComps];
      const newDeliveredTotal = deliver ? totalOccupants : 0;
      const summary = `${newDeliveredTotal}/${totalOccupants} brazaletes entregados`;

      await updateReservacion(currentReservation.id, {
        acompanantes: updatedAcompList,
        titular_brazalete_entregado: deliver,
        brazaletes: summary
      });

      showToast(
        deliver ? 'Todos los brazaletes marcados como entregados' : 'Brazaletes marcados como pendientes', 
        deliver ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast('Error al actualizar brazaletes', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 animate-scale-up">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/20 font-bold">
                FOLIO #{currentReservation.codigo || currentReservation.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isCheckedIn ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'
              }`}>
                {currentReservation.estado}
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              Condominio {prop?.nombre} <span className="text-sm font-normal text-teal-100">({edificio?.nombre})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                <User className="w-4 h-4 text-teal-700" /> Huésped Titular (Responsable)
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
                <span className="font-semibold text-teal-800">{currentReservation.tipo_huesped}</span>
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
                  <span className="font-mono text-slate-900 font-bold">{currentReservation.fecha_checkin}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Check-out</span>
                  <span className="font-mono text-slate-900 font-bold">{currentReservation.fecha_checkout}</span>
                </div>
              </div>
              <div className="pt-1 flex justify-between text-xs">
                <span className="text-slate-500">Ocupación / Autos:</span>
                <span className="font-bold text-slate-800">{totalOccupants} personas ({currentReservation.numero_autos} autos)</span>
              </div>
            </div>

          </div>

          {/* Interactive List of Occupants & Wristbands Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-teal-50/60 to-slate-50 border border-teal-100 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-900">Lista de Ocupantes y Entrega de Brazaletes</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  deliveredCount === totalOccupants 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {deliveredCount} / {totalOccupants} Brazaletes Entregados
                </span>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleToggleAll(deliveredCount !== totalOccupants)}
                  className="text-[11px] text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer ml-1"
                >
                  {deliveredCount === totalOccupants ? 'Desmarcar todos' : '✓ Entregar a todos'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Haz clic en el botón de cualquier ocupante para registrar o alternar su entrega de brazalete individual:
            </p>

            <div className="space-y-2">
              {/* Titular item */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs hover:border-teal-300 transition-colors shadow-2xs">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Huésped Titular'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                      Titular
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{huesped?.telefono || 'Contacto principal'}</span>
                </div>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleToggleDelivery(
                    'titular', 
                    titularDelivered, 
                    huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Titular'
                  )}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                    titularDelivered 
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-2xs' 
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs'
                  }`}
                  title="Haz clic para cambiar estado de entrega"
                >
                  {titularDelivered ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Brazalete Entregado</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pendiente</span>
                    </>
                  )}
                </button>
              </div>

              {/* Acompañantes items */}
              {acompList.map((acomp, idx) => (
                <div 
                  key={acomp.id || idx} 
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs hover:border-teal-300 transition-colors shadow-2xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{acomp.nombre_completo}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {acomp.tipo}
                      </span>
                    </div>
                    {acomp.telefono && (
                      <span className="text-[10px] text-slate-500">{acomp.telefono}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleToggleDelivery(
                      acomp.id, 
                      acomp.brazalete_entregado, 
                      acomp.nombre_completo
                    )}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                      acomp.brazalete_entregado 
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-2xs' 
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs'
                    }`}
                    title="Haz clic para cambiar estado de entrega"
                  >
                    {acomp.brazalete_entregado ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>Brazalete Entregado</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pendiente</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Brazaletes & Vehículo Highlight Strip */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-teal-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-teal-700" /> Control de Acceso & Pagos
              </span>
              <span className="text-teal-800 font-medium">
                Condición: <strong>{currentReservation.pago_tipo || 'Sin pago'}</strong>
              </span>
            </div>
            {currentReservation.brazaletes && (
              <p className="text-xs font-semibold text-teal-950">
                Detalle: {currentReservation.brazaletes}
              </p>
            )}
            {currentReservation.vehiculo_info && (
              <p className="text-xs text-slate-700 flex items-center gap-1.5 pt-1 border-t border-teal-200/60">
                <Car className="w-3.5 h-3.5 text-slate-500" />
                Vehículo registrado: {currentReservation.vehiculo_info}
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
          {currentReservation.notas && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-600">Notas:</span>
              <p className="text-slate-800">{currentReservation.notas}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/80">
          <button
            onClick={() => {
              onClose();
              onEdit(currentReservation);
            }}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Datos</span>
          </button>

          <div className="flex items-center gap-2">
            {!isCheckedIn && currentReservation.estado !== 'Checked-out' ? (
              <button
                onClick={() => {
                  onClose();
                  onCheckIn(currentReservation);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Entrada (Check-In)</span>
              </button>
            ) : isCheckedIn ? (
              <button
                onClick={() => {
                  checkOutReservacion(currentReservation.id);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs active:scale-95 cursor-pointer"
              >
                Registrar Salida (Check-Out)
              </button>
            ) : null}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
