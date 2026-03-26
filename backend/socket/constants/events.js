// socket/constants/events.js

// Events client sends to server
export const CLIENT = {
  // Message events
  SEND_MESSAGE: "client:message:send",
  EDIT_MESSAGE: "client:message:edit",
  DELETE_MESSAGE: "client:message:delete",
  MARK_READ: "client:message:read",

  // Chat/conversation events
  JOIN_CHAT: "client:chat:join",
  LEAVE_CHAT: "client:chat:leave",
  CREATE_CHAT: "client:chat:create",

  // Typing events
  TYPING_START: "client:typing:start",
  TYPING_STOP: "client:typing:stop",

  // User events
  GET_ONLINE_USERS: "client:users:online:get",
  GET_USER_STATUS: "client:user:status:get",
};

// Events server sends to client
export const SERVER = {
  // Message events
  NEW_MESSAGE: "server:message:new",
  MESSAGE_EDITED: "server:message:edited",
  MESSAGE_DELETED: "server:message:deleted",
  MESSAGE_READ: "server:message:read",

  // Chat events
  CHAT_JOINED: "server:chat:joined",
  CHAT_LEFT: "server:chat:left",
  CHAT_CREATED: "server:chat:created",

  // Typing events
  TYPING_START: "server:typing:start",
  TYPING_STOP: "server:typing:stop",

  // User presence
  USER_ONLINE: "server:user:online",
  USER_OFFLINE: "server:user:offline",
  USERS_ONLINE: "server:users:online", // List
  USER_STATUS: "server:user:status", // Object

  // System
  SESSION_EXPIRED: "server:session:expired",
  ERROR: "server:error",
};

// Internal Socket.IO events
export const INTERNAL = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
};
