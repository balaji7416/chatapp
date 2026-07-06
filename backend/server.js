import app from "./app.js";
import dotenv from "dotenv";
import initializeSocket from "./socket/index.js";
import { createServer } from "http";
import { cleanUpExpiredSessions } from "./services/session.service.js";
import { testDB } from "./config/db.js";

dotenv.config();

// connect to database
const connectToDB = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      await testDB();
      return;
    } catch (e) {
      console.log("DB host: ", process.env.DB_HOST);
      console.log("failed to connect to database, Error: ", e);
      console.log("retrying...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log("failed to connect to database, exiting...");
  throw new Error("failed to connect to database");
};

await connectToDB();
const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await cleanUpExpiredSessions();
    console.log("Cleaned up expired sessions");

    const server = createServer(app);
    initializeSocket(server);
    console.log("Socket initialized");

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.log("Error starting the server: ", err);
    process.exit(1);
  }
};

startServer();
