import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types/user';

interface AuthContextType {
  user: User | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isWorker: boolean;
  isClient: boolean;
  hasRole: (role: UserRole) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Simulación de login - En producción esto debe conectarse al backend Django
    // TODO: Implementar autenticación con Django REST Framework
    
    // Usuario admin de prueba
    if (email === 'admin@tribu.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        email: 'admin@tribu.com',
        displayName: 'Administrador',
        role: 'admin',
        active: true
      };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return;
    }
    
    // Usuario cliente de prueba
    const clientUser: User = {
      id: Date.now().toString(),
      email,
      displayName: email.split('@')[0],
      role: 'client',
      active: true
    };
    setUser(clientUser);
    localStorage.setItem('user', JSON.stringify(clientUser));
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const refreshProfile = useCallback(async () => {
    // Recargar perfil desde localStorage o backend
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const isWorker = user?.role === 'worker';
  const isClient = user?.role === 'client' || !user;

  const hasRole = useCallback((role: UserRole) => {
    return user?.role === role;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile: user,
        loading,
        signIn,
        signOut,
        isAdmin,
        isWorker,
        isClient,
        hasRole,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
