import { create } from "zustand";
import io from "socket.io-client";
import { useAuthStore } from "./authStore.js";
import { INTERNAL } from "../lib/events.js";
const useSocketStore = create((set, get) => ({
  //state
  socket: null,
  isConnected: false,
  connectionError: null,

  //actions
  connect: () => {
    const token = useAuthStore.getState().access_token;
    if (!token) {
      console.error("token not found, cannot initialize socket");
      return null;
    }

    if (get().socket) {
      console.log("socket already connected");
      return get().socket;
    }

    console.log("initializing socket");
    const socket = io("http://localhost:5000", {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("socket connected - ", socket.id);
      //emit to server, to join rooms
      socket.emit(INTERNAL.CONNECTION, {}, (res) => {
        console.log("connection response: ", res);
      });
      set({ socket, isConnected: true });
    });

    socket.on("connect_error", (error) => {
      console.error("socket connect error: ", error);
      set({ isConnected: false, connectionError: error });
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected - ", socket.id);
      set({ socket: null, isConnected: false, connectionError: null });
    });
  },

  disconnect: () => {
    const socket = get().socket;
    if (!socket) return;

    console.log("manually disconnecting socket");
    socket.disconnect();
    set({ isConnected: false, socket: null, connectionError: null });
  },

  emit: (event, data) => {
    const socket = get().socket;
    if (!socket) {
      console.warn(`cannot emit ${event} - socket not connected`);
      return false;
    }
    socket.emit(event, data);
    return true;
  },

  on: (event, callback) => {
    const socket = get().socket;
    if (!socket) {
      console.warn(`cannot on ${event} - socket not connected`);
      return () => {};
    }

    socket.on(event, callback);

    // return cleanup function
    return () => {
      socket.off(event, callback);
    };
  },

  off: (event, callback) => {
    const socket = get().socket;
    if (!socket) return;
    socket.off(event, callback);
  },

  forceReconnect: async () => {
    const socket = get().socket;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
    set({ socket: null, isConnected: false, connectionError: null });
    await new Promise(() => setTimeout(() => 200));
    get.connect();
  },
}));

export { useSocketStore };
