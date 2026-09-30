import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../types';

export interface AuthContextType {
  currentUser: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUserRole: (role: 'Administrador' | 'Supervisor') => void;
  presetUsers: Usuario[];
}

// Usuarios predeterminados del sistema
export const DEFAULT_ADMIN_USER: Usuario = {
  id: 1,
  email: 'admin@laspalomas.com',
  nombre: 'Francisco',
  apellido: 'Amado',
  rol: 'Administrador',
  telefono: '+52 638 102 3344',
  idioma: 'Español',
  ciudad: 'Puerto Peñasco',
  estado_geo: 'Sonora',
  codigo_postal: '83550',
  status: 'Active',
  created_at: '2026-01-01T08:00:00Z',
};

export const DEFAULT_SUPERVISOR_USER: Usuario = {
  id: 2,
  email: 'supervisor@laspalomas.com',
  nombre: 'Carlos',
  apellido: 'Méndez',
  rol: 'Supervisor',
  telefono: '+52 638 382 9900',
  idioma: 'Español',
  ciudad: 'Puerto Peñasco',
  estado_geo: 'Sonora',
  codigo_postal: '83550',
  status: 'Active',
  created_at: '2026-01-15T09:00:00Z',
};

export const PRESET_USERS = [DEFAULT_ADMIN_USER, DEFAULT_SUPERVISOR_USER];
export const DEFAULT_USER = DEFAULT_ADMIN_USER;

const AUTH_STORAGE_KEY = 'lp_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      return savedSession ? JSON.parse(savedSession) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (
    email: string, 
    password: string, 
    rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // Breve transición fluida para respuesta visual
    await new Promise(resolve => setTimeout(resolve, 200));

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setIsLoading(false);
      return { success: false, error: 'Por favor ingresa tu correo electrónico.' };
    }

    if (!password || password.length < 3) {
      setIsLoading(false);
      return { success: false, error: 'Por favor ingresa tu contraseña.' };
    }

    // Seleccionar usuario correspondiente o crear sesión
    let userToSet: Usuario;
    if (cleanEmail.includes('supervisor')) {
      userToSet = {
        ...DEFAULT_SUPERVISOR_USER,
        email: cleanEmail,
      };
    } else {
      userToSet = {
        ...DEFAULT_ADMIN_USER,
        email: cleanEmail || DEFAULT_ADMIN_USER.email,
      };
    }

    setCurrentUser(userToSet);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToSet));
    setIsLoading(false);
    return { success: true };
  };

  const switchUserRole = (role: 'Administrador' | 'Supervisor') => {
    const targetUser = role === 'Supervisor' ? DEFAULT_SUPERVISOR_USER : DEFAULT_ADMIN_USER;
    setCurrentUser(targetUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        switchUserRole,
        presetUsers: PRESET_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
