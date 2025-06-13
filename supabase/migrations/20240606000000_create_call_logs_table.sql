-- Create call_logs table
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  history_item_id TEXT NOT NULL,
  voice_id TEXT,
  voice_name TEXT,
  transcript TEXT,
  audio_url TEXT,
  date TEXT,
  time TEXT,
  duration TEXT,
  type TEXT,
  status TEXT,
  client_name TEXT,
  agent_name TEXT,
  messages_count INTEGER,
  evaluation_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for call_logs table
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Policy for selecting call logs
CREATE POLICY "Users can view their own call logs" 
  ON call_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for inserting call logs
CREATE POLICY "Users can insert their own call logs" 
  ON call_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating call logs
CREATE POLICY "Users can update their own call logs" 
  ON call_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for deleting call logs
CREATE POLICY "Users can delete their own call logs" 
  ON call_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for call audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('call-audio', 'call-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for call-audio bucket
CREATE POLICY "Public can view call audio"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'call-audio');

CREATE POLICY "Authenticated users can upload call audio"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'call-audio' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own call audio"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'call-audio' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete their own call audio"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'call-audio' AND
    auth.uid() = owner
  );

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS call_logs_user_id_idx ON call_logs(user_id);

-- Create index on history_item_id for faster lookups
CREATE INDEX IF NOT EXISTS call_logs_history_item_id_idx ON call_logs(history_item_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_call_logs_updated_at
BEFORE UPDATE ON call_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 