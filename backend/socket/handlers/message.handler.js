import SocketError from "../utils/socketError.js";
import { CLIENT, SERVER } from "../constants/events.js";
import {
  sendMessageService,
  deleteMessageService,
  markMessagesAsReadService,
} from "../../services/message.service.js";

const sendMessageHandler = ({ io, socket, data }) => {
  const { conversationId, messageId, content, replyToId = null } = data;

  if (!conversationId) {
    return {
      success: false,
      error: "conversation id is required",
    };
  }

  //send to everyone in the room except the sender
  socket.to(`conversation:${conversationId}`).emit(SERVER.NEW_MESSAGE, {
    success: true,
    data: {
      messageId,
      conversationId,
      content,
      replyToId,
      senderId: socket.user.id,
      createdAt: new Date().toISOString(),
    },
  });

  // for sender's callback
  return {
    success: true,
    data: {
      messageId,
      content: content,
      createdAt: new Date().toISOString(),
    },
  };
};

const deleteMessageHandler = async ({ io, socket, data }) => {
  const { conversationId, messageId } = data;

  if (!messageId) {
    throw new SocketError(
      CLIENT.DELETE_MESSAGE,
      400,
      "message id is required",
      "VALIDATION_ERROR",
    );
  }

  //delete message from database
  await deleteMessageService(messageId, socket?.user.id);

  return {
    room: `conversation:${conversationId}`,
    id: messageId,
    message: "message deleted",
  };
};

const markMessageAsRead = async ({ io, socket, data }) => {
  const { conversationId } = data;

  if (!conversationId) {
    throw new SocketError(CLIENT.MARK_READ, 400, "conversation id is required");
  }

  //mark message as read
  await markMessagesAsReadService(conversationId, socket?.user.id);

  return {
    room: `conversation:${conversationId}`,

    id: conversationId,
    conversationId: conversationId,
    userId: socket?.user?.id,
    message: "messages marked as read",
  };
};

const typingStartHandler = async ({ io, socket, data }) => {
  const { conversationId } = data;

  return {
    room: `conversation:${conversationId}`,

    conversationId: conversationId,
    userId: socket?.user?.id,
    message: "started typing",
  };
};

const typingStopHandler = async ({ io, socket, data }) => {
  const { conversationId } = data;
  return {
    room: `conversation:${conversationId}`,
    conversationId: conversationId,
    userId: socket?.user?.id,
    message: "stopped typing",
  };
};

export {
  sendMessageHandler,
  deleteMessageHandler,
  markMessageAsRead,
  typingStartHandler,
  typingStopHandler,
};
