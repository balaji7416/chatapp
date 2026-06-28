import { Server } from "socket.io";
import socketAuth from "./middleware/auth.middleware.js";
import { CLIENT, INTERNAL } from "./constants/events.js";
import { removeSession } from "../services/session.service.js";
import connectionHandler from "./handlers/connection.handler.js";
import {
  markMessageAsRead,
  sendMessageHandler,
  typingStartHandler,
  typingStopHandler,
} from "./handlers/message.handler.js";
import { joinChatHandler, leaveChatHanlder } from "./handlers/user.handler.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on(INTERNAL.CONNECTION, async (socket) => {
    console.log(`new connection: ${socket.id} - User: ${socket.user?.username}`);

    // Client emits "connection" as a handshake to join its rooms
    socket.on(INTERNAL.CONNECTION, async (data, callback) => {
      const res = await connectionHandler({ io, socket, data });
      if (callback) callback(res);
    });

    socket.on(CLIENT.SEND_MESSAGE, (data, callback) => {
      const res = sendMessageHandler({ socket, data });
      if (callback) callback(res);
    });

    socket.on(CLIENT.JOIN_CHAT, (data, callback) => {
      const res = joinChatHandler({ io, socket, data });
      if (callback) callback(res);
    });

    socket.on(CLIENT.LEAVE_CHAT, (data, callback) => {
      const res = leaveChatHanlder({ io, socket, data });
      if (callback) callback(res);
    });

    socket.on(CLIENT.TYPING_START, (data, callback) => {
      const res = typingStartHandler({ socket, data });
      if (callback) callback(res);
    });

    socket.on(CLIENT.MARK_MESSAGE_AS_READ, (data, callback) => {
      const res = markMessageAsRead({ io, socket, data });
      if (callback) callback(res);
    });

    socket.on(CLIENT.TYPING_STOP, (data, callback) => {
      const res = typingStopHandler({ socket, data });
      if (callback) callback(res);
    });

    socket.on(INTERNAL.DISCONNECT, async () => {
      console.log(`disconnected: ${socket.id} - User: ${socket.user?.username}`);
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
