import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles, Plus, Trash2, Edit3, Check, Search, Filter, Tag, FileText, ArrowRight, X } from 'lucide-react';
import { PlantillaComunicado, CategoriaComunicado } from '../../types';

export const DEFAULT_PLANTILLAS: PlantillaComunicado[] = [
  {
    id: 'plan-1',
    titulo: 'Mantenimiento Preventivo de Elevadores',
    categoria: 'MANTENIMIENTO',
    asunto: 'Aviso de Mantenimiento Preventivo de Elevadores – Las Palomas',
    cuerpo: `Estimado(a) Propietario(a) {nombre_propietario},
Condominio(s): {condominio} | {torre}

Le informamos que el próximo jueves se llevarán a cabo trabajos programados de mantenimiento preventivo y certificación en los elevadores de su edificio ({torre}).

• Horario estimado: 09:00 a.m. a 02:00 p.m.
• Impacto: Uno de los elevadores permanecerá en servicio alternado mientras se realiza el ajuste de poleas y pruebas de seguridad.

Agradecemos su comprensión y colaboración continua para mantener nuestras instalaciones en óptimas condiciones.

Atentamente,
Administración & Comité de Mantenimiento
Las Palomas Seaside Golf Community`
  },
  {
    id: 'plan-2',
    titulo: 'Jornada Bimestral de Fumigación',
    categoria: 'MANTENIMIENTO',
    asunto: 'Jornada Programada de Fumigación y Control de Plagas',
    cuerpo: `Estimados Propietarios de {torre},
Unidad(es): {condominio}

Les notificamos que el día de mañana se realizará la jornada bimestral de fumigación en pasillos, ductos de basura, áreas verdes y perímetro de condominios.

Recomendaciones de seguridad:
1. Mantener puertas y ventanas cerradas durante el horario de aplicación (10:00 a 14:00 hrs).
2. Si cuenta con mascotas en terraza o balcones, resguardarlas en el interior.
3. Evitar el tránsito de niños pequeños en pasillos durante la hora inmediata posterior a la aplicación.

Para cualquier duda, comunicarse a caseta de seguridad o recepción.

Atentamente,
Administración Las Palomas HOA`
  },
  {
    id: 'plan-3',
    titulo: 'Convocatoria Oficial a Asamblea General',
    categoria: 'ASAMBLEA',
    asunto: 'Convocatoria Oficial – Asamblea General Ordinaria de Propietarios',
    cuerpo: `Estimado(a) Propietario(a) {nombre_propietario},
Condominio(s): {condominio}

Por medio de la presente se le convoca formalmente a la Asamblea General Ordinaria de Condóminos de Las Palomas Seaside Golf Community.

• Fecha: Sábado 15 de Noviembre de 2026
• Primera Convocatoria: 10:00 a.m. | Segunda Convocatoria: 10:30 a.m.
• Sede: Salón de Eventos Principal / Enlace Virtual Zoom con voto verificado

Orden del día:
1. Lista de asistencia y verificación del quórum legal.
2. Informe anual del Consejo de Administración y Estados Financieros auditados.
3. Presentación y votación del Presupuesto Operativo y Fondo de Reserva 2027.
4. Elección y renovación de miembros del Comité de Vigilancia.
5. Asuntos generales.

Agradecemos confirmar su asistencia o enviar su carta poder debidamente firmada.

Atentamente,
Consejo Directivo & Administración HOA`
  },
  {
    id: 'plan-4',
    titulo: 'Interrupción Temporal del Suministro de Agua',
    categoria: 'URGENTE',
    asunto: 'AVISO URGENTE: Interrupción Temporal del Suministro de Agua',
    cuerpo: `Estimados Propietarios de {torre},
Afectación en: {condominio}

Por motivos de reparación urgente en la tubería matriz hidroneumática, se suspenderá temporalmente el suministro de agua en el edificio el día de hoy entre las 02:00 p.m. y las 05:00 p.m.

Nuestro equipo técnico de guardia ya se encuentra en sitio sustituyendo la válvula principal para normalizar la presión a la brevedad posible.

Lamentamos los inconvenientes temporales que esta maniobra técnica pueda ocasionar.

Atentamente,
Dirección de Operaciones & HOA Las Palomas`
  },
  {
    id: 'plan-5',
    titulo: 'Recordatorio Cuota de Mantenimiento HOA',
    categoria: 'PAGOS_HOA',
    asunto: 'Recordatorio de Cuota Ordinaria de Mantenimiento y Operación',
    cuerpo: `Estimado(a) Propietario(a) {nombre_propietario},
Unidad(es): {condominio}

Le enviamos un cordial saludo y le recordamos que las cuotas ordinarias de mantenimiento correspondientes al presente periodo se encuentran vigentes para pago oportuno.

Agradecemos a todos los propietarios que mantienen sus cuentas al corriente, lo que permite financiar los servicios de seguridad 24/7, albercas climatizadas, paisajismo y mantenimiento continuo de amenidades.

Para consultar su estado de cuenta actualizado o enviar su comprobante bancario, favor de comunicarse al departamento de cobranza.

Atentamente,
Departamento de Cobranza & Administración HOA`
  },
  {
    id: 'plan-6',
    titulo: 'Protocolo de Seguridad y Accesos a Visitantes',
    categoria: 'SEGURIDAD',
    asunto: 'Actualización de Protocolos de Seguridad y Registro en Caseta Principal',
    cuerpo: `Estimados Propietarios de Las Palomas ({condominio} | {torre}),

Con el fin de salvaguardar la tranquilidad y exclusividad de nuestro complejo, les recordamos las normas vigentes de acceso:

1. Todo visitante o contratista externo debe contar con pre-registro en el sistema o llamada previa de confirmación.
2. Los pases de acceso temporal tienen vigencia exclusiva por el periodo autorizado.
3. El límite de velocidad dentro de las vialidades internas es de 20 km/h.

Agradecemos su valiosa cooperación para mantener la seguridad de nuestras familias y patrimonio.

Atentamente,
Comité de Seguridad & Vigilancia Las Palomas`
  },
  {
    id: 'plan-7',
    titulo: 'Reglamento de Albercas y Áreas Comunes',
    categoria: 'AVISO_GENERAL',
    asunto: 'Normativas de Convivencia y Uso de Albercas en Temporada Alta',
    cuerpo: `Estimados Residentes y Propietarios ({condominio}),

Les compartimos un atento recordatorio sobre las normas de uso de nuestras albercas y jacuzzis para asegurar una experiencia placentera para toda la comunidad:

• Horario de albercas: 08:00 a.m. a 10:00 p.m.
• Queda estrictamente prohibido el uso de envases o recipientes de vidrio en la zona de camastros y albercas.
• El uso de bocinas portátiles debe mantenerse a un volumen moderado que respete el descanso de los vecinos.
• Los menores de 12 años deben estar acompañados en todo momento por un adulto responsable.

Disfrutemos juntos de nuestras instalaciones de primer nivel.

Atentamente,
Administración General Las Palomas HOA`
  }
];

