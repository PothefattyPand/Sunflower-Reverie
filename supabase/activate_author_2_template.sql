-- ==============================================================================
-- Sunflower Reverie: Activate Second Author (When Ready)
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Invite or sign up the second author in Supabase Dashboard -> Authentication -> Users.
-- 2. Replace 'second_author@example.com' below with their exact registered email address.
-- 3. Run this script in the Supabase SQL Editor.
-- ==============================================================================

DO $$
DECLARE
    v_target_email TEXT := 'second_author@example.com'; -- <<< CHANGE THIS TO SECOND AUTHOR'S EMAIL
    v_user RECORD;
    v_author_two_slug TEXT;
    v_author_two_name TEXT;
BEGIN
    SELECT id, email INTO v_user
    FROM auth.users
    WHERE email = lower(trim(v_target_email))
    LIMIT 1;

    IF v_user.id IS NULL THEN
        RAISE EXCEPTION 'User % not found in auth.users. Please invite or create the user in Authentication -> Users first.', v_target_email;
    END IF;

    -- 1. Insert into authorized_authors (enforced by trigger max 2 authors)
    INSERT INTO public.authorized_authors (user_id, email)
    VALUES (v_user.id, v_user.email)
    ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

    -- 2. Derive display name and slug
    v_author_two_name := initcap(split_part(v_user.email, '@', 1));
    v_author_two_slug := lower(regexp_replace(split_part(v_user.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g'));

    -- 3. Create or update profile in public.profiles
    INSERT INTO public.profiles (
        id, display_name, slug, role, short_bio, full_bio, quote, social_links
    ) VALUES (
        v_user.id,
        v_author_two_name,
        v_author_two_slug,
        'Narrative Essayist, Diarist & Co-Curator',
        'A chronicler of garden seasons, reflective memoirs, and intimate epistolary letters written beneath the afternoon sun.',
        v_author_two_name || ' tends to the afternoon folios and chronicles of Sunflower Reverie. Focusing on personal journals, literary short narratives, and epistolary correspondences, their works celebrate the patience required to let thoughts mature like seeds beneath autumn soil.',
        'In the garden of language, every sentence seeks its own light.',
        json_build_array(
            json_build_object('platform', 'Substack', 'url', 'https://substack.com'),
            json_build_object('platform', 'Goodreads', 'url', 'https://goodreads.com'),
            json_build_object('platform', 'Email', 'url', 'mailto:' || v_user.email)
        )::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'SUCCESS: Author 2 (%) successfully authorized and activated in Sunflower Reverie!', v_user.email;
END $$;

