import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// create a pool

let pool;

pool = new Pool({
  user: "postgres",
  password: "postgres",
  port: "5432",
  host: "postgres",
  database: "chatapp",
});

// if (process.env.NODE_ENV === "development") {
//   pool = new Pool({
//     user: "postgres",
//     password: "Nellore@2811",
//     database: "chatapp",
//     port: 5432,
//   });
// } else {
//   pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: { rejectUnauthorized: false },

//     max: 20,
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 10000,
//   });
// }

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
