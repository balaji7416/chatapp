import { Server } from "socket.io";
import socketAuth from "./middleware/auth.middleware.js";
import { CLIENT, SERVER, INTERNAL } from "./constants/events.js";
import { createSession, removeSession } from "../services/session.service.js";
import connectionHandler from "./handlers/connection.handler.js";
import socketHandler from "./utils/socketHanlder.js";
import {
  sendMessageHandler,
  deleteMessageHandler,
  markMessageAsRead,
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
    console.log(
      `new connection: ${socket.id} - User: ${socket.user?.username}`,
    );

    socket.on(INTERNAL.CONNECTION, async (data, callback) => {
      const res = await connectionHandler({ io, socket, data });
      if (callback) callback(res);
    });

    socket.on(CLIENT.SEND_MESSAGE, (data, callback) => {
      const res = sendMessageHandler({ io, socket, data });
      if (callback) callback(res);
    });

    socket.on(CLIENT.JOIN_CHAT, (data, callback) => {
      //console.log(`join chat: ${data}`);
      const res = joinChatHandler({ io, socket, data });
      if (callback) callback(res);
    });

    socket.on(CLIENT.LEAVE_CHAT, (data, callback) => {
      //console.log(`leave chat: ${data}`);
      //console.log(data);
      const res = leaveChatHanlder({ io, socket, data });
      if (callback) callback(res);
    });

    //delete message
    socket.on(
      CLIENT.DELETE_MESSAGE,
      socketHandler(io, socket, deleteMessageHandler, {
        requestEvent: CLIENT.DELETE_MESSAGE,
        responseEvent: SERVER.MESSAGE_DELETED,
      }),
    );

    //mark messaged as read
    socket.on(
      CLIENT.MARK_READ,
      socketHandler(io, socket, markMessageAsRead, {
        requestEvent: CLIENT.MARK_READ,
        responseEvent: SERVER.MESSAGE_READ,
      }),
    );

    socket.on(
      CLIENT.TYPING_START,
      socketHandler(io, socket, typingStartHandler, {
        requestEvent: CLIENT.TYPING_START,
        responseEvent: SERVER.TYPING_START,
      }),
    );

    socket.on(
      CLIENT.TYPING_STOP,
      socketHandler(io, socket, typingStopHandler, {
        requestEvent: CLIENT.TYPING_STOP,
        responseEvent: SERVER.TYPING_STOP,
      }),
    );

    //on disconnect
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
