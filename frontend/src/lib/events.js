// socket/constants/events.js

// ============================================
// CLIENT EVENTS (Client → Server)
// ============================================
export const CLIENT = {
  // Message events
  MESSAGE_SEND: "client:message:send",
  MESSAGE_READ: "client:message:read",

  // Chat/Conversation events
  CHAT_JOIN: "client:chat:join",
  CHAT_LEAVE: "client:chat:leave",
  CHAT_CREATE: "client:chat:create",

  // Typing events
  TYPING_START: "client:typing:start",
  TYPING_STOP: "client:typing:stop",
};

// ============================================
// SERVER EVENTS (Server → Client)
// ============================================
export const SERVER = {
  // Message events
  MESSAGE_NEW: "server:message:new",
  MESSAGE_READ: "server:message:read",

  // Chat events
  CHAT_JOINED: "server:chat:joined",
  CHAT_LEFT: "server:chat:left",
  CHAT_CREATED: "server:chat:created",

  // Typing events
  TYPING_START: "server:typing:start",
  TYPING_STOP: "server:typing:stop",

  // User presence
  USER_JOINED_CHAT: "server:user:joined-chat",
  USER_LEFT_CHAT: "server:user:left-chat",

  // Session management
  SESSION_EXPIRED: "server:session:expired",

  // System
};

// ============================================
// INTERNAL SOCKET.IO EVENTS (Built-in)
// ============================================
export const INTERNAL = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  // Reconnection events (Client-side only)
  // These are emitted by Socket.IO client during reconnection
  RECONNECT: "reconnect", // Client receives when reconnected
  RECONNECT_ATTEMPT: "reconnect_attempt", // Client receives on each attempt
  RECONNECT_ERROR: "reconnect_error", // Client receives on reconnection error
  RECONNECT_FAILED: "reconnect_failed", // Client receives when max attempts reached
};
