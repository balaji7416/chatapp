import SocketError from "./socketError.js";
import SocketResponse from "./socketResponse.js";

const socketHandler = (io, socket, handler, config = {}) => {
  const { requestEvent = "unknown", responseEvent } = config;
  return async (data, callback) => {
    try {
      const result = await handler({ io, socket, data });

      const response = new SocketResponse(requestEvent, "Success", result);

      if (typeof callback === "function") {
        callback(response);
      }
      if (result?.room) {
        socket
          .to(result.room)
          .emit(responseEvent || `${requestEvent}:response`, response);
      } else if (!callback) {
        socket.emit(responseEvent || `${requestEvent}:response`, response);
      }
    } catch (err) {
      const socketError =
        err instanceof SocketError
          ? err
          : new SocketError(
              requestEvent,
              err.statusCode || 500,
              err.message,
              err.code || "SOCKET_ERROR",
            );
      if (typeof callback === "function") {
        callback(socketError);
      } else {
        socket.emit(requestEvent, socketError.toJSON());
      }
    }
  };
};

export default socketHandler;

/* Example usage for room support
export const joinChatRoom = async ({ io, socket, data }) => {
  const { roomId, username } = data;
  
  await socket.join(roomId);
  
  // By returning the 'room', the handler knows to broadcast to others
  return {
    room: roomId, 
    user: username,
    message: `${username} has entered the room`
  };
};
*/
