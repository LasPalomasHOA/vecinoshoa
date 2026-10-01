import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Edificio, 
  GrupoPropiedad, 
  Usuario, 
  Propiedad, 
  PropiedadUsuario, 
  Huesped, 
  Reservacion, 
  SolicitudAcceso,
  Acompanante,
  AcompananteAmenidad,
  BitacoraEntry
} from '../types';
import { api } from '../services/api';
import { compareCondoNames } from '../utils/sortUtils';
import { useAuth } from './AuthContext';

export type ActiveTab = 'inicio' | 'frontdesk' | 'calendar' | 'properties' | 'users' | 'requests' | 'reports' | 'bitacora';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  error: string | null;
  refreshAllData: () => Promise<void>;
  
  // Database Tables State
  edificios: Edificio[];
  grupos: GrupoPropiedad[];
  usuarios: Usuario[];
  propiedades: Propiedad[];
  propiedadUsuarios: PropiedadUsuario[];
  huespedes: Huesped[];
  reservaciones: Reservacion[];
  solicitudes: SolicitudAcceso[];

  // Bitácora / Audit Log State
  bitacora: BitacoraEntry[];
  registrarEventoBitacora: (
    entry: Omit<BitacoraEntry, 'id' | 'timestamp' | 'usuario_nombre' | 'usuario_email' | 'usuario_rol'> & {
      usuario_nombre?: string;
      usuario_email?: string;
      usuario_rol?: string;
      timestamp?: string;
    }
  ) => void;
  agregarNotaBitacora: (descripcion: string, modulo?: BitacoraEntry['modulo']) => void;
  limpiarBitacora: () => void;
  
  // CRUD Actions connected to Database Layer
  addPropiedad: (propiedad: Omit<Propiedad, 'id'>, ownerId?: number) => Promise<void>;
  updatePropiedad: (id: number, propiedad: Partial<Propiedad>, ownerId?: number) => Promise<void>;
  deletePropiedad: (id: number) => Promise<void>;
  
  addEdificio: (nombre: string) => Promise<void>;
  deleteEdificio: (id: number) => Promise<void>;
  
  addUsuario: (usuario: Omit<Usuario, 'id'>) => Promise<void>;
  updateUsuario: (id: number, usuario: Partial<Usuario>) => Promise<void>;
  deleteUsuario: (id: number) => Promise<void>;
  
  addReservacion: (reservacion: Omit<Reservacion, 'id'>, huespedData?: Partial<Huesped>) => Promise<void>;
  updateReservacion: (id: number, reservacion: Partial<Reservacion>, huespedData?: Partial<Huesped>) => Promise<void>;
  checkInReservacion: (
    id: number, 
    brazaletes?: string, 
    vehiculo?: string, 
    acompanantes?: Acompanante[], 
    titularBrazaleteEntregado?: boolean,
    acompanantes_amenidades?: AcompananteAmenidad[]
  ) => Promise<void>;
  checkOutReservacion: (id: number) => Promise<void>;
  deleteReservacion: (id: number) => Promise<void>;
  
  addSolicitud: (solicitud: Omit<SolicitudAcceso, 'id' | 'created_at'>) => Promise<void>;
  updateSolicitudStatus: (id: number, estatus: SolicitudAcceso['estatus'], comentario?: string) => Promise<void>;
  
  // Helpers
  getPropiedadById: (id: number) => Propiedad | undefined;
  getEdificioById: (id: number) => Edificio | undefined;
  getGrupoById: (id?: number) => GrupoPropiedad | undefined;
  getOwnerByPropiedadId: (propiedadId: number) => Usuario | undefined;
  getHuespedById: (id: number) => Huesped | undefined;
  checkReservationOverlap: (propiedadId: number, checkin: string, checkout: string, excludeResId?: number) => Reservacion | undefined;
  
  // Layout & Sidebar
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  resetToDefaults: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Registros históricos iniciales por defecto para la Bitácora
const DEFAULT_BITACORA_LOGS: BitacoraEntry[] = [
  {
    id: 'BIT-2026-008',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // Hace 18 min
    usuario_nombre: 'Francisco Amado',
    usuario_email: 'admin@laspalomas.com',
    usuario_rol: 'Administrador',
    accion: 'CHECK-IN',
    modulo: 'Reservaciones',
    descripcion: 'Realizó Check-In y entrega de brazaletes para la reservación #RES-202601 en Diamante 101 a nombre de Alejandro Vázquez.',
    entidad_id: 1,
    entidad_nombre: 'Diamante 101 / RES-202601',
    detalles: {
      nuevo: { estado: 'En Casa (Checked-in)', brazaletes: 'Azul Diamante 101A-101D', vehiculo: 'GMC Sierra Blanca Sonora UBN-892' },
      notas: 'Entrega de 4 brazaletes y marbete de estacionamiento caseta norte.',
      dispositivo: 'Terminal Front Desk #1 (Windows / Edge)'
    }
  },
  {
    id: 'BIT-2026-007',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // Hace 55 min
    usuario_nombre: 'Carlos Méndez',
    usuario_email: 'supervisor@laspalomas.com',
    usuario_rol: 'Supervisor',
    accion: 'CAMBIO_ESTATUS',
    modulo: 'Solicitudes de Acceso',
    descripcion: 'Aprobó solicitud de acceso #1 para Climas del Desierto (Reparación A/C en Diamante 101). Técnico autorizado: José Luis Beltrán.',
    entidad_id: 1,
    entidad_nombre: 'Solicitud #1 (Diamante 101)',
    detalles: {
      previo: { estatus: 'Pendiente' },
      nuevo: { estatus: 'Aprobado', comentario: 'Técnico autorizado: José Luis Beltrán con identificación oficial INE.' },
      dispositivo: 'Módulo Supervisor (Windows / Chrome)'
    }
  },
  {
    id: 'BIT-2026-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // Hace 3 horas
    usuario_nombre: 'Carlos Méndez',
    usuario_email: 'supervisor@laspalomas.com',
    usuario_rol: 'Supervisor',
    accion: 'EDICIÓN',
    modulo: 'Propiedades',
    descripcion: 'Actualizó información y notas administrativas en Cristales 701 (Penthouse).',
    entidad_id: 4,
    entidad_nombre: 'Cristales 701 (Penthouse)',
    detalles: {
      cambios: ['Actualización de notas de inspección'],
      dispositivo: 'Módulo Supervisor (Windows / Chrome)'
    }
  },
  {
    id: 'BIT-2026-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // Hace 8 horas
    usuario_nombre: 'Francisco Amado',
    usuario_email: 'admin@laspalomas.com',
    usuario_rol: 'Administrador',
    accion: 'CREACIÓN',
    modulo: 'Reservaciones',
    descripcion: 'Registró nueva reservación #RES-202603 para huésped Daniela Fernández en Rubi 202 (25 al 29 Sep 2026).',
    entidad_id: 3,
    entidad_nombre: 'RES-202603 / Rubi 202',
    detalles: {
      nuevo: { codigo: 'RES-202603', huesped: 'Daniela Fernández', propiedad: 'Rubi 202', fechas: '2026-09-25 a 2026-09-29' },
      dispositivo: 'Portal Administrativo'
    }
  },
  {
    id: 'BIT-2026-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Ayer
    usuario_nombre: 'Francisco Amado',
    usuario_email: 'admin@laspalomas.com',
    usuario_rol: 'Administrador',
    accion: 'CREACIÓN',
    modulo: 'Usuarios',
    descripcion: 'Registró al nuevo propietario Carlos Mendoza (carlos.mendoza@laspalomas.com) en el sistema.',
    entidad_id: 3,
    entidad_nombre: 'Carlos Mendoza',
    detalles: {
      nuevo: { nombre: 'Carlos Mendoza', rol: 'Dueño', email: 'carlos.mendoza@laspalomas.com', status: 'Active' },
      dispositivo: 'Portal Administrativo'
    }
  },
  {
    id: 'BIT-2026-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // Ayer
    usuario_nombre: 'Carlos Méndez',
    usuario_email: 'supervisor@laspalomas.com',
    usuario_rol: 'Supervisor',
    accion: 'NOTA_SUPERVISOR',
    modulo: 'Sistema',
    descripcion: 'Auditoría física y conteo de brazaletes de seguridad temporada 2026 completado en caseta principal y recepción sin diferencias.',
    detalles: {
      notas: 'Auditoría de seguridad y brazaletes aprobada.'
    }
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hoa_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('hoa_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Live Database State
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [grupos, setGrupos] = useState<GrupoPropiedad[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [propiedadUsuarios, setPropiedadUsuarios] = useState<PropiedadUsuario[]>([]);
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudAcceso[]>([]);

  // Bitácora State
  const [bitacora, setBitacora] = useState<BitacoraEntry[]>(() => {
    try {
      const saved = localStorage.getItem('lp_bitacora_logs');
      return saved ? JSON.parse(saved) : DEFAULT_BITACORA_LOGS;
    } catch {
      return DEFAULT_BITACORA_LOGS;
    }
  });

  // Registrador central de auditoría y bitácora
  const registrarEventoBitacora = useCallback((
    entry: Omit<BitacoraEntry, 'id' | 'timestamp' | 'usuario_nombre' | 'usuario_email' | 'usuario_rol'> & {
      usuario_nombre?: string;
      usuario_email?: string;
      usuario_rol?: string;
      timestamp?: string;
    }
  ) => {
    const actorNombre = entry.usuario_nombre || (currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Personal HOA');
    const actorEmail = entry.usuario_email || (currentUser ? currentUser.email : 'sistema@laspalomas.com');
    const actorRol = entry.usuario_rol || (currentUser ? currentUser.rol : 'Administrador');

    const newLog: BitacoraEntry = {
      id: `BIT-${Date.now().toString().slice(-6)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      usuario_id: currentUser?.id,
      usuario_nombre: actorNombre,
      usuario_email: actorEmail,
      usuario_rol: actorRol,
      accion: entry.accion,
      modulo: entry.modulo,
      descripcion: entry.descripcion,
      entidad_id: entry.entidad_id,
      entidad_nombre: entry.entidad_nombre,
      detalles: {
        ...entry.detalles,
        dispositivo: entry.detalles?.dispositivo || `Portal HOA (${actorRol})`
      }
    };

    setBitacora(prev => {
      const updated = [newLog, ...prev];
      try {
        localStorage.setItem('lp_bitacora_logs', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Guardar permanentemente en la base de datos PostgreSQL
    api.bitacora.create({
      usuario_nombre: actorNombre,
      usuario_email: actorEmail,
      usuario_rol: actorRol,
      accion: entry.accion,
      modulo: entry.modulo,
      descripcion: entry.descripcion,
      entidad_nombre: entry.entidad_nombre,
      detalles: entry.detalles
    }).catch(err => console.warn('[Bitacora PostgreSQL Sync]:', err.message));

  }, [currentUser]);

  const agregarNotaBitacora = useCallback((descripcion: string, modulo: BitacoraEntry['modulo'] = 'Sistema') => {
    registrarEventoBitacora({
      accion: 'NOTA_SUPERVISOR',
      modulo,
      descripcion: descripcion.trim(),
      detalles: {
        notas: 'Nota / observación manual registrada desde el panel de Bitácora.'
      }
    });
    showToast('Nota registrada en la Bitácora de Auditoría y Base de Datos', 'success');
  }, [registrarEventoBitacora]);

  const limpiarBitacora = useCallback(() => {
    setBitacora(DEFAULT_BITACORA_LOGS);
    try {
      localStorage.setItem('lp_bitacora_logs', JSON.stringify(DEFAULT_BITACORA_LOGS));
    } catch {}
    showToast('Bitácora restablecida a eventos de auditoría base', 'info');
  }, []);

  // Toast notifications
  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch all data from Database Service
  const refreshAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [
        edificiosData,
        gruposData,
        usuariosData,
        propiedadesData,
        propiedadUsuariosData,
        huespedesData,
        reservacionesData,
        solicitudesData,
        bitacoraData
      ] = await Promise.all([
        api.edificios.getAll(),
        api.grupos.getAll(),
        api.usuarios.getAll(),
        api.propiedades.getAll(),
        api.propiedadUsuarios.getAll(),
        api.huespedes.getAll(),
        api.reservaciones.getAll(),
        api.solicitudes.getAll(),
        api.bitacora.getAll().catch(() => [])
      ]);

      setEdificios(edificiosData);
      setGrupos(gruposData);

      // Asegurar que el usuario Supervisor esté visible en la lista de usuarios
      const hasSupervisor = usuariosData.some(u => u.email === 'supervisor@laspalomas.com' || u.rol === 'Supervisor');
      let combinedUsers = [...usuariosData];
      if (!hasSupervisor) {
        combinedUsers.push({
          id: 6,
          email: 'supervisor@laspalomas.com',
          nombre: 'Carlos',
          apellido: 'Méndez',
          rol: 'Supervisor',
          telefono: '638-382-9900',
          idioma: 'es',
          ciudad: 'Puerto Peñasco',
          estado_geo: 'Sonora',
          codigo_postal: '83550',
          status: 'Active',
          created_at: '2026-01-15T09:00:00Z',
        });
      }
      setUsuarios(combinedUsers);

      // Sort properties naturally (e.g. A-101 before A-1001, A then B then C)
      const sortedPropiedades = (propiedadesData || []).slice().sort((a, b) => 
        compareCondoNames(a.nombre, b.nombre)
      );
      setPropiedades(sortedPropiedades);
      setPropiedadUsuarios(propiedadUsuariosData);
      setHuespedes(huespedesData);
      setReservaciones(reservacionesData);
      setSolicitudes(solicitudesData);

      if (Array.isArray(bitacoraData) && bitacoraData.length > 0) {
        setBitacora(bitacoraData);
        try {
          localStorage.setItem('lp_bitacora_logs', JSON.stringify(bitacoraData));
        } catch {}
      }
    } catch (err: any) {
      console.error('Error fetching database records:', err);
      setError(err.message || 'Error al conectar con la base de datos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // CRUD Actions
  const addPropiedad = async (propData: Omit<Propiedad, 'id'>, ownerId?: number) => {
    try {
      const created = await api.propiedades.create(propData, ownerId);
      setPropiedades(prev => [created, ...prev].sort((a, b) => 
        compareCondoNames(a.nombre, b.nombre)
      ));
      
      if (ownerId && ownerId > 0) {
        const assignments = await api.propiedadUsuarios.getAll();
        setPropiedadUsuarios(assignments);
      }

      registrarEventoBitacora({
        accion: 'CREACIÓN',
        modulo: 'Propiedades',
        descripcion: `Creó la propiedad "${created.nombre}" (${created.dormitorios} recámaras, ${created.banos} baños).`,
        entidad_id: created.id,
        entidad_nombre: created.nombre,
        detalles: { nuevo: created }
      });

      showToast(`Propiedad ${created.nombre} creada exitosamente`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al crear la propiedad', 'error');
    }
  };

  const updatePropiedad = async (id: number, propData: Partial<Propiedad>, ownerId?: number) => {
    try {
      const previous = propiedades.find(p => p.id === id);
      const updated = await api.propiedades.update(id, propData, ownerId);
      setPropiedades(prev => prev.map(p => (p.id === id ? updated : p)).sort((a, b) => 
        compareCondoNames(a.nombre, b.nombre)
      ));

      if (ownerId !== undefined) {
        const assignments = await api.propiedadUsuarios.getAll();
        setPropiedadUsuarios(assignments);
      }

      registrarEventoBitacora({
        accion: 'EDICIÓN',
        modulo: 'Propiedades',
        descripcion: `Actualizó información y características de la propiedad "${updated.nombre}".`,
        entidad_id: updated.id,
        entidad_nombre: updated.nombre,
        detalles: { previo: previous, nuevo: updated }
      });

      showToast(`Propiedad ${updated.nombre} actualizada`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar propiedad', 'error');
    }
  };

  const deletePropiedad = async (id: number) => {
    try {
      const target = propiedades.find(p => p.id === id);
      await api.propiedades.delete(id);
      setPropiedades(prev => prev.filter(p => p.id !== id));
      setPropiedadUsuarios(prev => prev.filter(pu => pu.propiedad_id !== id));

      registrarEventoBitacora({
        accion: 'ELIMINACIÓN',
        modulo: 'Propiedades',
        descripcion: `Eliminó la propiedad "${target?.nombre || `#${id}`}" del inventario de condominios.`,
        entidad_id: id,
        entidad_nombre: target?.nombre,
        detalles: { previo: target }
      });

      showToast('Propiedad eliminada', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar propiedad', 'error');
    }
  };

  const addEdificio = async (nombre: string) => {
    try {
      const created = await api.edificios.create({ nombre: nombre.trim(), activo: true });
      setEdificios(prev => [...prev, created]);

      registrarEventoBitacora({
        accion: 'CREACIÓN',
        modulo: 'Torres',
        descripcion: `Agregó la torre / edificio "${created.nombre}" al catálogo de torres activas.`,
        entidad_id: created.id,
        entidad_nombre: created.nombre,
        detalles: { nuevo: created }
      });

      showToast(`Torre ${created.nombre} agregada`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al crear edificio', 'error');
    }
  };

  const deleteEdificio = async (id: number) => {
    try {
      const target = edificios.find(e => e.id === id);
      await api.edificios.delete(id);
      setEdificios(prev => prev.filter(e => e.id !== id));

      registrarEventoBitacora({
        accion: 'ELIMINACIÓN',
        modulo: 'Torres',
        descripcion: `Eliminó la torre "${target?.nombre || `#${id}`}" del sistema.`,
        entidad_id: id,
        entidad_nombre: target?.nombre,
        detalles: { previo: target }
      });

      showToast('Torre eliminada', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar torre', 'error');
    }
  };

  const addUsuario = async (userData: Omit<Usuario, 'id'>) => {
    try {
      const created = await api.usuarios.create(userData);
      setUsuarios(prev => [created, ...prev]);

      registrarEventoBitacora({
        accion: 'CREACIÓN',
        modulo: 'Usuarios',
        descripcion: `Registró al usuario "${created.nombre} ${created.apellido}" con rol "${created.rol}" (${created.email}).`,
        entidad_id: created.id,
        entidad_nombre: `${created.nombre} ${created.apellido}`,
        detalles: { nuevo: created }
      });

      showToast(`Usuario ${created.nombre} ${created.apellido} registrado`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al registrar usuario', 'error');
    }
  };

  const updateUsuario = async (id: number, userData: Partial<Usuario>) => {
    try {
      const previous = usuarios.find(u => u.id === id);
      const updated = await api.usuarios.update(id, userData);
      setUsuarios(prev => prev.map(u => (u.id === id ? updated : u)));

      registrarEventoBitacora({
        accion: 'EDICIÓN',
        modulo: 'Usuarios',
        descripcion: `Modificó datos del usuario "${updated.nombre} ${updated.apellido}" (Rol: ${updated.rol}, Estatus: ${updated.status}).`,
        entidad_id: updated.id,
        entidad_nombre: `${updated.nombre} ${updated.apellido}`,
        detalles: { previo: previous, nuevo: updated }
      });

      showToast('Usuario actualizado correctamente', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar usuario', 'error');
    }
  };

  const deleteUsuario = async (id: number) => {
    try {
      const target = usuarios.find(u => u.id === id);
      await api.usuarios.delete(id);
      setUsuarios(prev => prev.filter(u => u.id !== id));
      setPropiedadUsuarios(prev => prev.filter(pu => pu.usuario_id !== id));

      registrarEventoBitacora({
        accion: 'ELIMINACIÓN',
        modulo: 'Usuarios',
        descripcion: `Eliminó al usuario "${target ? `${target.nombre} ${target.apellido}` : `#${id}`}" (${target?.email || ''}, Rol: ${target?.rol || ''}).`,
        entidad_id: id,
        entidad_nombre: target ? `${target.nombre} ${target.apellido}` : undefined,
        detalles: { previo: target }
      });

      showToast('Usuario eliminado', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar usuario', 'error');
    }
  };

  const checkReservationOverlap = (
    propiedadId: number,
    checkin: string,
    checkout: string,
    excludeResId?: number
  ): Reservacion | undefined => {
    return reservaciones.find(res => {
      if (res.propiedad_id !== propiedadId) return false;
      if (excludeResId && res.id === excludeResId) return false;
      if (res.estado === 'Cancelada' || res.estado === 'Checked-out') return false;
      return checkin < res.fecha_checkout && checkout > res.fecha_checkin;
    });
  };

  const addReservacion = async (
    resData: Omit<Reservacion, 'id'>, 
    huespedData?: Partial<Huesped>
  ) => {
    try {
      const overlap = checkReservationOverlap(resData.propiedad_id, resData.fecha_checkin, resData.fecha_checkout);
      if (overlap) {
        const prop = propiedades.find(p => p.id === resData.propiedad_id);
        const overlapGuest = huespedes.find(h => h.id === overlap.huesped_id);
        const guestName = overlapGuest?.nombres?.trim() || 'otro huésped';
        showToast(`Conflicto de fechas en ${prop?.nombre || 'la propiedad'}: ya reservada por ${guestName} (${overlap.fecha_checkin} al ${overlap.fecha_checkout})`, 'error');
        throw new Error('Conflicto de superposición de fechas');
      }

      let targetHuespedId = resData.huesped_id;
      let huespedName = '';
      if (huespedData && huespedData.nombres) {
        const newHuesped = await api.huespedes.create({
          nombres: huespedData.nombres.trim()
        });
        setHuespedes(prev => [newHuesped, ...prev]);
        targetHuespedId = newHuesped.id;
        huespedName = newHuesped.nombres.trim();
      } else {
        const existingH = huespedes.find(h => h.id === targetHuespedId);
        if (existingH) huespedName = existingH.nombres.trim();
      }

      const generatedCode = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
      const newRes = await api.reservaciones.create({
        ...resData,
        codigo: resData.codigo || generatedCode,
        huesped_id: targetHuespedId,
        estado: resData.estado || 'Confirmada'
      });

      setReservaciones(prev => [newRes, ...prev]);

      const propTarget = propiedades.find(p => p.id === newRes.propiedad_id);
      registrarEventoBitacora({
        accion: 'CREACIÓN',
        modulo: 'Reservaciones',
        descripcion: `Registró reservación #${newRes.codigo} en "${propTarget?.nombre || `Unidad ${newRes.propiedad_id}`}" para ${huespedName || 'Huésped'} (${newRes.fecha_checkin} al ${newRes.fecha_checkout}, ${newRes.numero_ocupantes} ocupantes, tipo: ${newRes.tipo_huesped}).`,
        entidad_id: newRes.id,
        entidad_nombre: newRes.codigo,
        detalles: { nuevo: newRes }
      });

      showToast(`Reservación #${newRes.codigo || newRes.id} registrada con éxito`, 'success');
    } catch (err: any) {
      if (!err.message?.includes('Conflicto')) {
        showToast(err.message || 'Error al guardar reservación', 'error');
      }
      throw err;
    }
  };

  const updateReservacion = async (
    id: number, 
    resData: Partial<Reservacion>,
    huespedData?: Partial<Huesped>
  ) => {
    try {
      const current = reservaciones.find(r => r.id === id);
      if (current) {
        const propId = resData.propiedad_id !== undefined ? resData.propiedad_id : current.propiedad_id;
        const checkin = resData.fecha_checkin || current.fecha_checkin;
        const checkout = resData.fecha_checkout || current.fecha_checkout;

        const overlap = checkReservationOverlap(propId, checkin, checkout, id);
        if (overlap) {
          showToast(`Superposición detectada en fechas ${checkin} al ${checkout}`, 'error');
          throw new Error('Conflicto de superposición de fechas');
        }
      }

      // Update guest name if provided
      if (huespedData && huespedData.nombres && current?.huesped_id) {
        try {
          const updatedGuest = await api.huespedes.update(current.huesped_id, {
            nombres: huespedData.nombres.trim()
          });
          if (updatedGuest) {
            setHuespedes(prev => prev.map(h => h.id === updatedGuest.id ? updatedGuest : h));
          }
        } catch (e) {
          console.warn('Error updating guest record:', e);
        }
      }

      const updated = await api.reservaciones.update(id, resData);
      setReservaciones(prev => prev.map(r => (r.id === id ? updated : r)));

      const propTarget = propiedades.find(p => p.id === updated.propiedad_id);
      registrarEventoBitacora({
        accion: 'EDICIÓN',
        modulo: 'Reservaciones',
        descripcion: `Modificó fechas o datos de la reservación #${updated.codigo || updated.id} (${propTarget?.nombre || 'Unidad'}, del ${updated.fecha_checkin} al ${updated.fecha_checkout}, Estatus: ${updated.estado}).`,
        entidad_id: updated.id,
        entidad_nombre: updated.codigo,
        detalles: { previo: current, nuevo: updated }
      });

      showToast(`Reservación #${updated.codigo || updated.id} actualizada`, 'success');
    } catch (err: any) {
      if (!err.message?.includes('Superposición')) {
        showToast(err.message || 'Error al actualizar reservación', 'error');
      }
      throw err;
    }
  };

  const checkInReservacion = async (
    id: number, 
    brazaletes?: string, 
    vehiculo?: string,
    acompanantes?: Acompanante[],
    titularBrazaleteEntregado?: boolean,
    acompanantes_amenidades?: AcompananteAmenidad[]
  ) => {
    try {
      const current = reservaciones.find(r => r.id === id);
      const prop = current ? propiedades.find(p => p.id === current.propiedad_id) : undefined;
      const guest = current ? huespedes.find(h => h.id === current.huesped_id) : undefined;

      const payload: Partial<Reservacion> = {
        estado: 'En Casa (Checked-in)',
        brazaletes: brazaletes || 'Asignado',
        vehiculo_info: vehiculo || 'Sin vehículo'
      };
      if (acompanantes !== undefined) {
        payload.acompanantes = acompanantes;
      }
      if (titularBrazaleteEntregado !== undefined) {
        payload.titular_brazalete_entregado = titularBrazaleteEntregado;
      }
      if (acompanantes_amenidades !== undefined) {
        payload.acompanantes_amenidades = acompanantes_amenidades;
      }

      const updated = await api.reservaciones.update(id, payload);
      setReservaciones(prev => prev.map(r => (r.id === id ? updated : r)));

      registrarEventoBitacora({
        accion: 'CHECK-IN',
        modulo: 'Reservaciones',
        descripcion: `Completó Check-In de #${current?.codigo || id} (${prop?.nombre || 'Unidad'}) para ${guest?.nombres || 'Huésped'}. Brazaletes: "${brazaletes || 'Asignados'}", Vehículo: "${vehiculo || 'Sin vehículo'}".`,
        entidad_id: id,
        entidad_nombre: current?.codigo,
        detalles: {
          nuevo: updated,
          brazaletes,
          vehiculo,
          acompanantes_total: acompanantes?.length || 0
        }
      });

      showToast('Check-In completado exitosamente. Huésped En Casa.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al procesar Check-in', 'error');
    }
  };

  const checkOutReservacion = async (id: number) => {
    try {
      const current = reservaciones.find(r => r.id === id);
      const prop = current ? propiedades.find(p => p.id === current.propiedad_id) : undefined;
      const updated = await api.reservaciones.update(id, { estado: 'Checked-out' });
      setReservaciones(prev => prev.map(r => (r.id === id ? updated : r)));

      registrarEventoBitacora({
        accion: 'CHECK-OUT',
        modulo: 'Reservaciones',
        descripcion: `Procesó Check-Out y liberación de la unidad "${prop?.nombre || 'Condominio'}" para la reservación #${current?.codigo || id}.`,
        entidad_id: id,
        entidad_nombre: current?.codigo,
        detalles: { previo: current, nuevo: updated }
      });

      showToast('Check-Out completado. Unidad liberada.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al procesar Check-out', 'error');
    }
  };

  const deleteReservacion = async (id: number) => {
    try {
      const target = reservaciones.find(r => r.id === id);
      const prop = target ? propiedades.find(p => p.id === target.propiedad_id) : undefined;
      await api.reservaciones.delete(id);
      setReservaciones(prev => prev.filter(r => r.id !== id));

      registrarEventoBitacora({
        accion: 'ELIMINACIÓN',
        modulo: 'Reservaciones',
        descripcion: `Eliminó la reservación #${target?.codigo || id} (${prop?.nombre || 'Unidad'}, del ${target?.fecha_checkin} al ${target?.fecha_checkout}).`,
        entidad_id: id,
        entidad_nombre: target?.codigo,
        detalles: { previo: target }
      });

      showToast('Reservación eliminada', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar reservación', 'error');
    }
  };

  const addSolicitud = async (solicitudData: Omit<SolicitudAcceso, 'id' | 'created_at'>) => {
    try {
      const created = await api.solicitudes.create(solicitudData);
      setSolicitudes(prev => [created, ...prev]);

      const prop = propiedades.find(p => p.id === created.propiedad_id);
      registrarEventoBitacora({
        accion: 'CREACIÓN',
        modulo: 'Solicitudes de Acceso',
        descripcion: `Registró solicitud de acceso "${created.solicitud}" para ${prop?.nombre || `Propiedad #${created.propiedad_id}`} (Fecha programada: ${created.fecha_esperada}, Solicitante: ${created.creador_nombre}).`,
        entidad_id: created.id,
        entidad_nombre: prop?.nombre,
        detalles: { nuevo: created }
      });

      showToast('Solicitud de acceso enviada', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al registrar solicitud', 'error');
    }
  };

  const updateSolicitudStatus = async (
    id: number, 
    estatus: SolicitudAcceso['estatus'], 
    comentario?: string
  ) => {
    try {
      const target = solicitudes.find(s => s.id === id);
      const prop = target ? propiedades.find(p => p.id === target.propiedad_id) : undefined;
      const procesador = currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Supervisor';
      
      const updated = await api.solicitudes.updateStatus(id, estatus, comentario, procesador);
      setSolicitudes(prev => prev.map(s => (s.id === id ? updated : s)));

      registrarEventoBitacora({
        accion: 'CAMBIO_ESTATUS',
        modulo: 'Solicitudes de Acceso',
        descripcion: `Cambió estatus de solicitud #${id} (${prop?.nombre || ''} - "${target?.solicitud || ''}") a "${estatus}".${comentario ? ` Comentario: "${comentario}".` : ''}`,
        entidad_id: id,
        entidad_nombre: target?.solicitud,
        detalles: {
          previo: target?.estatus,
          nuevo: estatus,
          comentario,
          procesador
        }
      });

      showToast(`Solicitud ${estatus.toLowerCase()}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar estatus', 'error');
    }
  };

  const resetToDefaults = async () => {
    try {
      localStorage.clear();
      setBitacora(DEFAULT_BITACORA_LOGS);
      await refreshAllData();
      registrarEventoBitacora({
        accion: 'CONFIGURACIÓN',
        modulo: 'Sistema',
        descripcion: 'Restablecimiento general del sistema con sincronización de datos de catálogo oficial.'
      });
      showToast('Sistema reiniciado y sincronizado con base de datos', 'info');
    } catch (err: any) {
      showToast('Error al reiniciar datos', 'error');
    }
  };

  // Helpers
  const getPropiedadById = useCallback((id: number) => {
    return propiedades.find(p => p.id === id);
  }, [propiedades]);

  const getEdificioById = useCallback((id: number) => {
    return edificios.find(e => e.id === id);
  }, [edificios]);

  const getGrupoById = useCallback((id?: number) => {
    if (!id) return undefined;
    return grupos.find(g => g.id === id);
  }, [grupos]);

  const getOwnerByPropiedadId = useCallback((propiedadId: number) => {
    const relation = propiedadUsuarios.find(pu => pu.propiedad_id === propiedadId && pu.es_principal);
    if (!relation) return undefined;
    return usuarios.find(u => u.id === relation.usuario_id);
  }, [propiedadUsuarios, usuarios]);

  const getHuespedById = useCallback((id: number) => {
    return huespedes.find(h => h.id === id);
  }, [huespedes]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isLoading,
        error,
        refreshAllData,
        edificios,
        grupos,
        usuarios,
        propiedades,
        propiedadUsuarios,
        huespedes,
        reservaciones,
        solicitudes,
        bitacora,
        registrarEventoBitacora,
        agregarNotaBitacora,
        limpiarBitacora,
        addPropiedad,
        updatePropiedad,
        deletePropiedad,
        addEdificio,
        deleteEdificio,
        addUsuario,
        updateUsuario,
        deleteUsuario,
        addReservacion,
        updateReservacion,
        checkInReservacion,
        checkOutReservacion,
        deleteReservacion,
        addSolicitud,
        updateSolicitudStatus,
        getPropiedadById,
        getEdificioById,
        getGrupoById,
        getOwnerByPropiedadId,
        getHuespedById,
        checkReservationOverlap,
        toasts,
        showToast,
        removeToast,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
