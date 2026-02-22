import pool from "../config/db.js";

const getConversationMembers = async (conversation_id) => {
  const query = `
        select cm.* from conversation_members cm
        where conversation_id = $1
    `;
  const { rows } = await pool.query(query, [conversation_id]);
  return rows;
};

export { getConversationMembers };
