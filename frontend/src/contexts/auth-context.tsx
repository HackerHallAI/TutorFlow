'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginRequest, RegisterRequest, AuthContextType } from '@/types/auth';
import { authApi, userApi } from '@/lib/api';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token and validate it
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const currentUser = await userApi.getCurrentUser();
          setUser(currentUser);
        }
      } catch {
        // Token is invalid, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      
      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Create user object from response
      const user: User = {
        id: response.user_id,
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
        role: response.role,
        is_active: true, // Assuming active if login successful
        created_at: new Date().toISOString(), // Will be updated by getCurrentUser
        updated_at: new Date().toISOString(),
      };
      
      setUser(user);
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);
      
      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Create user object from response
      const user: User = {
        id: response.user_id,
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
        role: response.role,
        is_active: true, // Assuming active if registration successful
        created_at: new Date().toISOString(), // Will be updated by getCurrentUser
        updated_at: new Date().toISOString(),
      };
      
      setUser(user);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken(refreshToken);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Create user object from response data
      const user: User = {
        id: response.user_id,
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
        role: response.role,
        is_active: true, // Assuming active if refresh successful
        created_at: new Date().toISOString(), // Will be updated by getCurrentUser if needed
        updated_at: new Date().toISOString(),
      };
      
      setUser(user);
    } catch (error) {
      // Refresh failed, logout user
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 