import pool from "../config/db.js";

//get conversation members
const getConversationMembers = async (conversation_id) => {
  const query = `
        select cm.* from conversation_members cm
        where conversation_id = $1
    `;
  const { rows } = await pool.query(query, [conversation_id]);
  return rows;
};

//add memeber to conversation
const addMember = async (conversation_id, user_id) => {
  const query = `
    insert into conversation_members(conversation_id, user_id)
    values ($1, $2)
    returning conversation_id, user_id
  `;
  const { rows } = await pool.query(query, [conversation_id, user_id]);
  return rows[0];
};

export { getConversationMembers, addMember };
