import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'ADMIN' | 'MEMBER') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Silent token verification on reload
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('ethara_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Call the real endpoint to resolve profile details
        const response = await api.get<{ status: string; data: { user: User } }>('/auth/me');
        if (response.status === 'success' && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('ethara_user', JSON.stringify(response.data.user));
        } else {
          logout();
        }
      } catch (error) {
        console.error('Session authentication failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  /**
   * Log into a user session via real backend API
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.post<{ 
        status: string; 
        data: { user: User; token: string } 
      }>('/auth/login', { email, password });

      const { user: userData, token } = response.data;

      localStorage.setItem('ethara_token', token);
      localStorage.setItem('ethara_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register a new user session via real backend API
   */
  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'ADMIN' | 'MEMBER'
  ): Promise<void> => {
    try {
      const response = await api.post<{ 
        status: string; 
        data: { user: User; token: string } 
      }>('/auth/signup', { name, email, password, role });

      const { user: userData, token } = response.data;

      localStorage.setItem('ethara_token', token);
      localStorage.setItem('ethara_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Log out current session
   */
  const logout = () => {
    localStorage.removeItem('ethara_token');
    localStorage.removeItem('ethara_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
