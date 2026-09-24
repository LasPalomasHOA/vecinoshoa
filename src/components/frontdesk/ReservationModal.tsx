import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Reservacion, TipoHuesped, EstadoReservacion } from '../../types';
import { X, Calendar, User, Building2, Tag, Car } from 'lucide-react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationToEdit?: Reservacion | null;
  initialData?: {
    propiedadId?: number;
    fechaCheckin?: string;
    fechaCheckout?: string;
  } | null;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  reservationToEdit,
  initialData
}) => {
  const { 
    propiedades, 
    huespedes, 
    addReservacion, 
    updateReservacion 
  } = useApp();

  const [propiedadId, setPropiedadId] = useState<number>(propiedades[0]?.id || 101);
  const [huespedId, setHuespedId] = useState<number>(huespedes[0]?.id || 1);
  const [isNewHuesped, setIsNewHuesped] = useState<boolean>(false);
  
  const [newHuespedNombre, setNewHuespedNombre] = useState('');
  const [newHuespedApellido, setNewHuespedApellido] = useState('');
  const [newHuespedTelefono, setNewHuespedTelefono] = useState('');
  const [newHuespedEmail, setNewHuespedEmail] = useState('');

  const [codigo, setCodigo] = useState('');
  const [tipoHuesped, setTipoHuesped] = useState<TipoHuesped>('Huésped sin Cobro (NPG)');
  const [fechaCheckin, setFechaCheckin] = useState('2026-09-23');
  const [fechaCheckout, setFechaCheckout] = useState('2026-09-26');
  const [numeroOcupantes, setNumeroOcupantes] = useState<number>(2);
  const [numeroAutos, setNumeroAutos] = useState<number>(1);
  const [brazaletes, setBrazaletes] = useState('');
  const [vehiculoInfo, setVehiculoInfo] = useState('');
  const [pagoTipo, setPagoTipo] = useState<'Con pago' | 'Sin pago' | 'Uso de amenidades' | 'Cortesia'>('Sin pago');
  const [estado, setEstado] = useState<EstadoReservacion>('Confirmada');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (reservationToEdit) {
      setPropiedadId(reservationToEdit.propiedad_id);
      setHuespedId(reservationToEdit.huesped_id);
      setIsNewHuesped(false);
      setCodigo(reservationToEdit.codigo || '');
      setTipoHuesped(reservationToEdit.tipo_huesped);
      setFechaCheckin(reservationToEdit.fecha_checkin);
      setFechaCheckout(reservationToEdit.fecha_checkout);
      setNumeroOcupantes(reservationToEdit.numero_ocupantes);
      setNumeroAutos(reservationToEdit.numero_autos);
      setBrazaletes(reservationToEdit.brazaletes || '');
      setVehiculoInfo(reservationToEdit.vehiculo_info || '');
      setPagoTipo(reservationToEdit.pago_tipo || 'Sin pago');
      setEstado(reservationToEdit.estado);
      setNotas(reservationToEdit.notas || '');
    } else {
      const defaultProp = initialData?.propiedadId || propiedades[0]?.id || 101;
      setPropiedadId(defaultProp);
      setCodigo(`RES-${Math.floor(100000 + Math.random() * 900000)}`);
      setTipoHuesped('Huésped sin Cobro (NPG)');
      
      const inDate = initialData?.fechaCheckin || '2026-09-23';
      let outDate = initialData?.fechaCheckout;
      if (!outDate) {
        try {
          const d = new Date(inDate + 'T12:00:00');
          d.setDate(d.getDate() + 3);
          outDate = d.toISOString().split('T')[0];
        } catch {
          outDate = '2026-09-26';
        }
      }
      setFechaCheckin(inDate);
      setFechaCheckout(outDate);
      setNumeroOcupantes(2);
      setNumeroAutos(1);
      setBrazaletes('');
      setVehiculoInfo('');
      setPagoTipo('Sin pago');
      setEstado('Confirmada');
      setNotas('');
      setIsNewHuesped(false);
    }
  }, [reservationToEdit, isOpen, initialData, propiedades]);

  const nightsCount = React.useMemo(() => {
    if (!fechaCheckin || !fechaCheckout) return 0;
    try {
      const d1 = new Date(fechaCheckin + 'T12:00:00');
      const d2 = new Date(fechaCheckout + 'T12:00:00');
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  }, [fechaCheckin, fechaCheckout]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (reservationToEdit) {
      updateReservacion(reservationToEdit.id, {
        propiedad_id: propiedadId,
        huesped_id: huespedId,
        codigo,
        tipo_huesped: tipoHuesped,
        fecha_checkin: fechaCheckin,
        fecha_checkout: fechaCheckout,
        numero_ocupantes: numeroOcupantes,
        numero_autos: numeroAutos,
        brazaletes,
        vehiculo_info: vehiculoInfo,
        pago_tipo: pagoTipo,
        estado,
        notas
      });
    } else {
      const huespedData = isNewHuesped
        ? {
            nombres: newHuespedNombre || 'Nuevo',
            apellidos: newHuespedApellido || 'Huésped',
            telefono: newHuespedTelefono,
            email: newHuespedEmail
          }
        : undefined;

      addReservacion(
        {
          propiedad_id: propiedadId,
          huesped_id: isNewHuesped ? 0 : huespedId,
          codigo,
          tipo_huesped: tipoHuesped,
          fecha_checkin: fechaCheckin,
          fecha_checkout: fechaCheckout,
          numero_ocupantes: numeroOcupantes,
          numero_autos: numeroAutos,
          brazaletes,
          vehiculo_info: vehiculoInfo,
          pago_tipo: pagoTipo,
          estado,
          notas
        },
        huespedData
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {reservationToEdit ? 'Editar Reservación' : 'Nueva Reservación / Entrada'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Row 1: Property & Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Propiedad / Condominio *
              </label>
              <select
                value={propiedadId}
                onChange={(e) => setPropiedadId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl form-input text-xs font-bold text-teal-900"
                required
              >
                {propiedades.map(prop => (
                  <option key={prop.id} value={prop.id}>
                    {prop.nombre} - (Piso {prop.piso}, Capacidad: {prop.capacidad_personas} pers.)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Código / Folio de Reservación
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="ej. 2569009 o SL:973438"
                className="w-full px-3 py-2 rounded-xl form-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Guest Selector */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-700" /> Huésped Titular
              </span>
              {!reservationToEdit && (
                <button
                  type="button"
                  onClick={() => setIsNewHuesped(!isNewHuesped)}
                  className="text-xs text-teal-700 hover:underline font-bold"
                >
                  {isNewHuesped ? '← Seleccionar existente' : '+ Registrar nuevo huésped'}
                </button>
              )}
            </div>

            {isNewHuesped ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={newHuespedNombre}
                    onChange={(e) => setNewHuespedNombre(e.target.value)}
                    placeholder="ej. Carlos"
                    className="w-full px-3 py-2 rounded-lg form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={newHuespedApellido}
                    onChange={(e) => setNewHuespedApellido(e.target.value)}
                    placeholder="ej. Hernandez"
                    className="w-full px-3 py-2 rounded-lg form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newHuespedTelefono}
                    onChange={(e) => setNewHuespedTelefono(e.target.value)}
                    placeholder="+52 662 000 0000"
                    className="w-full px-3 py-2 rounded-lg form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={newHuespedEmail}
                    onChange={(e) => setNewHuespedEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 py-2 rounded-lg form-input text-xs"
                  />
                </div>
              </div>
            ) : (
              <select
                value={huespedId}
                onChange={(e) => setHuespedId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg form-input text-xs font-semibold"
              >
                {huespedes.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.nombres} {h.apellidos} {h.telefono ? `(${h.telefono})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dates with Night Counter */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50/50 via-slate-50/70 to-sky-50/50 border border-teal-100/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" /> Periodo de Estadía
              </span>
              {nightsCount > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100/80 text-teal-800 border border-teal-200">
                  ✨ {nightsCount} {nightsCount === 1 ? 'noche' : 'noches'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Fecha Check-in (Entrada) *
                </label>
                <input
                  type="date"
                  required
                  value={fechaCheckin}
                  onChange={(e) => {
                    const newIn = e.target.value;
                    setFechaCheckin(newIn);
                    if (fechaCheckout && newIn >= fechaCheckout) {
                      const d = new Date(newIn + 'T12:00:00');
                      d.setDate(d.getDate() + 1);
                      setFechaCheckout(d.toISOString().split('T')[0]);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl form-input text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Fecha Check-out (Salida) *
                </label>
                <input
                  type="date"
                  required
                  min={fechaCheckin}
                  value={fechaCheckout}
                  onChange={(e) => setFechaCheckout(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl form-input text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Tipo & Estatus */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipo de Huésped
              </label>
              <select
                value={tipoHuesped}
                onChange={(e) => setTipoHuesped(e.target.value as TipoHuesped)}
                className="w-full px-3 py-2 rounded-xl form-input text-xs font-medium"
              >
                <option value="Bloqueo de Dueño">Bloqueo de Dueño</option>
                <option value="Huésped con Cobro (PG)">Huésped con Cobro (PG)</option>
                <option value="Huésped sin Cobro (NPG)">Huésped sin Cobro (NPG)</option>
                <option value="Renta / Streamline">Renta / Streamline</option>
                <option value="Resort Amenity Usage">Resort Amenity Usage</option>
                <option value="Mantenimiento / Staff">Mantenimiento / Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Condición de Pago
              </label>
              <select
                value={pagoTipo}
                onChange={(e) => setPagoTipo(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl form-input text-xs font-medium"
              >
                <option value="Sin pago">Sin pago</option>
                <option value="Con pago">Con pago</option>
                <option value="Uso de amenidades">Uso de amenidades</option>
                <option value="Cortesia">Cortesía</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Estatus
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoReservacion)}
                className="w-full px-3 py-2 rounded-xl form-input text-xs font-semibold"
              >
                <option value="Confirmada">Confirmada</option>
                <option value="En Casa (Checked-in)">En Casa (Checked-in)</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Checked-out">Checked-out</option>
              </select>
            </div>
          </div>

          {/* Brazaletes & Vehículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Brazaletes Asignados
              </label>
              <input
                type="text"
                value={brazaletes}
                onChange={(e) => setBrazaletes(e.target.value)}
                placeholder="ej. Azul Marino 9367-9368"
                className="w-full px-3 py-2 rounded-xl form-input text-xs font-semibold text-teal-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Vehículo y Placas
              </label>
              <input
                type="text"
                value={vehiculoInfo}
                onChange={(e) => setVehiculoInfo(e.target.value)}
                placeholder="ej. Ford F150 Blue AJM5429"
                className="w-full px-3 py-2 rounded-xl form-input text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notas y Observaciones
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Comentarios adicionales o permisos especiales..."
              className="w-full px-3 py-2 rounded-xl form-input text-xs"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-700/20"
            >
              {reservationToEdit ? 'Guardar Cambios' : 'Confirmar Reservación'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
