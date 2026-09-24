import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, RolUsuario } from '../types';

export interface AuthContextType {
  currentUser: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  quickLoginAs: (rol: RolUsuario) => void;
  logout: () => void;
}

// Cuentas predeterminadas para acceso rápido y pruebas
export const DEMO_ACCOUNTS: Array<{
  usuario: Usuario;
  passwordDefault: string;
  badgeLabel: string;
  description: string;
}> = [
  {
    usuario: {
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
    },
    passwordDefault: 'admin123',
    badgeLabel: 'Administrador General',
    description: 'Acceso total a catálogo, timeline, finanzas y reportes'
  },
  {
    usuario: {
      id: 2,
      email: 'recepcion@laspalomas.com',
      nombre: 'Carmen',
      apellido: 'Navarro',
      rol: 'Recepcionista',
      telefono: '+52 638 108 5566',
      idioma: 'Español',
      ciudad: 'Puerto Peñasco',
      estado_geo: 'Sonora',
      codigo_postal: '83550',
      status: 'Active',
      created_at: '2026-01-15T09:00:00Z',
    },
    passwordDefault: 'recepcion123',
    badgeLabel: 'Front Desk & Recepción',
    description: 'Gestión diaria de check-in, brazaletes y salidas'
  },
  {
    usuario: {
      id: 3,
      email: 'seguridad@laspalomas.com',
      nombre: 'Roberto',
      apellido: 'Mendoza',
      rol: 'Guardia de Seguridad',
      telefono: '+52 638 114 7788',
      idioma: 'Español',
      ciudad: 'Puerto Peñasco',
      estado_geo: 'Sonora',
      codigo_postal: '83550',
      status: 'Active',
      created_at: '2026-02-01T10:00:00Z',
    },
    passwordDefault: 'seguridad123',
    badgeLabel: 'Comité / Seguridad',
    description: 'Validación de pases de trabajo y control de accesos'
  },
  {
    usuario: {
      id: 4,
      email: 'dueno@laspalomas.com',
      nombre: 'Guillermo',
      apellido: 'Garza',
      rol: 'Dueño',
      telefono: '+1 602 555 0192',
      idioma: 'Español',
      ciudad: 'Scottsdale',
      estado_geo: 'Arizona',
      codigo_postal: '85251',
      status: 'Active',
      created_at: '2026-02-10T12:00:00Z',
    },
    passwordDefault: 'dueno123',
    badgeLabel: 'Propietario / Residente',
    description: 'Consulta de condominio, autorizaciones y visitas'
  }
];

const AUTH_STORAGE_KEY = 'lp_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setCurrentUser(parsed);
      }
    } catch (err) {
      console.error('Error al restaurar sesión de usuario:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    email: string, 
    password: string, 
    rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // Simulación de retraso de red suave y realista
    await new Promise(resolve => setTimeout(resolve, 600));

    const cleanEmail = email.trim().toLowerCase();

    // 1. Buscar en cuentas demo predeterminadas
    const foundDemo = DEMO_ACCOUNTS.find(
      acc => acc.usuario.email.toLowerCase() === cleanEmail
    );

    if (foundDemo) {
      if (password && password.length >= 4) {
        const userToSet = foundDemo.usuario;
        setCurrentUser(userToSet);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToSet));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
      }
    }

    // 2. Si es cualquier otro correo pero con contraseña válida de prueba
    if (cleanEmail.includes('@') && password && password.length >= 4) {
      const genericUser: Usuario = {
        id: Math.floor(Math.random() * 9000) + 1000,
        email: cleanEmail,
        nombre: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
        apellido: 'HOA',
        rol: 'Administrador',
        idioma: 'Español',
        status: 'Active',
        created_at: new Date().toISOString()
      };

      setCurrentUser(genericUser);
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(genericUser));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { 
      success: false, 
      error: 'Credenciales no reconocidas. Ingrese un correo y contraseña válidos o elija un acceso rápido.' 
    };
  };

  const quickLoginAs = (rol: RolUsuario) => {
    const target = DEMO_ACCOUNTS.find(a => a.usuario.rol === rol) || DEMO_ACCOUNTS[0];
    setCurrentUser(target.usuario);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(target.usuario));
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
        quickLoginAs,
        logout
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
