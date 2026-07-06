import { SERVER } from "../constants/events.js";
import {
  markMessagesAsReadService,
} from "../../services/message.service.js";

const sendMessageHandler = ({ socket, data }) => {
  const { conversationId, messageId, content, replyToId = null, created_at } = data;

  if (!conversationId) {
    return {
      success: false,
      error: "conversation id is required",
    };
  }

  socket.to(`conversation:${conversationId}`).emit(SERVER.NEW_MESSAGE, {
    success: true,
    data: {
      messageId,
      conversationId,
      content,
      replyToId,
      user_id: socket.user.id,
      created_at: created_at || new Date().toISOString(),
    },
  });

  return {
    success: true,
    data: {
      messageId,
      content,
      createdAt: new Date().toISOString(),
    },
  };
};

const typingStartHandler = ({ socket, data }) => {
  const { conversationId, user } = data;
  if (!conversationId) {
    return {
      success: false,
      error: "conversation id is required",
    };
  }

  socket.to(`conversation:${conversationId}`).emit(SERVER.TYPING_START, {
    success: true,
    data: {
      conversationId,
      user,
      message: `${user?.username} started typing`,
    },
  });

  return {
    success: true,
    data: {
      conversationId,
      message: "started typing",
    },
  };
};

const typingStopHandler = ({ socket, data }) => {
  const { conversationId, user } = data;
  if (!conversationId) {
    return {
      success: false,
      error: "conversation id is required",
    };
  }

  socket.to(`conversation:${conversationId}`).emit(SERVER.TYPING_STOP, {
    success: true,
    data: {
      conversationId,
      user,
      message: `${user?.username} stopped typing`,
    },
  });

  return {
    success: true,
    data: {
      conversationId,
      message: "stopped typing",
    },
  };
};

const markMessageAsRead = async ({ io, socket, data }) => {
  const { conversationId } = data;

  if (!conversationId) {
    throw new Error("conversation id is required");
  }

  const result = await markMessagesAsReadService(conversationId, socket?.user.id);

  io.to(`conversation:${conversationId}`).emit(SERVER.MARK_MESSAGE_AS_READ, {
    success: true,
    data: {
      conversationId,
      user_id: socket?.user?.id,
      last_read_at: result?.last_read_at,
      message: "messages marked as read",
    },
  });

  return {
    conversationId,
    userId: socket?.user?.id,
    last_read_at: result?.last_read_at,
    message: "messages marked as read",
  };
};

export {
  sendMessageHandler,
  markMessageAsRead,
  typingStartHandler,
  typingStopHandler,
};
