-- Add admin user automatically for any existing authenticated users
-- This will make the first authenticated user an admin

DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first authenticated user
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If we found a user, make them admin
    IF first_user_id IS NOT NULL THEN
        INSERT INTO admin_users (user_id, role) 
        VALUES (first_user_id, 'admin')
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Added user % as admin', first_user_id;
    ELSE
        RAISE NOTICE 'No authenticated users found. Create a user account first, then run this migration again.';
    END IF;
END $$;