class SocketResponse {
  constructor(event, message, data) {
    this.event = event;
    this.message = message || "Internal Server Error";
    this.data = data;
    this.success = true;
    this.timestamp = new Date().toISOString();
  }
}

export default SocketResponse;
