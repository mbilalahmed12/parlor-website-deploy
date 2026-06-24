import { create } from 'zustand';
import { authAPI } from './api';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      const token = data?.token || null;
      const userProfile = data?.user || null;
      set({
        session: null,
        token,
        user: userProfile,
        isLoading: false,
      });
      if (typeof window !== 'undefined') {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
      }
      return userProfile;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (fullName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.register({ name: fullName, email, password });
      const token = data?.token || null;
      const userProfile = data?.user || null;
      set({
        session: null,
        token,
        user: userProfile,
        isLoading: false,
      });
      if (typeof window !== 'undefined') {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
      }
      return userProfile;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ user: null, session: null, token: null });
      if (typeof window !== 'undefined') localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Initialize auth state on app load
  hydrate: async () => {
    set({ isLoading: true });
    try {
      if (typeof window === 'undefined') {
        set({ session: null, token: null, isLoading: false });
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        set({ session: null, token: null, user: null, isLoading: false });
        return;
      }

      set({ token, session: null });

      const response = await authAPI.me();
      const userProfile = response?.data?.user || null;
      if (userProfile) {
        set({ user: userProfile, session: null, token, isLoading: false });
      } else {
        set({ user: null, session: null, token, isLoading: false });
      }
    } catch (error) {
      console.error('Hydrate error:', error);
      set({ session: null, token: localStorage.getItem('token'), user: null, isLoading: false });
    }
  },
}));
