# Agent Visit Limit Management

This document provides SQL queries to manage agent visit limits in Supabase.

## Database Structure

### Tables Created:
- `agent_visit_limits`: Stores visit limits for each agent (default: 30 visits)
- `agent_visits`: Tracks individual visits with metadata

## Default Behavior

When a user visits an agent URL (e.g., `http://localhost:8080/agent/agent_01jy613388e0vstqwm4z7w41j6`):
1. System automatically creates a visit limit record (default: 30 visits)
2. Each visit is recorded and counted
3. After 30 visits, access is blocked with a professional error page
4. All visits are logged with timestamp, user agent, referrer, and session ID

## SQL Queries for Agent Visit Management

### 1. View All Agent Visit Limits

```sql
-- View all agents and their visit limits
SELECT 
    agent_id,
    max_visits,
    current_visits,
    (max_visits - current_visits) AS remaining_visits,
    is_active,
    created_at,
    updated_at,
    notes
FROM public.agent_visit_limits
ORDER BY current_visits DESC;
```

### 2. Set Custom Visit Limit for Specific Agent

```sql
-- Set custom limit for a specific agent (example: 50 visits)
INSERT INTO public.agent_visit_limits (agent_id, max_visits, notes)
VALUES ('agent_01jy613388e0vstqwm4z7w41j6', 50, 'Premium agent - higher limit')
ON CONFLICT (agent_id) 
DO UPDATE SET 
    max_visits = EXCLUDED.max_visits,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- Set unlimited visits (using high number)
INSERT INTO public.agent_visit_limits (agent_id, max_visits, notes)
VALUES ('agent_01jy613388e0vstqwm4z7w41j6', 999999, 'Unlimited access for VIP client')
ON CONFLICT (agent_id) 
DO UPDATE SET 
    max_visits = EXCLUDED.max_visits,
    notes = EXCLUDED.notes,
    updated_at = NOW();
```

### 3. Update Existing Agent Limits

```sql
-- Increase limit for specific agent
UPDATE public.agent_visit_limits 
SET max_visits = 25, notes = 'Increased for beta testing'
WHERE agent_id = 'agent_01jy613388e0vstqwm4z7w41j6';

-- Reset visit count for an agent
UPDATE public.agent_visit_limits 
SET current_visits = 0, updated_at = NOW()
WHERE agent_id = 'agent_01jy613388e0vstqwm4z7w41j6';

-- Disable access for an agent
UPDATE public.agent_visit_limits 
SET is_active = false, notes = 'Agent temporarily disabled'
WHERE agent_id = 'agent_01jy613388e0vstqwm4z7w41j6';

-- Re-enable access for an agent
UPDATE public.agent_visit_limits 
SET is_active = true, notes = 'Agent re-enabled'
WHERE agent_id = 'agent_01jy613388e0vstqwm4z7w41j6';
```

### 4. View Visit History and Analytics

```sql
-- View all visits for a specific agent
SELECT 
    visited_at,
    ip_address,
    user_agent,
    referrer,
    session_id,
    blocked
FROM public.agent_visits
WHERE agent_id = 'agent_01jy613388e0vstqwm4z7w41j6'
ORDER BY visited_at DESC;

-- Count total visits by agent
SELECT 
    avl.agent_id,
    avl.max_visits,
    avl.current_visits,
    COUNT(av.id) as total_recorded_visits,
    COUNT(CASE WHEN av.blocked = true THEN 1 END) as blocked_attempts
FROM public.agent_visit_limits avl
LEFT JOIN public.agent_visits av ON avl.agent_id = av.agent_id
GROUP BY avl.agent_id, avl.max_visits, avl.current_visits
ORDER BY total_recorded_visits DESC;

-- View recent activity (last 24 hours)
SELECT 
    av.agent_id,
    COUNT(*) as visits_today,
    COUNT(CASE WHEN av.blocked = true THEN 1 END) as blocked_today
FROM public.agent_visits av
WHERE av.visited_at > NOW() - INTERVAL '24 hours'
GROUP BY av.agent_id
ORDER BY visits_today DESC;

-- View visits by unique sessions
SELECT 
    agent_id,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(*) as total_visits
FROM public.agent_visits
WHERE agent_id = 'agent_01jy613388e0vstqwm4z7w41j6'
GROUP BY agent_id;
```

### 5. Bulk Operations

```sql
-- Set default limit for multiple agents
INSERT INTO public.agent_visit_limits (agent_id, max_visits, notes) VALUES
('agent_01jy613388e0vstqwm4z7w41j6', 20, 'Beta agent'),
('agent_02ab123456789012345678901234', 15, 'Demo agent'),
('agent_03cd234567890123456789012345', 30, 'Premium agent')
ON CONFLICT (agent_id) DO NOTHING;

-- Reset all visit counts
UPDATE public.agent_visit_limits 
SET current_visits = 0, updated_at = NOW()
WHERE is_active = true;

-- Disable all agents temporarily
UPDATE public.agent_visit_limits 
SET is_active = false, notes = 'System maintenance'
WHERE is_active = true;
```

### 6. Advanced Analytics

