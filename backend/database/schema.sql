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
        last_message_id uuid, --foreign key added after messages table, (for showing last message to all group members)
        last_message_at timestamp default current_timestamp,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp
    );

-- conversation_members table
create table 
    conversation_members (
        conversation_id uuid references conversations(id) on delete cascade,
        user_id uuid references users(id) on delete cascade,
        role varchar(30) default 'member', --'admin', 'member'

        unread_count int default 0, --for notification badges 
        last_read_message_id uuid, -- for tracking unread messages
        is_muted boolean default false,
        joined_at timestamp default current_timestamp,
        primary key (conversation_id, user_id)
    );