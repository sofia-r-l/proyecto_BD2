import { api } from './api';
import type { LoginData, AuthResponse } from '@/types';

export const authService = {
    async login(credentials: LoginData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    async getProfile(): Promise<any> {
        const response = await api.get('/auth/profile');
        return response.data;
    }
};