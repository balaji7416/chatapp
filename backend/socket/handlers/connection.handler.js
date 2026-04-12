import { findUserConversations } from "../../repositories/conversation.repo.js";
import { createSession } from "../../services/session.service.js";

const connectionHandler = async ({ io, socket, data }) => {
  //validation
  if (!socket?.user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  try {
    //join personal room
    socket.join(`user:${socket?.user.id}`);

    //get user conversations
    const conversations = await findUserConversations(socket?.user.id);

    //join all conversation rooms
    const joinedRooms = [];
    conversations.forEach((conversation) => {
      socket.join(`conversation:${conversation?.id}`);
      joinedRooms.push(conversation?.name);
    });

    //create user session
    const session = await createSession(socket?.user.id, socket);

    //log successful connection
    console.log(`user ${socket?.user.id} connected`);
    console.log(`rooms: ${joinedRooms.length}\tSession: ${session?.id}`);

    return {
      success: true,
      data: {
        userId: socket?.user.id,
        conversations: joinedRooms,
        sessionId: session?.id,
      },
    };
  } catch (error) {
    console.error("Error in connection handler: ", error);
    return {
      success: false,
      error: error.message || "connection failed",
    };
  }
};

export default connectionHandler;
