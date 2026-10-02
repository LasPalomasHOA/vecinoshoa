import React, { useState } from 'react';
import { Mail, X, Smartphone, Monitor, Copy, Check, Sparkles, Building, User } from 'lucide-react';
import { DestinatarioComunicado, CategoriaComunicado } from '../../types';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  asunto: string;
  cuerpo: string;
  categoria: CategoriaComunicado;
  destinatarios: DestinatarioComunicado[];
  remitenteNombre?: string;
  remitenteEmail?: string;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  asunto,
  cuerpo,
  categoria,
  destinatarios,
  remitenteNombre = 'Administración Las Palomas HOA',
  remitenteEmail = 'admin@laspalomas.com'
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentRecipient = destinatarios[selectedRecipientIndex] || {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'propietario@laspalomas.com',
    condominios: [{ propiedad_nombre: 'Condo 302', edificio_nombre: 'Torre Diamante' }]
  };

  const sampleName = `${currentRecipient.nombre} ${currentRecipient.apellido}`;
  const sampleCondo = currentRecipient.condominios?.[0]?.propiedad_nombre || 'Condominio #101';
  const sampleTorre = currentRecipient.condominios?.[0]?.edificio_nombre || 'Torre Principal';

  // Replace dynamic tags
  const personalizedSubject = asunto
    .replace(/{nombre_propietario}/g, sampleName)
    .replace(/{condominio}/g, sampleCondo)
    .replace(/{torre}/g, sampleTorre);

  const personalizedBody = cuerpo
    .replace(/{nombre_propietario}/g, sampleName)
    .replace(/{condominio}/g, sampleCondo)
    .replace(/{torre}/g, sampleTorre)
    .replace(/{fecha_actual}/g, new Date().toLocaleDateString('es-MX', { dateStyle: 'long' }))
    .replace(/{administrador}/g, remitenteNombre);

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${personalizedSubject}\n\n${personalizedBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        
        {/* Modal Header Controls */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Simulador de Correo Oficial</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                  Vista Previa
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Visualiza el formato exacto que llegará a la bandeja de entrada</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Switcher */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/60">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  deviceView === 'desktop'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista de Computadora"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Escritorio</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  deviceView === 'mobile'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista de Móvil"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Móvil</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Recipient Tester Selector */}
        {destinatarios.length > 0 && (
          <div className="px-5 py-2.5 bg-teal-50/60 border-b border-teal-100/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-teal-900">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="font-semibold text-[11px]">Probar personalización con destinatario:</span>
            </div>
            <select
              value={selectedRecipientIndex}
              onChange={(e) => setSelectedRecipientIndex(Number(e.target.value))}
              className="px-2.5 py-1 text-xs rounded-lg bg-white border border-teal-200 text-teal-950 font-medium focus:ring-1 focus:ring-teal-500 max-w-xs truncate"
            >
              {destinatarios.slice(0, 30).map((d, i) => (
                <option key={d.usuario_id || i} value={i}>
                  {d.nombre} {d.apellido} ({d.condominios?.[0]?.propiedad_nombre || 'Sin condo'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Email Viewer Canvas */}
        <div className="p-4 sm:p-6 bg-slate-100/90 overflow-y-auto flex-1 flex justify-center items-start">
          <div
            className={`bg-white rounded-xl border border-slate-200/90 shadow-md overflow-hidden text-slate-800 transition-all duration-300 ${
              deviceView === 'desktop' ? 'w-full max-w-xl' : 'w-full max-w-xs'
            }`}
          >
            {/* Header Las Palomas Banner */}
            <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-5 text-white text-center relative">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Building className="w-3 h-3" />
                <span>Las Palomas Seaside Golf Community</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                COMUNICADO OFICIAL HOA
              </h2>
              <p className="text-[11px] text-teal-200 font-medium mt-0.5">
                Administración General & Consejo Directivo
              </p>
            </div>

            {/* Email Meta Info Card */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 text-xs space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-400 shrink-0 w-12">De:</span>
                <span className="font-semibold text-slate-800 truncate">
                  {remitenteNombre} &lt;{remitenteEmail}&gt;
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-400 shrink-0 w-12">Para:</span>
                <span className="font-semibold text-teal-900 truncate">
                  {sampleName} &lt;{currentRecipient.email}&gt;
                </span>
              </div>
              <div className="flex items-start gap-2 border-t border-slate-200/60 pt-1.5">
                <span className="font-bold text-slate-400 shrink-0 w-12">Asunto:</span>
                <span className="font-bold text-slate-950 leading-snug">
                  {personalizedSubject || 'Sin asunto'}
                </span>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-5 sm:p-6 space-y-3.5 text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {personalizedBody || 'Escribe el contenido del mensaje para visualizarlo aquí...'}
            </div>

            {/* Email Official Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200/80 text-center text-[10px] sm:text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">
                Asociación de Condóminos Las Palomas Seaside Golf Community
              </p>
              <p className="text-slate-400">
                Blvd. Costero 150, Sandy Beach, Puerto Peñasco, Sonora, México. C.P. 83550
              </p>
              <p className="text-[10px] text-slate-400 pt-1">
                Este correo fue enviado de forma oficial a propietarios registrados en el sistema de gestión residencial.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Cerrar Vista Previa
          </button>
        </div>

      </div>
    </div>
  );
};
