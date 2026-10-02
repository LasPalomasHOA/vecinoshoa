import React, { useState } from 'react';
import { X, Copy, Check, Printer, RotateCcw } from 'lucide-react';
import { ComunicadoHistorial, CategoriaComunicado } from '../../types';

interface ComunicadoDetailModalProps {
  comunicado: ComunicadoHistorial | null;
  onClose: () => void;
  onReuse: (comunicado: ComunicadoHistorial) => void;
}

const CATEGORY_LABELS: Record<CategoriaComunicado, string> = {
  AVISO_GENERAL: 'Aviso General',
  MANTENIMIENTO: 'Mantenimiento',
  ASAMBLEA: 'Asamblea',
  SEGURIDAD: 'Seguridad',
  PAGOS_HOA: 'Pagos HOA',
  EVENTO: 'Evento',
  URGENTE: 'Urgente'
};

export const ComunicadoDetailModal: React.FC<ComunicadoDetailModalProps> = ({
  comunicado,
  onClose,
  onReuse
}) => {
  const [copied, setCopied] = useState(false);
  const [searchRecipient, setSearchRecipient] = useState('');

  if (!comunicado) return null;

  const formattedDate = new Date(comunicado.fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] print:border-none print:shadow-none">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-slate-900">Detalle del comunicado</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
              {CATEGORY_LABELS[comunicado.categoria] || comunicado.categoria}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
              comunicado.estado === 'Enviado' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {comunicado.estado}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">Fecha y Remitente:</span>
              <span className="font-medium text-slate-800">{comunicado.remitente_nombre}</span>
              <span className="text-[10px] text-slate-400 block">{formattedDate}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Audiencia:</span>
              <span className="font-medium text-slate-800 truncate block">{comunicado.criterio_detalle}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Destinatarios:</span>
              <span className="font-semibold text-slate-900">{comunicado.total_destinatarios} propietarios</span>
            </div>
          </div>

          {/* Asunto */}
          <div>
            <span className="text-[11px] font-medium text-slate-500 block mb-1">Asunto</span>
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-900 font-medium text-xs">
              {comunicado.asunto}
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-500">Mensaje</span>
              <button
                type="button"
                onClick={handleCopyContent}
                className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 cursor-pointer print:hidden"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-white whitespace-pre-line leading-relaxed text-slate-800 text-xs font-normal">
              {comunicado.contenido}
            </div>
          </div>

          {/* Destinatarios Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">
                Destinatarios notificados ({comunicado.destinatarios?.length || 0})
              </span>

              <input
                type="text"
                placeholder="Filtrar..."
                value={searchRecipient}
                onChange={(e) => setSearchRecipient(e.target.value)}
                className="px-2 py-0.5 text-xs rounded border border-slate-200 print:hidden max-w-[150px]"
              />
            </div>

            <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 p-1 space-y-1 bg-slate-50/50">
              {filteredDestinatarios.map((d, i) => (
                <div key={i} className="p-1.5 flex items-center justify-between text-[11px] bg-white rounded border border-slate-100">
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-slate-800 truncate block">{d.nombre}</span>
                    <span className="text-[10px] text-slate-400 font-mono truncate block">{d.email}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 px-1.5 py-0.2 rounded bg-slate-100 shrink-0">
                    {d.condominios_resumen}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onReuse(comunicado)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Clonar</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
