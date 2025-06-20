-- Create agent_visit_limits table for configurable limits per agent
CREATE TABLE IF NOT EXISTS public.agent_visit_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL UNIQUE,
    max_visits INTEGER DEFAULT 10,
    current_visits INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Create agent_visits table to track individual visits
CREATE TABLE IF NOT EXISTS public.agent_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    session_id VARCHAR(255),
    blocked BOOLEAN DEFAULT false
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_visit_limits_agent_id ON public.agent_visit_limits(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_visit_limits_active ON public.agent_visit_limits(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_visits_agent_id ON public.agent_visits(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_visits_visited_at ON public.agent_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_agent_visits_ip_session ON public.agent_visits(ip_address, session_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.agent_visit_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_visits ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_visit_limits
CREATE POLICY "Allow reading visit limits" ON public.agent_visit_limits
    FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage visit limits" ON public.agent_visit_limits
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- Create policies for agent_visits
CREATE POLICY "Allow inserting visit records" ON public.agent_visits
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow reading visits for authenticated users" ON public.agent_visits
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT ON public.agent_visit_limits TO anon;
GRANT INSERT ON public.agent_visits TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_visit_limits TO authenticated;
GRANT SELECT, INSERT ON public.agent_visits TO authenticated;

-- Function to check and record agent visit
CREATE OR REPLACE FUNCTION public.check_and_record_agent_visit(
    p_agent_id VARCHAR(255),
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_session_id VARCHAR(255) DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_visit_limit public.agent_visit_limits%ROWTYPE;
    v_result JSON;
    v_is_blocked BOOLEAN DEFAULT false;
BEGIN
    -- Get or create visit limit record for this agent
    SELECT * INTO v_visit_limit
    FROM public.agent_visit_limits
    WHERE agent_id = p_agent_id AND is_active = true;

    -- If no limit exists, create default one
    IF NOT FOUND THEN
        INSERT INTO public.agent_visit_limits (agent_id, max_visits, current_visits, is_active)
        VALUES (p_agent_id, 10, 0, true)
        RETURNING * INTO v_visit_limit;
    END IF;

    -- Check if visit limit has been reached
    IF v_visit_limit.current_visits >= v_visit_limit.max_visits THEN
        v_is_blocked := true;
    END IF;

    -- Record the visit attempt
    INSERT INTO public.agent_visits (
        agent_id,
        ip_address,
        user_agent,
        referrer,
        session_id,
        blocked
    ) VALUES (
        p_agent_id,
        p_ip_address,
        p_user_agent,
        p_referrer,
        p_session_id,
        v_is_blocked
    );

    -- If not blocked, increment visit count
    IF NOT v_is_blocked THEN
        UPDATE public.agent_visit_limits
        SET 
            current_visits = current_visits + 1,
            updated_at = NOW()
        WHERE agent_id = p_agent_id;
        
        v_visit_limit.current_visits := v_visit_limit.current_visits + 1;
    END IF;

    -- Return result
    RETURN json_build_object(
        'allowed', NOT v_is_blocked,
        'current_visits', v_visit_limit.current_visits,
        'max_visits', v_visit_limit.max_visits,
        'remaining_visits', GREATEST(0, v_visit_limit.max_visits - v_visit_limit.current_visits),
        'blocked', v_is_blocked,
        'message', CASE 
            WHEN v_is_blocked THEN 'Visit limit reached for this agent'
            ELSE 'Visit recorded successfully'
        END
    );
END;
$$;

-- Function to get agent visit statistics
CREATE OR REPLACE FUNCTION public.get_agent_visit_stats(p_agent_id VARCHAR(255))
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_visit_limit public.agent_visit_limits%ROWTYPE;
    v_total_visits INTEGER;
    v_blocked_visits INTEGER;
    v_today_visits INTEGER;
BEGIN
    -- Get visit limit info
    SELECT * INTO v_visit_limit
    FROM public.agent_visit_limits
    WHERE agent_id = p_agent_id;

    -- If no record exists, return default
    IF NOT FOUND THEN
        RETURN json_build_object(
            'agent_id', p_agent_id,
            'max_visits', 10,
            'current_visits', 0,
            'remaining_visits', 10,
            'total_visits', 0,
            'blocked_visits', 0,
            'today_visits', 0,
            'is_active', true
        );
    END IF;

    -- Count total visits
    SELECT COUNT(*) INTO v_total_visits
    FROM public.agent_visits
    WHERE agent_id = p_agent_id;

    -- Count blocked visits
    SELECT COUNT(*) INTO v_blocked_visits
    FROM public.agent_visits
    WHERE agent_id = p_agent_id AND blocked = true;

    -- Count today's visits
    SELECT COUNT(*) INTO v_today_visits
    FROM public.agent_visits
    WHERE agent_id = p_agent_id 
    AND visited_at >= CURRENT_DATE;

    RETURN json_build_object(
        'agent_id', p_agent_id,
        'max_visits', v_visit_limit.max_visits,
        'current_visits', v_visit_limit.current_visits,
        'remaining_visits', GREATEST(0, v_visit_limit.max_visits - v_visit_limit.current_visits),
        'total_visits', v_total_visits,
        'blocked_visits', v_blocked_visits,
        'today_visits', v_today_visits,
        'is_active', v_visit_limit.is_active,
        'created_at', v_visit_limit.created_at,
        'updated_at', v_visit_limit.updated_at,
        'notes', v_visit_limit.notes
    );
END;
$$; 