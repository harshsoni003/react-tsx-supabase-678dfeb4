# Access Code Management

This document provides SQL queries to manage access codes in Supabase for bypassing rate limits.

## Database Structure

### Tables Created:
- `access_codes`: Stores the access codes with usage limits
- `access_code_usage`: Tracks individual usage of codes

## SQL Queries for Access Code Management

### 1. Create a New Access Code

```sql
-- Create a single-use access code
INSERT INTO public.access_codes (code, description, max_uses)
VALUES ('1234', 'Single-use code for VIP customer', 1);

-- Create a multi-use access code (2 uses)
INSERT INTO public.access_codes (code, description, max_uses)
VALUES ('AGENT50', 'Code for beta testers', 2);

-- Create an unlimited code (set max_uses to a high number)
INSERT INTO public.access_codes (code, description, max_uses)
VALUES ('UNLIMITED', 'Code for team members', 999);
```

### 2. View All Access Codes

```sql
-- View all active codes with usage statistics
SELECT 
    code,
    description,
    max_uses,
    current_uses,
    (max_uses - current_uses) AS remaining_uses,
    is_active,
    created_at,
    expires_at
FROM public.access_codes
ORDER BY created_at DESC;
```

### 3. View Code Usage History

```sql
-- View usage history for all codes
SELECT 
    ac.code,
    ac.description,
    acu.used_at,
    acu.user_email,
    acu.ip_address
FROM public.access_code_usage acu
JOIN public.access_codes ac ON acu.access_code_id = ac.id
ORDER BY acu.used_at DESC;

-- View usage for a specific code
SELECT 
    acu.used_at,
    acu.user_email,
    acu.ip_address,
    acu.user_agent
FROM public.access_code_usage acu
JOIN public.access_codes ac ON acu.access_code_id = ac.id
WHERE ac.code = '6388'
ORDER BY acu.used_at DESC;
```

### 4. Update Access Code Settings

```sql
-- Change the number of allowed uses for a code
UPDATE public.access_codes 
SET max_uses = 5 
WHERE code = '6388';

-- Deactivate a code
UPDATE public.access_codes 
SET is_active = false 
WHERE code = '1234';

-- Reactivate a code
UPDATE public.access_codes 
SET is_active = true 
WHERE code = '1234';

-- Set expiration date for a code
UPDATE public.access_codes 
SET expires_at = '2024-12-31 23:59:59+00'
WHERE code = 'TEMP2024';

-- Reset usage count for a code
UPDATE public.access_codes 
SET current_uses = 0 
WHERE code = '6388';
```

### 5. Delete Access Codes

```sql
-- Delete a specific access code (and all its usage records)
DELETE FROM public.access_codes WHERE code = '1234';

-- Delete all expired codes
DELETE FROM public.access_codes 
WHERE expires_at IS NOT NULL AND expires_at < NOW();

-- Delete all used up codes
DELETE FROM public.access_codes 
WHERE current_uses >= max_uses AND max_uses < 999;
```

### 6. Monitoring and Analytics

```sql
-- Count total code usage
SELECT COUNT(*) as total_code_uses FROM public.access_code_usage;

-- Most used codes
SELECT 
    ac.code,
    ac.description,
    ac.current_uses,
    ac.max_uses
FROM public.access_codes ac
WHERE ac.current_uses > 0
ORDER BY ac.current_uses DESC;

-- Recent activity (last 24 hours)
SELECT 
    ac.code,
    COUNT(acu.id) as uses_today
FROM public.access_code_usage acu
JOIN public.access_codes ac ON acu.access_code_id = ac.id
WHERE acu.used_at > NOW() - INTERVAL '24 hours'
GROUP BY ac.code, ac.id
ORDER BY uses_today DESC;

-- Codes about to expire
SELECT 
    code,
    description,
    expires_at,
    (expires_at - NOW()) as time_remaining
FROM public.access_codes
WHERE expires_at IS NOT NULL 
AND expires_at > NOW() 
AND expires_at < NOW() + INTERVAL '7 days'
ORDER BY expires_at ASC;
```

### 7. Bulk Operations

```sql
-- Create multiple codes at once
INSERT INTO public.access_codes (code, description, max_uses) VALUES
('BETA01', 'Beta tester access', 2),
('BETA02', 'Beta tester access', 2),
('BETA03', 'Beta tester access', 2),
('BETA04', 'Beta tester access', 2),
('BETA05', 'Beta tester access', 2);

-- Deactivate all expired codes
UPDATE public.access_codes 
SET is_active = false 
WHERE expires_at IS NOT NULL AND expires_at < NOW();
```

## Function Usage

### Using the Validation Function

The `validate_and_use_access_code` function can be called directly:

```sql
-- Validate and use a code
SELECT public.validate_and_use_access_code('6388', 'user@example.com', '192.168.1.1', 'Mozilla/5.0...');

-- Example successful response:
-- {"success": true, "code_id": "uuid", "remaining_uses": 1}

-- Example error response:
-- {"success": false, "error": "Access code has been used maximum number of times"}
```

## Security Notes

1. **Row Level Security (RLS)** is enabled on both tables
2. Anonymous users can only SELECT active codes and INSERT usage records
3. Authenticated users have full access to manage codes
4. The validation function is SECURITY DEFINER to ensure proper access control
5. All sensitive operations are logged in the usage table

## Best Practices

1. **Regular Cleanup**: Delete old usage records and expired codes
2. **Monitoring**: Set up alerts for unusual usage patterns
3. **Code Naming**: Use descriptive names and clear patterns
4. **Expiration**: Set expiration dates for temporary codes
5. **Usage Limits**: Be conservative with max_uses values
6. **Documentation**: Always add descriptions when creating codes 