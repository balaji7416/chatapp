import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// create a pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("connect", () => {
  console.log("connected to the database");
});

pool.on("error", (err) => {
  console.log("error connecting to the database: ", err);
});

export default pool;
