-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE
    users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        avatar_url TEXT,
        -- Auth & Presence
        refresh_token TEXT UNIQUE,
        status VARCHAR(20) DEFAULT 'offline', -- 'online', 'offline', 'away'
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- 2. USER BLOCKS (Privacy/Security)
CREATE TABLE
    user_blocks (
        blocker_id UUID REFERENCES users (id) ON DELETE CASCADE,
        blocked_id UUID REFERENCES users (id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (blocker_id, blocked_id)
    );

-- 3. CONVERSATIONS
CREATE TABLE
    conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        NAME VARCHAR(100), -- Nullable for 1-on-1 DMs
        is_group BOOLEAN DEFAULT FALSE,
        created_by UUID REFERENCES users (id) ON DELETE SET NULL,
        -- Denormalization for fast chat-list fetching
        last_message_id UUID, -- Foreign key added after messages table
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- 4. CONVERSATION MEMBERS (Includes Unread Counts & Last Read State)
CREATE TABLE
    conversation_members (
        conversation_id UUID REFERENCES conversations (id) ON DELETE CASCADE,
        user_id UUID REFERENCES users (id) ON DELETE CASCADE,
        ROLE VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'
        -- Performance: Track unread count and highest read message instead of a row per read
        unread_count INT DEFAULT 0,
        last_read_message_id UUID,
        is_muted BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
    );

-- 5. MESSAGES
CREATE TABLE
    messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        conversation_id UUID REFERENCES conversations (id) ON DELETE CASCADE,
        user_id UUID REFERENCES users (id) ON DELETE SET NULL, -- Sender
        reply_to_id UUID REFERENCES messages (id) ON DELETE SET NULL, -- For threaded replies
        CONTENT TEXT NOT NULL,
        TYPE VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'system', etc.
        status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
        is_edited BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP, -- Soft delete
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Add circular foreign keys now that tables exist
ALTER TABLE conversations
ADD CONSTRAINT fk_last_message FOREIGN KEY (last_message_id) REFERENCES messages (id) ON DELETE SET NULL;

ALTER TABLE conversation_members
ADD CONSTRAINT fk_last_read_message FOREIGN KEY (last_read_message_id) REFERENCES messages (id) ON DELETE SET NULL;

-- 6. ATTACHMENTS (Separated from JSONB for better querying)
CREATE TABLE
    attachments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        message_id UUID REFERENCES messages (id) ON DELETE CASCADE,
        file_url TEXT NOT NULL,
        file_type VARCHAR(50), -- 'image/jpeg', 'application/pdf'
        file_size INT, -- In bytes
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- 7. MESSAGE REACTIONS
CREATE TABLE
    message_reactions (
        message_id UUID REFERENCES messages (id) ON DELETE CASCADE,
        user_id UUID REFERENCES users (id) ON DELETE CASCADE,
        emoji VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (message_id, user_id, emoji)
    );

-- Users
CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_username ON users (username);

-- Messages: Fetching history & finding replies
CREATE INDEX idx_messages_conversation_created ON messages (conversation_id, created_at DESC);

CREATE INDEX idx_messages_reply_to ON messages (reply_to_id);

-- Conversation Members: Fetching user's chat list
CREATE INDEX idx_conversation_members_user ON conversation_members (user_id);

-- Conversations: Sorting the home screen by most recent activity
CREATE INDEX idx_conversations_last_message_at ON conversations (last_message_at DESC);

-- 1. Generic Updated_At Trigger
CREATE
OR REPLACE FUNCTION update_updated_at_column () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_conversations_updated_at BEFORE
UPDATE ON conversations FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_messages_updated_at BEFORE
UPDATE ON messages FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

-- 2. Trigger: On New Message (Update Last Message & Increment Unread Counts)
CREATE
OR REPLACE FUNCTION process_new_message () RETURNS TRIGGER AS $$
BEGIN
    -- Update the conversation's last message ID and timestamp
    UPDATE conversations 
    SET last_message_id = NEW.id,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;

    -- Increment unread_count for everyone EXCEPT the sender
    UPDATE conversation_members
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id 
      AND user_id != NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_new_message
AFTER INSERT ON messages FOR EACH ROW
EXECUTE FUNCTION process_new_message ();

-- 3. Trigger: Reset Unread Count when Last Read is Updated
CREATE
OR REPLACE FUNCTION reset_unread_count () RETURNS TRIGGER AS $$
BEGIN
    -- If the user updates their last_read_message_id, set unreads to 0
    IF NEW.last_read_message_id IS DISTINCT FROM OLD.last_read_message_id THEN
        NEW.unread_count = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_reset_unread BEFORE
UPDATE ON conversation_members FOR EACH ROW
EXECUTE FUNCTION reset_unread_count ();