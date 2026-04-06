
-- --query for to get admin users
-- SELECT u.username as username, c.name as conversation_name, cm.role as role
-- from users u inner join conversation_members cm on u.id = cm.user_id
-- inner join conversations c on cm.conversation_id = c.id 
-- where cm.role = 'admin';

-- --query to get users belonging to a conversation
-- -- SELECT u.username as username, c.name as conversation_name
-- -- from users u inner join conversation_members cm on u.id = cm.user_id
-- -- inner join conversations c on cm.conversation_id = c.id 
-- -- where c.name ilike '%an%';

-- --get all users
select id, email, username from users;

--get all conversations
SELECT c.id,c.name, m.content as last_message from conversations c
inner join messages m on c.last_message_id = m.id;

-- -- get messages
-- select u.username as message_sent_by, c.name as conversation_name, m.content as message_content
-- from users u inner join messages m on u.id = m.user_id
-- inner join conversations c on m.conversation_id = c.id;

-- --get messages
-- select u.username as sent_by, c.name as conversation_name, m.content as message_content 
-- from users u inner join messages m on u.id = m.user_id 
-- inner join conversations c on m.conversation_id = c.id;


--get conversation members with thier unread_counts
select c.id as conversation_id,u.username as username, c.name as conversation_name, cm.unread_count as unread_count
from users u inner join conversation_members cm on u.id = cm.user_id
inner join conversations c on cm.conversation_id = c.id
order by username, c.name;

select u.username as username, c.name as conversation_name, c.id as conversation_id
from users u inner join conversation_members cm on 
u.id = cm.user_id
inner join conversations c on cm.conversation_id = c.id;

-- delete from user_sessions;

-- select id, u.username as username, u.status as status, u.last_seen as last_seen
-- from users u;

-- insert into user_sessions (user_id, socket_id, ip_address, user_agent)
-- values (
--     (select id from users limit 1), 
--     'socket_id_123', 
--     '127.0.0.1', 
--     'Mozilla/5.0'
-- );

select id, u.username as username, u.status as status, u.last_seen as last_seen
from users u;

select u.username as username, s.socket_id as socket_id
from user_sessions s inner join users u on s.user_id = u.id;
