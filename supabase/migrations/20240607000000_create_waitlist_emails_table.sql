-- Create waitlist_emails table
CREATE TABLE IF NOT EXISTS public.waitlist_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    contacted_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_emails_email ON public.waitlist_emails(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_emails_status ON public.waitlist_emails(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_emails_created_at ON public.waitlist_emails(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.waitlist_emails ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts for authenticated and anonymous users
CREATE POLICY "Allow email submissions" ON public.waitlist_emails
    FOR INSERT 
    WITH CHECK (true);

-- Create policy to allow reading for authenticated users (for admin dashboard)
CREATE POLICY "Allow reading for authenticated users" ON public.waitlist_emails
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT INSERT ON public.waitlist_emails TO anon;
GRANT SELECT, INSERT, UPDATE ON public.waitlist_emails TO authenticated; 