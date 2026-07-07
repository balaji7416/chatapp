import { Server } from "socket.io";
import socketAuth from "./middleware/auth.middleware.js";
import { CLIENT, INTERNAL } from "./constants/events.js";
import { removeSession } from "../services/session.service.js";
import connectionHandler from "./handlers/connection.handler.js";
import { mountHandlers } from "./handlers/mountHandlers.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on(INTERNAL.CONNECTION, async (socket) => {
    console.log(
      `new connection: ${socket.id} - User: ${socket.user?.username}`,
    );

    try {
      // Initialize connection - create user session, join user rooms
      await connectionHandler({ io, socket });

      // Send connection success to client
      socket.emit(INTERNAL.CONNECTED, {
        success: true,
        userId: socket.user.id,
        username: socket.user.username,
        sessionId: socket.sessionId,
        joinedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Connection failed for ${socket.id}:`, error);
      socket.emit(INTERNAL.CONNECTED, {
        success: false,
        error: error.message || "Connection failed",
      });
      socket.disconnect(true);
      return;
    }

    // mount handlers
    mountHandlers({ io, socket });

    // ===== Disconnect =====
    socket.on(INTERNAL.DISCONNECT, async () => {
      console.log(
        `disconnected: ${socket.id} - User: ${socket.user?.username}`,
      );
      try {
        await removeSession(socket.id);
        console.log(`${socket.user?.username || socket.id} session removed`);
      } catch (err) {
        console.error("Error removing session: ", err);
      }
    });
  });

  return io;
};

export default initializeSocket;
