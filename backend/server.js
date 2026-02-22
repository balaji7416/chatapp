import app from "./app.js";
import dotnev from "dotenv";
import pool from "./config/db.js";

dotnev.config();
const port = process.env.PORT || 3000;

try {
  await pool.query("SELECT 1");
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (err) {
  console.log("Failed to connect to the database: ", err);
  process.exit(1);
}
