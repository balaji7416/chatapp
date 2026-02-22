import { response } from "express";

const globalErrorHandler = (err, req, res, next) => {
  //default values
  const status = err.status || 500;
  const message = err.message || "internal server error";

  //log error for debugging
  console.log("Error ", status, " ", message);
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  const response = {
    success: false,
    message: message,
    status: status,
  };

  return res.status(status).json(response);
};

export default globalErrorHandler;
