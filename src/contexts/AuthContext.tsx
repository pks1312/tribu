import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api/config';
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
    // Intentar obtener el usuario actual desde el backend
    const loadUser = async () => {
      try {
        const response = await api.get('/accounts/users/me/');
        if (response.data && response.data.id) {
          const userData: User = {
            id: response.data.id.toString(),
            email: response.data.email,
            displayName: response.data.first_name || response.data.username,
            role: response.data.profile?.role || 'client',
            active: true
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Login con el backend Django (acepta email o username)
      const response = await api.post('/accounts/users/login/', {
        email: email,  // El backend acepta tanto 'email' como 'username'
        password: password
      });
      
      if (response.data && response.data.user) {
        const userData: User = {
          id: response.data.user.id.toString(),
          email: response.data.user.email,
          displayName: response.data.user.first_name || response.data.user.username,
          role: response.data.user.profile?.role || 'client',
          active: true
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.detail || 'Error al iniciar sesión');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post('/accounts/users/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.get('/accounts/users/me/');
      if (response.data && response.data.id) {
        const userData: User = {
          id: response.data.id.toString(),
          email: response.data.email,
          displayName: response.data.first_name || response.data.username,
          role: response.data.profile?.role || 'client',
          active: true
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
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