interface PlantillasManagerProps {
  onSelectPlantilla: (plantilla: PlantillaComunicado) => void;
}

export const PlantillasManager: React.FC<PlantillasManagerProps> = ({ onSelectPlantilla }) => {
  const [plantillas, setPlantillas] = useState<PlantillaComunicado[]>(() => {
    const saved = localStorage.getItem('lp_custom_plantillas');
    if (saved) {
      try {
        const custom = JSON.parse(saved);
        return [...DEFAULT_PLANTILLAS, ...custom];
      } catch (e) {
        return DEFAULT_PLANTILLAS;
      }
    }
    return DEFAULT_PLANTILLAS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingModal, setIsCreatingModal] = useState(false);

  // New Template Form
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState<CategoriaComunicado>('AVISO_GENERAL');
  const [nuevoAsunto, setNuevoAsunto] = useState('');
  const [nuevoCuerpo, setNuevoCuerpo] = useState('');

  const saveCustomTemplates = (updatedList: PlantillaComunicado[]) => {
    setPlantillas(updatedList);
    const customOnly = updatedList.filter(p => !DEFAULT_PLANTILLAS.some(def => def.id === p.id));
    localStorage.setItem('lp_custom_plantillas', JSON.stringify(customOnly));
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim() || !nuevoAsunto.trim() || !nuevoCuerpo.trim()) return;

    const newPlan: PlantillaComunicado = {
      id: `custom-${Date.now()}`,
      titulo: nuevoTitulo.trim(),
      categoria: nuevaCategoria,
      asunto: nuevoAsunto.trim(),
      cuerpo: nuevoCuerpo.trim()
    };

    saveCustomTemplates([...plantillas, newPlan]);
    setIsCreatingModal(false);
    setNuevoTitulo('');
    setNuevoAsunto('');
    setNuevoCuerpo('');
  };

  const handleDeleteCustom = (id: string) => {
    if (window.confirm('¿Deseas eliminar esta plantilla personalizada?')) {
      const updated = plantillas.filter(p => p.id !== id);
      saveCustomTemplates(updated);
    }
  };

  const getCategoriaBadge = (cat: CategoriaComunicado) => {
    switch (cat) {
      case 'AVISO_GENERAL':
        return { label: 'Aviso General', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'MANTENIMIENTO':
        return { label: 'Mantenimiento', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'ASAMBLEA':
        return { label: 'Asamblea', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'SEGURIDAD':
        return { label: 'Seguridad', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'PAGOS_HOA':
        return { label: 'Pagos HOA', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'EVENTO':
        return { label: 'Evento', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'URGENTE':
        return { label: 'Urgente', bg: 'bg-red-100 text-red-800 border-red-300 font-bold' };
      default:
        return { label: cat, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const filteredPlantillas = plantillas.filter(p => {
    const matchCat = selectedCategory === 'TODAS' || p.categoria === selectedCategory;
    const matchSearch = !searchTerm.trim() || 
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cuerpo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Catálogo de Plantillas Predefinidas</h2>
              <p className="text-xs text-slate-500">Selecciona o personaliza circulares oficiales listas para enviar</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nueva Plantilla</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar plantilla por título o contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl form-input shadow-2xs"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['TODAS', 'AVISO_GENERAL', 'MANTENIMIENTO', 'ASAMBLEA', 'SEGURIDAD', 'PAGOS_HOA', 'URGENTE'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat === 'TODAS' ? 'Todas' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlantillas.map(plan => {
          const badge = getCategoriaBadge(plan.categoria);
          const isCustom = plan.id.startsWith('custom-');

          return (
            <div
              key={plan.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  
                  {isCustom && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        Personalizada
                      </span>
                      <button
                        onClick={() => handleDeleteCustom(plan.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Eliminar plantilla"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                    {plan.titulo}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1 line-clamp-1">
                    Asunto: {plan.asunto}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 line-clamp-4 leading-relaxed font-normal">
                  {plan.cuerpo}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onSelectPlantilla(plan)}
                  className="px-3.5 py-2 rounded-xl bg-teal-50 group-hover:bg-teal-600 text-teal-800 group-hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Cargar en Redactor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating New Custom Template */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">Crear Nueva Plantilla Personalizada</h3>
              </div>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre de la Plantilla *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Mantenimiento de Jacuzzis"
                    value={nuevoTitulo}
                    onChange={(e) => setNuevoTitulo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg form-input text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría *</label>
                  <select
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value as CategoriaComunicado)}
                    className="w-full px-3 py-2 rounded-lg form-input text-xs font-semibold text-slate-800"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Asunto Sugerido *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Trabajos de Mantenimiento en Área de Jacuzzis"
                  value={nuevoAsunto}
                  onChange={(e) => setNuevoAsunto(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg form-input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cuerpo del Mensaje *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Escribe el cuerpo de la plantilla. Puedes usar etiquetas como {nombre_propietario}, {condominio}, {torre}..."
                  value={nuevoCuerpo}
                  onChange={(e) => setNuevoCuerpo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg form-input text-xs leading-relaxed font-normal"
                />
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Guardar Plantilla
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
