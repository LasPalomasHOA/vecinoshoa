import React, { useState } from 'react';
import { Mail, X, Clock, Users, Copy, Check, Printer, RotateCcw, Building, Shield, Tag } from 'lucide-react';
import { ComunicadoHistorial, CategoriaComunicado } from '../../types';

interface ComunicadoDetailModalProps {
  comunicado: ComunicadoHistorial | null;
  onClose: () => void;
  onReuse: (comunicado: ComunicadoHistorial) => void;
}

export const ComunicadoDetailModal: React.FC<ComunicadoDetailModalProps> = ({
  comunicado,
  onClose,
  onReuse
}) => {
  const [copied, setCopied] = useState(false);
  const [searchRecipient, setSearchRecipient] = useState('');

  if (!comunicado) return null;

  const formattedDate = new Date(comunicado.fecha).toLocaleString('es-MX', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const getCategoriaBadge = (cat: CategoriaComunicado) => {
    switch (cat) {
      case 'AVISO_GENERAL':
        return { label: 'Aviso General', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'MANTENIMIENTO':
        return { label: 'Mantenimiento', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'ASAMBLEA':
        return { label: 'Asamblea / Convocatoria', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'SEGURIDAD':
        return { label: 'Seguridad & Vigilancia', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'PAGOS_HOA':
        return { label: 'Pagos & Cuotas HOA', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'EVENTO':
        return { label: 'Evento Social', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'URGENTE':
        return { label: 'Urgente / Prioritario', bg: 'bg-red-100 text-red-800 border-red-300 font-black' };
      default:
        return { label: cat, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const catBadge = getCategoriaBadge(comunicado.categoria);

  const filteredDestinatarios = (comunicado.destinatarios || []).filter(d => {
    if (!searchRecipient.trim()) return true;
    const q = searchRecipient.toLowerCase();
    return d.nombre.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.condominios_resumen.toLowerCase().includes(q);
  });

  const handleCopyContent = () => {
    navigator.clipboard.writeText(`${comunicado.asunto}\n\n${comunicado.contenido}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up print:border-none print:shadow-none print:max-h-full">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Expediente de Comunicado Oficial</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catBadge.bg}`}>
                  {catBadge.label}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                  comunicado.estado === 'Enviado' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {comunicado.estado}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Folio: #{comunicado.id} • Registrado el {formattedDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/90">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remitente:</span>
              <span className="font-semibold text-slate-800">{comunicado.remitente_nombre}</span>
              <span className="text-[11px] text-slate-500 block truncate">{comunicado.remitente_email}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Audiencia / Criterio:</span>
              <span className="font-semibold text-slate-800">{comunicado.criterio_seleccion}</span>
              <span className="text-[11px] text-teal-800 font-bold block truncate">{comunicado.criterio_detalle}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Destinatarios:</span>
              <span className="text-base font-black text-slate-900">{comunicado.total_destinatarios}</span>
              <span className="text-[11px] text-slate-500 block">propietarios notificados</span>
            </div>
          </div>

          {/* Asunto & Contenido */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Asunto Oficial:</span>
            <div className="p-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm tracking-tight shadow-xs">
              {comunicado.asunto}
            </div>
          </div>

          {/* Mensaje Renderizado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contenido del Comunicado:</span>
              <button
                type="button"
                onClick={handleCopyContent}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer print:hidden"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar texto'}</span>
              </button>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/90 whitespace-pre-line leading-relaxed text-slate-800 shadow-2xs font-normal text-xs sm:text-sm">
              {comunicado.contenido}
            </div>
          </div>

          {/* Destinatarios Table / List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Destinatarios Notificados ({comunicado.destinatarios?.length || 0})</span>
              </span>

              <input
                type="text"
                placeholder="Filtrar por nombre o condo..."
                value={searchRecipient}
                onChange={(e) => setSearchRecipient(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg form-input max-w-xs print:hidden"
              />
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 divide-y divide-slate-100">
              {filteredDestinatarios.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No se encontraron destinatarios con el filtro indicado.
                </div>
              ) : (
                filteredDestinatarios.map((d, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between text-xs hover:bg-white transition-colors">
                    <div className="min-w-0 pr-3">
                      <span className="font-bold text-slate-800 block truncate">{d.nombre}</span>
                      <span className="text-[11px] font-mono text-slate-500 truncate block">{d.email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-100 shrink-0">
                      {d.condominios_resumen}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onReuse(comunicado)}
              className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clonar y Reutilizar</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Imprimir Circular</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
