import pool from "../config/db.js";
import fs from "fs/promises";
import path from "path";

export const runMigrations = async () => {
  const connectDB = async () => {
    for (let i = 0; i < 10; i++) {
      try {
        await pool.connect();
        console.log("connected to the db");
        return;
      } catch (e) {
        console.log("failed to connect to the db, retrying..., ", i + 1);
        console.log("error: ", e);
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  };

  const client = await pool.connect();

  try {
    console.log("running migrations...");
    const sql = await fs.readFile(
      path.join(process.cwd(), "database", "schema.sql"),
      "utf-8",
    );
    await client.query(sql);
    console.log("migrations ran successfully");
  } catch (e) {
    console.log("error running migrations: ", e);
    process.exit(1);
  } finally {
    client.release();
  }
};

runMigrations();
