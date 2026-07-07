// socket/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { findUserById } from "../../repositories/user.repo.js";
import { SERVER, INTERNAL } from "../constants/events.js";

/**
 * Socket.IO Authentication Middleware
 * - Validates JWT token from handshake
 * - Attaches user to socket
 * - Sets up token expiry handling
 */
const authMiddleware = async (socket, next) => {
  try {
    // 1. Extract token from handshake
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.token;

    if (!token) {
      console.error(`[Auth] No token provided for ${socket.id}`);
      return next(new Error("Authentication error: Token not found"));
    }

    // 2. Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error(`[Auth] Token expired for ${socket.id}`);
        return next(new Error("Authentication error: Token expired"));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        console.error(`[Auth] Invalid token for ${socket.id}:`, error.message);
        return next(new Error("Authentication error: Invalid token"));
      }
      throw error;
    }

    // 3. Check token expiry
    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const remainingTime = expiryTime - currentTime;

    if (remainingTime <= 0) {
      console.error(`[Auth] Token already expired for ${socket.id}`);
      return next(new Error("Authentication error: Token expired"));
    }

    // 4. Fetch user from database
    const user = await findUserById(decoded.id);

    if (!user) {
      console.error(`[Auth] User not found for ${socket.id}: ${decoded.id}`);
      return next(new Error("Authentication error: User not found"));
    }

    // 5. Attach user to socket
    socket.user = user;
    socket.tokenExpiry = expiryTime;

    console.log(
      `[Auth] ✅ User ${user.username} (${user.id}) authenticated for ${socket.id}`,
    );
    console.log(
      `[Auth] Token expires in ${Math.round(remainingTime / 1000 / 60)} minutes`,
    );

    // 6. Set up token expiry timer
    const disconnectTimer = setTimeout(() => {
      console.log(
        `[Auth] ⏰ Token expired for ${socket.id} - User: ${user.username}`,
      );

      // Emit session expired event to client
      socket.emit(SERVER.SESSION_EXPIRED, {
        success: false,
        error: "Session expired. Please refresh your token.",
        timestamp: new Date().toISOString(),
      });

      // Disconnect the socket
      socket.disconnect(true);
    }, remainingTime);

    // 7. Clean up timer on disconnect
    socket.once(INTERNAL.DISCONNECT, () => {
      clearTimeout(disconnectTimer);
      console.log(`[Auth] Cleaned up expiry timer for ${socket.id}`);
    });

    // 8. Allow connection
    next();
  } catch (error) {
    console.error(`[Auth] Unexpected error for ${socket.id}:`, {
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });

    return next(new Error("Authentication error: Internal server error"));
  }
};

export default authMiddleware;
