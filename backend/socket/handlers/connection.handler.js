// socket/handlers/connection.handler.js
import { findUserConversations } from "../../repositories/conversation.repo.js";
import { createSession } from "../../services/session.service.js";

/**
 * Handle new socket connection
 * - Joins user to their personal room
 * - Fetches and joins user's conversation rooms
 * - Creates a user session
 */
const connectionHandler = async ({ io, socket }) => {
  // Validate user exists
  if (!socket?.user) {
    throw new Error("User not authenticated");
  }

  if (!socket?.user?.id) {
    throw new Error("User ID is missing");
  }

  try {
    const userId = socket.user.id;
    const username = socket.user.username;

    // 1. Join user's personal room
    const userRoom = `user:${userId}`;
    socket.join(userRoom);

    // 2. Get user's conversations
    const conversations = await findUserConversations(userId);

    // 3. Join all conversation rooms
    const joinedRoomIds = [];
    const joinedRoomNames = [];

    if (conversations && Array.isArray(conversations)) {
      for (const conversation of conversations) {
        if (conversation?.id) {
          const roomId = `conversation:${conversation.id}`;
          socket.join(roomId);
          joinedRoomIds.push(conversation.id);

          if (conversation?.name) {
            joinedRoomNames.push(conversation.name);
          }
        }
      }
    }

    // 4. Create user session
    const session = await createSession(userId, socket);

    if (!session) {
      throw new Error("Failed to create user session");
    }

    // Store session ID on socket for later use
    socket.sessionId = session.id;

    // Log successful connection
    console.log(`✅ User ${username} (${userId}) connected`);
    console.log(`   Rooms joined: ${joinedRoomIds.length}`);
    console.log(`   Session ID: ${session.id}`);

    // Return flat response
    return {
      userId,
      username,
      sessionId: session.id,
      joinedRooms: joinedRoomIds,
      joinedRoomNames,
      joinedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Connection handler error:", {
      error: error.message,
      userId: socket?.user?.id,
      socketId: socket?.id,
      stack: error.stack,
    });

    throw new Error(error.message || "Connection failed");
  }
};

export default connectionHandler;
