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
  Clock,
  Bookmark
} from 'lucide-react';

import { AudienceSelector } from './AudienceSelector';
import { ComunicadoComposer } from './ComunicadoComposer';
import { PlantillasManager, DEFAULT_PLANTILLAS } from './PlantillasManager';
import { HistorialView } from './HistorialView';
import { ConfirmSendModal } from './ConfirmSendModal';
import { ComunicadoDetailModal } from './ComunicadoDetailModal';
import { DispatchProgressModal } from './DispatchProgressModal';

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

  // Active view tab
  const [activeTab, setActiveTab] = useState<'nuevo' | 'plantillas' | 'historial'>('nuevo');

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
  const [isSendSuccess, setIsSendSuccess] = useState(false);

  // Composer Form State
  const [asunto, setAsunto] = useState('Comunicado Oficial – Las Palomas Seaside Golf Community');
  const [categoria, setCategoria] = useState<CategoriaComunicado>('AVISO_GENERAL');
  const [cuerpo, setCuerpo] = useState(
    `Estimado(a) Propietario(a) {nombre_propietario},
Condominio(s): {condominio} | {torre}

Por medio del presente comunicado oficial de la Administración y Comité HOA de Las Palomas Seaside Golf Community, les informamos lo siguiente:

[Escriba aquí la información oficial para los condóminos]

Agradecemos su valiosa atención y colaboración continua para el cuidado y beneficio de nuestra comunidad.

Atentamente,
Administración General & Consejo Directivo HOA
Las Palomas Seaside Golf Community`
  );
  const [isTestMode, setIsTestMode] = useState(false);

  // Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [historyDetailModal, setHistoryDetailModal] = useState<ComunicadoHistorial | null>(null);

  // 1. Build Base Owners List using O(1) indexed maps
  const todosDestinatarios = useMemo<DestinatarioComunicado[]>(() => {
    const ownersMap = new Map<number, DestinatarioComunicado>();
    const edMap = new Map(edificios.map(e => [e.id, e.nombre]));
    const propMap = new Map(propiedades.map(p => [p.id, p]));

    // Map user -> condominios list
    const userCondosMap = new Map<number, DestinatarioComunicado['condominios']>();

    // 1. From pre-joined properties
    propiedades.forEach(prop => {
      if (prop.owner_id) {
        const list = userCondosMap.get(prop.owner_id) || [];
        const edNombre = prop.edificio_nombre || edMap.get(prop.edificio_id) || `Torre #${prop.edificio_id}`;
        list.push({
          propiedad_id: prop.id,
          propiedad_nombre: prop.nombre,
          edificio_id: prop.edificio_id,
          edificio_nombre: edNombre,
          piso: prop.piso || 1
        });
        userCondosMap.set(prop.owner_id, list);
      }
    });

    // 2. From propiedadUsuarios
    propiedadUsuarios.forEach(pu => {
      const prop = propMap.get(pu.propiedad_id);
      if (prop) {
        const list = userCondosMap.get(pu.usuario_id) || [];
        if (!list.some(c => c.propiedad_id === prop.id)) {
          const edNombre = prop.edificio_nombre || edMap.get(prop.edificio_id) || `Torre #${prop.edificio_id}`;
          list.push({
            propiedad_id: prop.id,
            propiedad_nombre: prop.nombre,
            edificio_id: prop.edificio_id,
            edificio_nombre: edNombre,
            piso: prop.piso || 1
          });
          userCondosMap.set(pu.usuario_id, list);
        }
      }
    });

    usuarios.forEach(u => {
      const userProps = userCondosMap.get(u.id) || [];
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

  // Unique floors
  const pisosDisponibles = useMemo(() => {
    const set = new Set<number>();
    propiedades.forEach(p => {
      if (p.piso) set.add(p.piso);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [propiedades]);

  // 2. Filter recipients based on active Criterio
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

  const handleApplyPlantilla = (plan: PlantillaComunicado) => {
    setAsunto(plan.asunto);
    setCategoria(plan.categoria);
    setCuerpo(plan.cuerpo);
    setActiveTab('nuevo');
  };

  const handleReuseHistory = (com: ComunicadoHistorial) => {
    setAsunto(com.asunto);
    setCategoria(com.categoria);
    setCuerpo(com.contenido);
    setHistoryDetailModal(null);
    setActiveTab('nuevo');
  };

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

  const senderName = currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Administración Las Palomas';
  const senderEmail = currentUser ? currentUser.email : 'admin@laspalomas.com';

  const handleSendBroadcast = async () => {
    if (destinatariosCalculados.length === 0 || !asunto.trim() || !cuerpo.trim()) return;

    setIsConfirmModalOpen(false);
    setIsSending(true);
    setIsSendSuccess(false);

    try {
      if (!isTestMode) {
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
          const firstErr = res.results?.find(r => !r.success)?.error || 'Error al conectar con servidor SMTP';
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

      setIsSendSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1400));
      setIsSending(false);
      setIsSendSuccess(false);
      setActiveTab('historial');
    } catch (err: any) {
      console.error('[Error envio comunicado]:', err);
      setIsSending(false);
      setIsSendSuccess(false);
      alert(`Error al emitir comunicado: ${err.message || 'Error en servidor'}`);
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
              Comunicación Masiva & Segmentada a Propietarios
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Emisión oficial de avisos de mantenimiento, asambleas, seguridad y circulares HOA por torre, piso, rango o personalizada.
            </p>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('nuevo')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'nuevo'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nuevo Envío</span>
            </button>

            <button
              onClick={() => setActiveTab('plantillas')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'plantillas'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Plantillas</span>
            </button>

            <button
              onClick={() => setActiveTab('historial')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'historial'
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

      {/* View Content according to Active Tab */}
      {activeTab === 'nuevo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: AUDIENCE TARGETING (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <AudienceSelector
              criterio={criterio}
              setCriterio={setCriterio}
              generalSelected={generalSelected}
              setGeneralSelected={setGeneralSelected}
              selectedTorres={selectedTorres}
              setSelectedTorres={setSelectedTorres}
              selectedPisos={selectedPisos}
              setSelectedPisos={setSelectedPisos}
              rangoDesde={rangoDesde}
              setRangoDesde={setRangoDesde}
              rangoHasta={rangoHasta}
              setRangoHasta={setRangoHasta}
              excludedUserIds={excludedUserIds}
              setExcludedUserIds={setExcludedUserIds}
              manualSelectedUserIds={manualSelectedUserIds}
              setManualSelectedUserIds={setManualSelectedUserIds}
              todosDestinatarios={todosDestinatarios}
              destinatariosCalculados={destinatariosCalculados}
              recipientSearch={recipientSearch}
              setRecipientSearch={setRecipientSearch}
              edificios={edificios}
              propiedades={propiedades}
              pisosDisponibles={pisosDisponibles}
              onToggleRecipient={handleToggleRecipient}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
          </div>

          {/* RIGHT COLUMN: CONTENT COMPOSER (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <ComunicadoComposer
              asunto={asunto}
              setAsunto={setAsunto}
              categoria={categoria}
              setCategoria={setCategoria}
              cuerpo={cuerpo}
              setCuerpo={setCuerpo}
              isTestMode={isTestMode}
              setIsTestMode={setIsTestMode}
              destinatariosCount={destinatariosCalculados.length}
              destinatariosCalculados={destinatariosCalculados}
              plantillas={DEFAULT_PLANTILLAS}
              onApplyPlantilla={handleApplyPlantilla}
              onOpenConfirm={() => setIsConfirmModalOpen(true)}
              adminEmail={senderEmail}
              adminName={senderName}
            />
          </div>

        </div>
      )}

      {activeTab === 'plantillas' && (
        <PlantillasManager onSelectPlantilla={handleApplyPlantilla} />
      )}

      {activeTab === 'historial' && (
        <HistorialView
          comunicados={comunicados}
          onOpenDetail={(c) => setHistoryDetailModal(c)}
          onReuse={handleReuseHistory}
          onNewBroadcast={() => setActiveTab('nuevo')}
        />
      )}

      {/* MODALS */}
      <ConfirmSendModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleSendBroadcast}
        isSending={isSending}
        asunto={asunto}
        categoria={categoria}
        criterio={criterio}
        criterioDetalle={getCriterioDetalle()}
        destinatarios={destinatariosCalculados}
        isTestMode={isTestMode}
        remitenteNombre={senderName}
        remitenteEmail={senderEmail}
      />

      <ComunicadoDetailModal
        comunicado={historyDetailModal}
        onClose={() => setHistoryDetailModal(null)}
        onReuse={handleReuseHistory}
      />

      {/* DISPATCH PROGRESS MODAL */}
      <DispatchProgressModal
        isOpen={isSending}
        totalDestinatarios={destinatariosCalculados.length}
        asunto={asunto}
        isTestMode={isTestMode}
        isSuccess={isSendSuccess}
      />

    </div>
  );
};
