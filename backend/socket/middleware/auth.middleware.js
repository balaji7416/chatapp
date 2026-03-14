import jwt from "jsonwebtoken";
import SocketError from "../utils/socketError.js";
import dotenv from "dotenv";
import { findUserById } from "../../repositories/user.repo.js";
import { OUTGOING, INTERNAL } from "../constants/events.js";
dotenv.config();
import { removeSession } from "../../services/session.service.js";

const authMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.token;

    if (!token) {
      //return error to client, client listens on "connection_error"
      return next(
        SocketError.unauthorized("connection", "Access token is missing"),
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const user = await findUserById(decoded.id);
    socket.user = user;

    //enforce force disconnect on token expiry
    const expiryTime = decoded.exp * 1000; // in ms
    const reamainTime = expiryTime - Date.now();

    if (reamainTime <= 0) {
      return next(
        SocketError.unauthorized("connection", "Token already expired"),
      );
    }

    //set timer to force disconnect
    const disconnectTimer = setTimeout(() => {
      console.log(
        `Force disconnecting ${socket.id} - User: ${user.username} - Token expired`,
      );
      socket.emit(
        OUTGOING.SESSION_EXPIRED,
        SocketError.unauthorized(
          OUTGOING.SESSION_EXPIRED,
          "session expired, refresh token and login again",
        ),
      );
      socket.disconnect(true); //immediately disconnect the socket (by passing true)
    }, reamainTime);

    //clear timer on disconnect
    socket.on(INTERNAL.DISCONNECT, async () => {
      clearTimeout(disconnectTimer);
      try {
        await removeSession(user.id);
        console.log(`session expired, Removed session for ${user.username}`);
      } catch (err) {
        console.log("Error removing session: from auth middleware -- ", err);
      }
    });

    next();
  } catch (err) {
    console.log(err);
    if (err instanceof jwt.TokenExpiredError) {
      return next(
        SocketError.unauthorized("connection", "Token already expired"),
      );
    }
    return next(
      SocketError.unauthorized("connection", "Acess token is invalid"),
    );
  }
};

export default authMiddleware;
