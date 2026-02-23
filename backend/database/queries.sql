
-- query for to get admin users
-- SELECT u.username as username, c.name as conversation_name, cm.role as role
-- from users u inner join conversation_members cm on u.id = cm.user_id
-- inner join conversations c on cm.conversation_id = c.id 
-- where cm.role = 'admin';

--query to get users belonging to a conversation
-- SELECT u.username as username, c.name as conversation_name
-- from users u inner join conversation_members cm on u.id = cm.user_id
-- inner join conversations c on cm.conversation_id = c.id 
-- where c.name ilike '%an%';

--get all uses
select id, username from users;