import { INTERNAL, SERVER, CLIENT } from "../constants/events.js";
import { findUserConversations } from "../../repositories/conversation.repo.js";
import { createSession } from "../../services/session.service.js";
import SocketError from "../utils/socketError.js";

const connectionHandler = async ({ io, socket, data }) => {
  if (!socket?.user) {
    throw new SocketError(INTERNAL.CONNECTION, 400, "User not found");
  }

  //join personal room
  socket.join(`user:${socket?.user.id}`);

  //get user conversations
  const conversations = await findUserConversations(socket?.user.id);

  //join all conversation rooms
  const joinedRooms = [];
  conversations.forEach((conversation) => {
    socket.join(`conversation:${conversation?.id}`);
    joinedRooms.push(conversation?.id);
  });

  //create user session
  const session = await createSession(socket?.user.id, socket);

  //log successful connection
  console.log(`user ${socket?.user.id} connected`);
  console.log(
    `
    * personal room: user:${socket?.user.id}
    * conversations: ${joinedRooms.length}
    * session id: ${session?.id}
    `,
  );

  //return res (to socketHandler)
  return {
    userId: socket?.user.id,
    conversations: joinedRooms,
    sessionId: session?.id,
  };
};

export default connectionHandler;
