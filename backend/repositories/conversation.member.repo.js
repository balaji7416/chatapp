import pool from "../config/db.js";

//get conversation members
const getConversationMembers = async (conversation_id) => {
  const query = `
        select c.id as conversation_id, c.name as conversation_name,u.id, u.username, u.email, u.full_name, cm.role as role from users u
        inner join conversation_members cm
        on u.id = cm.user_id
        inner join conversations c
        on c.id = cm.conversation_id
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

//remove member from conversation
const removeMember = async (conversation_id, user_id) => {
  const query = `
    delete from conversation_members
    where conversation_id = $1 and user_id = $2
    returning user_id, conversation_id
    `;
  const { rows } = await pool.query(query, [conversation_id, user_id]);
  return rows[0];
};

const isAdmin = async (conversation_id, user_id) => {
  const query = `select cm.role as role from 
    conversation_members cm 
    where cm.conversation_id = $1 and cm.user_id = $2
  `;
  const { rows } = await pool.query(query, [conversation_id, user_id]);

  //if user is not a member of the conversation
  if (rows.length === 0) return false;
  return rows[0].role === "admin";
};

//leave conversation
const leaveConversation = async (conversation_id, user_id) => {
  const query = `
  delete from conversation_members
  where conversation_id=$1 and user_id=$2
  returning conversation_id, user_id
  `;
  const { rows } = await pool.query(query, [conversation_id, user_id]);
  return rows[0];
};

export {
  getConversationMembers,
  addMember,
  removeMember,
  isAdmin,
  leaveConversation,
};
