import pool from "../config/db.js";

const sendMessage = async (
  conversation_id,
  user_id,
  reply_to_id,
  message_content,
) => {
  const query = `
        insert into messages (conversation_id, user_id, content, reply_to_id)
        values ($1, $2, $3, $4)
        returning id, conversation_id, user_id, content, created_at, reply_to_id
    `;
  const { rows } = await pool.query(query, [
    conversation_id,
    user_id,
    message_content,
    reply_to_id ?? null,
  ]);
  return rows[0];
};

export { sendMessage };
