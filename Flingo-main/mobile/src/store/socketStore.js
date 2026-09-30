import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './authStore';
import { getApiBaseUrl } from '../api/config';

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: async () => {
    const user = useAuthStore.getState().user;
    if (!user || get().socket?.connected) return;

    const baseUrl = await getApiBaseUrl();

    try {
      const socket = io(baseUrl, {
        query: {
          userId: user._id,
        },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        // Connected
      });

      socket.on('getOnlineUsers', (users) => {
        set({ onlineUsers: users || [] });
      });

      set({ socket });
    } catch (e) {
      console.warn('Socket connection error', e);
    }
  },

  disconnectSocket: () => {
    const current = get().socket;
    if (current?.connected) {
      current.disconnect();
    }
    set({ socket: null, onlineUsers: [] });
  },
}));
