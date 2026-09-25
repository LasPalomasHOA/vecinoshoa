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
  Acompanante
} from '../types';
import { api } from '../services/api';

export type ActiveTab = 'frontdesk' | 'calendar' | 'properties' | 'users' | 'requests' | 'reports';

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
  
  // CRUD Actions connected to Database Layer
  addPropiedad: (propiedad: Omit<Propiedad, 'id'>, ownerId?: number) => Promise<void>;
  updatePropiedad: (id: number, propiedad: Partial<Propiedad>, ownerId?: number) => Promise<void>;
  deletePropiedad: (id: number) => Promise<void>;
  
  addEdificio: (nombre: string) => Promise<void>;
  deleteEdificio: (id: number) => Promise<void>;
  
  addUsuario: (usuario: Omit<Usuario, 'id'>) => Promise<void>;
  updateUsuario: (id: number, usuario: Partial<Usuario>) => Promise<void>;
  deleteUsuario: (id: number) => Promise<void>;
  
  addReservacion: (reservacion: Omit<Reservacion, 'id'>, huespedData?: Omit<Huesped, 'id'>) => Promise<void>;
  updateReservacion: (id: number, reservacion: Partial<Reservacion>) => Promise<void>;
  checkInReservacion: (
    id: number, 
    brazaletes?: string, 
    vehiculo?: string, 
    acompanantes?: Acompanante[], 
    titularBrazaleteEntregado?: boolean
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('frontdesk');
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
        solicitudesData
      ] = await Promise.all([
        api.edificios.getAll(),
        api.grupos.getAll(),
        api.usuarios.getAll(),
        api.propiedades.getAll(),
        api.propiedadUsuarios.getAll(),
        api.huespedes.getAll(),
        api.reservaciones.getAll(),
        api.solicitudes.getAll()
      ]);

      setEdificios(edificiosData);
      setGrupos(gruposData);
      setUsuarios(usuariosData);
      setPropiedades(propiedadesData);
      setPropiedadUsuarios(propiedadUsuariosData);
      setHuespedes(huespedesData);
      setReservaciones(reservacionesData);
      setSolicitudes(solicitudesData);
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
      setPropiedades(prev => [created, ...prev]);
      
      if (ownerId && ownerId > 0) {
        // Refresh assignments
        const assignments = await api.propiedadUsuarios.getAll();
        setPropiedadUsuarios(assignments);
      }

      showToast(`Propiedad ${created.nombre} creada exitosamente`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al crear la propiedad', 'error');
    }
  };

  const updatePropiedad = async (id: number, propData: Partial<Propiedad>, ownerId?: number) => {
    try {
      const updated = await api.propiedades.update(id, propData, ownerId);
      setPropiedades(prev => prev.map(p => (p.id === id ? updated : p)));

      if (ownerId !== undefined) {
        const assignments = await api.propiedadUsuarios.getAll();
        setPropiedadUsuarios(assignments);
      }

      showToast(`Propiedad ${updated.nombre} actualizada`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar propiedad', 'error');
    }
  };

  const deletePropiedad = async (id: number) => {
    try {
      await api.propiedades.delete(id);
      setPropiedades(prev => prev.filter(p => p.id !== id));
      setPropiedadUsuarios(prev => prev.filter(pu => pu.propiedad_id !== id));
      showToast('Propiedad eliminada', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar propiedad', 'error');
    }
  };

  const addEdificio = async (nombre: string) => {
    try {
      const created = await api.edificios.create({ nombre: nombre.trim(), activo: true });
      setEdificios(prev => [...prev, created]);
      showToast(`Torre ${created.nombre} agregada`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al crear edificio', 'error');
    }
  };

  const deleteEdificio = async (id: number) => {
    try {
      await api.edificios.delete(id);
      setEdificios(prev => prev.filter(e => e.id !== id));
      showToast('Torre eliminada', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar torre', 'error');
    }
  };

  const addUsuario = async (userData: Omit<Usuario, 'id'>) => {
    try {
      const created = await api.usuarios.create(userData);
      setUsuarios(prev => [created, ...prev]);
      showToast(`Usuario ${created.nombre} ${created.apellido} registrado`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al registrar usuario', 'error');
    }
  };

  const updateUsuario = async (id: number, userData: Partial<Usuario>) => {
    try {
      const updated = await api.usuarios.update(id, userData);
      setUsuarios(prev => prev.map(u => (u.id === id ? updated : u)));
      showToast('Usuario actualizado correctamente', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar usuario', 'error');
    }
  };

  const deleteUsuario = async (id: number) => {
    try {
      await api.usuarios.delete(id);
      setUsuarios(prev => prev.filter(u => u.id !== id));
      setPropiedadUsuarios(prev => prev.filter(pu => pu.usuario_id !== id));
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
    huespedData?: Omit<Huesped, 'id'>
  ) => {
    try {
      const overlap = checkReservationOverlap(resData.propiedad_id, resData.fecha_checkin, resData.fecha_checkout);
      if (overlap) {
        const prop = propiedades.find(p => p.id === resData.propiedad_id);
        const overlapGuest = huespedes.find(h => h.id === overlap.huesped_id);
        const guestName = overlapGuest ? `${overlapGuest.nombres} ${overlapGuest.apellidos}` : 'otro huésped';
        showToast(`Conflicto de fechas en ${prop?.nombre || 'la propiedad'}: ya reservada por ${guestName} (${overlap.fecha_checkin} al ${overlap.fecha_checkout})`, 'error');
        throw new Error('Conflicto de superposición de fechas');
      }

      let targetHuespedId = resData.huesped_id;
      if (huespedData && huespedData.nombres) {
        const newHuesped = await api.huespedes.create(huespedData);
        setHuespedes(prev => [newHuesped, ...prev]);
        targetHuespedId = newHuesped.id;
      }

      const generatedCode = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
      const newRes = await api.reservaciones.create({
        ...resData,
        codigo: resData.codigo || generatedCode,
        huesped_id: targetHuespedId,
        balance: resData.balance || 0,
        estado: resData.estado || 'Confirmada'
      });

      setReservaciones(prev => [newRes, ...prev]);
      showToast(`Reservación #${newRes.codigo || newRes.id} registrada con éxito`, 'success');
    } catch (err: any) {
      if (!err.message?.includes('Conflicto')) {
        showToast(err.message || 'Error al guardar reservación', 'error');
      }
      throw err;
    }
  };

  const updateReservacion = async (id: number, resData: Partial<Reservacion>) => {
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

      const updated = await api.reservaciones.update(id, resData);
      setReservaciones(prev => prev.map(r => (r.id === id ? updated : r)));
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
    titularBrazaleteEntregado?: boolean
  ) => {
    try {
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

      const updated = await api.reservaciones.update(id, payload);
      setReservaciones(prev => prev.map(r => (r.id === id ? updated : r)));
      showToast('Check-In completado exitosamente. Huésped En Casa.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al procesar Check-in', 'error');
    }
  };

  const checkOutReservacion = async (id: number) => {
    try {
      const updated = await api.reservaciones.update(id, { estado: 'Checked-out' });
      setReservaciones(prev => prev.map(r => (r.id === id ? updated : r)));
      showToast('Check-Out completado. Unidad liberada.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al procesar Check-out', 'error');
    }
  };

  const deleteReservacion = async (id: number) => {
    try {
      await api.reservaciones.delete(id);
      setReservaciones(prev => prev.filter(r => r.id !== id));
      showToast('Reservación eliminada', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar reservación', 'error');
    }
  };

  const addSolicitud = async (solicitudData: Omit<SolicitudAcceso, 'id' | 'created_at'>) => {
    try {
      const created = await api.solicitudes.create(solicitudData);
      setSolicitudes(prev => [created, ...prev]);
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
      const updated = await api.solicitudes.updateStatus(id, estatus, comentario);
      setSolicitudes(prev => prev.map(s => (s.id === id ? updated : s)));
      showToast(`Solicitud ${estatus.toLowerCase()}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar estatus', 'error');
    }
  };

  const resetToDefaults = async () => {
    try {
      localStorage.clear();
      await refreshAllData();
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
