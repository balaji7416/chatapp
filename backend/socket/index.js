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
import getUserStatusHandler from "./handlers/user.handler.js";
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

    //on connection
    socketHandler(io, socket, connectionHandler, {
      requestEvent: INTERNAL.CONNECTION,
      responseEvent: "server:connection:response",
    })();

    //message handlers

    //send message
    socket.on(
      CLIENT.SEND_MESSAGE,
      socketHandler(io, socket, sendMessageHandler, {
        requestEvent: CLIENT.SEND_MESSAGE,
        responseEvent: SERVER.NEW_MESSAGE,
      }),
    );

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

    //user handlers
    socket.on(
      CLIENT.GET_USER_STATUS,
      socketHandler(io, socket, getUserStatusHandler, {
        requestEvent: CLIENT.GET_USER_STATUS,
        responseEvent: SERVER.USER_STATUS,
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
