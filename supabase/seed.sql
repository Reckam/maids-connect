-- This script is now idempotent and can be run multiple times.

DO $$
DECLARE
    admin_email TEXT := 'maids.admin@email.com';
    admin_user_id UUID;
BEGIN
    -- Check if the admin user already exists in auth.users
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;

    -- If the user doesn't exist, create it.
    IF admin_user_id IS NULL THEN
        -- Insert the admin user into auth.users and capture the generated UUID
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            uuid_generate_v4(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt('MaidsConnect123', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"user_type": "admin", "full_name": "Maids Admin"}',
            now(),
            now()
        ) RETURNING id INTO admin_user_id;

        RAISE NOTICE 'Admin user created in auth.users with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user already exists in auth.users with ID: %', admin_user_id;
    END IF;

    -- Check if the profile exists and create it if it doesn't.
    -- This ensures the profile exists even if the auth user was already there.
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = admin_user_id) THEN
        -- Directly insert the corresponding profile into public.users
        INSERT INTO public.users (id, full_name, user_type, is_verified, district)
        VALUES (admin_user_id, 'Maids Admin', 'admin', true, 'Kampala');
        
        RAISE NOTICE 'Admin profile created in public.users for ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin profile already exists in public.users for ID: %', admin_user_id;
    END IF;

END $$;
