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
 * Supports both direct REST/PostgreSQL API endpoints (configured via VITE_API_URL)
 * and structured local persistence with PostgreSQL schema compliance.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const STORAGE_PREFIX = 'lp_db_';

// Generic HTTP helper for backend communication
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (API_BASE_URL) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Local persistent storage engine (simulates PostgreSQL table operations)
  return mockDbRequest<T>(endpoint, options);
}

// Internal local DB engine for standalone mode
function mockDbRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const method = options?.method || 'GET';
  const table = endpoint.replace(/^\//, '').split('/')[0];
  const storageKey = `${STORAGE_PREFIX}${table}`;
  const raw = localStorage.getItem(storageKey);
  const items: any[] = raw ? JSON.parse(raw) : [];

  if (method === 'GET') {
    const parts = endpoint.split('/');
    if (parts.length > 2 && parts[2]) {
      const id = parseInt(parts[2]);
      const found = items.find(i => i.id === id);
      if (!found) return Promise.reject(new Error(`Registro no encontrado en ${table}`));
      return Promise.resolve(found as T);
    }
    return Promise.resolve(items as T);
  }

  if (method === 'POST') {
    const body = JSON.parse((options?.body as string) || '{}');
    const newId = body.id || (items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1);
    const now = new Date().toISOString();
    const newItem = {
      ...body,
      id: newId,
      created_at: body.created_at || now,
      updated_at: now,
    };
    items.push(newItem);
    localStorage.setItem(storageKey, JSON.stringify(items));
    return Promise.resolve(newItem as T);
  }

  if (method === 'PUT' || method === 'PATCH') {
    const parts = endpoint.split('/');
    const id = parseInt(parts[2]);
    const body = JSON.parse((options?.body as string) || '{}');
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return Promise.reject(new Error(`Registro no encontrado en ${table}`));
    
    items[index] = {
      ...items[index],
      ...body,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(items));
    return Promise.resolve(items[index] as T);
  }

  if (method === 'DELETE') {
    const parts = endpoint.split('/');
    const id = parseInt(parts[2]);
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    return Promise.resolve({ success: true, id } as T);
  }

  return Promise.resolve([] as unknown as T);
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
  create: (data: Omit<Propiedad, 'id'>) => request<Propiedad>('/propiedades', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Propiedad>) => request<Propiedad>(`/propiedades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean; id: number }>(`/propiedades/${id}`, { method: 'DELETE' }),
};

// 5. Asignaciones Propiedad - Usuarios API
export const propiedadUsuariosApi = {
  getAll: () => request<PropiedadUsuario[]>('/propiedad_usuarios'),
  create: (data: Omit<PropiedadUsuario, 'id'>) => request<PropiedadUsuario>('/propiedad_usuarios', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean; id: number }>(`/propiedad_usuarios/${id}`, { method: 'DELETE' }),
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
  create: (data: Omit<Reservacion, 'id'>) => request<Reservacion>('/reservaciones', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Reservacion>) => request<Reservacion>(`/reservaciones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean; id: number }>(`/reservaciones/${id}`, { method: 'DELETE' }),
};

// 8. Solicitudes de Acceso API
export const solicitudesApi = {
  getAll: () => request<SolicitudAcceso[]>('/solicitudes'),
  create: (data: Omit<SolicitudAcceso, 'id' | 'created_at'>) => request<SolicitudAcceso>('/solicitudes', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: number, estatus: SolicitudAcceso['estatus'], comentario?: string) => 
    request<SolicitudAcceso>(`/solicitudes/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify({ estatus, comentario, updated_at: new Date().toISOString() }) 
    }),
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
};
