import pool from "../config/db.js";

const createSession = async (userId, socket) => {
  const socketId = socket.id;
  const userAgent = socket.handshake.headers["user-agent"];
  const ipAddress = socket.handshake.address;

  const query = `
    insert into user_sessions (user_id, socket_id, ip_address, user_agent)
    values ($1, $2, $3, $4)
    returning  id, user_id, socket_id, connected_at
    `;

  //update the user
  const { rows } = await pool.query(query, [
    userId,
    socketId,
    ipAddress,
    userAgent,
  ]);
  return rows[0];
};

const removeSession = async (socketId) => {
  const query = `
        delete from user_sessions
        where socket_id = $1
        returning user_id, socket_id 
    `;

  const { rows } = await pool.query(query, [socketId]);
  return rows[0];
};

const cleanUpExpiredSessions = async () => {
  const query = `
    delete from user_sessions
    `;

  const { rows } = await pool.query(query);
  return rows[0];
};

export { createSession, removeSession, cleanUpExpiredSessions };
