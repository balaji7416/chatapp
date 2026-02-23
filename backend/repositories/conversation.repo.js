import pool from "../config/db.js";

//create a conversation
const createConversation = async (name, isGroup, createdBy, members) => {
  //get a connection from the pool
  const client = await pool.connect();

  //start a transaction
  try {
    await client.query("begin");

    //create conversation in conversations table
    const conversation_query = `
        insert into conversations (name,is_group,created_by)
        values ($1, $2, $3)
        returning id, name, is_group, created_by, created_at
    `;
    const { rows } = await client.query(conversation_query, [
      isGroup ? name : null,
      isGroup,
      createdBy,
    ]);

    const conversation_id = rows[0].id;

    //already filtered in controller
    // //filter the duplicate members
    // const uniqueMembers = [...new Set([createdBy, ...members])];

    const insertPromises = members.map((member) => {
      const role = member === createdBy ? "admin" : "member";
      const member_query = `
            insert into conversation_members(conversation_id,user_id,role)
            values($1, $2,$3)
        `;
      return client.query(member_query, [conversation_id, member, role]);
    });

    //execute all queries in parallel
    await Promise.all(insertPromises);

    //commit the transaction
    await client.query("commit");
    return rows[0];
  } catch (err) {
    //rollback the transaction if any query fails
    await client.query("rollback");
    throw err;
  } finally {
    client.release(); // no await needed release is sync
  }
};

//find a one-one conversation between two users
const findOneToOneConversation = async (user1Id, user2Id) => {
  const query = `
        select c.* from conversations c
        where c.is_group = false
        and c.id in (
            select cm1.conversation_id 
            from conversation_members cm1
            where cm1.user_id = $1
            intersect 
            select cm2.conversation_id
            from conversation_members cm2
            where cm2.user_id = $2
        )
    `;
  const { rows } = await pool.query(query, [user1Id, user2Id]);
  return rows[0];
};

//get conversation by id
const findConversationById = async (id) => {
  const query = `
        select * from conversations
        where id = $1
    `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

//get conversations by user id
const findUserConversations = async (userId) => {
  const query = `
        select c.* from conversations c
        inner join conversation_members cm
        on c.id = cm.conversation_id
        where cm.user_id = $1
        order by c.last_message_at desc -- sort by last_message_at for recent chats
    `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

// check user membership in conversation
const checkMemberShip = async (conversation_id, user_id) => {
  const query = `
        select * from conversation_members
        where conversation_id = $1
        and user_id = $2
    `;
  const { rows } = await pool.query(query, [conversation_id, user_id]);
  return rows.length > 0;
};

//delete conversation
const deleteConversation = async (conversation_id) => {
  const query = `
    delete from conversations
    where id = $1
    returning id,name
  `;
  const { rows } = await pool.query(query, [conversation_id]);
  return rows[0];
};

export {
  createConversation,
  findConversationById,
  findUserConversations,
  findOneToOneConversation,
  checkMemberShip,
  deleteConversation,
};
