import { SERVER } from "../constants/events.js";

const joinChatHandler = async ({ io, socket, data }) => {
  const { conversationId, user } = data;
  socket.join(`conversation:${conversationId}`);
  socket.to(`conversation:${conversationId}`).emit(SERVER.CHAT_JOINED, {
    success: true,
    data: {
      conversationId,
      user,
      message: `${socket?.user?.username} joined chat`,
    },
  });
  return {
    success: true,
    data: {
      conversationId,
      message: "joined conversation",
    },
  };
};

const leaveChatHanlder = async ({ io, socket, data }) => {
  const { conversationId } = data;
  const user = socket?.user;
  socket.leave(`conversation:${conversationId}`);
  socket.to(`conversation:${conversationId}`).emit(SERVER.CHAT_LEFT, {
    success: true,
    data: {
      conversationId,
      user,
      message: `${user?.username} left chat`,
    },
  });
  return {
    success: true,
    data: {
      conversationId,
      message: "left conversation",
    },
  };
};

export { joinChatHandler, leaveChatHanlder };
