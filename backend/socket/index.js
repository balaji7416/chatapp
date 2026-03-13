import { Server } from "socket.io";
import socketAuth from "./middleware/auth.middleware.js";
import { INCOMING, OUTGOING, INTERNAL } from "./constants/events.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on(INTERNAL.CONNECTION, (socket) => {
    console.log(
      `new connection: ${socket.id} - User: ${socket.user?.username}`,
    );

    //mount the socket handlers

    socket.on(INTERNAL.DISCONNECT, () => {
      console.log(
        `disconnected: ${socket.id} - User: ${socket.user?.username}`,
      );
    });
  });

  return io;
};

export default initializeSocket;
