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

  const message = rows[0];

  const selectQuery = `
    select u.username as message_sent_by, c.name as conversation_name, m.content as message_content
    from users u inner join messages m on u.id = m.user_id
    inner join conversations c on m.conversation_id = c.id
    where m.id = $1
  `;
  const { rows: fullMessage } = await pool.query(selectQuery, [message.id]);
  return { ...message, ...fullMessage[0] };
};

const getMesssages = async (conversation_id) => {
  const query = `
        select m.*, 
        u.username as message_sent_by,
        c.name as conversation_name
        from messages m 
        inner join users u on m.user_id = u.id
        inner join conversations c on m.conversation_id = c.id
        where conversation_id = $1
        order by created_at desc
        `;
  const { rows } = await pool.query(query, [conversation_id]);
  return rows;
};

export { sendMessage, getMesssages };
