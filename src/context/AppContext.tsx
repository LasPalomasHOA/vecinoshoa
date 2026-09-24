import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Edificio, 
  GrupoPropiedad, 
  Usuario, 
  Propiedad, 
  PropiedadUsuario, 
  Huesped, 
  Reservacion, 
  SolicitudAcceso,
  EstadoReservacion
} from '../types';
import { 
  initialEdificios, 
  initialGrupos, 
  initialUsuarios, 
  initialPropiedades, 
  initialPropiedadUsuarios, 
  initialHuespedes, 
  initialReservaciones, 
  initialSolicitudes 
} from '../data/mockData';

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
  
  // Data
  edificios: Edificio[];
  grupos: GrupoPropiedad[];
  usuarios: Usuario[];
  propiedades: Propiedad[];
  propiedadUsuarios: PropiedadUsuario[];
  huespedes: Huesped[];
  reservaciones: Reservacion[];
  solicitudes: SolicitudAcceso[];
  
  // CRUD Actions
  addPropiedad: (propiedad: Omit<Propiedad, 'id'>, ownerId?: number) => void;
  updatePropiedad: (id: number, propiedad: Partial<Propiedad>, ownerId?: number) => void;
  deletePropiedad: (id: number) => void;
  
  addEdificio: (nombre: string) => void;
  deleteEdificio: (id: number) => void;
  
  addUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  updateUsuario: (id: number, usuario: Partial<Usuario>) => void;
  deleteUsuario: (id: number) => void;
  
  addReservacion: (reservacion: Omit<Reservacion, 'id'>, huespedData?: Omit<Huesped, 'id'>) => void;
  updateReservacion: (id: number, reservacion: Partial<Reservacion>) => void;
  checkInReservacion: (id: number, brazaletes?: string, vehiculo?: string) => void;
  checkOutReservacion: (id: number) => void;
  deleteReservacion: (id: number) => void;
  
  addSolicitud: (solicitud: Omit<SolicitudAcceso, 'id' | 'created_at'>) => void;
  updateSolicitudStatus: (id: number, estatus: SolicitudAcceso['estatus'], comentario?: string) => void;
  
  // Helpers
  getPropiedadById: (id: number) => Propiedad | undefined;
  getEdificioById: (id: number) => Edificio | undefined;
  getGrupoById: (id?: number) => GrupoPropiedad | undefined;
  getOwnerByPropiedadId: (propiedadId: number) => Usuario | undefined;
  getHuespedById: (id: number) => Huesped | undefined;
  
  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'lp_hoa_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('frontdesk');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load state with fallback to seed data
  const [edificios, setEdificios] = useState<Edificio[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}edificios`);
    return saved ? JSON.parse(saved) : initialEdificios;
  });

  const [grupos] = useState<GrupoPropiedad[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}grupos`);
    return saved ? JSON.parse(saved) : initialGrupos;
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}usuarios`);
    return saved ? JSON.parse(saved) : initialUsuarios;
  });

  const [propiedades, setPropiedades] = useState<Propiedad[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}propiedades`);
    return saved ? JSON.parse(saved) : initialPropiedades;
  });

  const [propiedadUsuarios, setPropiedadUsuarios] = useState<PropiedadUsuario[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}propiedad_usuarios`);
    return saved ? JSON.parse(saved) : initialPropiedadUsuarios;
  });

  const [huespedes, setHuespedes] = useState<Huesped[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}huespedes`);
    return saved ? JSON.parse(saved) : initialHuespedes;
  });

  const [reservaciones, setReservaciones] = useState<Reservacion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reservaciones`);
    return saved ? JSON.parse(saved) : initialReservaciones;
  });

  const [solicitudes, setSolicitudes] = useState<SolicitudAcceso[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}solicitudes`);
    return saved ? JSON.parse(saved) : initialSolicitudes;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}edificios`, JSON.stringify(edificios));
  }, [edificios]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}usuarios`, JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}propiedades`, JSON.stringify(propiedades));
  }, [propiedades]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}propiedad_usuarios`, JSON.stringify(propiedadUsuarios));
  }, [propiedadUsuarios]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}huespedes`, JSON.stringify(huespedes));
  }, [huespedes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}reservaciones`, JSON.stringify(reservaciones));
  }, [reservaciones]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}solicitudes`, JSON.stringify(solicitudes));
  }, [solicitudes]);

  // Toast notifier
  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper Lookups
  const getPropiedadById = (id: number) => propiedades.find(p => p.id === id);
  const getEdificioById = (id: number) => edificios.find(e => e.id === id);
  const getGrupoById = (id?: number) => (id ? grupos.find(g => g.id === id) : undefined);
  const getHuespedById = (id: number) => huespedes.find(h => h.id === id);

  const getOwnerByPropiedadId = (propiedadId: number) => {
    const rel = propiedadUsuarios.find(pu => pu.propiedad_id === propiedadId && pu.es_principal);
    if (!rel) return undefined;
    return usuarios.find(u => u.id === rel.usuario_id);
  };

  // CRUD Implementations
  const addPropiedad = (propiedadData: Omit<Propiedad, 'id'>, ownerId?: number) => {
    const newId = Math.max(...propiedades.map(p => p.id), 0) + 1;
    const newProp: Propiedad = {
      ...propiedadData,
      id: newId,
      created_at: new Date().toISOString()
    };
    setPropiedades(prev => [newProp, ...prev]);

    if (ownerId) {
      const newRelId = Math.max(...propiedadUsuarios.map(r => r.id), 0) + 1;
      setPropiedadUsuarios(prev => [
        ...prev,
        { id: newRelId, propiedad_id: newId, usuario_id: ownerId, tipo_relacion: 'Owner', es_principal: true }
      ]);
    }
    showToast(`Propiedad ${newProp.nombre} agregada correctamente.`);
  };

  const updatePropiedad = (id: number, propiedadData: Partial<Propiedad>, ownerId?: number) => {
    setPropiedades(prev => prev.map(p => p.id === id ? { ...p, ...propiedadData, updated_at: new Date().toISOString() } : p));
    
    if (ownerId !== undefined) {
      setPropiedadUsuarios(prev => {
        const withoutOld = prev.filter(r => !(r.propiedad_id === id && r.es_principal));
        if (ownerId > 0) {
          const newRelId = Math.max(...prev.map(r => r.id), 0) + 1;
          return [...withoutOld, { id: newRelId, propiedad_id: id, usuario_id: ownerId, tipo_relacion: 'Owner', es_principal: true }];
        }
        return withoutOld;
      });
    }
    showToast('Propiedad actualizada con éxito.');
  };

  const deletePropiedad = (id: number) => {
    setPropiedades(prev => prev.filter(p => p.id !== id));
    setPropiedadUsuarios(prev => prev.filter(r => r.propiedad_id !== id));
    showToast('Propiedad eliminada.', 'info');
  };

  const addEdificio = (nombre: string) => {
    if (!nombre.trim()) return;
    const newId = Math.max(...edificios.map(e => e.id), 0) + 1;
    setEdificios(prev => [...prev, { id: newId, nombre: nombre.trim(), activo: true }]);
    showToast(`Edificio ${nombre} registrado.`);
  };

  const deleteEdificio = (id: number) => {
    setEdificios(prev => prev.filter(e => e.id !== id));
    showToast('Edificio removido.', 'info');
  };

  const addUsuario = (userData: Omit<Usuario, 'id'>) => {
    const newId = Math.max(...usuarios.map(u => u.id), 0) + 1;
    const newUser: Usuario = {
      ...userData,
      id: newId,
      created_at: new Date().toISOString()
    };
    setUsuarios(prev => [newUser, ...prev]);
    showToast(`Usuario ${newUser.nombre} ${newUser.apellido} creado.`);
  };

  const updateUsuario = (id: number, userData: Partial<Usuario>) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...userData, updated_at: new Date().toISOString() } : u));
    showToast('Datos de usuario actualizados.');
  };

  const deleteUsuario = (id: number) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
    setPropiedadUsuarios(prev => prev.filter(r => r.usuario_id !== id));
    showToast('Usuario eliminado.', 'info');
  };

  const addReservacion = (resData: Omit<Reservacion, 'id'>, huespedData?: Omit<Huesped, 'id'>) => {
    let finalHuespedId = resData.huesped_id;

    if (huespedData && (!finalHuespedId || finalHuespedId === 0)) {
      finalHuespedId = Math.max(...huespedes.map(h => h.id), 0) + 1;
      const newHuesped: Huesped = {
        ...huespedData,
        id: finalHuespedId,
        created_at: new Date().toISOString()
      };
      setHuespedes(prev => [newHuesped, ...prev]);
    }

    const newResId = Math.max(...reservaciones.map(r => r.id), 2500000) + 1;
    const newRes: Reservacion = {
      ...resData,
      id: newResId,
      codigo: resData.codigo || `${newResId}`,
      huesped_id: finalHuespedId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setReservaciones(prev => [newRes, ...prev]);
    showToast(`Reservación #${newRes.codigo} creada.`);
  };

  const updateReservacion = (id: number, resData: Partial<Reservacion>) => {
    setReservaciones(prev => prev.map(r => r.id === id ? { ...r, ...resData, updated_at: new Date().toISOString() } : r));
    showToast('Reservación actualizada.');
  };

  const checkInReservacion = (id: number, brazaletes?: string, vehiculo?: string) => {
    setReservaciones(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          estado: 'En Casa (Checked-in)' as EstadoReservacion,
          brazaletes: brazaletes || r.brazaletes || 'Brazaletes Asignados',
          vehiculo_info: vehiculo || r.vehiculo_info,
          updated_at: new Date().toISOString()
        };
      }
      return r;
    }));
    showToast('Entrada registrada exitosamente (Checked-in).');
  };

  const checkOutReservacion = (id: number) => {
    setReservaciones(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          estado: 'Checked-out' as EstadoReservacion,
          updated_at: new Date().toISOString()
        };
      }
      return r;
    }));
    showToast('Salida registrada (Checked-out).', 'info');
  };

  const deleteReservacion = (id: number) => {
    setReservaciones(prev => prev.filter(r => r.id !== id));
    showToast('Reservación cancelada/eliminada.', 'info');
  };

  const addSolicitud = (solData: Omit<SolicitudAcceso, 'id' | 'created_at'>) => {
    const newId = Math.max(...solicitudes.map(s => s.id), 0) + 1;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newSol: SolicitudAcceso = {
      ...solData,
      id: newId,
      created_at: formattedDate
    };
    setSolicitudes(prev => [newSol, ...prev]);
    showToast('Pase / Solicitud registrada con éxito.');
  };

  const updateSolicitudStatus = (id: number, estatus: SolicitudAcceso['estatus'], comentario?: string) => {
    setSolicitudes(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          estatus,
          comentario: comentario !== undefined ? comentario : s.comentario
        };
      }
      return s;
    }));
    showToast(`Solicitud #${id} marcada como ${estatus}.`);
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setEdificios(initialEdificios);
    setUsuarios(initialUsuarios);
    setPropiedades(initialPropiedades);
    setPropiedadUsuarios(initialPropiedadUsuarios);
    setHuespedes(initialHuespedes);
    setReservaciones(initialReservaciones);
    setSolicitudes(initialSolicitudes);
    showToast('Datos reiniciados al catálogo demo oficial de Las Palomas HOA.');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
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
        toasts,
        showToast,
        removeToast,
        resetToDefaults
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
