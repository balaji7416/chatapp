import jwt from "jsonwebtoken";
import { findUserById } from "../../repositories/user.repo.js";
import { SERVER } from "../constants/events.js";
import { removeSession } from "../../services/session.service.js";

const authMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.token;

    if (!token) {
      return next(new Error("Authentication error: Token not found in request"));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const user = await findUserById(decoded.id);
    socket.user = user;

    const expiryTime = decoded.exp * 1000;
    const remainTime = expiryTime - Date.now();

    if (remainTime <= 0) {
      return next(new Error("Authentication error: Token already expired"));
    }

    // Force-disconnect the socket when the token expires
    const disconnectTimer = setTimeout(() => {
      console.log(
        `Force disconnecting ${socket.id} - User: ${user.username} - Token expired`,
      );
      socket.emit(
        SERVER.SESSION_EXPIRED,
        new Error("Authentication error: Token already expired"),
      );
      socket.disconnect(true);
    }, remainTime);

    // Clean up the timer when the client disconnects normally
    socket.on("disconnect", () => {
      clearTimeout(disconnectTimer);
    });

    next();
  } catch (err) {
    console.log(err);
    if (err instanceof jwt.TokenExpiredError) {
      return next(new Error("Authentication error: Token already expired"));
    }
    return next(new Error("Authentication error: Invalid token"));
  }
};

export default authMiddleware;
