import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './authStore';

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const user = useAuthStore.getState().user;
    if (!user || get().socket?.connected) return;

    const socket = io('', {
      query: {
        userId: user._id,
      },
    });

    socket.on('getOnlineUsers', (users) => {
      set({ onlineUsers: users });
    });

    set({ socket });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));
