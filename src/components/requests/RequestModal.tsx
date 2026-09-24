import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SolicitudAcceso } from '../../types';
import { X, FileCheck } from 'lucide-react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose }) => {
  const { propiedades, addSolicitud } = useApp();

  const [propiedadId, setPropiedadId] = useState<number>(propiedades[0]?.id || 101);
  const [creadorNombre, setCreadorNombre] = useState('');
  const [solicitud, setSolicitud] = useState('');
  const [fechaEsperada, setFechaEsperada] = useState('2026-09-23');
  const [comentario, setComentario] = useState('');
  const [estatus] = useState<SolicitudAcceso['estatus']>('Pendiente');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSolicitud({
      propiedad_id: propiedadId,
      creador_nombre: creadorNombre || 'Propietario',
      solicitud,
      fecha_esperada: fechaEsperada,
      comentario,
      estatus,
      procesador_nombre: 'Recepción HOA'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Nueva Solicitud / Pase de Acceso</h2>
              <p className="text-xs text-slate-500">Pase para técnicos, vidrieros o mantenimiento</p>
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
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Condominio / Propiedad *
            </label>
            <select
              value={propiedadId}
              onChange={(e) => setPropiedadId(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl form-input text-xs font-bold text-teal-900"
            >
              {propiedades.map(p => (
                <option key={p.id} value={p.id}>
                  Condominio {p.nombre} (Piso {p.piso})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Solicitante / Residente *
            </label>
            <input
              type="text"
              required
              value={creadorNombre}
              onChange={(e) => setCreadorNombre(e.target.value)}
              placeholder="ej. Ennia Celaya / Propietario"
              className="w-full px-3.5 py-2 rounded-xl form-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Detalle del Trabajo / Empresa / Contratista *
            </label>
            <textarea
              required
              rows={3}
              value={solicitud}
              onChange={(e) => setSolicitud(e.target.value)}
              placeholder="ej. Santana Glass vendrá mañana para revisar reparación de ventanales..."
              className="w-full px-3.5 py-2 rounded-xl form-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Fecha Programada de Acceso *
            </label>
            <input
              type="date"
              required
              value={fechaEsperada}
              onChange={(e) => setFechaEsperada(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl form-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Comentarios de Recepción / Seguridad (Opcional)
            </label>
            <input
              type="text"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="ej. Se requiere identificación oficial en caseta"
              className="w-full px-3.5 py-2 rounded-xl form-input text-xs"
            />
          </div>

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
              Registrar Pase
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
