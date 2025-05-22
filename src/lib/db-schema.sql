-- Create tables for the chat application

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('individual', 'group')),
  labels TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat participants
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labels table
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);

-- Function to get unread count for a chat
CREATE OR REPLACE FUNCTION get_unread_count(chat_id UUID, user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  last_read TIMESTAMP WITH TIME ZONE;
  unread_count INTEGER;
BEGIN
  SELECT cp.last_read INTO last_read
  FROM chat_participants cp
  WHERE cp.chat_id = get_unread_count.chat_id AND cp.user_id = get_unread_count.user_id;

  IF last_read IS NULL THEN
    SELECT COUNT(*) INTO unread_count
    FROM messages m
    WHERE m.chat_id = get_unread_count.chat_id;
  ELSE
    SELECT COUNT(*) INTO unread_count
    FROM messages m
    WHERE m.chat_id = get_unread_count.chat_id AND m.created_at > last_read;
  END IF;

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update chat's updated_at when a new message is added
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats
  SET updated_at = NOW()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update chat's updated_at
CREATE TRIGGER update_chat_timestamp_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_timestamp();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Chats: Users can read and write to chats they are participants in
CREATE POLICY "Users can read chats they participate in" ON chats 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants WHERE chat_id = chats.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chats" ON chats FOR INSERT WITH CHECK (true);

-- Chat participants: Users can read participants of chats they are in
CREATE POLICY "Users can read participants of their chats" ON chat_participants 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants WHERE chat_id = chat_participants.chat_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants to chats they created" ON chat_participants 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chats c 
    JOIN chat_participants cp ON c.id = cp.chat_id 
    WHERE c.id = chat_participants.chat_id AND cp.user_id = auth.uid()
  )
);

-- Messages: Users can read messages in chats they participate in and create new messages
CREATE POLICY "Users can read messages in their chats" ON messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants WHERE chat_id = messages.chat_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their chats" ON messages 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_participants WHERE chat_id = messages.chat_id AND user_id = auth.uid()
  ) AND sender_id = auth.uid()
);

-- Labels: All users can read labels
CREATE POLICY "All users can read labels" ON labels FOR SELECT USING (true);
