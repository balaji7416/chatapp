import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//routers
import authRouter from "./routes/auth.routes.js";
import conversationRouter from "./routes/conversation.routes.js";
import messageRouter from "./routes/message.routes.js";

//middleware
import globalErrorHandler from "./middleware/global.error.middleware.js";

const app = express();

// cross origin resource sharing
app.use(
  cors({
    credentials: true,
  }),
);

//body parser
app.use(express.json());
app.use(cookieParser());

//mount routers
app.use("/api/auth", authRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/messages", messageRouter);
//route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

//global error handler
app.use(globalErrorHandler);

export default app;
