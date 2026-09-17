"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/authApi';
import type { LoginDto, RegisterDto } from '@todo-app/shared';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (credentials: LoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const { accessToken } = await authApi.login(credentials);
      localStorage.setItem('token', accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const { accessToken } = await authApi.register(userData);
      localStorage.setItem('token', accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return { login, register, logout, isLoading, error };
};
