class SocketError extends Error {
  constructor(event, statusCode, message, code = "SOCKET_ERROR") {
    super(message);
    this.event = event;
    this.message = message || "Internal Server Error";
    this.statusCode = statusCode || 500;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static unauthorized(event, message) {
    return new SocketError(event, 401, message, "UNAUTHORIZED");
  }

  static forbidden(event, message) {
    return new SocketError(event, 403, message, "FORBIDDEN");
  }

  toJSON() {
    return {
      success: false,
      event: this.event,
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      timestamp: new Date().toISOString(),
    };
  }
}

export default SocketError;