```sql
-- Top agents by popularity
SELECT 
    avl.agent_id,
    avl.max_visits,
    avl.current_visits,
    ROUND((avl.current_visits::decimal / avl.max_visits) * 100, 2) as usage_percentage,
    COUNT(av.id) as total_visits,
    COUNT(DISTINCT av.session_id) as unique_visitors
FROM public.agent_visit_limits avl
LEFT JOIN public.agent_visits av ON avl.agent_id = av.agent_id
GROUP BY avl.agent_id, avl.max_visits, avl.current_visits
HAVING COUNT(av.id) > 0
ORDER BY usage_percentage DESC;

-- Agents approaching their limits (>80% usage)
SELECT 
    agent_id,
    max_visits,
    current_visits,
    (max_visits - current_visits) as remaining_visits,
    ROUND((current_visits::decimal / max_visits) * 100, 2) as usage_percentage
FROM public.agent_visit_limits
WHERE is_active = true 
AND (current_visits::decimal / max_visits) > 0.8
ORDER BY usage_percentage DESC;

-- Usage patterns by hour
SELECT 
    EXTRACT(hour FROM visited_at) as hour_of_day,
    COUNT(*) as visits,
    COUNT(DISTINCT agent_id) as unique_agents
FROM public.agent_visits
WHERE visited_at > NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(hour FROM visited_at)
ORDER BY hour_of_day;
```

### 7. Cleanup Operations

```sql
-- Delete old visit records (older than 30 days)
DELETE FROM public.agent_visits 
WHERE visited_at < NOW() - INTERVAL '30 days';

-- Remove inactive agent limits
DELETE FROM public.agent_visit_limits 
WHERE is_active = false 
AND updated_at < NOW() - INTERVAL '7 days';
```

## Using the Functions

### Check and Record Visit

```sql
-- Manually check and record a visit
SELECT public.check_and_record_agent_visit(
    'agent_01jy613388e0vstqwm4z7w41j6',
    '192.168.1.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'https://example.com',
    'session_123456789'
);

-- Example successful response:
-- {"allowed": true, "current_visits": 5, "max_visits": 10, "remaining_visits": 5, "blocked": false, "message": "Visit recorded successfully"}

-- Example blocked response:
-- {"allowed": false, "current_visits": 10, "max_visits": 10, "remaining_visits": 0, "blocked": true, "message": "Visit limit reached for this agent"}
```

### Get Agent Statistics

```sql
-- Get detailed statistics for an agent
SELECT public.get_agent_visit_stats('agent_01jy613388e0vstqwm4z7w41j6');

-- Example response:
-- {
--   "agent_id": "agent_01jy613388e0vstqwm4z7w41j6",
--   "max_visits": 10,
--   "current_visits": 7,
--   "remaining_visits": 3,
--   "total_visits": 12,
--   "blocked_visits": 2,
--   "today_visits": 3,
--   "is_active": true,
--   "created_at": "2024-01-01T10:00:00Z",
--   "updated_at": "2024-01-01T15:30:00Z",
--   "notes": null
-- }
```

## Common Use Cases

### 1. Set Different Limits by Agent Type

```sql
-- Free tier agents: 5 visits
UPDATE public.agent_visit_limits 
SET max_visits = 5, notes = 'Free tier'
WHERE agent_id LIKE 'agent_free_%';

-- Premium agents: 50 visits
UPDATE public.agent_visit_limits 
SET max_visits = 50, notes = 'Premium tier'
WHERE agent_id LIKE 'agent_premium_%';

-- Enterprise agents: Unlimited
UPDATE public.agent_visit_limits 
SET max_visits = 999999, notes = 'Enterprise unlimited'
WHERE agent_id LIKE 'agent_enterprise_%';
```

### 2. Temporary Promotions

```sql
-- Double visit limits for Black Friday
UPDATE public.agent_visit_limits 
SET max_visits = max_visits * 2, notes = 'Black Friday 2x promotion'
WHERE is_active = true;

-- Reset after promotion
UPDATE public.agent_visit_limits 
SET max_visits = max_visits / 2, notes = 'Back to normal limits'
WHERE notes = 'Black Friday 2x promotion';
```

### 3. Monitor and Alert

```sql
-- Find agents that need attention
SELECT 
    agent_id,
    'Near limit' as status,
    current_visits,
    max_visits,
    (max_visits - current_visits) as remaining
FROM public.agent_visit_limits
WHERE (current_visits::decimal / max_visits) > 0.9
AND is_active = true

UNION ALL

SELECT 
    agent_id,
    'Exceeded limit' as status,
    current_visits,
    max_visits,
    (max_visits - current_visits) as remaining
FROM public.agent_visit_limits
WHERE current_visits >= max_visits
AND is_active = true

ORDER BY remaining ASC;
```

## Security Notes

1. **Row Level Security (RLS)** is enabled on both tables
2. Anonymous users can only record visits and read active limits
3. Authenticated users have full management access
4. All visit attempts are logged, including blocked ones
5. Session tracking helps identify unique visitors vs. page refreshes

## Best Practices

1. **Regular Monitoring**: Check usage patterns weekly
2. **Cleanup**: Remove old visit records monthly
3. **Flexible Limits**: Adjust based on agent popularity
4. **Documentation**: Always add notes when changing limits
5. **Analytics**: Use visit data to understand user behavior
6. **Grace Period**: Consider warning users before blocking access 