-- Enable UUID extension
create extension if not exists "uuid-ossp";


-- users table 
create table
    users (
        -- identity
        id uuid primary key DEFAULT uuid_generate_v4 (),
        email varchar(255) unique not null,
        username varchar(80) unique not null,
        password_hash varchar(255) not null,
        full_name varchar(100), --display name
        avatar_url text, --profile picture link
        -- auth & presence
        refresh_token text unique,
        status varchar(20) default 'offline', --'online', 'offline', 'away'
        last_seen timestamp default current_timestamp,
        deleted_at timestamp default null, --for soft delete
        --timestamps
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp
    );


-- conversations table
create table
    conversations (
        id uuid primary key default uuid_generate_v4 (),
        name varchar(100) default null, --nullable for 1-on-1 DMs
        is_group boolean default FALSE, -- false for 1-on-1 DMs
        created_by uuid references users (id) on delete set null,
        last_message_id uuid,  -- add foreign key after messages table (for showing last message to all group members)
        last_message_at timestamp default current_timestamp,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp
    );


-- conversation_members table
create table
    conversation_members (
        conversation_id uuid references conversations (id) on delete cascade,
        user_id uuid references users (id) on delete cascade,
        role varchar(30) default 'member', --'admin', 'member'
        unread_count int default 0, --for notification badges 
        last_read_message_id uuid ,-- for tracking unread messages
        is_muted boolean default false,
        joined_at timestamp default current_timestamp,
        primary key (conversation_id, user_id)
    );


-- messages table
create table
    messages (
        id uuid primary key default uuid_generate_v4 (),
        conversation_id uuid references conversations (id) on delete cascade,
        user_id uuid references Users (id) on delete set null,
        reply_to_id uuid references messages (id) on delete set null, --for threaded replies
        content text not null,
        type varchar(30) default 'text', --'text', 'image', 'system', etc.
        is_edited boolean default false,
        deleted_at timestamp default null, --for soft delete
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp
    );

-- user sessions table
create table user_sessions (
    id uuid primary key default uuid_generate_v4 (),
    user_id uuid references users(id) on delete cascade,
    socket_id text not null unique, 
    connected_at timestamp default current_timestamp,
    last_activity timestamp default current_timestamp,
    user_agent text, --tells about clients device and browser
    ip_address text,
    is_active boolean default true 
);

--foreign key constraints
alter table conversations
add constraint fk_last_message 
foreign key (last_message_id) references messages(id) on delete set null;

alter table conversation_members
add constraint fk_last_read_message
foreign key (last_read_message_id) references messages(id) on delete set null;

----Triggers

--update timestamps for update_column trigger
create or replace function update_updated_at_column() 
returns trigger as $$
begin 
    new.updated_at = current_timestamp;
    return new;
end;
$$ language 'plpgsql';

--add trigger to users 
create or replace trigger tr_update_updated_at_column
before update on users
for each row 
execute function update_updated_at_column();

--add trigger to conversations
create or replace trigger tr_update_updated_at_column
before update on conversations
for each row 
execute function update_updated_at_column();

--add trigger to messages
create or replace trigger tr_update_updated_at_column
before update on messages
for each row 
execute function update_updated_at_column();


-- new message trigger
create or replace function process_new_message()
returns trigger as $$
begin
    -- update conversation 
    update conversations 
    set last_message_id = new.id, last_message_at = new.created_at
    where id = new.conversation_id;

    -- Increment unread_count for everyone EXCEPT the sender
    update conversation_members
    set unread_count = unread_count + 1
    where conversation_id = new.conversation_id and user_id !=new.user_id;

    return new;
end;
$$ language 'plpgsql';

--add trigger to messages
create or replace trigger tr_process_new_message
after insert on messages
for each row 
execute function process_new_message();

--mark as read trigger (reset unread_count to 0)
create or replace function reset_unread_count()
returns trigger as $$
begin 
    -- only update unread_count if the last_read_message_id has changed
    if(new.last_read_message_id is distinct from old.last_read_message_id) then 
        new.unread_count = 0;
    end if;

    return new;
end;
$$ language 'plpgsql';

--add trigger to conversation_members
create or replace trigger tr_reset_unread_count
before update on conversation_members
for each row 
execute function reset_unread_count();


--trigger to user_sessions to update user_status, last_activity
create or replace function handle_user_sessions()
returns trigger as $$
begin
    if TG_OP = 'INSERT' then
    -- when session is created, set user_status = online
        update users
        set status = 'online', last_seen = current_timestamp
        where id = new.user_id;
        return new;
    end if;

    if TG_OP = 'DELETE' then
    -- when session is deleted and there's no other sessions,
    -- set user_status = offline
        if not exists(select 1 from user_sessions where user_id = old.user_id and id != old.id) then
            update users 
            set status = 'offline', last_seen = current_timestamp
            where id = old.user_id;
        end if;
        return old;
    end if;

    return null;
end;
$$ language 'plpgsql';

create or replace trigger tr_handle_user_sessions
after insert or delete on user_sessions
for each row
execute function handle_user_sessions();