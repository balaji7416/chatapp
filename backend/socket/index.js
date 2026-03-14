import { Server } from "socket.io";
import socketAuth from "./middleware/auth.middleware.js";
import { INCOMING, OUTGOING, INTERNAL } from "./constants/events.js";
import { createSession, removeSession } from "../services/session.service.js";
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

    //create a user session in the database
    try {
      const session = await createSession(socket.user.id, socket);
    } catch (err) {
      console.log("Error creating session: ", err);
    }

    //mount the socket handlers

    socket.on(INTERNAL.DISCONNECT, async () => {
      console.log(
        `disconnected: ${socket.id} - User: ${socket.user?.username}`,
      );

      //remove session from the database
      try {
        await removeSession(socket.id);
        console.log(`${socket.user.username || socket.id} session removed`);
      } catch (err) {
        console.log("Error removing session: ", err);
      }
    });
  });

  return io;
};

export default initializeSocket;
