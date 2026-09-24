import {
  Edificio,
  GrupoPropiedad,
  Usuario,
  Propiedad,
  PropiedadUsuario,
  Huesped,
  Reservacion,
  SolicitudAcceso
} from '../types';

/**
 * Backend API & Database Service Client
 * 
 * Communicates with PostgreSQL database via REST API (/api/*)
 * Compatible with local development (.env) and Vercel serverless deployments.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const STORAGE_PREFIX = 'lp_db_fallback_';

// Generic HTTP request function
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let errorMsg = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(text);
        errorMsg = errorData.error || errorData.message || errorData.detail || errorMsg;
      } catch {
        if (text) {
          errorMsg = `Error ${response.status}: ${text.substring(0, 200)}`;
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    // Cache successfully fetched collection locally for offline fallback
    if ((!options || options.method === 'GET') && Array.isArray(data)) {
      const table = endpoint.replace(/^\//, '').split('/')[0];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${table}`, JSON.stringify(data));
      } catch {
        // ignore storage quota errors
      }
    }

    return data;
  } catch (err: any) {
    console.warn(`[API Network/Server Warning] ${options?.method || 'GET'} ${url}:`, err.message);
    
    // In case of initial setup before tables are created in DB or temporary network issues,
    // fallback gracefully to cached local storage
    if (!options || options.method === 'GET') {
      const table = endpoint.replace(/^\//, '').split('/')[0];
      const cached = localStorage.getItem(`${STORAGE_PREFIX}${table}`);
      if (cached) {
        try {
          const items = JSON.parse(cached);
          const parts = endpoint.split('/');
          if (parts.length > 2 && parts[2]) {
            const id = parseInt(parts[2]);
            const found = items.find((i: any) => i.id === id);
            if (found) return found;
          }
          return items as T;
        } catch {
          // fallback failed
        }
      }
    }

    throw err;
  }
}

// 1. Edificios API
export const edificiosApi = {
  getAll: () => request<Edificio[]>('/edificios'),
  getById: (id: number) => request<Edificio>(`/edificios/${id}`),
  create: (data: Omit<Edificio, 'id'>) => request<Edificio>('/edificios', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Edificio>) => request<Edificio>(`/edificios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean; id: number }>(`/edificios/${id}`, { method: 'DELETE' }),
};

// 2. Grupos de Propiedad API
export const gruposApi = {
  getAll: () => request<GrupoPropiedad[]>('/grupos_propiedad'),
  getById: (id: number) => request<GrupoPropiedad>(`/grupos_propiedad/${id}`),
  create: (data: Omit<GrupoPropiedad, 'id'>) => request<GrupoPropiedad>('/grupos_propiedad', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<GrupoPropiedad>) => request<GrupoPropiedad>(`/grupos_propiedad/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean; id: number }>(`/grupos_propiedad/${id}`, { method: 'DELETE' }),
};

// 3. Usuarios / Propietarios API
export const usuariosApi = {
  getAll: () => request<Usuario[]>('/usuarios'),
  getById: (id: number) => request<Usuario>(`/usuarios/${id}`),
  create: (data: Omit<Usuario, 'id'>) => request<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Usuario>) => request<Usuario>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean; id: number }>(`/usuarios/${id}`, { method: 'DELETE' }),
};

// 4. Propiedades API
export const propiedadesApi = {
  getAll: () => request<Propiedad[]>('/propiedades'),
  getById: (id: number) => request<Propiedad>(`/propiedades/${id}`),
  create: (data: Omit<Propiedad, 'id'>, ownerId?: number) => 
    request<Propiedad>('/propiedades', { method: 'POST', body: JSON.stringify({ ...data, ownerId }) }),
  update: (id: number, data: Partial<Propiedad>, ownerId?: number) => 
    request<Propiedad>(`/propiedades/${id}`, { method: 'PUT', body: JSON.stringify({ ...data, ownerId }) }),
  delete: (id: number) => request<{ success: boolean; id: number }>(`/propiedades/${id}`, { method: 'DELETE' }),
};

// 5. Asignaciones Propiedad - Usuarios API
export const propiedadUsuariosApi = {
  getAll: () => request<PropiedadUsuario[]>('/propiedad_usuarios'),
  create: (data: Omit<PropiedadUsuario, 'id'>) => 
    request<PropiedadUsuario>('/propiedad_usuarios', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => 
    request<{ success: boolean; id: number }>(`/propiedad_usuarios/${id}`, { method: 'DELETE' }),
};

// 6. Huéspedes API
export const huespedesApi = {
  getAll: () => request<Huesped[]>('/huespedes'),
  getById: (id: number) => request<Huesped>(`/huespedes/${id}`),
  create: (data: Omit<Huesped, 'id'>) => request<Huesped>('/huespedes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Huesped>) => request<Huesped>(`/huespedes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean; id: number }>(`/huespedes/${id}`, { method: 'DELETE' }),
};

// 7. Reservaciones API
export const reservacionesApi = {
  getAll: () => request<Reservacion[]>('/reservaciones'),
  getById: (id: number) => request<Reservacion>(`/reservaciones/${id}`),
  create: (data: Omit<Reservacion, 'id'>, huespedData?: Omit<Huesped, 'id'>) => 
    request<Reservacion>('/reservaciones', { 
      method: 'POST', 
      body: JSON.stringify({ ...data, huespedData }) 
    }),
  update: (id: number, data: Partial<Reservacion>) => 
    request<Reservacion>(`/reservaciones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean; id: number }>(`/reservaciones/${id}`, { method: 'DELETE' }),
};

// 8. Solicitudes de Acceso API
export const solicitudesApi = {
  getAll: () => request<SolicitudAcceso[]>('/solicitudes'),
  create: (data: Omit<SolicitudAcceso, 'id' | 'created_at'>) => 
    request<SolicitudAcceso>('/solicitudes', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: number, estatus: SolicitudAcceso['estatus'], comentario?: string, procesadorNombre?: string) => 
    request<SolicitudAcceso>(`/solicitudes/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify({ 
        estatus, 
        comentario, 
        procesador_nombre: procesadorNombre 
      }) 
    }),
};

// 9. Base de Datos Status & Health Check
export const healthApi = {
  check: () => request<{
    connected: boolean;
    message: string;
    tables: Record<string, number>;
    environment: {
      hasCustomDbUrl: boolean;
      hasDatabaseUrl: boolean;
      hasPostgresUrl: boolean;
    };
  }>('/health'),
};

export const api = {
  edificios: edificiosApi,
  grupos: gruposApi,
  usuarios: usuariosApi,
  propiedades: propiedadesApi,
  propiedadUsuarios: propiedadUsuariosApi,
  huespedes: huespedesApi,
  reservaciones: reservacionesApi,
  solicitudes: solicitudesApi,
  health: healthApi,
};
