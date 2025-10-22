import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean, twoFactorCode?: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (accessToken) {
        refreshToken();
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  async function fetchCurrentUser() {
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setAccessToken(null);
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string, rememberMe = false, twoFactorCode?: string) {
    const res = await apiRequest('POST', '/api/auth/login', { email, password, rememberMe, twoFactorCode });
    const data = await res.json();

    if (data.requiresTwoFactor) {
      return data;
    }

    setAccessToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('accessToken', data.accessToken);
    queryClient.invalidateQueries();

    return data;
  }

  async function register(userData: any) {
    const res = await apiRequest('POST', '/api/auth/register', userData);
    const data = await res.json();
    return data;
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      queryClient.clear();
    }
  }

  async function refreshToken() {
    try {
      const res = await apiRequest('POST', '/api/auth/refresh', undefined);
      const data = await res.json();
      setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
