// socket/handlers/user.handler.js
import { SERVER } from "../constants/events.js";

/**
 * Handle user joining a chat/conversation
 * - Validates required fields
 * - Joins the conversation room
 * - Notifies other members
 */
const joinChatHandler = async ({ io, socket, data }) => {
  const { conversationId } = data;

  // Validate required fields
  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }

  // Validate user exists
  if (!socket?.user) {
    throw new Error("User not authenticated");
  }

  if (!socket?.user?.id) {
    throw new Error("User ID is missing");
  }

  const userId = socket.user.id;
  const username = socket.user.username;
  const conversationRoom = `conversation:${conversationId}`;

  // Check if user is already in the room
  const rooms = Array.from(socket.rooms);
  if (rooms.includes(conversationRoom)) {
    throw new Error("You are already a member of this conversation");
  }

  // Join the conversation room
  socket.join(conversationRoom);

  // Notify other members in the conversation
  socket.to(conversationRoom).emit(SERVER.CHAT_JOINED, {
    success: true,
    conversationId,
    user: socket.user,
    userId,
    username,
    message: `${username} joined the conversation`,
    joinedAt: new Date().toISOString(),
  });

  // Return flat response
  return {
    conversationId,
    user: socket.user,
    joinedAt: new Date().toISOString(),
  };
};

/**
 * Handle user leaving a chat/conversation
 * - Validates required fields
 * - Leaves the conversation room
 * - Notifies other members
 */
const leaveChatHandler = async ({ io, socket, data }) => {
  const { conversationId } = data;

  // Validate required fields
  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }

  // Validate user exists
  if (!socket?.user) {
    throw new Error("User not authenticated");
  }

  if (!socket?.user?.id) {
    throw new Error("User ID is missing");
  }

  const userId = socket.user.id;
  const username = socket.user.username;
  const conversationRoom = `conversation:${conversationId}`;

  // Check if user is in the room
  const rooms = Array.from(socket.rooms);
  if (!rooms.includes(conversationRoom)) {
    throw new Error("You are not a member of this conversation");
  }

  // Leave the conversation room
  socket.leave(conversationRoom);

  // Notify other members in the conversation
  socket.to(conversationRoom).emit(SERVER.CHAT_LEFT, {
    success: true,
    conversationId,
    user: socket.user,
    message: `${username} left the conversation`,
    leftAt: new Date().toISOString(),
  });

  // Return flat response
  return {
    conversationId,
    userId,
    user: socket.user,
    username,
    leftAt: new Date().toISOString(),
  };
};

export { joinChatHandler, leaveChatHandler };
