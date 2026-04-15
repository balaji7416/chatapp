import app from "./app.js";
import dotenv from "dotenv";
import pool from "./config/db.js";
import initializeSocket from "./socket/index.js";
import { createServer } from "http";

import { cleanUpExpiredSessions } from "./services/session.service.js";

dotenv.config();
const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await cleanUpExpiredSessions();
    console.log("Cleaned up expired sessions");

    const server = createServer(app);
    const io = initializeSocket(server);

    console.log("Socket initialized");

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.log("Error starting the server: ", err);
    process.exit(1);
  }
};

try {
  startServer();
} catch (err) {
  console.log("Error starting the server: ", err);
  process.exit(1);
}
