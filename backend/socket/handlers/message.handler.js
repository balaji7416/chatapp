import { SERVER } from "../constants/events.js";
import { markMessagesAsReadService } from "../../services/message.service.js";

/**
 * Send a message to a conversation
 * NOTE: This handler only broadcasts the message to the room.
 * Message creation should be handled by REST API.
 */
const sendMessageHandler = async ({ socket, data }) => {
  const {
    conversationId,
    messageId,
    content,
    replyToId = null,
    createdAt,
  } = data;

  // Validate required fields
  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }

  if (!messageId) {
    throw new Error("Message ID is required");
  }

  if (!content || content.trim().length === 0) {
    throw new Error("Message content cannot be empty");
  }

  // Check if user is in the conversation room
  const rooms = Array.from(socket.rooms);
  const conversationRoom = `conversation:${conversationId}`;

  if (!rooms.includes(conversationRoom)) {
    throw new Error("You are not a member of this conversation");
  }

  // Broadcast message to everyone in the conversation
  socket.to(conversationRoom).emit(SERVER.MESSAGE_NEW, {
    success: true,
    messageId,
    conversationId,
    content,
    replyToId,
    userId: socket.user.id,
    username: socket.user.username,
    createdAt: createdAt || new Date().toISOString(),
  });

  // Return flat response
  return {
    messageId,
    conversationId,
    content,
    replyToId,
    userId: socket.user.id,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Handle typing start event
 */
const typingStartHandler = async ({ socket, data }) => {
  const { conversationId, user } = data;

  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }

  // Check if user is in the conversation room
  const rooms = Array.from(socket.rooms);
  const conversationRoom = `conversation:${conversationId}`;

  if (!rooms.includes(conversationRoom)) {
    throw new Error("You are not a member of this conversation");
  }

  // Broadcast typing start to everyone in the conversation
  socket.to(conversationRoom).emit(SERVER.TYPING_START, {
    success: true,
    conversationId,
    user,
    timestamp: new Date().toISOString(),
  });

  // Return flat response
  return {
    conversationId,
    userId: socket.user.id,
    username: socket.user.username,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Handle typing stop event
 */
const typingStopHandler = async ({ socket, data }) => {
  const { conversationId } = data;

  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }

  // Check if user is in the conversation room
  const rooms = Array.from(socket.rooms);
  const conversationRoom = `conversation:${conversationId}`;

  if (!rooms.includes(conversationRoom)) {
    throw new Error("You are not a member of this conversation");
  }

  // Broadcast typing stop to everyone in the conversation
  socket.to(conversationRoom).emit(SERVER.TYPING_STOP, {
    success: true,
    conversationId,
    userId: socket.user.id,
    username: socket.user.username,
    timestamp: new Date().toISOString(),
  });

  // Return flat response
  return {
    conversationId,
    userId: socket.user.id,
    username: socket.user.username,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Mark messages as read in a conversation
 */
const markMessageAsRead = async ({ io, socket, data }) => {
  const { conversationId } = data;

  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }

  // Check if user is in the conversation room
  const rooms = Array.from(socket.rooms);
  const conversationRoom = `conversation:${conversationId}`;

  if (!rooms.includes(conversationRoom)) {
    throw new Error("You are not a member of this conversation");
  }

  // Mark messages as read in database
  const result = await markMessagesAsReadService(
    conversationId,
    socket.user.id,
  );

  // Broadcast to everyone in the conversation that this user read messages
  io.to(conversationRoom).emit(SERVER.MESSAGE_READ, {
    success: true,
    conversationId,
    userId: socket.user.id,
    username: socket.user.username,
    lastReadAt:
      result?.last_read_at || result?.lastReadAt || new Date().toISOString(),
  });

  // Return flat response
  return {
    conversationId,
    userId: socket.user.id,
    username: socket.user.username,
    lastReadAt: result?.lastReadAt || new Date().toISOString(),
    messageId,
  };
};

export {
  sendMessageHandler,
  typingStartHandler,
  typingStopHandler,
  markMessageAsRead,
};
