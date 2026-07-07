import {
  sendMessageHandler,
  typingStartHandler,
  typingStopHandler,
  markMessageAsRead,
} from "./message.handler.js";
import { joinChatHandler, leaveChatHandler } from "./user.handler.js";
import { CLIENT, SERVER } from "../constants/events.js";

export const mountHandlers = async ({ io, socket }) => {
  // ===== Message Events =====
  socket.on(CLIENT.MESSAGE_SEND, async (data, callback) => {
    try {
      const result = await sendMessageHandler({ socket, data });
      if (callback) {
        callback({ success: true, ...result });
      }
    } catch (error) {
      console.error(`Send message error for ${socket.id}:`, {
        error: error.message,
        userId: socket.user?.id,
        conversationId: data?.conversationId,
      });
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to send message",
        });
      }
    }
  });

  // ===== Typing Events =====
  socket.on(CLIENT.TYPING_START, async (data, callback) => {
    try {
      const result = await typingStartHandler({ socket, data });
      if (callback) {
        callback({ success: true, ...result });
      }
    } catch (error) {
      console.error(`Typing start error for ${socket.id}:`, {
        error: error.message,
        userId: socket.user?.id,
        conversationId: data?.conversationId,
      });
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to send typing status",
        });
      }
    }
  });

  socket.on(CLIENT.TYPING_STOP, async (data, callback) => {
    try {
      const result = await typingStopHandler({ socket, data });
      if (callback) {
        callback({ success: true, ...result });
      }
    } catch (error) {
      console.error(`Typing stop error for ${socket.id}:`, {
        error: error.message,
        userId: socket.user?.id,
        conversationId: data?.conversationId,
      });
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to send typing status",
        });
      }
    }
  });

  // ===== Read Receipts =====
  socket.on(CLIENT.MESSAGE_READ, async (data, callback) => {
    try {
      const result = await markMessageAsRead({ io, socket, data });
      if (callback) {
        callback({ success: true, ...result });
      }
    } catch (error) {
      console.error(`Mark read error for ${socket.id}:`, {
        error: error.message,
        userId: socket.user?.id,
        conversationId: data?.conversationId,
      });
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to mark messages as read",
        });
      }
    }
  });

  // ===== Chat Management =====
  socket.on(CLIENT.CHAT_JOIN, async (data, callback) => {
    try {
      const result = await joinChatHandler({ io, socket, data });
      if (callback) {
        callback({ success: true, ...result });
      }
    } catch (error) {
      console.error(`Join chat error for ${socket.id}:`, {
        error: error.message,
        userId: socket.user?.id,
        conversationId: data?.conversationId,
      });
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to join chat",
        });
      }
    }
  });

  socket.on(CLIENT.CHAT_LEAVE, async (data, callback) => {
    try {
      const result = await leaveChatHandler({ io, socket, data });
      if (callback) {
        callback({ success: true, ...result });
      }
    } catch (error) {
      console.error(`Leave chat error for ${socket.id}:`, {
        error: error.message,
        userId: socket.user?.id,
        conversationId: data?.conversationId,
      });
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to leave chat",
        });
      }
    }
  });
};
