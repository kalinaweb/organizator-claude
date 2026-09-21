import { api } from '@/lib/api';
import type { LoginDto, RegisterDto, AuthTokens, User } from '@todo-app/shared';

export const authApi = {
  async login(credentials: LoginDto): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>('/auth/login', credentials);
    return data;
  },

  async register(userData: RegisterDto): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>('/auth/register', userData);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
