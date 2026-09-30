import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('@flingo_jwt_token');
      const savedUser = await AsyncStorage.getItem('@flingo_user');

      if (token && savedUser) {
        set({
          token,
          user: JSON.parse(savedUser),
          isAuthenticated: true,
          isLoading: false,
        });

        // Background refresh profile from server
        try {
          const freshUser = await apiClient('/api/auth/me');
          if (freshUser && freshUser._id) {
            await AsyncStorage.setItem('@flingo_user', JSON.stringify(freshUser));
            set({ user: freshUser });
          }
        } catch (err) {
          if (err.status === 401) {
            // Token expired or invalid
            await get().logout();
          }
        }
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.warn('checkAuth error:', error);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const data = await apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      await AsyncStorage.setItem('@flingo_jwt_token', data.token);
    }
    await AsyncStorage.setItem('@flingo_user', JSON.stringify(data));

    set({
      user: data,
      token: data.token || null,
      isAuthenticated: true,
      isLoading: false,
    });
    return data;
  },

  register: async (name, username, email, password) => {
    const data = await apiClient('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, email, password }),
    });

    if (data.token) {
      await AsyncStorage.setItem('@flingo_jwt_token', data.token);
    }
    await AsyncStorage.setItem('@flingo_user', JSON.stringify(data));

    set({
      user: data,
      token: data.token || null,
      isAuthenticated: true,
      isLoading: false,
    });
    return data;
  },

  updateUser: async (updatedData) => {
    const currentUser = get().user;
    const merged = { ...currentUser, ...updatedData };
    await AsyncStorage.setItem('@flingo_user', JSON.stringify(merged));
    set({ user: merged });
  },

  logout: async () => {
    try {
      await apiClient('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      await AsyncStorage.removeItem('@flingo_jwt_token');
      await AsyncStorage.removeItem('@flingo_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
