// socket/constants/events.js

// Events client sends to server
export const CLIENT = {
  // Message events
  SEND_MESSAGE: "client:message:send",

  // Chat/conversation events
  JOIN_CHAT: "client:chat:join",
  LEAVE_CHAT: "client:chat:leave",
  CREATE_CHAT: "client:chat:create",

  // Typing events
  TYPING_START: "client:typing:start",
  TYPING_STOP: "client:typing:stop",

  MARK_MESSAGE_AS_READ: "client:message:read",
};

// Events server sends to client
export const SERVER = {
  // Message events
  NEW_MESSAGE: "server:message:new",
  MARK_MESSAGE_AS_READ: "server:message:read",

  // Chat events
  CHAT_JOINED: "server:chat:joined",
  CHAT_LEFT: "server:chat:left",

  // Typing events
  TYPING_START: "server:typing:start",
  TYPING_STOP: "server:typing:stop",

  // System
  SESSION_EXPIRED: "server:session:expired",
};

// Internal Socket.IO events
export const INTERNAL = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
};
