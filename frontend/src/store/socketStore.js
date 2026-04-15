import { create } from "zustand";
import io from "socket.io-client";
import { useAuthStore } from "./authStore.js";
import { INTERNAL } from "../lib/events.js";

const useSocketStore = create((set, get) => ({
  //state
  socket: null,
  isConnected: false,
  connectionError: null,
  isConnecting: false,
  //actions
  connect: () => {
    if (get().isConnecting) {
      console.warn("socket conenction already in progress");
      return;
    }
    set({ isConnecting: true });
    const token = useAuthStore.getState().access_token;
    if (!token) {
      console.error("token not found, cannot initialize socket");
      return null;
    }

    if (get().isConnected) {
      console.log("socket already connected");
      return get().socket;
    }

    //clean up existing socket if it exists
    if (get().socket) {
      console.log(`cleaning up existing socket: ${get().socket.id}`);
      get().socket.removeAllListeners();
      get().socket.disconnect();
      set({ socket: null, isConnected: false });
    }

    console.log("initializing socket");
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("socket connected - ", socket.id);
      //emit to server, to join rooms
      socket.emit(INTERNAL.CONNECTION, {}, (res) => {
        if (res.success) {
          set({ socket, isConnected: true });
          console.log("-----------------");
          //console.log("socket connected to server: ", res.data);
          //console.log("rooms: ", res.data.conversations);
          console.log("session: ", res?.data?.sessionId);
          console.log("-----------------");
        } else {
          console.log("-----------------");
          console.log("socket connection failed: ", res.error);
          console.log("-----------------");
        }
      });
      set({ isConnecting: false });
    });

    socket.on("connect_error", (error) => {
      console.error("socket connect error: ", error);
      set({ isConnected: false, connectionError: error, isConnecting: false });
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
    socket.removeAllListeners();
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
    await new Promise((resolve) => setTimeout(resolve, 200));
    get.connect();
  },
}));

export { useSocketStore };
