import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Reservacion, TipoHuesped, EstadoReservacion, Acompanante } from '../../types';
import { 
  X, 
  Calendar, 
  User, 
  Car, 
  AlertTriangle, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock,
  ShieldCheck
} from 'lucide-react';

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
    updateReservacion,
    checkReservationOverlap,
    getHuespedById
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
  const [numeroOcupantes, setNumeroOcupantes] = useState<number>(1);
  const [numeroAutos, setNumeroAutos] = useState<number>(1);
  const [brazaletes, setBrazaletes] = useState('');
  const [vehiculoInfo, setVehiculoInfo] = useState('');
  const [pagoTipo, setPagoTipo] = useState<'Con pago' | 'Sin pago' | 'Uso de amenidades' | 'Cortesia'>('Sin pago');
  const [estado, setEstado] = useState<EstadoReservacion>('Confirmada');
  const [notas, setNotas] = useState('');

  // Acompañantes y control de brazaletes
  const [acompanantes, setAcompanantes] = useState<Acompanante[]>([]);
  const [titularBrazaleteEntregado, setTitularBrazaleteEntregado] = useState<boolean>(false);

  useEffect(() => {
    if (reservationToEdit) {
      setPropiedadId(reservationToEdit.propiedad_id);
      setHuespedId(reservationToEdit.huesped_id);
      setIsNewHuesped(false);
      setCodigo(reservationToEdit.codigo || '');
      setTipoHuesped(reservationToEdit.tipo_huesped);
      setFechaCheckin(reservationToEdit.fecha_checkin);
      setFechaCheckout(reservationToEdit.fecha_checkout);
      setNumeroOcupantes(reservationToEdit.numero_ocupantes || 1);
      setNumeroAutos(reservationToEdit.numero_autos || 0);
      setBrazaletes(reservationToEdit.brazaletes || '');
      setVehiculoInfo(reservationToEdit.vehiculo_info || '');
      setPagoTipo(reservationToEdit.pago_tipo || 'Sin pago');
      setEstado(reservationToEdit.estado);
      setNotas(reservationToEdit.notas || '');

      // Load acompanantes
      const rawList = Array.isArray(reservationToEdit.acompanantes) ? reservationToEdit.acompanantes : [];
      const titularObj = rawList.find(a => a.id === 'titular');
      const compList = rawList.filter(a => a.id !== 'titular');

      setAcompanantes(compList);
      setTitularBrazaleteEntregado(
        titularObj 
          ? titularObj.brazalete_entregado 
          : (reservationToEdit.titular_brazalete_entregado ?? (reservationToEdit.estado === 'En Casa (Checked-in)'))
      );
    } else {
      const defaultProp = (typeof initialData?.propiedadId === 'number' && initialData.propiedadId > 0)
        ? initialData.propiedadId
        : (propiedades[0]?.id || 101);
      setPropiedadId(Number(defaultProp));
      setCodigo(`RES-${Math.floor(100000 + Math.random() * 900000)}`);
      setTipoHuesped('Huésped sin Cobro (NPG)');
      
      const inDate = (typeof initialData?.fechaCheckin === 'string' && initialData.fechaCheckin) || '2026-09-23';
      let outDate = typeof initialData?.fechaCheckout === 'string' ? initialData.fechaCheckout : undefined;
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
      setNumeroOcupantes(1);
      setNumeroAutos(1);
      setBrazaletes('');
      setVehiculoInfo('');
      setPagoTipo('Sin pago');
      setEstado('Confirmada');
      setNotas('');
      setIsNewHuesped(false);
      setAcompanantes([]);
      setTitularBrazaleteEntregado(false);
    }
  }, [reservationToEdit, isOpen, initialData, propiedades]);

  const nightsCount = useMemo(() => {
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

  // Overlap conflict check
  const conflictReservation = useMemo(() => {
    if (!propiedadId || !fechaCheckin || !fechaCheckout) return undefined;
    return checkReservationOverlap(Number(propiedadId), fechaCheckin, fechaCheckout, reservationToEdit?.id);
  }, [propiedadId, fechaCheckin, fechaCheckout, reservationToEdit, checkReservationOverlap]);

  const conflictGuest = conflictReservation ? getHuespedById(conflictReservation.huesped_id) : undefined;

  // Handlers for Acompañantes
  const handleAddAcompanante = () => {
    const newAcomp: Acompanante = {
      id: 'acomp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      nombre_completo: '',
      tipo: 'Adulto',
      telefono: '',
      brazalete_entregado: false
    };
    const updated = [...acompanantes, newAcomp];
    setAcompanantes(updated);
    setNumeroOcupantes(1 + updated.length);
  };

  const handleUpdateAcompanante = (id: string, field: keyof Acompanante, value: any) => {
    setAcompanantes(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'brazalete_entregado' && value === true && !updated.fecha_entrega) {
          updated.fecha_entrega = new Date().toISOString();
        }
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveAcompanante = (id: string) => {
    const updated = acompanantes.filter(item => item.id !== id);
    setAcompanantes(updated);
    setNumeroOcupantes(Math.max(1, 1 + updated.length));
  };

  const handleToggleAllBrazaletes = (deliver: boolean) => {
    setTitularBrazaleteEntregado(deliver);
    const nowStr = new Date().toISOString();
    setAcompanantes(prev => prev.map(a => ({
      ...a,
      brazalete_entregado: deliver,
      fecha_entrega: deliver ? (a.fecha_entrega || nowStr) : undefined
    })));
  };

  if (!isOpen) return null;

  const currentProperty = propiedades.find(p => p.id === Number(propiedadId));
  const maxCapacity = currentProperty?.capacidad_personas || 8;
  const totalOccupants = 1 + acompanantes.filter(a => a.nombre_completo.trim().length > 0).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictReservation) return;

    // Filter out completely empty companion rows
    const cleanAcompanantes = acompanantes
      .filter(a => a.id !== 'titular' && a.nombre_completo.trim().length > 0)
      .map(a => ({
        ...a,
        nombre_completo: a.nombre_completo.trim(),
        telefono: a.telefono?.trim() || undefined
      }));

    const titularGuest = huespedes.find(h => h.id === Number(huespedId));
    const titularName = isNewHuesped 
      ? `${newHuespedNombre.trim()} ${newHuespedApellido.trim()}`.trim()
      : (titularGuest ? `${titularGuest.nombres} ${titularGuest.apellidos}` : 'Huésped Titular');

    const titularItem: Acompanante = {
      id: 'titular',
      nombre_completo: titularName || 'Huésped Titular',
      tipo: 'Adulto',
      brazalete_entregado: titularBrazaleteEntregado,
      fecha_entrega: titularBrazaleteEntregado ? new Date().toISOString() : undefined
    };

    const finalAcompanantes = [titularItem, ...cleanAcompanantes];
    const finalOccupantsCount = Math.max(Number(numeroOcupantes) || 1, 1 + cleanAcompanantes.length);

    // Summary of brazaletes
    const deliveredCount = (titularBrazaleteEntregado ? 1 : 0) + cleanAcompanantes.filter(a => a.brazalete_entregado).length;
    const brazaletesSummary = `${deliveredCount}/${finalOccupantsCount} entregados`;

    if (reservationToEdit) {
      updateReservacion(reservationToEdit.id, {
        propiedad_id: Number(propiedadId),
        huesped_id: Number(huespedId),
        codigo: codigo.trim() || undefined,
        tipo_huesped: tipoHuesped,
        fecha_checkin: fechaCheckin,
        fecha_checkout: fechaCheckout,
        numero_ocupantes: finalOccupantsCount,
        numero_autos: Number(numeroAutos) || 0,
        brazaletes: brazaletes.trim() || brazaletesSummary,
        vehiculo_info: vehiculoInfo.trim() || undefined,
        pago_tipo: pagoTipo,
        estado,
        notas: notas.trim() || undefined,
        acompanantes: finalAcompanantes,
        titular_brazalete_entregado: titularBrazaleteEntregado,
        titular_fecha_entrega: titularBrazaleteEntregado ? (reservationToEdit.titular_fecha_entrega || new Date().toISOString()) : undefined
      });
    } else {
      const huespedData = isNewHuesped
        ? {
            nombres: newHuespedNombre.trim() || 'Nuevo',
            apellidos: newHuespedApellido.trim() || 'Huésped',
            telefono: newHuespedTelefono.trim() || undefined,
            email: newHuespedEmail.trim() || undefined
          }
        : undefined;

      addReservacion(
        {
          propiedad_id: Number(propiedadId) || propiedades[0]?.id || 101,
          huesped_id: isNewHuesped ? 0 : Number(huespedId) || 1,
          codigo: codigo.trim() || undefined,
          tipo_huesped: tipoHuesped,
          fecha_checkin: fechaCheckin,
          fecha_checkout: fechaCheckout,
          numero_ocupantes: finalOccupantsCount,
          numero_autos: Number(numeroAutos) || 0,
          brazaletes: brazaletes.trim() || brazaletesSummary,
          vehiculo_info: vehiculoInfo.trim() || undefined,
          pago_tipo: pagoTipo,
          estado,
          notas: notas.trim() || undefined,
          acompanantes: finalAcompanantes,
          titular_brazalete_entregado: titularBrazaleteEntregado,
          titular_fecha_entrega: titularBrazaleteEntregado ? new Date().toISOString() : undefined
        },
        huespedData
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-scale-up my-auto max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {reservationToEdit ? 'Editar Reservación' : 'Nueva Reservación / Entrada'}
              </h2>
              <p className="text-[11px] text-slate-500">Gestión de estadía, ocupantes y asignación de brazaletes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
          
          {/* Row 1: Property & Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Propiedad / Condominio *
              </label>
              <select
                value={propiedadId}
                onChange={(e) => setPropiedadId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg form-input text-xs font-bold text-teal-900"
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
                className="w-full px-3 py-2 rounded-lg form-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Guest Selector (Titular) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-700" /> Huésped Titular (Responsable)
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

            {/* Titular Wristband Delivery Status */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Entrega de brazalete al Titular:
              </span>
              <button
                type="button"
                onClick={() => setTitularBrazaleteEntregado(!titularBrazaleteEntregado)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  titularBrazaleteEntregado 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                {titularBrazaleteEntregado ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Brazalete Entregado</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pendiente de Entrega</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic Accompanist / Occupants Section */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-50 to-teal-50/20 border border-teal-100/90 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-700" /> Acompañantes y Control de Brazaletes
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-200">
                  {totalOccupants} / {maxCapacity} personas
                </span>
              </div>

              <div className="flex items-center gap-2">
                {acompanantes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleToggleAllBrazaletes(true)}
                    className="text-[11px] text-teal-700 hover:text-teal-900 hover:underline font-semibold"
                  >
                    ✓ Entregar a todos
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddAcompanante}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Acompañante</span>
                </button>
              </div>
            </div>

            {acompanantes.length === 0 ? (
              <div className="p-4 text-center rounded-lg border border-dashed border-slate-200 bg-white/70 text-slate-500 text-xs">
                <span>No hay acompañantes registrados en esta reservación. Solo el titular ocupará la unidad.</span>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {acompanantes.map((acomp, idx) => (
                  <div 
                    key={acomp.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      
                      {/* Name */}
                      <div className="md:col-span-5">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Nombre Completo ({idx + 1}) *
                        </label>
                        <input
                          type="text"
                          required
                          value={acomp.nombre_completo}
                          onChange={(e) => handleUpdateAcompanante(acomp.id, 'nombre_completo', e.target.value)}
                          placeholder="ej. María Morales"
                          className="w-full px-2.5 py-1.5 rounded-lg form-input text-xs"
                        />
                      </div>

                      {/* Type */}
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Tipo de Ocupante
                        </label>
                        <select
                          value={acomp.tipo}
                          onChange={(e) => handleUpdateAcompanante(acomp.id, 'tipo', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg form-input text-xs font-medium"
                        >
                          <option value="Adulto">Adulto</option>
                          <option value="Menor">Menor de Edad</option>
                          <option value="Invitado">Invitado</option>
                          <option value="Visita">Visita de Día</option>
                        </select>
                      </div>

                      {/* Wristband status */}
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Brazalete
                        </label>
                        <button
                          type="button"
                          onClick={() => handleUpdateAcompanante(acomp.id, 'brazalete_entregado', !acomp.brazalete_entregado)}
                          className={`w-full px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            acomp.brazalete_entregado 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {acomp.brazalete_entregado ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Entregado</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pendiente</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Remove Button */}
                      <div className="md:col-span-1 flex justify-end items-end pt-3 md:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveAcompanante(acomp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar acompañante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dates with Night Counter */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-teal-50/50 via-slate-50/70 to-sky-50/50 border border-teal-100/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" /> Periodo de Estadía
              </span>
              {nightsCount > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100/80 text-teal-800 border border-teal-200">
                  {nightsCount} {nightsCount === 1 ? 'noche' : 'noches'}
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
                  className="w-full px-3 py-2 rounded-lg form-input text-xs font-medium"
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
                  className="w-full px-3 py-2 rounded-lg form-input text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Tipo, Condición & Estatus */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipo de Huésped
              </label>
              <select
                value={tipoHuesped}
                onChange={(e) => setTipoHuesped(e.target.value as TipoHuesped)}
                className="w-full px-3 py-2 rounded-lg form-input text-xs font-medium"
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
                className="w-full px-3 py-2 rounded-lg form-input text-xs font-medium"
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
                className="w-full px-3 py-2 rounded-lg form-input text-xs font-semibold"
              >
                <option value="Confirmada">Confirmada</option>
                <option value="En Casa (Checked-in)">En Casa (Checked-in)</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Checked-out">Checked-out</option>
              </select>
            </div>
          </div>

          {/* Autos & Vehículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Número de Autos Autorizados
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={numeroAutos}
                onChange={(e) => setNumeroAutos(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl form-input text-xs font-semibold"
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
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
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
              className="w-full px-3 py-2 rounded-lg form-input text-xs"
            />
          </div>

          {/* Conflict Error Alert if overlap detected */}
          {conflictReservation && (
            <div className="p-3.5 rounded-lg bg-rose-50/90 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-950 block">Fechas No Disponibles (Superposición de Reservaciones):</span>
                <span className="text-rose-800 text-[11px] leading-relaxed">
                  Este condominio ya se encuentra reservado del <strong>{conflictReservation.fecha_checkin}</strong> al <strong>{conflictReservation.fecha_checkout}</strong> por <strong>{conflictGuest ? `${conflictGuest.nombres} ${conflictGuest.apellidos}` : 'otro huésped'}</strong> (Folio #{conflictReservation.codigo || conflictReservation.id}). No se permiten sobreventas.
                </span>
              </div>
            </div>
          )}

          {/* Footer */}
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
              disabled={!!conflictReservation}
              className={`px-6 py-2 rounded-lg font-bold text-xs shadow-md transition-all ${
                conflictReservation
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-700/20 active:scale-95'
              }`}
            >
              {conflictReservation ? 'Fechas No Disponibles' : reservationToEdit ? 'Guardar Cambios' : 'Confirmar Reservación'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
