import io from "socket.io-client";
import { useAuthStore } from "../store/auth.store.js";

let socket = null;

const initializeSocket = () => {
  const token = useAuthStore.getState().access_token;

  if (!token) {
    console.error("token not found, cannot initialize socket");
    return null;
  }

  if (socket) {
    return socket;
  }

  socket = io("http://localhost:5000", {
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("socket connected - ", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("socket connect error: ", error);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected - ", socket.id);
  });

  return socket;
};

const getSocket = () => socket;

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { initializeSocket, getSocket, disconnectSocket };
