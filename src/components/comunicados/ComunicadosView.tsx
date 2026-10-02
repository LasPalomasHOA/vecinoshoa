import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  DestinatarioComunicado,
  TipoSeleccionComunicado,
  CategoriaComunicado,
  PlantillaComunicado,
  ComunicadoHistorial
} from '../../types';
import {
  Send,
  Mail,
  Users,
  Building2,
  Layers,
  Filter,
  Eye,
  CheckCircle2,
  Search,
  Sparkles,
  AlertTriangle,
  FileText,
  Clock,
  CheckSquare,
  Square,
  ChevronRight,
  ShieldAlert,
  Calendar,
  X,
  RefreshCw,
  Hash,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';

const PLANTILLAS_PREDEFINIDAS: PlantillaComunicado[] = [
  {
    id: 'plan-1',
    titulo: 'Mantenimiento de Elevadores',
    categoria: 'MANTENIMIENTO',
    asunto: 'Aviso de Mantenimiento Preventivo de Elevadores – Las Palomas',
    cuerpo: `Estimado(a) Propietario(a) {nombre_propietario},

Le informamos que el próximo jueves se llevarán a cabo trabajos programados de mantenimiento preventivo y certificación en los elevadores de su edificio ({torre}).

• Horario estimado: 09:00 a.m. a 02:00 p.m.
• Impacto: Uno de los elevadores permanecerá en servicio intermitente.

Agradecemos su comprensión y colaboración para mantener nuestras instalaciones en óptimas condiciones de seguridad.

Atentamente,
Administración & Comité de Mantenimiento
Las Palomas Seaside Golf Community`
  },
  {
    id: 'plan-2',
    titulo: 'Fumigación de Áreas Comunes',
    categoria: 'MANTENIMIENTO',
    asunto: 'Jornada Programada de Fumigación y Control de Plagas',
    cuerpo: `Estimados Propietarios de {torre},

Les notificamos que el día de mañana se realizará la jornada bimestral de fumigación en pasillos, ductos, áreas verdes y perímetro de condominios ({condominio}).

Recomendaciones:
1. Mantener puertas y ventanas cerradas durante el horario de aplicación (10:00 a 14:00 hrs).
2. Si cuenta con mascotas en terraza, mantenerlas resguardadas.

Para cualquier duda, comunicarse a caseta de seguridad o administración.

Atentamente,
Administración Las Palomas HOA`
  },
  {
    id: 'plan-3',
    titulo: 'Convocatoria a Asamblea General',
    categoria: 'ASAMBLEA',
    asunto: 'Convocatoria Oficial – Asamblea General Ordinaria de Propietarios',
    cuerpo: `Estimado(a) Propietario(a) {nombre_propietario},
Condominio(s): {condominio}

Por medio de la presente se le convoca formalmente a la Asamblea General Ordinaria de Condóminos de Las Palomas Community.

• Fecha: Sábado 15 de Noviembre de 2026
• Primera Convocatoria: 10:00 a.m. | Segunda Convocatoria: 10:30 a.m.
• Lugar: Salón de Eventos Principal / Enlace Virtual Zoom

Orden del día:
1. Informe de actividades y mejoras en infraestructura 2026.
2. Presentación y aprobación del presupuesto operativo 2027.
3. Asuntos generales de la comunidad.

Esperamos contar con su valiosa presencia.

Consejo Directivo & Administración`
  },
  {
    id: 'plan-4',
    titulo: 'Interrupción Programada de Agua',
    categoria: 'URGENTE',
    asunto: 'AVISO URGENTE: Interrupción Temporal del Suministro de Agua',
    cuerpo: `Estimados Propietarios de {torre},

Por motivos de reparación urgente en la tubería matriz hidroneumática, se suspenderá temporalmente el suministro de agua en el edificio el día de hoy entre las 02:00 p.m. y las 05:00 p.m.

Afectación: {condominio} y áreas comunes de la torre.

Nuestro equipo técnico ya se encuentra trabajando para restablecer la presión con normalidad a la brevedad posible.

Disculpen los inconvenientes causados.
Administración HOA Las Palomas`
  },
  {
    id: 'plan-5',
    titulo: 'Recordatorio Cuota de Mantenimiento',
    categoria: 'PAGOS_HOA',
    asunto: 'Recordatorio de Cuota de Mantenimiento y Operación HOA',
    cuerpo: `Estimado(a) Propietario(a) {nombre_propietario},
Unidad(es): {condominio}

Le enviamos un cordial saludo y le recordamos que las cuotas ordinarias de mantenimiento correspondientes al presente periodo se encuentran vigentes para pago oportuno.

Agradecemos a todos los propietarios que mantienen sus cuentas al corriente, lo que permite continuar brindando servicios de seguridad 24/7, albercas, jardinería y mantenimiento continuo.

Para aclaraciones sobre su estado de cuenta, favor de responder a este correo o contactar al departamento de contabilidad.

Atentamente,
Departamento de Cobranza & Administración HOA`
  }
];

export const ComunicadosView: React.FC = () => {
  const {
    propiedades,
    usuarios,
    propiedadUsuarios,
    edificios,
    comunicados,
    enviarComunicado
  } = useApp();

  const { currentUser } = useAuth();

  // Active view tab: Compose vs History
  const [activeSubTab, setActiveSubTab] = useState<'nuevo' | 'historial'>('nuevo');

  // Filter Selection Criteria
  const [criterio, setCriterio] = useState<TipoSeleccionComunicado>('GENERAL');
  const [generalSelected, setGeneralSelected] = useState<boolean>(false);
  const [selectedTorres, setSelectedTorres] = useState<number[]>([]);
  const [selectedPisos, setSelectedPisos] = useState<number[]>([]);
  const [rangoDesde, setRangoDesde] = useState('');
  const [rangoHasta, setRangoHasta] = useState('');
  const [excludedUserIds, setExcludedUserIds] = useState<Set<number>>(new Set());
  const [manualSelectedUserIds, setManualSelectedUserIds] = useState<Set<number>>(new Set());
  const [recipientSearch, setRecipientSearch] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Composer Form
  const [asunto, setAsunto] = useState('Comunicado Oficial – Las Palomas Seaside Golf Community');
  const [categoria, setCategoria] = useState<CategoriaComunicado>('AVISO_GENERAL');
  const [cuerpo, setCuerpo] = useState(
    `Estimado(a) Propietario(a) {nombre_propietario},
Condominio(s): {condominio} | {torre}

Por medio del presente comunicado de la Administración y Comité HOA de Las Palomas Seaside Golf Community, le notificamos lo siguiente:

[Escriba aquí la información oficial para los condóminos]

Agradecemos su atención y colaboración continua para el cuidado y beneficio de nuestra comunidad.

Atentamente,
Administración General & Consejo Directivo HOA
Las Palomas Seaside Golf Community`
  );
  const [isTestMode, setIsTestMode] = useState(false); // Default to Real Email Sending (false)

  // Modals
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [historyDetailModal, setHistoryDetailModal] = useState<ComunicadoHistorial | null>(null);

  // 1. Build Base Owners List with their properties and towers
  const todosDestinatarios = useMemo<DestinatarioComunicado[]>(() => {
    const ownersMap = new Map<number, DestinatarioComunicado>();

    usuarios.forEach(u => {
      const userRels = propiedadUsuarios.filter(pu => pu.usuario_id === u.id);
      const userProps = userRels.map(rel => {
        const prop = propiedades.find(p => p.id === rel.propiedad_id);
        if (!prop) return null;
        const ed = edificios.find(e => e.id === prop.edificio_id);
        return {
          propiedad_id: prop.id,
          propiedad_nombre: prop.nombre,
          edificio_id: prop.edificio_id,
          edificio_nombre: ed?.nombre || `Torre #${prop.edificio_id}`,
          piso: prop.piso || 1
        };
      }).filter(Boolean) as DestinatarioComunicado['condominios'];

      if (u.email && (u.rol === 'Dueño' || userProps.length > 0)) {
        ownersMap.set(u.id, {
          usuario_id: u.id,
          nombre: u.nombre,
          apellido: u.apellido,
          email: u.email,
          telefono: u.telefono,
          rol: u.rol,
          condominios: userProps,
          seleccionado: true
        });
      }
    });

    return Array.from(ownersMap.values()).sort((a, b) => 
      `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`)
    );
  }, [usuarios, propiedades, propiedadUsuarios, edificios]);

  // Extract all unique floors from properties
  const pisosDisponibles = useMemo(() => {
    const set = new Set<number>();
    propiedades.forEach(p => {
      if (p.piso) set.add(p.piso);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [propiedades]);

  // 2. Filter recipients based on active Criterio (Defaults to 0 selected across all options)
  const destinatariosCalculados = useMemo<DestinatarioComunicado[]>(() => {
    if (criterio === 'GENERAL') {
      if (!generalSelected) return [];
      return todosDestinatarios.filter(d => !excludedUserIds.has(d.usuario_id));
    }

    if (criterio === 'TORRE') {
      if (selectedTorres.length === 0) return [];
      return todosDestinatarios.filter(d => {
        const matchesTorre = d.condominios.some(c => selectedTorres.includes(c.edificio_id));
        return matchesTorre && !excludedUserIds.has(d.usuario_id);
      });
    }

    if (criterio === 'PISO') {
      if (selectedPisos.length === 0) return [];
      return todosDestinatarios.filter(d => {
        const matchesPiso = d.condominios.some(c => selectedPisos.includes(c.piso));
        return matchesPiso && !excludedUserIds.has(d.usuario_id);
      });
    }

    if (criterio === 'RANGO') {
      if (!rangoDesde.trim() && !rangoHasta.trim()) return [];
      const desdeNum = parseInt(rangoDesde.replace(/\D/g, '')) || 0;
      const hastaNum = parseInt(rangoHasta.replace(/\D/g, '')) || 999999;

      return todosDestinatarios.filter(d => {
        const matchesRango = d.condominios.some(c => {
          const condoNum = parseInt(c.propiedad_nombre.replace(/\D/g, ''));
          if (isNaN(condoNum)) {
            return c.propiedad_nombre.toLowerCase().includes(rangoDesde.toLowerCase().trim());
          }
          return condoNum >= desdeNum && condoNum <= hastaNum;
        });
        return matchesRango && !excludedUserIds.has(d.usuario_id);
      });
    }

    if (criterio === 'PERSONALIZADO') {
      return todosDestinatarios.filter(d => manualSelectedUserIds.has(d.usuario_id));
    }

    return [];
  }, [
    todosDestinatarios,
    criterio,
    generalSelected,
    selectedTorres,
    selectedPisos,
    rangoDesde,
    rangoHasta,
    excludedUserIds,
    manualSelectedUserIds
  ]);

  // Candidate recipients to show in the list:
  // In PERSONALIZADO: show ALL owners (filtered by search) so user can search & check any owner.
  // In other criteria: show filtered destinatariosCalculados (filtered by search).
  const destinatariosVisiblesParaLista = useMemo(() => {
    const baseList = criterio === 'PERSONALIZADO' ? todosDestinatarios : destinatariosCalculados;
    if (!recipientSearch.trim()) return baseList;

    const q = recipientSearch.toLowerCase().trim();
    return baseList.filter(d => {
      const matchName = `${d.nombre} ${d.apellido}`.toLowerCase().includes(q);
      const matchEmail = d.email.toLowerCase().includes(q);
      const matchCondos = d.condominios.some(c => 
        c.propiedad_nombre.toLowerCase().includes(q) || c.edificio_nombre.toLowerCase().includes(q)
      );
      return matchName || matchEmail || matchCondos;
    });
  }, [criterio, todosDestinatarios, destinatariosCalculados, recipientSearch]);

  // Toggle individual recipient
  const handleToggleRecipient = (userId: number) => {
    if (criterio === 'PERSONALIZADO') {
      setManualSelectedUserIds(prev => {
        const next = new Set(prev);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        return next;
      });
    } else {
      setExcludedUserIds(prev => {
        const next = new Set(prev);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        return next;
      });
    }
  };

  // Toggle select all
  const handleSelectAll = () => {
    if (criterio === 'PERSONALIZADO') {
      const allIds = new Set(todosDestinatarios.map(d => d.usuario_id));
      setManualSelectedUserIds(allIds);
    } else if (criterio === 'GENERAL') {
      setGeneralSelected(true);
      setExcludedUserIds(new Set());
    } else if (criterio === 'TORRE') {
      setSelectedTorres(edificios.map(e => e.id));
      setExcludedUserIds(new Set());
    } else if (criterio === 'PISO') {
      setSelectedPisos([...pisosDisponibles]);
      setExcludedUserIds(new Set());
    } else {
      setExcludedUserIds(new Set());
    }
  };

  const handleDeselectAll = () => {
    if (criterio === 'PERSONALIZADO') {
      setManualSelectedUserIds(new Set());
    } else if (criterio === 'GENERAL') {
      setGeneralSelected(false);
      setExcludedUserIds(new Set());
    } else if (criterio === 'TORRE') {
      setSelectedTorres([]);
      setExcludedUserIds(new Set());
    } else if (criterio === 'PISO') {
      setSelectedPisos([]);
      setExcludedUserIds(new Set());
    } else if (criterio === 'RANGO') {
      setRangoDesde('');
      setRangoHasta('');
      setExcludedUserIds(new Set());
    } else {
      const allIds = new Set(todosDestinatarios.map(d => d.usuario_id));
      setExcludedUserIds(allIds);
    }
  };

  // Apply template
  const handleApplyPlantilla = (plan: PlantillaComunicado) => {
    setAsunto(plan.asunto);
    setCategoria(plan.categoria);
    setCuerpo(plan.cuerpo);
  };

  // Generate friendly criteria description
  const getCriterioDetalle = () => {
    switch (criterio) {
      case 'GENERAL':
        return generalSelected
          ? `Toda la comunidad (${destinatariosCalculados.length} propietarios)`
          : 'Ninguno seleccionado';
      case 'TORRE':
        const torresNames = edificios
          .filter(e => selectedTorres.includes(e.id))
          .map(e => e.nombre)
          .join(', ');
        return `Torre(s): ${torresNames || 'Ninguna seleccionada'} (${destinatariosCalculados.length} propietarios)`;
      case 'PISO':
        return `Piso(s): ${selectedPisos.map(p => `Piso ${p}`).join(', ') || 'Ninguno'} (${destinatariosCalculados.length} propietarios)`;
      case 'RANGO':
        return `Rango de condominios: ${rangoDesde || 'Inicio'} a ${rangoHasta || 'Fin'} (${destinatariosCalculados.length} propietarios)`;
      case 'PERSONALIZADO':
        return `Selección personalizada (${destinatariosCalculados.length} propietarios elegidos)`;
    }
  };

  // Handle Send Confirmation
  const handleSendBroadcast = async () => {
    if (destinatariosCalculados.length === 0 || !asunto.trim() || !cuerpo.trim()) return;

    const senderName = currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Francisco Amado';
    const senderEmail = currentUser ? currentUser.email : 'admin@laspalomas.com';

    setIsSending(true);
    try {
      if (!isTestMode) {
        // Enviar correos reales vía SMTP
        const payload = {
          asunto: asunto.trim(),
          categoria,
          contenido: cuerpo.trim(),
          destinatarios: destinatariosCalculados.map(d => ({
            nombre: `${d.nombre} ${d.apellido}`,
            email: d.email,
            condominio: d.condominios.map(c => c.propiedad_nombre).join(', '),
            torre: d.condominios.map(c => c.edificio_nombre).join(', ')
          }))
        };
        const res = await api.comunicados.send(payload);
        if (res && res.failed > 0 && res.sent === 0) {
          const firstErr = res.results?.find(r => !r.success)?.error || 'Error al conectar con servidor SMTP de Gmail';
          throw new Error(`Fallo de envío SMTP: ${firstErr}`);
        }
      }

      await enviarComunicado({
        asunto: asunto.trim(),
        categoria,
        criterio_seleccion: criterio,
        criterio_detalle: getCriterioDetalle(),
        total_destinatarios: destinatariosCalculados.length,
        destinatarios: destinatariosCalculados.map(d => ({
          usuario_id: d.usuario_id,
          nombre: `${d.nombre} ${d.apellido}`,
          email: d.email,
          condominios_resumen: d.condominios.map(c => `${c.edificio_nombre} ${c.propiedad_nombre}`).join(', ') || 'Sin condominio'
        })),
        contenido: cuerpo.trim(),
        remitente_nombre: senderName,
        remitente_email: senderEmail,
        estado: isTestMode ? 'Simulado' : 'Enviado'
      });

      setIsConfirmModalOpen(false);
      setActiveSubTab('historial');
    } catch (err: any) {
      console.error('[Error envio comunicado]:', err);
      alert(`Error al emitir comunicado: ${err.message || 'Error en servidor'}`);
    } finally {
      setIsSending(false);
    }
  };

  // Helper badge for category
  const getCategoriaBadge = (cat: CategoriaComunicado) => {
    switch (cat) {
      case 'AVISO_GENERAL':
        return { label: 'Aviso General', className: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'MANTENIMIENTO':
        return { label: 'Mantenimiento', className: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'ASAMBLEA':
        return { label: 'Asamblea', className: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'SEGURIDAD':
        return { label: 'Seguridad', className: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'PAGOS_HOA':
        return { label: 'Pagos HOA', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'EVENTO':
        return { label: 'Evento', className: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'URGENTE':
        return { label: 'Urgente', className: 'bg-red-100 text-red-800 border-red-300 font-bold' };
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Módulo de Envíos & Comunicados Oficiales</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Comunicación Masiva & Selectiva a Dueños
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Emisión segmentada de avisos, mantenimiento, convocatorias y circulares por torre, piso, rango o personalizada.
            </p>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shrink-0">
            <button
              onClick={() => setActiveSubTab('nuevo')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'nuevo'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nuevo Envío</span>
            </button>

            <button
              onClick={() => setActiveSubTab('historial')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'historial'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Historial ({comunicados.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'nuevo' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ============================================================ */}
          {/* LEFT COLUMN: FILTROS & SELECCIÓN DE AUDIENCIA (5 COLS)       */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">1. Criterio de Selección</h2>
                    <p className="text-[11px] text-slate-500">¿A quiénes se enviará el comunicado?</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                  destinatariosCalculados.length > 0
                    ? 'bg-teal-100 text-teal-800 border-teal-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {destinatariosCalculados.length} seleccionados
                </span>
              </div>

              {/* Selector de Modos de Segmentación */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                
                <button
                  type="button"
                  onClick={() => setCriterio('GENERAL')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    criterio === 'GENERAL'
                      ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4 text-teal-700 mb-1" />
                  <span className="text-xs">🌐 General</span>
                  <span className="text-[10px] text-slate-500 font-normal">Toda la comunidad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCriterio('TORRE')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    criterio === 'TORRE'
                      ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-teal-700 mb-1" />
                  <span className="text-xs">🏢 Por Torre</span>
                  <span className="text-[10px] text-slate-500 font-normal">Edificios específicos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCriterio('PISO')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    criterio === 'PISO'
                      ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4 text-teal-700 mb-1" />
                  <span className="text-xs">🪜 Por Piso</span>
                  <span className="text-[10px] text-slate-500 font-normal">Niveles específicos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCriterio('RANGO')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    criterio === 'RANGO'
                      ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Hash className="w-4 h-4 text-teal-700 mb-1" />
                  <span className="text-xs">🔢 Rango</span>
                  <span className="text-[10px] text-slate-500 font-normal">Condos 101 al 110</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCriterio('PERSONALIZADO')}
                  className={`col-span-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    criterio === 'PERSONALIZADO'
                      ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-teal-700" />
                    <div>
                      <span className="text-xs block">🎯 Personalizado</span>
                      <span className="text-[10px] text-slate-500 font-normal">Buscar y elegir dueño por dueño</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold">
                    {manualSelectedUserIds.size} elegidos
                  </span>
                </button>

              </div>

              {/* Sub-Panel de Configuración de Criterio */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                
                {/* 1. GENERAL */}
                {criterio === 'GENERAL' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-700" />
                        <span className="text-xs font-bold text-slate-800">Toda la comunidad ({todosDestinatarios.length} propietarios)</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        generalSelected ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {generalSelected ? `${destinatariosCalculados.length} incluidos` : '0 seleccionados'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setGeneralSelected(true);
                          setExcludedUserIds(new Set());
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          generalSelected
                            ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                            : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Seleccionar toda la comunidad ({todosDestinatarios.length})</span>
                      </button>

                      {generalSelected && (
                        <button
                          type="button"
                          onClick={() => {
                            setGeneralSelected(false);
                            setExcludedUserIds(new Set());
                          }}
                          className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {generalSelected 
                        ? 'Todos los condóminos están incluidos. Puedes desmarcar personas específicas abajo si lo deseas.'
                        : 'Por defecto ningún condómino está seleccionado. Haz clic en el botón para seleccionarlos a todos.'}
                    </p>
                  </div>
                )}

                {/* 2. POR TORRE */}
                {criterio === 'TORRE' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">Selecciona las torres a incluir:</label>
                      <div className="flex gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-teal-700 hover:underline font-bold cursor-pointer"
                        >
                          Todas
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="text-slate-500 hover:underline font-bold cursor-pointer"
                        >
                          Ninguna
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {edificios.map(ed => {
                        const isChecked = selectedTorres.includes(ed.id);
                        const condoCount = propiedades.filter(p => p.edificio_id === ed.id).length;
                        return (
                          <button
                            key={ed.id}
                            type="button"
                            onClick={() => {
                              setSelectedTorres(prev => 
                                isChecked ? prev.filter(id => id !== ed.id) : [...prev, ed.id]
                              );
                            }}
                            className={`p-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className="truncate">{ed.nombre}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isChecked ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              {condoCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. POR PISO */}
                {criterio === 'PISO' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">Selecciona los pisos / niveles:</label>
                      <div className="flex gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-teal-700 hover:underline font-bold cursor-pointer"
                        >
                          Todos
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="text-slate-500 hover:underline font-bold cursor-pointer"
                        >
                          Ninguno
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {pisosDisponibles.map(piso => {
                        const isChecked = selectedPisos.includes(piso);
                        return (
                          <button
                            key={piso}
                            type="button"
                            onClick={() => {
                              setSelectedPisos(prev => 
                                isChecked ? prev.filter(p => p !== piso) : [...prev, piso]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-teal-600 text-white border-teal-700'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            Piso {piso}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. RANGO */}
                {criterio === 'RANGO' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Rango numérico de condominios:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">Desde condo:</span>
                        <input
                          type="text"
                          placeholder="ej. 101"
                          value={rangoDesde}
                          onChange={(e) => setRangoDesde(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg form-input text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">Hasta condo:</span>
                        <input
                          type="text"
                          placeholder="ej. 205"
                          value={rangoHasta}
                          onChange={(e) => setRangoHasta(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg form-input text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PERSONALIZADO */}
                {criterio === 'PERSONALIZADO' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-bold">Selección individual de propietarios:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-[11px] text-teal-700 hover:underline font-bold cursor-pointer"
                        >
                          Seleccionar todos ({todosDestinatarios.length})
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="text-[11px] text-slate-500 hover:underline font-bold cursor-pointer"
                        >
                          Limpiar selección
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Usa el buscador inferior para encontrar rápidamente cualquier dueño por nombre, condo o correo y marcar su casilla.
                    </p>
                  </div>
                )}

              </div>

              {/* Lista Interactiva de Destinatarios */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {criterio === 'PERSONALIZADO'
                      ? `Propietarios (${manualSelectedUserIds.size} seleccionados de ${todosDestinatarios.length})`
                      : `Destinatarios Filtrados (${destinatariosCalculados.length})`}
                  </span>
                  
                  {criterio !== 'PERSONALIZADO' && destinatariosCalculados.length > 0 && (
                    <div className="flex gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setExcludedUserIds(new Set())}
                        className="text-teal-700 hover:underline font-semibold cursor-pointer"
                      >
                        Restablecer todos
                      </button>
                    </div>
                  )}
                </div>

                {/* Search within recipients */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={
                      criterio === 'PERSONALIZADO'
                        ? "Buscar dueño por nombre, condo (ej. 101), torre o correo..."
                        : "Filtrar en destinatarios seleccionados..."
                    }
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg form-input"
                  />
                </div>

                {/* Scrollable list */}
                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-1 bg-slate-50/50">
                  {destinatariosVisiblesParaLista.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                      {criterio === 'GENERAL' && !generalSelected && (
                        <div>Haz clic en <strong>"Seleccionar toda la comunidad"</strong> arriba para incluir a los propietarios.</div>
                      )}
                      {criterio === 'TORRE' && selectedTorres.length === 0 && (
                        <div>Selecciona al menos una torre arriba para incluir a los propietarios.</div>
                      )}
                      {criterio === 'PISO' && selectedPisos.length === 0 && (
                        <div>Selecciona al menos un piso arriba para incluir a los propietarios.</div>
                      )}
                      {criterio === 'RANGO' && !rangoDesde && !rangoHasta && (
                        <div>Ingresa el rango de condominios arriba (ej. 101 al 110).</div>
                      )}
                      {criterio === 'PERSONALIZADO' && recipientSearch.trim() && (
                        <div>No se encontraron propietarios que coincidan con <strong>"{recipientSearch}"</strong>.</div>
                      )}
                      {criterio === 'PERSONALIZADO' && !recipientSearch.trim() && (
                        <div>No hay propietarios registrados en el sistema.</div>
                      )}
                      {criterio !== 'PERSONALIZADO' && destinatariosCalculados.length > 0 && recipientSearch.trim() && (
                        <div>No hay destinatarios que coincidan con la búsqueda.</div>
                      )}
                    </div>
                  ) : (
                    destinatariosVisiblesParaLista.map(dest => {
                      const isSelected = criterio === 'PERSONALIZADO'
                        ? manualSelectedUserIds.has(dest.usuario_id)
                        : !excludedUserIds.has(dest.usuario_id);

                      const isRealEmail = dest.email.includes('omarzapata') || dest.email.endsWith('@gmail.com');

                      return (
                        <div
                          key={dest.usuario_id}
                          onClick={() => handleToggleRecipient(dest.usuario_id)}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer select-none ${
                            isSelected
                              ? 'bg-white border-teal-300 ring-1 ring-teal-500/20 shadow-2xs'
                              : 'bg-white/80 border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-bold truncate ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                  {dest.nombre} {dest.apellido}
                                </span>
                                {isRealEmail && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    REAL
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-slate-500 truncate">{dest.email}</p>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {dest.condominios.map((c, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-teal-50 border border-teal-100 text-teal-800 font-semibold">
                                    {c.propiedad_nombre} ({c.edificio_nombre})
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isSelected ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {isSelected ? 'Seleccionado' : 'No seleccionado'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: REDACCIÓN DEL COMUNICADO & PLANTILLAS (7 COLS) */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Plantillas Rápidas */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800">Plantillas Rápidas de Redacción</span>
                </div>
                <span className="text-[11px] text-slate-500">Haz clic para cargar plantilla</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PLANTILLAS_PREDEFINIDAS.map(plan => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handleApplyPlantilla(plan)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    <span>{plan.titulo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor de Contenido */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">2. Contenido del Comunicado</h2>
                    <p className="text-[11px] text-slate-500">Diseña el mensaje oficial para los condóminos</p>
                  </div>
                </div>

                {/* Category selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">Categoría:</span>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaComunicado)}
                    className="px-2.5 py-1 rounded-lg form-input text-xs font-bold text-slate-800"
                  >
                    <option value="AVISO_GENERAL">📢 Aviso General</option>
                    <option value="MANTENIMIENTO">🛠️ Mantenimiento</option>
                    <option value="ASAMBLEA">🏛️ Asamblea</option>
                    <option value="SEGURIDAD">🛡️ Seguridad</option>
                    <option value="PAGOS_HOA">💳 Pagos HOA</option>
                    <option value="EVENTO">🎉 Evento</option>
                    <option value="URGENTE">🚨 Urgente</option>
                  </select>
                </div>
              </div>

              {/* Asunto */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Asunto del Correo <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="ej. Aviso de Mantenimiento Preventivo de Elevadores – Torre Diamante"
                  className="w-full px-3.5 py-2 rounded-lg form-input text-xs font-semibold focus:border-teal-500"
                />
              </div>

              {/* Variables dinámicas disponibles */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="font-bold text-slate-600">Etiquetas dinámicas:</span>
                <button
                  type="button"
                  onClick={() => setCuerpo(prev => prev + ' {nombre_propietario}')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-teal-800 font-mono hover:bg-teal-50 cursor-pointer"
                  title="Inserta el nombre del dueño"
                >
                  {'{nombre_propietario}'}
                </button>
                <button
                  type="button"
                  onClick={() => setCuerpo(prev => prev + ' {condominio}')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-teal-800 font-mono hover:bg-teal-50 cursor-pointer"
                  title="Inserta el nombre del condo"
                >
                  {'{condominio}'}
                </button>
                <button
                  type="button"
                  onClick={() => setCuerpo(prev => prev + ' {torre}')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-teal-800 font-mono hover:bg-teal-50 cursor-pointer"
                  title="Inserta la torre"
                >
                  {'{torre}'}
                </button>
              </div>

              {/* Cuerpo del mensaje */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Cuerpo del Mensaje <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={10}
                  value={cuerpo}
                  onChange={(e) => setCuerpo(e.target.value)}
                  placeholder="Escribe el cuerpo del comunicado aquí..."
                  className="w-full px-3.5 py-2.5 rounded-lg form-input text-xs leading-relaxed font-normal focus:border-teal-500 focus:ring-teal-500/20"
                />
              </div>

              {/* Selector de Modo de Envío */}
              <div className={`p-4 rounded-xl border transition-all ${
                !isTestMode 
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs' 
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className={`w-4 h-4 ${!isTestMode ? 'text-emerald-700' : 'text-amber-700'}`} />
                    <span className="font-bold text-xs">
                      {!isTestMode ? '✉️ Modo: Envío Real de Correo (SMTP Activo)' : '🛡️ Modo: Simulación (Sin Enviar Correos)'}
                    </span>
                  </div>

                  <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsTestMode(false)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        !isTestMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Envío Real
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTestMode(true)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        isTestMode ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Simulado
                    </button>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-600">
                  {!isTestMode
                    ? 'Los correos se enviarán directamente a las bandejas de entrada de los destinatarios a través del servidor Gmail oficial (integradorpro.yec@gmail.com).'
                    : 'Modo seguro: se registrará el comunicado en la bitácora y el historial del sistema sin enviar correos a los destinatarios.'}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  disabled={!asunto.trim() || !cuerpo.trim()}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>Vista Previa de Correo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={destinatariosCalculados.length === 0 || !asunto.trim() || !cuerpo.trim()}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-teal-700/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Emitir Comunicado ({destinatariosCalculados.length})</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* ============================================================ */
        /* HISTORIAL DE COMUNICADOS EMITIDOS                            */
        /* ============================================================ */
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Historial de Comunicados Emitidos</h2>
              <p className="text-xs text-slate-500">Registro de todas las circulares y avisos enviados a propietarios</p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {comunicados.length} comunicados registrados
            </span>
          </div>

          {comunicados.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No hay comunicados registrados</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Los avisos y circulares masivas que envíes aparecerán listados aquí con su detalle y destinatarios.
              </p>
              <button
                onClick={() => setActiveSubTab('nuevo')}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
              >
                Crear primer comunicado
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold">
                    <th className="py-2.5 px-3">Fecha & Hora</th>
                    <th className="py-2.5 px-3">Asunto del Comunicado</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3">Criterio / Audiencia</th>
                    <th className="py-2.5 px-3 text-center">Destinatarios</th>
                    <th className="py-2.5 px-3">Remitente</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comunicados.map(com => {
                    const badge = getCategoriaBadge(com.categoria);
                    const formattedDate = new Date(com.fecha).toLocaleString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={com.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 max-w-xs truncate">
                          {com.asunto}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                          {com.criterio_detalle}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-teal-800">
                          {com.total_destinatarios} propietarios
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                          {com.remitente_nombre}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setHistoryDetailModal(com)}
                            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Detalle</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: VISTA PREVIA DE CORREO ELECTRÓNICO                   */}
      {/* ============================================================ */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Vista Previa del Correo Oficial</h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Layout Simulation */}
            <div className="p-6 bg-slate-100 max-h-[75vh] overflow-y-auto">
              <div className="max-w-xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
                
                {/* Header Las Palomas */}
                <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-5 text-white text-center">
                  <h2 className="text-lg font-black tracking-wide">LAS PALOMAS SEASIDE GOLF COMMUNITY</h2>
                  <p className="text-[11px] text-teal-300 uppercase tracking-widest mt-0.5">Gestión Residencial & HOA</p>
                </div>

                {/* Email Meta */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs space-y-1">
                  <div>
                    <span className="font-bold text-slate-500">De: </span>
                    <span className="font-semibold text-slate-800">Administración Las Palomas &lt;admin@laspalomas.com&gt;</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Para: </span>
                    <span className="font-semibold text-teal-900">
                      {destinatariosCalculados[0]
                        ? `${destinatariosCalculados[0].nombre} ${destinatariosCalculados[0].apellido} <${destinatariosCalculados[0].email}> (Muestra)`
                        : 'Condóminos'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Asunto: </span>
                    <span className="font-bold text-slate-950">{asunto}</span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-6 space-y-4 text-xs leading-relaxed whitespace-pre-line text-slate-700">
                  {cuerpo
                    .replace(/{nombre_propietario}/g, destinatariosCalculados[0] ? `${destinatariosCalculados[0].nombre} ${destinatariosCalculados[0].apellido}` : 'Propietario(a)')
                    .replace(/{condominio}/g, destinatariosCalculados[0]?.condominios[0]?.propiedad_nombre || 'Condominio')
                    .replace(/{torre}/g, destinatariosCalculados[0]?.condominios[0]?.edificio_nombre || 'Torre')
                  }
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-500">Asociación de Condóminos Las Palomas Seaside Golf Community</p>
                  <p>Blvd. Costero 150, Sandy Beach, Puerto Peñasco, Sonora, México.</p>
                </div>

              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CONFIRMACIÓN DE ENVÍO                                */}
      {/* ============================================================ */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="p-5 border-b border-teal-100 bg-teal-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirmar Emisión de Comunicado</h3>
                <p className="text-xs text-teal-800 font-medium">Se registrará en el historial y bitácora del sistema</p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Asunto:</span>
                  <span className="font-bold text-slate-900 text-right max-w-xs truncate">{asunto}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
                  <span className="font-bold text-slate-500">Criterio:</span>
                  <span className="font-semibold text-teal-900">{criterio}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
                  <span className="font-bold text-slate-500">Total Destinatarios:</span>
                  <span className="font-extrabold text-teal-700">{destinatariosCalculados.length} propietarios</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
                  <span className="font-bold text-slate-500">Tipo de Envío:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    !isTestMode ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {!isTestMode ? '✉️ Correo Real (SMTP Gmail Activo)' : '🛡️ Simulación / Solo Bitácora'}
                  </span>
                </div>
              </div>

              <div className="max-h-36 overflow-y-auto p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] space-y-1">
                <span className="font-bold text-slate-600 block mb-1">Destinatarios que recibirán el comunicado:</span>
                {destinatariosCalculados.map(d => (
                  <div key={d.usuario_id} className="flex items-center justify-between text-slate-700">
                    <span className="truncate font-medium">{d.nombre} {d.apellido}</span>
                    <span className="font-mono text-[10px] text-slate-500 truncate">{d.email}</span>
                  </div>
                ))}
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSending}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={isSending}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando correo(s)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{!isTestMode ? 'Confirmar y Enviar' : 'Confirmar y Registrar'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: DETALLE DE HISTORIAL                                */}
      {/* ============================================================ */}
      {historyDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-teal-700" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Detalle del Comunicado</h3>
                  <p className="text-xs text-slate-500">ID: {historyDetailModal.id} • {new Date(historyDetailModal.fecha).toLocaleString('es-MX')}</p>
                </div>
              </div>
              <button
                onClick={() => setHistoryDetailModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Asunto:</span>
                  <span className="font-bold text-slate-900">{historyDetailModal.asunto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Audiencia:</span>
                  <span className="font-semibold text-slate-800">{historyDetailModal.criterio_detalle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Remitente:</span>
                  <span className="text-slate-800">{historyDetailModal.remitente_nombre} ({historyDetailModal.remitente_email})</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Cuerpo del Mensaje:</span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 whitespace-pre-line leading-relaxed text-slate-700">
                  {historyDetailModal.contenido}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">
                  Lista de Destinatarios ({historyDetailModal.total_destinatarios}):
                </span>
                <div className="max-h-40 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  {historyDetailModal.destinatarios.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-200/50 last:border-0">
                      <span className="font-semibold text-slate-800">{d.nombre}</span>
                      <span className="font-mono text-slate-500">{d.email}</span>
                      <span className="text-teal-800 font-bold">{d.condominios_resumen}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setAsunto(historyDetailModal.asunto);
                  setCategoria(historyDetailModal.categoria);
                  setCuerpo(historyDetailModal.contenido);
                  setHistoryDetailModal(null);
                  setActiveSubTab('nuevo');
                }}
                className="px-4 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition-colors cursor-pointer"
              >
                Reutilizar Plantilla
              </button>

              <button
                type="button"
                onClick={() => setHistoryDetailModal(null)}
                className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
