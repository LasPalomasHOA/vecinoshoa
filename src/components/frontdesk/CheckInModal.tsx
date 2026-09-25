import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Reservacion, Acompanante } from '../../types';
import { CheckCircle2, X, Tag, Car, Key, Users, Check, Clock } from 'lucide-react';

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
  const { reservaciones, checkInReservacion, getPropiedadById, getHuespedById } = useApp();

  const currentReservation = reservaciones.find(r => r.id === reservation?.id) || reservation;

  const [brazaletes, setBrazaletes] = useState('');
  const [vehiculoInfo, setVehiculoInfo] = useState('');
  const [titularEntregado, setTitularEntregado] = useState(true);
  const [acompanantesList, setAcompanantesList] = useState<Acompanante[]>([]);

  useEffect(() => {
    if (currentReservation) {
      setBrazaletes(currentReservation.brazaletes || '');
      setVehiculoInfo(currentReservation.vehiculo_info || '');
      
      const rawAcomp = Array.isArray(currentReservation.acompanantes) ? currentReservation.acompanantes : [];
      const titularInAcomp = rawAcomp.find(a => a.id === 'titular');
      const compList = rawAcomp.filter(a => a.id !== 'titular');

      setTitularEntregado(
        titularInAcomp 
          ? titularInAcomp.brazalete_entregado 
          : (currentReservation.titular_brazalete_entregado ?? true)
      );
      setAcompanantesList(compList);
    }
  }, [currentReservation, isOpen]);

  if (!isOpen || !currentReservation) return null;

  const prop = getPropiedadById(currentReservation.propiedad_id);
  const huesped = getHuespedById(currentReservation.huesped_id);

  const totalPeople = 1 + acompanantesList.length;
  const deliveredCount = (titularEntregado ? 1 : 0) + acompanantesList.filter(a => a.brazalete_entregado).length;

  const handleToggleAcompananteBrazalete = (id: string) => {
    setAcompanantesList(prev => prev.map(a => {
      if (a.id === id) {
        const nextState = !a.brazalete_entregado;
        return {
          ...a,
          brazalete_entregado: nextState,
          fecha_entrega: nextState ? new Date().toISOString() : undefined
        };
      }
      return a;
    }));
  };

  const handleMarkAllDelivered = (deliver: boolean) => {
    setTitularEntregado(deliver);
    const now = new Date().toISOString();
    setAcompanantesList(prev => prev.map(a => ({
      ...a,
      brazalete_entregado: deliver,
      fecha_entrega: deliver ? (a.fecha_entrega || now) : undefined
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const summary = `${deliveredCount}/${totalPeople} brazaletes entregados`;
    const finalBrazaleteNote = brazaletes.trim() ? `${brazaletes.trim()} (${summary})` : summary;

    const titularItem: Acompanante = {
      id: 'titular',
      nombre_completo: huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Huésped Titular',
      tipo: 'Adulto',
      brazalete_entregado: titularEntregado,
      fecha_entrega: titularEntregado ? new Date().toISOString() : undefined
    };

    const finalAcompList = [titularItem, ...acompanantesList];

    checkInReservacion(
      currentReservation.id, 
      finalBrazaleteNote,
      vehiculoInfo,
      finalAcompList,
      titularEntregado
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-100 bg-emerald-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Registro de Entrada (Check-In)</h2>
              <p className="text-xs text-emerald-800 font-semibold">Condominio {prop?.nombre || currentReservation.propiedad_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Huésped Titular:</span>
              <span className="font-bold text-slate-900">{huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Periodo de Estadía:</span>
              <span className="font-mono text-teal-800 font-bold">{currentReservation.fecha_checkin} al {currentReservation.fecha_checkout}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Total de Personas:</span>
              <span className="font-bold text-slate-800">{totalPeople} ({totalPeople === 1 ? 'Solo titular' : `1 titular + ${acompanantesList.length} acompañantes`})</span>
            </div>
          </div>

          {/* Individual Wristband Checklist */}
          <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-900">Entrega de Brazaletes por Huésped</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                deliveredCount === totalPeople 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {deliveredCount} / {totalPeople} Entregados
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-end gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleMarkAllDelivered(true)}
                className="text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer"
              >
                ✓ Entregar a todos los presentes
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => handleMarkAllDelivered(false)}
                className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
              >
                Desmarcar todos
              </button>
            </div>

            {/* Occupants list */}
            <div className="space-y-2 pt-1">
              
              {/* Titular item */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Huésped Titular'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                      Titular
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{huesped?.telefono || 'Contacto principal'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setTitularEntregado(!titularEntregado)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    titularEntregado 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  {titularEntregado ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Entregado</span>
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
              {acompanantesList.map((acomp) => (
                <div key={acomp.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{acomp.nombre_completo || 'Acompañante'}</span>
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
                    onClick={() => handleToggleAcompananteBrazalete(acomp.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      acomp.brazalete_entregado 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {acomp.brazalete_entregado ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Entregado</span>
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

          {/* Color o Notas de Brazaletes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-teal-700" />
              Color / Observación de Brazaletes (Opcional)
            </label>
            <input
              type="text"
              value={brazaletes}
              onChange={(e) => setBrazaletes(e.target.value)}
              placeholder="ej. Azul Marino Temporada 2026"
              className="w-full px-3.5 py-2 rounded-xl form-input text-xs text-teal-900 font-bold"
            />
          </div>

          {/* Vehículo y Placas */}
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

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
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
