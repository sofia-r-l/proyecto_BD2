// src/stores/auth.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Usuario, LoginData, AuthResponse } from '@/types';
import { authService } from '@/services/auth.service.ts';

export const useAuthStore = defineStore('auth', () => {
    const usuario = ref<Usuario | null>(null);
    const token = ref<string | null>(localStorage.getItem('auth_token'));
    const loading = ref(false);
    const error = ref<string | null>(null);

    const isAuthenticated = ref(!!token.value);

    const login = async (credentials: LoginData) => {
        loading.value = true;
        error.value = null;

        try {
            const response: AuthResponse = await authService.login(credentials);

            token.value = response.token;
            usuario.value = response.usuario;
            isAuthenticated.value = true;

            localStorage.setItem('auth_token', response.token);

            return response;
        } catch (err: any) {
            error.value = err.response?.data?.error || 'Error de autenticación';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const logout = () => {
        usuario.value = null;
        token.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem('auth_token');
    };

    const checkAuth = () => {
        if (token.value) {
            // Podríamos validar el token con el backend
            isAuthenticated.value = true;
        }
    };

    return {
        usuario,
        token,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        checkAuth
    };
});