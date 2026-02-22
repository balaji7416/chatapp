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

