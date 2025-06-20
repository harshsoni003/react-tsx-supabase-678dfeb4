-- Create access_codes table
CREATE TABLE IF NOT EXISTS public.access_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create access_code_usage table to track individual usage
CREATE TABLE IF NOT EXISTS public.access_code_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    access_code_id UUID NOT NULL REFERENCES public.access_codes(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON public.access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_active ON public.access_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_access_code_usage_code_id ON public.access_code_usage(access_code_id);
CREATE INDEX IF NOT EXISTS idx_access_code_usage_used_at ON public.access_code_usage(used_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_code_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for access_codes
CREATE POLICY "Allow reading active codes" ON public.access_codes
    FOR SELECT 
    USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Allow authenticated users to manage codes" ON public.access_codes
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- Create policies for access_code_usage
CREATE POLICY "Allow inserting usage records" ON public.access_code_usage
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow reading usage for authenticated users" ON public.access_code_usage
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT ON public.access_codes TO anon;
GRANT INSERT ON public.access_code_usage TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_codes TO authenticated;
GRANT SELECT, INSERT ON public.access_code_usage TO authenticated;

-- Insert default access code
INSERT INTO public.access_codes (code, description, max_uses, is_active) 
VALUES ('6388', 'Default bypass code for agent creation', 2, true)
ON CONFLICT (code) DO NOTHING;

-- Function to validate and use access code
CREATE OR REPLACE FUNCTION public.validate_and_use_access_code(
    p_code VARCHAR(50),
    p_user_email VARCHAR(255) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_access_code public.access_codes%ROWTYPE;
    v_result JSON;
BEGIN
    -- Find the access code
    SELECT * INTO v_access_code
    FROM public.access_codes
    WHERE code = p_code 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW());

    -- Check if code exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid or expired access code'
        );
    END IF;

    -- Check if code has remaining uses
    IF v_access_code.current_uses >= v_access_code.max_uses THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Access code has been used maximum number of times'
        );
    END IF;

    -- Record the usage
    INSERT INTO public.access_code_usage (
        access_code_id,
        user_email,
        ip_address,
        user_agent
    ) VALUES (
        v_access_code.id,
        p_user_email,
        p_ip_address,
        p_user_agent
    );

    -- Increment usage count
    UPDATE public.access_codes
    SET 
        current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE id = v_access_code.id;

    -- Return success
    RETURN json_build_object(
        'success', true,
        'code_id', v_access_code.id,
        'remaining_uses', v_access_code.max_uses - v_access_code.current_uses - 1
    );
END;
$$; 