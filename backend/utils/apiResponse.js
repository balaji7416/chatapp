class ApiResponse {
  constructor(status, message, data) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.success = true;
  }
}

export default ApiResponse;
