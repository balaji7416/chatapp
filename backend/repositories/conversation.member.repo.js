import pool from "../config/db.js";

// get conversation members
const getConversationMembers = async (conversation_id) => {
  const query = `
        select c.id as conversation_id, c.name as conversation_name, u.id, u.username, u.email, u.full_name, cm.role as role, cm.last_read_message_id,
        coalesce(m.created_at, to_timestamp(0)) as last_read_at
        from users u
        inner join conversation_members cm
        on u.id = cm.user_id
        inner join conversations c
        on c.id = cm.conversation_id
        left join messages m
        on m.id = cm.last_read_message_id
        where cm.conversation_id = $1
    `;
  const { rows } = await pool.query(query, [conversation_id]);
  return rows;
};

// add member to conversation
const addMember = async (conversation_id, user_id) => {
  const insertQuery = `
    insert into conversation_members(conversation_id, user_id)
    values ($1, $2)
  `;
  await pool.query(insertQuery, [conversation_id, user_id]);

  const selectQuery = `
    select * from conversation_members
    inner join users on conversation_members.user_id = users.id
    where conversation_id = $1 and user_id = $2
  `;
  const { rows } = await pool.query(selectQuery, [conversation_id, user_id]);
  return rows[0];
};

/**
 * Removes a user from a conversation. Used by both admin removal and self-leave.
 */
const removeMemberFromConversation = async (conversation_id, user_id) => {
  const query = `
    delete from conversation_members
    where conversation_id = $1 and user_id = $2
    returning user_id, conversation_id
  `;
  const { rows } = await pool.query(query, [conversation_id, user_id]);
  return rows[0];
};

const isAdmin = async (conversation_id, user_id) => {
  const query = `
    select cm.role as role from conversation_members cm
    where cm.conversation_id = $1 and cm.user_id = $2
  `;
  const { rows } = await pool.query(query, [conversation_id, user_id]);
  if (rows.length === 0) return false;
  return rows[0].role === "admin";
};

export {
  getConversationMembers,
  addMember,
  removeMemberFromConversation as removeMember,
  removeMemberFromConversation as leaveConversation,
  isAdmin,
};
