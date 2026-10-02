import React, { useRef, useState } from 'react';
import {
  FileText,
  Mail,
  Send,
  Sparkles,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  SendHorizontal,
  RefreshCw
} from 'lucide-react';
import { CategoriaComunicado, PlantillaComunicado, DestinatarioComunicado } from '../../types';
import { api } from '../../services/api';

interface ComunicadoComposerProps {
  asunto: string;
  setAsunto: (asunto: string) => void;
  categoria: CategoriaComunicado;
  setCategoria: (categoria: CategoriaComunicado) => void;
  cuerpo: string;
  setCuerpo: React.Dispatch<React.SetStateAction<string>>;
  isTestMode: boolean;
  setIsTestMode: (isTest: boolean) => void;
  destinatariosCount: number;
  destinatariosCalculados: DestinatarioComunicado[];
  plantillas: PlantillaComunicado[];
  onApplyPlantilla: (plantilla: PlantillaComunicado) => void;
  onOpenConfirm: () => void;
  adminEmail?: string;
  adminName?: string;
}

export const ComunicadoComposer: React.FC<ComunicadoComposerProps> = ({
  asunto,
  setAsunto,
  categoria,
  setCategoria,
  cuerpo,
  setCuerpo,
  isTestMode,
  setIsTestMode,
  destinatariosCount,
  destinatariosCalculados,
  plantillas,
  onApplyPlantilla,
  onOpenConfirm,
  adminEmail = 'admin@laspalomas.com',
  adminName = 'Administración Las Palomas HOA'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);
  const [testMailFeedback, setTestMailFeedback] = useState<{ msg: string; success: boolean } | null>(null);

  // Insert tag at current cursor position
  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setCuerpo(prev => prev + ' ' + tag);
      return;
    }
    const elem = textareaRef.current;
    const start = elem.selectionStart;
    const end = elem.selectionEnd;
    const text = elem.value;
    const newText = text.substring(0, start) + tag + text.substring(end);
    setCuerpo(newText);
    setTimeout(() => {
      elem.focus();
      elem.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  // Send a quick direct test email to the logged in admin
  const handleSendTestToSelf = async () => {
    if (!adminEmail || !asunto.trim() || !cuerpo.trim()) {
      alert('Por favor escribe un asunto y cuerpo para enviar el correo de prueba.');
      return;
    }

    setIsSendingTestMail(true);
    setTestMailFeedback(null);

    try {
      const payload = {
        asunto: `[PRUEBA DE REVISIÓN] ${asunto.trim()}`,
        categoria,
        contenido: cuerpo.trim(),
        destinatarios: [
          {
            nombre: adminName,
            email: adminEmail,
            condominio: 'Muestra Condominio #302',
            torre: 'Torre Diamante'
          }
        ]
      };

      const res = await api.comunicados.send(payload);
      if (res && res.failed > 0 && res.sent === 0) {
        throw new Error('Fallo al conectar con servidor SMTP');
      }

      setTestMailFeedback({
        msg: `¡Correo de prueba enviado con éxito a ${adminEmail}! Revisa tu bandeja de entrada.`,
        success: true
      });
    } catch (err: any) {
      setTestMailFeedback({
        msg: `No se pudo enviar la prueba: ${err.message || 'Error SMTP'}`,
        success: false
      });
    } finally {
      setIsSendingTestMail(false);
      setTimeout(() => setTestMailFeedback(null), 7000);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Quick Template Selector Strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-800">Plantillas Rápidas</span>
          </div>
          <span className="text-[11px] text-slate-400">Haz clic para precargar contenido</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {plantillas.slice(0, 6).map(plan => (
            <button
              key={plan.id}
              type="button"
              onClick={() => onApplyPlantilla(plan)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-teal-600 shrink-0" />
              <span className="truncate max-w-[180px]">{plan.titulo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Composer Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Header with Category Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Contenido del Comunicado</h2>
              <p className="text-[11px] text-slate-500">Redacta y personaliza la circular oficial</p>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Categoría:</span>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaComunicado)}
              className="px-3 py-1.5 rounded-xl form-input text-xs font-bold text-slate-800 shadow-2xs"
            >
              <option value="AVISO_GENERAL">Aviso General</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="ASAMBLEA">Asamblea</option>
              <option value="SEGURIDAD">Seguridad</option>
              <option value="PAGOS_HOA">Pagos HOA</option>
              <option value="EVENTO">Evento</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
        </div>

        {/* Asunto Input */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Asunto Oficial del Correo <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="ej. Aviso de Mantenimiento Preventivo de Elevadores – Las Palomas"
            className="w-full px-3.5 py-2.5 rounded-xl form-input text-xs font-semibold focus:border-teal-500"
          />
        </div>

        {/* Dynamic Variables Bar */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-teal-600" />
              <span>Etiquetas de personalización dinámica:</span>
            </span>
            <span className="text-[10px] text-slate-400">Clic para insertar en el texto</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleInsertTag('{nombre_propietario}')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-teal-900 font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              title="Nombre completo del destinatario"
            >
              {'{nombre_propietario}'}
            </button>

            <button
              type="button"
              onClick={() => handleInsertTag('{condominio}')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-teal-900 font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              title="Nombre o número del departamento"
            >
              {'{condominio}'}
            </button>

            <button
              type="button"
              onClick={() => handleInsertTag('{torre}')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-teal-900 font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              title="Nombre de la torre o edificio"
            >
              {'{torre}'}
            </button>

            <button
              type="button"
              onClick={() => handleInsertTag('{fecha_actual}')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-teal-900 font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              title="Fecha actual en formato legible"
            >
              {'{fecha_actual}'}
            </button>

            <button
              type="button"
              onClick={() => handleInsertTag('{administrador}')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-teal-900 font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              title="Nombre del administrador emisor"
            >
              {'{administrador}'}
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Cuerpo del Mensaje <span className="text-rose-600">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {cuerpo.length} caracteres
            </span>
          </div>
          
          <textarea
            ref={textareaRef}
            required
            rows={10}
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            placeholder="Escribe el cuerpo del comunicado aquí..."
            className="w-full px-3.5 py-2.5 rounded-xl form-input text-xs leading-relaxed font-normal focus:border-teal-500 focus:ring-teal-500/20"
          />
        </div>

        {/* Modo de Envío Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          !isTestMode 
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-xs' 
            : 'bg-amber-50/70 border-amber-300 text-amber-950'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2">
              <Mail className={`w-4 h-4 shrink-0 ${!isTestMode ? 'text-emerald-700' : 'text-amber-700'}`} />
              <div>
                <span className="font-bold text-xs block">
                  {!isTestMode ? 'Modo: Envío Masivo Real (SMTP Gmail Activo)' : 'Modo: Registro Simulado (Sin Despacho Real)'}
                </span>
              </div>
            </div>

            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsTestMode(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isTestMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Envío Real
              </button>
              <button
                type="button"
                onClick={() => setIsTestMode(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isTestMode ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Simulado
              </button>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-600">
            {!isTestMode
              ? 'Los correos se entregarán directamente a las cuentas de correo electrónico registradas con acuse formal de envío.'
              : 'Modo seguro: se archivará en la bitácora e historial sin despachar correos reales a los condóminos.'}
          </p>
        </div>

        {/* Direct Test Email to Admin Trigger */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SendHorizontal className="w-4 h-4 text-teal-700 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">¿Deseas comprobar cómo luce en tu bandeja?</span>
              <span className="text-[11px] text-slate-500">Enviarás una muestra instantánea a <strong>{adminEmail}</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendTestToSelf}
            disabled={isSendingTestMail || !asunto.trim() || !cuerpo.trim()}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50 shrink-0"
          >
            {isSendingTestMail ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-700" />
                <span>Enviando prueba...</span>
              </>
            ) : (
              <>
                <SendHorizontal className="w-3.5 h-3.5 text-teal-700" />
                <span>Enviar prueba a mi correo</span>
              </>
            )}
          </button>
        </div>

        {/* Feedback alert for self test */}
        {testMailFeedback && (
          <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 animate-fadeIn ${
            testMailFeedback.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            {testMailFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testMailFeedback.msg}</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenConfirm}
            disabled={destinatariosCount === 0 || !asunto.trim() || !cuerpo.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Emitir Comunicado ({destinatariosCount} propietarios)</span>
          </button>
        </div>

      </div>

    </div>
  );
};
