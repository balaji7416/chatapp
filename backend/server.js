import app from "./app.js";
import dotnev from "dotenv";
import pool from "./config/db.js";
import initializeSocket from "./socket/index.js";
import { createServer } from "http";
dotnev.config();
const port = process.env.PORT || 3000;

try {
  const server = createServer(app);
  const io = initializeSocket(server);

  console.log("Socket initialized");

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (err) {
  console.log("Failed to connect to the database: ", err);
  process.exit(1);
}
