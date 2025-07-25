import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, LoginResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedRole) {
          setToken(savedToken);
          setRole(savedRole);
          
          // Si hay un usuario guardado, usarlo, sino crear uno básico
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (error) {
              console.error('Error parsing saved user:', error);
              // Crear un usuario básico si hay error al parsear
              const userInfo: User = {
                id: 1,
                name: 'Usuario',
                email: 'admin@cucinare.co',
                dni: '',
                phone: '',
                role: savedRole as 'admin' | 'employee',
                status: 'active'
              };
              setUser(userInfo);
              localStorage.setItem('user', JSON.stringify(userInfo));
            }
          } else {
            // Crear un usuario básico con la información del rol
            const userInfo: User = {
              id: 1,
              name: 'Usuario',
              email: 'admin@cucinare.co',
              dni: '',
              phone: '',
              role: savedRole as 'admin' | 'employee',
              status: 'active'
            };
            setUser(userInfo);
            localStorage.setItem('user', JSON.stringify(userInfo));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
      }
      
      // Reducir el tiempo de carga inicial
      setIsLoading(false);
    };

    // Usar un timeout muy corto para asegurar que React termine de inicializar
    const timer = setTimeout(initializeAuth, 10);
    return () => clearTimeout(timer);
  }, []);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setRole(response.rol);
      
      // Crear un usuario básico con la información del rol
      const userInfo: User = {
        id: 1,
        name: 'Usuario',
        email: credentials.email,
        dni: '',
        phone: '',
        role: response.rol as 'admin' | 'employee',
        status: 'active'
      };
      
      setUser(userInfo);
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.rol);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    role,
    login,
    logout,
    isAuthenticated: !!token && !!role,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};