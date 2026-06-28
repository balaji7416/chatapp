const globalErrorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "internal server error";

  console.log("Error ", status, " ", message);
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  return res.status(status).json({
    success: false,
    message,
    status,
  });
};

export default globalErrorHandler;
