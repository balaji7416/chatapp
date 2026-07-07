// stores/socketStore.js
import { create } from "zustand";
import { io } from "socket.io-client";
import { useAuthStore } from "./authStore.js";
import { CLIENT, SERVER, INTERNAL } from "../lib/events.js";

// Connection states
const ConnectionState = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
  ERROR: "error",
};

export const useSocketStore = create((set, get) => ({
  // ===== State =====
  socket: null,
  connectionState: ConnectionState.DISCONNECTED,
  connectionError: null,
  sessionId: null,
  userId: null,

  // ===== Actions =====
  connect: () => {
    const state = get().connectionState;

    // Prevent duplicate connections
    if (
      state === ConnectionState.CONNECTING ||
      state === ConnectionState.RECONNECTING
    ) {
      console.warn("[Socket] Connection already in progress");
      return;
    }

    if (state === ConnectionState.CONNECTED && get().socket?.connected) {
      console.log("[Socket] Already connected");
      return get().socket;
    }

    // Get token
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      console.error("[Socket] No access token available");
      set({
        connectionState: ConnectionState.ERROR,
        connectionError: "No access token available",
      });
      return;
    }

    // Clean up existing socket
    get().cleanup();

    console.log("[Socket] Initializing connection...");
    set({
      connectionState: ConnectionState.CONNECTING,
      connectionError: null,
    });

    // Create socket
    const socket_url = import.meta.env.VITE_SOCKET_URL || "/"; //for docker
    // import.meta.env.VITE_ENV === "development"
    //   ? "/api"
    //   : import.meta.env.VITE_SOCKET_URL;
    const socket = io(socket_url, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    // Store socket reference
    set({ socket });

    console.log("reached till here");
    // Set up listeners
    setupSocketListeners(socket);
  },

  cleanup: () => {
    const { socket } = get();
    if (socket) {
      console.log("[Socket] Cleaning up...");
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null });
    }
  },

  disconnect: () => {
    const { socket, connectionState } = get();
    if (!socket || connectionState === ConnectionState.DISCONNECTED) return;

    console.log("[Socket] Manual disconnect");
    socket.removeAllListeners();
    socket.disconnect();
    set({
      socket: null,
      connectionState: ConnectionState.DISCONNECTED,
      connectionError: null,
      sessionId: null,
      userId: null,
    });
  },

  // ===== Emit Methods =====

  // Fire-and-forget emit
  emit: (event, data) => {
    const { socket, connectionState } = get();
    if (!socket || connectionState !== ConnectionState.CONNECTED) {
      console.warn(`[Socket] Cannot emit "${event}" - not connected`);
      return false;
    }
    socket.emit(event, data);
    return true;
  },

  // Promise-based emit with acknowledgment
  emitWithAck: (event, data, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const { socket, connectionState } = get();

      if (!socket || connectionState !== ConnectionState.CONNECTED) {
        reject(new Error("Socket not connected"));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error(`Event "${event}" timed out after ${timeout}ms`));
      }, timeout);

      socket.emit(event, data, (response) => {
        clearTimeout(timeoutId);
        if (response?.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || `Event "${event}" failed`));
        }
      });
    });
  },

  // ===== Event Listeners =====
  on: (event, callback) => {
    const { socket } = get();
    if (!socket) {
      console.warn(`[Socket] Cannot listen to "${event}" - no socket`);
      return () => {};
    }

    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  },

  off: (event, callback) => {
    const { socket } = get();
    if (!socket) return;
    socket.off(event, callback);
  },

  // ===== Reconnection =====
  reconnect: () => {
    const { connectionState } = get();
    if (connectionState === ConnectionState.RECONNECTING) return;

    console.log("[Socket] Manual reconnection...");
    set({ connectionState: ConnectionState.RECONNECTING });

    // Clean up and reconnect
    get().cleanup();
    setTimeout(() => {
      get().connect();
    }, 500);
  },

  // ===== Getters =====
  isReady: () => {
    return get().connectionState === ConnectionState.CONNECTED;
  },

  getConnectionState: () => get().connectionState,
}));

// ============================================
// Socket Listeners Setup
// ============================================
const setupSocketListeners = (socket) => {
  const store = useSocketStore;
  console.log("[Socket] Setting up listeners...");
  // ---- Connection Events ----
  socket.on(INTERNAL.CONNECTION, () => {
    console.log(`[Socket] TCP connected: ${socket.id}`);
    // Wait for server acknowledgment (INTERNAL.CONNECTED)
  });

  socket.on(INTERNAL.CONNECTED, (data) => {
    if (data.success) {
      console.log(`[Socket] ✅ Fully connected - Session: ${data.sessionId}`);
      store.setState({
        connectionState: ConnectionState.CONNECTED,
        connectionError: null,
        sessionId: data.sessionId,
        userId: data.userId,
      });
    } else {
      console.error(`[Socket] ❌ Connection rejected: ${data.error}`);
      store.setState({
        connectionState: ConnectionState.ERROR,
        connectionError: data.error,
      });
      socket.disconnect(true);
    }
  });

  socket.on(INTERNAL.CONNECT_ERROR, (error) => {
    console.error(`[Socket] Connection error: ${error.message}`);
    store.setState({
      connectionState: ConnectionState.ERROR,
      connectionError: error.message,
    });
  });

  // ---- Disconnection ----
  socket.on(INTERNAL.DISCONNECT, (reason) => {
    console.log(`[Socket] Disconnected: ${reason}`);

    if (reason === "io server disconnect") {
      // Server forced disconnect - don't auto-reconnect
      store.setState({
        connectionState: ConnectionState.DISCONNECTED,
        socket: null,
        sessionId: null,
        userId: null,
      });
    } else if (reason === "transport close" || reason === "transport error") {
      // Transport issues - let Socket.IO handle reconnection
      store.setState({
        connectionState: ConnectionState.RECONNECTING,
      });
    } else {
      // Other disconnects
      store.setState({
        connectionState: ConnectionState.DISCONNECTED,
      });
    }
  });

  // ---- Reconnection Events ----
  socket.on(INTERNAL.RECONNECT, (attemptNumber) => {
    console.log(`[Socket] Reconnected after ${attemptNumber} attempts`);
    store.setState({
      connectionState: ConnectionState.CONNECTING,
    });
  });

  socket.on(INTERNAL.RECONNECT_ATTEMPT, (attemptNumber) => {
    console.log(`[Socket] Reconnection attempt ${attemptNumber}`);
    store.setState({
      connectionState: ConnectionState.RECONNECTING,
    });
  });

  socket.on(INTERNAL.RECONNECT_ERROR, (error) => {
    console.error(`[Socket] Reconnection error: ${error.message}`);
  });

  socket.on(INTERNAL.RECONNECT_FAILED, () => {
    console.error("[Socket] Reconnection failed - max attempts reached");
    store.setState({
      connectionState: ConnectionState.ERROR,
      connectionError: "Reconnection failed after maximum attempts",
    });
  });

  // ---- Error Events ----
  socket.on(SERVER.ERROR, (data) => {
    console.error(`[Socket] Server error:`, data);
    // Don't change connection state - just log
  });
};

// Export connection state for use in components
export { ConnectionState };
export default useSocketStore;
