class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.message = message;
    this.status = status;
    this.success = false;
  }
}
export default ApiError;
