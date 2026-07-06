import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// create a pool
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },

//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 10000,
// });

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "postgres",
  database: process.env.DB_NAME || "chatapp",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

export const testDB = async () => {
  const client = await pool.connect();
  console.log("connected to the database");
  client.release();
};

pool.on("connect", () => {
  console.log("connected to the database");
});

pool.on("error", (err) => {
  console.log("error connecting to the database: ", err);
});

export default pool;
