import { create } from 'zustand';
import { authAPI } from './api';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ token, user, isLoading: false });
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ name, email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ token, user, isLoading: false });
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  hydrate: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token });
      authAPI.me()
        .then((response) => {
          set({ user: response.data.user });
        })
        .catch(() => {
          localStorage.removeItem('token');
          set({ token: null, user: null });
        });
    }
  },
}));
