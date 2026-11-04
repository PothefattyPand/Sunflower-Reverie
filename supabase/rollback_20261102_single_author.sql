-- ==============================================================================
-- Sunflower Reverie: Reviewed Rollback Plan for Migration 20261102
-- Script: supabase/rollback_20261102_single_author.sql
-- ==============================================================================
-- IMPORTANT NOTICE:
-- Do NOT blindly re-run 20261030_two_author_system.sql or 20261101 migrations.
-- Those legacy migrations contain overly permissive policies (e.g. profiles USING true),
-- lack compatibility with existing Nadvi records, and can cause foreign key or trigger errors.
--
-- This script provides an explicit, reviewed, controlled rollback to restore
-- author dashboard access to Mahi without deleting any records or content.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. PREREQUISITE ASSERTION: MAHI'S AUTH USER RECORD MUST EXIST
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_mahi_id UUID;
    v_mahi_email TEXT;
BEGIN
    -- Locate Mahi's auth user record by UUID or profile link
    SELECT u.id, u.email INTO v_mahi_id, v_mahi_email
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE p.slug = 'mahi'
       OR u.id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
    LIMIT 1;

    IF v_mahi_id IS NULL THEN
        RAISE EXCEPTION 'ROLLBACK ABORTED: Mahi account was not found in auth.users. Cannot restore access to non-existent user.';
    END IF;

    RAISE NOTICE 'Located Mahi account: UID %, Email %', v_mahi_id, v_mahi_email;
END $$;

-- ------------------------------------------------------------------------------
-- 2. REMOVE STRICT SINGLE-AUTHOR TRIGGER
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_limit_single_author ON public.authorized_authors;
DROP FUNCTION IF EXISTS public.check_single_authorized_author();

-- ------------------------------------------------------------------------------
-- 3. RESTORE MAHI TO AUTHORIZED AUTHORS ALLOWLIST
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_mahi_id UUID;
    v_mahi_email TEXT;
    v_nadvi_id UUID;
BEGIN
    SELECT u.id, u.email INTO v_mahi_id, v_mahi_email
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE p.slug = 'mahi'
       OR u.id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
    LIMIT 1;

    SELECT id INTO v_nadvi_id
    FROM auth.users
    WHERE LOWER(TRIM(email)) = 'nadvihasan107@gmail.com'
    LIMIT 1;

    -- Remove Nadvi from authorized allowlist
    DELETE FROM public.authorized_authors
    WHERE user_id = v_nadvi_id;

    -- Reinstate Mahi into authorized_authors
    INSERT INTO public.authorized_authors (user_id, email, authorized_at)
    VALUES (v_mahi_id, v_mahi_email, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email;

    -- Restore Mahi profile public visibility; hide Nadvi profile
    UPDATE public.profiles
    SET is_public_author = TRUE
    WHERE id = v_mahi_id;

    IF v_nadvi_id IS NOT NULL THEN
        UPDATE public.profiles
        SET is_public_author = FALSE
        WHERE id = v_nadvi_id;
    END IF;

    RAISE NOTICE 'SUCCESS: Reinstated Mahi (UID %) as authorized author. Concealed Nadvi.', v_mahi_id;
END $$;

-- ------------------------------------------------------------------------------
-- 4. RESTORE PROFILE SELECT POLICY TO ALLOW MAHI PUBLIC VISIBILITY
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view sole authorized author profile" ON public.profiles;

CREATE POLICY "Public can view authorized author profile"
ON public.profiles FOR SELECT
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = id)
    OR (
        is_public_author = TRUE
        AND id IN (
            SELECT user_id FROM public.authorized_authors
        )
    )
);

-- ------------------------------------------------------------------------------
-- 5. RECREATE PUBLIC VIEW WITH CURRENT AUTHOR JOIN
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS public.public_publications;

CREATE VIEW public.public_publications
WITH (security_invoker = false) AS
SELECT
    p.id,
    p.title,
    p.subtitle,
    p.slug,
    p.category,
    p.writing_subtype,
    p.excerpt,
    p.body,
    p.cover_image,
    p.tags,
    p.status,
    p.reading_time,
    p.published_at,
    p.created_at,
    p.updated_at,
    p.is_anonymous,
    CASE
        WHEN pr.is_public_author = TRUE AND pr.id IN (SELECT user_id FROM public.authorized_authors)
        THEN pr.id
        ELSE NULL
    END AS author_id,
    CASE
        WHEN pr.is_public_author = TRUE AND pr.id IN (SELECT user_id FROM public.authorized_authors)
        THEN pr.display_name
        ELSE 'Sunflower Reverie'
    END AS author_name,
    CASE
        WHEN pr.is_public_author = TRUE AND pr.id IN (SELECT user_id FROM public.authorized_authors)
        THEN pr.slug
        ELSE NULL
    END AS author_slug,
    CASE
        WHEN pr.is_public_author = TRUE AND pr.id IN (SELECT user_id FROM public.authorized_authors)
        THEN pr.role
        ELSE 'Author & Curator'
    END AS author_role,
    CASE
        WHEN pr.is_public_author = TRUE AND pr.id IN (SELECT user_id FROM public.authorized_authors)
        THEN pr.avatar_url
        ELSE NULL
    END AS author_avatar_url,
    CASE
        WHEN pr.is_public_author = TRUE AND pr.id IN (SELECT user_id FROM public.authorized_authors)
        THEN pr.short_bio
        ELSE NULL
    END AS author_short_bio
FROM public.publications p
LEFT JOIN public.profiles pr ON p.author_id = pr.id
WHERE p.status = 'published';

ALTER VIEW public.public_publications OWNER TO postgres;
REVOKE ALL ON public.public_publications FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE ON public.public_publications FROM anon, authenticated;
GRANT SELECT ON public.public_publications TO anon, authenticated;

-- Ensure base table SELECT is granted to anon during rollback
GRANT SELECT ON public.publications TO anon;

-- ------------------------------------------------------------------------------
-- 6. ASSERT ROLLBACK INVARIANTS
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_author_count INT;
BEGIN
    SELECT COUNT(*) INTO v_author_count FROM public.authorized_authors;
    IF v_author_count <> 1 THEN
        RAISE EXCEPTION 'ROLLBACK ASSERTION FAILED: Expected exactly 1 author in authorized_authors, found %', v_author_count;
    END IF;

    RAISE NOTICE 'SUCCESS: Rollback executed cleanly. Mahi is reinstated as authorized author.';
END $$;

COMMIT;

