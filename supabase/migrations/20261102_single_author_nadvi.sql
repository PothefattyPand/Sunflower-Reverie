-- ==============================================================================
-- Sunflower Reverie: Single Author Architecture & Hardened Security Migration
-- Migration: 20261102_single_author_nadvi.sql (Stage 1: Production Hardening)
-- ==============================================================================
-- Security Invariants & Production Specifications:
-- 1. Sole Authorized Author: nadvihasan107@gmail.com (Nadvi).
-- 2. Prerequisite Assertion: Validates Nadvi's account exists in auth.users.
-- 3. Atomic Allowlist Transition: Revokes Mahi's authorization and registers Nadvi.
--    Exactly 1 record in public.authorized_authors matching Nadvi's real auth.users UUID.
-- 4. Impersonation-Proof Single-Author Trigger:
--    - Evaluates BEFORE INSERT OR UPDATE on public.authorized_authors.
--    - Re-validates user_id against genuine auth.users ID for nadvihasan107@gmail.com.
--    - Prevents email tampering, UUID spoofing, or adding secondary authors.
-- 5. Comprehensive Privilege Hardening (Table & Column Level):
--    - Clears all existing column-level privileges on core tables.
--    - Revokes excessive table privileges from anon, authenticated, and PUBLIC.
--    - Grants column-level write privileges on profiles strictly omitting is_public_author and id.
-- 6. Clean Policy Slate:
--    - Drops all legacy/permissive policies across authorized_authors, profiles,
--      publications, and storage.objects to ensure no permissive policy undermines security.
-- 7. Public Author Profile Policy:
--    - Exposes ONLY Nadvi's approved public profile to public/anonymous visitors.
--    - Retired authors (Mahi) are strictly hidden at the database engine level.
-- 8. Public Projection View (public.public_publications):
--    - Inspects view dependencies before drop (no silent exception swallowing).
--    - Controlled recreation with exact 22 columns; projects Nadvi and redacts UUIDs.
--    - Read-only: SELECT granted to anon and authenticated; write operations revoked.
-- 9. Zero-Downtime Rollout Support (Stage 1):
--    - Retains SELECT on base table for anon (governed strictly by status = 'published')
--      until new frontend is deployed, after which Stage 2 migration revokes base table access.
-- 10. Hardened Storage Policies:
--    - Strict verified object ownership (owner = auth.uid() OR owner_id = auth.uid()::text).
--    - Folder name match alone cannot override a recorded object owner.
-- 11. Zero Invented Details & No Hardcoded Passwords:
--    - Clean profile placeholders; credentials managed via Supabase Auth.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. PREREQUISITE ASSERTION: NADVI'S AUTH ACCOUNT MUST EXIST
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_nadvi_id UUID;
BEGIN
    SELECT id INTO v_nadvi_id
    FROM auth.users
    WHERE LOWER(TRIM(email)) = 'nadvihasan107@gmail.com'
    LIMIT 1;

    IF v_nadvi_id IS NULL THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: Account nadvihasan107@gmail.com was not found in auth.users. Please create the user account in Supabase Studio (Authentication -> Users -> Add User) before executing this migration.';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. ATOMIC ALLOWLIST TRANSITION (REPLACE MAHI WITH NADVI)
-- ------------------------------------------------------------------------------
-- Drop previous triggers that would interfere with allowlist transition
DROP TRIGGER IF EXISTS trg_limit_two_authors ON public.authorized_authors;
DROP TRIGGER IF EXISTS trg_limit_single_author ON public.authorized_authors;
DROP FUNCTION IF EXISTS public.check_max_authorized_authors();

DO $$
DECLARE
    v_nadvi_id UUID;
    v_nadvi_email TEXT;
    v_mahi_revoked_count INT;
BEGIN
    -- Locate confirmed Nadvi auth account
    SELECT id, email INTO v_nadvi_id, v_nadvi_email
    FROM auth.users
    WHERE LOWER(TRIM(email)) = 'nadvihasan107@gmail.com'
    ORDER BY created_at DESC
    LIMIT 1;

    -- 1. Revoke authorization for all other accounts (safely retires Mahi without deleting account)
    DELETE FROM public.authorized_authors
    WHERE user_id <> v_nadvi_id;

    GET DIAGNOSTICS v_mahi_revoked_count = ROW_COUNT;

    -- 2. Insert or update Nadvi into authorized_authors allowlist
    INSERT INTO public.authorized_authors (user_id, email, authorized_at)
    VALUES (v_nadvi_id, 'nadvihasan107@gmail.com', NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET email = 'nadvihasan107@gmail.com',
        authorized_at = NOW();

    -- 3. Assert exactly one authorized account exists and matches Nadvi
    IF (SELECT COUNT(*) FROM public.authorized_authors) <> 1 THEN
        RAISE EXCEPTION 'Security invariant violation: Exactly one authorized author must exist in public.authorized_authors.';
    END IF;

    IF (SELECT user_id FROM public.authorized_authors LIMIT 1) <> v_nadvi_id THEN
        RAISE EXCEPTION 'Security invariant violation: Authorized author user_id does not match Nadvi auth UUID.';
    END IF;

    RAISE NOTICE 'SUCCESS: Allowlist transition complete. Nadvi (UID: %) is the sole authorized author. Revoked % prior author(s).',
        v_nadvi_id, v_mahi_revoked_count;
END $$;

-- ------------------------------------------------------------------------------
-- 3. PERMANENT IMPERSONATION-PROOF SINGLE-AUTHOR TRIGGER & HELPER
-- ------------------------------------------------------------------------------
-- Validates BOTH INSERT and UPDATE on public.authorized_authors.
-- Prevents spoofing Nadvi's email with a different user's UUID, or changing Nadvi's record.
CREATE OR REPLACE FUNCTION public.check_single_authorized_author()
RETURNS TRIGGER AS $$
DECLARE
    v_nadvi_id UUID;
BEGIN
    -- 1. Resolve Nadvi's genuine auth.users ID
    SELECT id INTO v_nadvi_id
    FROM auth.users
    WHERE LOWER(TRIM(email)) = 'nadvihasan107@gmail.com'
    LIMIT 1;

    IF v_nadvi_id IS NULL THEN
        RAISE EXCEPTION 'Sunflower Reverie Security Policy: Sole authorized author account (nadvihasan107@gmail.com) does not exist in auth.users.';
    END IF;

    -- 2. Strict email validation
    IF LOWER(TRIM(NEW.email)) <> 'nadvihasan107@gmail.com' THEN
        RAISE EXCEPTION 'Sunflower Reverie Security Policy: Only nadvihasan107@gmail.com is authorized as the sanctuary author.';
    END IF;

    -- 3. Strict user_id validation against the real auth.users UUID (prevents UUID spoofing/impersonation)
    IF NEW.user_id <> v_nadvi_id THEN
        RAISE EXCEPTION 'Sunflower Reverie Security Policy: user_id (%) does not match the genuine auth.users UUID for nadvihasan107@gmail.com.', NEW.user_id;
    END IF;

    -- 4. Strict single-author limit (no additional authors)
    IF (SELECT COUNT(*) FROM public.authorized_authors WHERE user_id <> NEW.user_id) >= 1 THEN
        RAISE EXCEPTION 'Sunflower Reverie Security Policy: Exactly one authorized author account is permitted in authorized_authors.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE TRIGGER trg_limit_single_author
BEFORE INSERT OR UPDATE ON public.authorized_authors
FOR EACH ROW EXECUTE FUNCTION public.check_single_authorized_author();

-- Ensure is_authorized_author helper is hardened and explicit
CREATE OR REPLACE FUNCTION public.is_authorized_author(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF check_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.authorized_authors WHERE user_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Hardened SECURITY DEFINER helper to verify sole public author without
-- leaking direct SELECT privileges on public.authorized_authors to anon
CREATE OR REPLACE FUNCTION public.is_sole_public_author(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF check_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 
        FROM public.authorized_authors 
        WHERE user_id = check_user_id
          AND LOWER(TRIM(email)) = 'nadvihasan107@gmail.com'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_authorized_author(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_sole_public_author(UUID) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 4. TABLE & COLUMN PRIVILEGE STRIPPING (authorized_authors, profiles, publications)
-- ------------------------------------------------------------------------------
-- PostgreSQL note: REVOKE ALL ON <table> revokes table-level privileges, but does NOT
-- remove independently granted column-level privileges.
-- We accurately inspect actual column-level ACL entries (pg_attribute.attacl IS NOT NULL)
-- and revoke independently granted column privileges from anon, authenticated, and PUBLIC
-- using valid PostgreSQL SQL syntax (unquoted keyword for PUBLIC, quoted identifier for roles).
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT 
            c.relname AS table_name,
            a.attname AS column_name,
            acl.privilege_type,
            acl.grantee,
            CASE WHEN acl.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(acl.grantee) END AS grantee_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_attribute a ON a.attrelid = c.oid
        CROSS JOIN LATERAL aclexplode(a.attacl) acl
        WHERE n.nspname = 'public'
          AND c.relname IN ('authorized_authors', 'profiles', 'publications')
          AND a.attnum > 0
          AND NOT a.attisdropped
          AND a.attacl IS NOT NULL
          AND (acl.grantee = 0 OR pg_get_userbyid(acl.grantee) IN ('anon', 'authenticated'))
    ) LOOP
        IF r.grantee = 0 THEN
            -- PostgreSQL reserved keyword PUBLIC must NOT be enclosed in quotes
            EXECUTE format(
                'REVOKE %s (%I) ON public.%I FROM PUBLIC',
                r.privilege_type, r.column_name, r.table_name
            );
        ELSE
            -- Quoted identifier for named roles
            EXECUTE format(
                'REVOKE %s (%I) ON public.%I FROM %I',
                r.privilege_type, r.column_name, r.table_name, r.grantee_name
            );
        END IF;
    END LOOP;
END $$;

-- Revoke all table-level privileges from anon, authenticated, and PUBLIC
REVOKE ALL ON public.authorized_authors FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.publications FROM PUBLIC, anon, authenticated;

-- Regrant approved table privileges to administrative roles
GRANT ALL ON public.authorized_authors TO postgres, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT ALL ON public.publications TO postgres, service_role;

-- ------------------------------------------------------------------------------
-- 5. authorized_authors PRIVILEGES & RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.authorized_authors ENABLE ROW LEVEL SECURITY;

-- Drop all legacy policies
DROP POLICY IF EXISTS "Authorized authors can view their status" ON public.authorized_authors;
DROP POLICY IF EXISTS "Allow authors to view authorization" ON public.authorized_authors;

-- Authenticated role can SELECT only (governed by self-check RLS)
GRANT SELECT ON public.authorized_authors TO authenticated;

CREATE POLICY "Authorized authors can view their status"
ON public.authorized_authors FOR SELECT
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. profiles SCHEMA, INITIALIZATION, PRIVILEGES & RLS
-- ------------------------------------------------------------------------------
-- Ensure required columns exist safely (idempotent schema evolution)
DO $$
BEGIN
    -- 1. Ensure interests column exists (TEXT[] DEFAULT '{}')
    -- Supports author literary interests and writing themes in profile editor
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'interests'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN interests TEXT[] DEFAULT '{}'::TEXT[];
    ELSE
        ALTER TABLE public.profiles
        ALTER COLUMN interests SET DEFAULT '{}'::TEXT[];
    END IF;

    -- 2. Ensure is_public_author column exists safely (BOOLEAN DEFAULT TRUE)
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'is_public_author'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN is_public_author BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
END $$;

-- Initialize Nadvi's essential profile record (WITHOUT invented bios, quotes, or links)
DO $$
DECLARE
    v_nadvi_id UUID;
BEGIN
    SELECT id INTO v_nadvi_id
    FROM auth.users
    WHERE LOWER(TRIM(email)) = 'nadvihasan107@gmail.com'
    LIMIT 1;

    INSERT INTO public.profiles (
        id,
        display_name,
        slug,
        role,
        short_bio,
        full_bio,
        quote,
        avatar_url,
        social_links,
        interests,
        is_public_author
    ) VALUES (
        v_nadvi_id,
        'Nadvi',
        'nadvi',
        'Author & Curator',
        NULL,              -- Left empty for Nadvi to write in Author Dashboard
        NULL,              -- Left empty for Nadvi to write in Author Dashboard
        NULL,              -- Left empty for Nadvi to write in Author Dashboard
        NULL,              -- Left empty for Nadvi to upload in Author Dashboard
        '[]'::JSONB,       -- Left empty for Nadvi to set in Author Dashboard
        '{}'::TEXT[],      -- Left empty for Nadvi to set in Author Dashboard
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        is_public_author = TRUE;

    -- Ensure Mahi's profile is strictly hidden from public views
    UPDATE public.profiles
    SET is_public_author = FALSE
    WHERE slug = 'mahi'
       OR id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID;

    RAISE NOTICE 'SUCCESS: Essential profile for Nadvi initialized and Mahi hidden.';
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for anon and authenticated (governed strictly by RLS)
GRANT SELECT ON public.profiles TO anon, authenticated;

-- Grant column-level write privileges to authenticated ONLY on approved author fields.
-- Notice is_public_author and id (on update) are strictly omitted!
GRANT INSERT (id, display_name, slug, role, short_bio, full_bio, quote, avatar_url, social_links, interests, created_at, updated_at)
ON public.profiles TO authenticated;

GRANT UPDATE (display_name, slug, role, short_bio, full_bio, quote, avatar_url, social_links, interests, updated_at)
ON public.profiles TO authenticated;

-- Drop all legacy/conflicting profile policies
DROP POLICY IF EXISTS "Public can view author profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view designated public authors" ON public.profiles;
DROP POLICY IF EXISTS "Author profile visibility policy" ON public.profiles;
DROP POLICY IF EXISTS "Public can view public author profiles or own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view sole authorized author profile" ON public.profiles;
DROP POLICY IF EXISTS "Authorized authors can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authorized authors can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authors can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authors can update own profile" ON public.profiles;

-- RLS: Only Nadvi's approved public profile is exposed to public / anon callers.
-- Uses hardened SECURITY DEFINER helper to avoid leaking authorized_authors SELECT to anon.
CREATE POLICY "Public can view sole authorized author profile"
ON public.profiles FOR SELECT
USING (
    -- Authenticated author can read their own profile (for dashboard/editing)
    (auth.uid() IS NOT NULL AND auth.uid() = id)
    -- Public / anon callers can ONLY view Nadvi's approved profile via SECURITY DEFINER helper
    OR (
        is_public_author = TRUE
        AND public.is_sole_public_author(id)
    )
);

CREATE POLICY "Authorized authors can update own profile"
ON public.profiles FOR UPDATE
USING (
    auth.uid() = id
    AND public.is_authorized_author(auth.uid())
)
WITH CHECK (
    auth.uid() = id
    AND public.is_authorized_author(auth.uid())
);

CREATE POLICY "Authorized authors can create own profile"
ON public.profiles FOR INSERT
WITH CHECK (
    auth.uid() = id
    AND public.is_authorized_author(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 7. publications SCHEMA, GRANTS & RLS
-- ------------------------------------------------------------------------------
-- Ensure is_anonymous column exists for backward schema compatibility (DEFAULT FALSE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'publications'
          AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE public.publications
        ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;
    ELSE
        ALTER TABLE public.publications
        ALTER COLUMN is_anonymous SET DEFAULT FALSE;
    END IF;
END $$;

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Authenticated authors can manage publications (governed by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publications TO authenticated;

-- For zero-downtime during deployment rollout (Stage 1), grant SELECT on base table to anon:
-- (Strictly governed by RLS: status = 'published' only; drafts can NEVER be read by anon)
GRANT SELECT ON public.publications TO anon;

-- Drop all legacy publication policies
DROP POLICY IF EXISTS "Publications visibility policy" ON public.publications;
DROP POLICY IF EXISTS "Public can view published publications" ON public.publications;
DROP POLICY IF EXISTS "Authors can view own publications" ON public.publications;
DROP POLICY IF EXISTS "Authorized authors can create publications" ON public.publications;
DROP POLICY IF EXISTS "Authors can update own publications" ON public.publications;
DROP POLICY IF EXISTS "Authors can delete own publications" ON public.publications;

-- SELECT Policy: Public visitors can read published posts; Nadvi can read own drafts
CREATE POLICY "Publications visibility policy"
ON public.publications FOR SELECT
USING (
    status = 'published'
    OR (
        auth.uid() IS NOT NULL
        AND author_id = auth.uid()
        AND public.is_authorized_author(auth.uid())
    )
);

-- INSERT Policy: Only authorized author (Nadvi) can create publications
CREATE POLICY "Authorized authors can create publications"
ON public.publications FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_authorized_author(auth.uid())
);

-- UPDATE Policy: Only authorized author (Nadvi) can update own publications
CREATE POLICY "Authors can update own publications"
ON public.publications FOR UPDATE
USING (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_authorized_author(auth.uid())
)
WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_authorized_author(auth.uid())
);

-- DELETE Policy: Only authorized author (Nadvi) can delete own publications
CREATE POLICY "Authors can delete own publications"
ON public.publications FOR DELETE
USING (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_authorized_author(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 8. PUBLIC PROJECTION VIEW (public.public_publications)
-- ------------------------------------------------------------------------------
-- Inspect database view dependencies before replacement (no silent exception swallowing)
DO $$
DECLARE
    v_dep_count INT;
BEGIN
    SELECT COUNT(*) INTO v_dep_count
    FROM pg_depend d
    JOIN pg_rewrite r ON r.oid = d.objid
    JOIN pg_class c ON c.oid = r.ev_class
    JOIN pg_class target ON target.oid = d.refobjid
    JOIN pg_namespace n ON n.oid = target.relnamespace
    WHERE target.relname = 'public_publications'
      AND n.nspname = 'public'
      AND c.relname <> 'public_publications';

    IF v_dep_count > 0 THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: % dependent object(s) rely on public.public_publications. Dropping the view without dependency management would leave broken database objects.', v_dep_count;
    END IF;
END $$;

-- Clean drop of existing view (if present)
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
    -- Strictly project only Nadvi's public identity; redact internal UUID or hidden author
    CASE
        WHEN pr.is_public_author = TRUE
             AND public.is_sole_public_author(pr.id)
        THEN pr.id
        ELSE NULL
    END AS author_id,
    CASE
        WHEN pr.is_public_author = TRUE
             AND public.is_sole_public_author(pr.id)
        THEN pr.display_name
        ELSE 'Sunflower Reverie'
    END AS author_name,
    CASE
        WHEN pr.is_public_author = TRUE
             AND public.is_sole_public_author(pr.id)
        THEN pr.slug
        ELSE NULL
    END AS author_slug,
    CASE
        WHEN pr.is_public_author = TRUE
             AND public.is_sole_public_author(pr.id)
        THEN pr.role
        ELSE 'Author & Curator'
    END AS author_role,
    CASE
        WHEN pr.is_public_author = TRUE
             AND public.is_sole_public_author(pr.id)
        THEN pr.avatar_url
        ELSE NULL
    END AS author_avatar_url,
    CASE
        WHEN pr.is_public_author = TRUE
             AND public.is_sole_public_author(pr.id)
        THEN pr.short_bio
        ELSE NULL
    END AS author_short_bio
FROM public.publications p
LEFT JOIN public.profiles pr ON p.author_id = pr.id
WHERE p.status = 'published';

ALTER VIEW public.public_publications OWNER TO postgres;

-- Revoke all write permissions; grant SELECT only to anon and authenticated
REVOKE ALL ON public.public_publications FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE ON public.public_publications FROM anon, authenticated;
GRANT SELECT ON public.public_publications TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 9. STORAGE BUCKET POLICIES (VERIFIED OBJECT OWNERSHIP & PATH RESTRICTIONS)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'sunflower-assets',
    'sunflower-assets',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

-- Drop all legacy storage policies
DROP POLICY IF EXISTS "Public can view sunflower assets" ON storage.objects;
DROP POLICY IF EXISTS "Authors can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Authors can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update own assets" ON storage.objects;
DROP POLICY IF EXISTS "Authors can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Authors can delete own assets" ON storage.objects;

-- SELECT Policy: Public can view assets
CREATE POLICY "Public can view sunflower assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'sunflower-assets');

-- INSERT Policy: Authorized author can upload to personal or permitted shared paths
CREATE POLICY "Authors can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'sunflower-assets'
    AND auth.uid() IS NOT NULL
    AND public.is_authorized_author(auth.uid())
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers')
    )
    -- Prevent spoofing owner on insert
    AND (owner IS NULL OR owner = auth.uid())
    AND (owner_id IS NULL OR owner_id = auth.uid()::text)
);

-- UPDATE Policy: Strict verified ownership; folder name alone cannot override recorded owner
CREATE POLICY "Authors can update own files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'sunflower-assets'
    AND auth.uid() IS NOT NULL
    AND public.is_authorized_author(auth.uid())
    -- Strict verified ownership
    AND (
        (owner IS NOT NULL AND owner = auth.uid())
        OR (owner_id IS NOT NULL AND owner_id = auth.uid()::text)
    )
    -- Path restriction
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers')
    )
)
WITH CHECK (
    bucket_id = 'sunflower-assets'
    AND auth.uid() IS NOT NULL
    AND public.is_authorized_author(auth.uid())
    AND (
        (owner IS NOT NULL AND owner = auth.uid())
        OR (owner_id IS NOT NULL AND owner_id = auth.uid()::text)
    )
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers')
    )
);

-- DELETE Policy: Strict verified ownership
CREATE POLICY "Authors can delete own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'sunflower-assets'
    AND auth.uid() IS NOT NULL
    AND public.is_authorized_author(auth.uid())
    -- Strict verified ownership
    AND (
        (owner IS NOT NULL AND owner = auth.uid())
        OR (owner_id IS NOT NULL AND owner_id = auth.uid()::text)
    )
    -- Path restriction
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers')
    )
);

-- ------------------------------------------------------------------------------
-- 10. POST-EXECUTION TRANSACTION INTEGRITY ASSERTIONS
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_nadvi_id UUID;
    v_author_count INT;
    v_has_unsafe_write BOOLEAN;
BEGIN
    SELECT id INTO v_nadvi_id
    FROM auth.users
    WHERE LOWER(TRIM(email)) = 'nadvihasan107@gmail.com'
    LIMIT 1;

    -- Assert exactly 1 author and matches Nadvi
    SELECT COUNT(*) INTO v_author_count FROM public.authorized_authors;
    IF v_author_count <> 1 THEN
        RAISE EXCEPTION 'POST-MIGRATION ASSERTION FAILED: Expected exactly 1 author, found %', v_author_count;
    END IF;

    IF (SELECT user_id FROM public.authorized_authors LIMIT 1) <> v_nadvi_id THEN
        RAISE EXCEPTION 'POST-MIGRATION ASSERTION FAILED: Sole author does not match Nadvi UUID';
    END IF;

    -- Assert no table-level write privilege on authorized_authors for anon or authenticated
    IF has_table_privilege('anon', 'public.authorized_authors', 'SELECT') THEN
        RAISE EXCEPTION 'POST-MIGRATION ASSERTION FAILED: anon has SELECT on authorized_authors';
    END IF;

    IF has_table_privilege('authenticated', 'public.authorized_authors', 'INSERT')
       OR has_table_privilege('authenticated', 'public.authorized_authors', 'UPDATE')
       OR has_table_privilege('authenticated', 'public.authorized_authors', 'DELETE') THEN
        RAISE EXCEPTION 'POST-MIGRATION ASSERTION FAILED: authenticated has write on authorized_authors';
    END IF;

    -- Assert no write privilege on profiles.is_public_author for authenticated
    IF has_column_privilege('authenticated', 'public.profiles', 'is_public_author', 'INSERT')
       OR has_column_privilege('authenticated', 'public.profiles', 'is_public_author', 'UPDATE') THEN
        RAISE EXCEPTION 'POST-MIGRATION ASSERTION FAILED: authenticated has write on profiles.is_public_author';
    END IF;

    -- Assert public_publications has exactly 22 columns
    IF (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'public_publications') <> 22 THEN
        RAISE EXCEPTION 'POST-MIGRATION ASSERTION FAILED: public_publications column count is not 22';
    END IF;

    -- Assert profiles.interests column exists with ARRAY type
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'interests'
          AND data_type = 'ARRAY'
    ) THEN
        RAISE EXCEPTION 'POST-MIGRATION ASSERTION FAILED: profiles.interests column missing or not array type';
    END IF;

    -- Assert is_sole_public_author helper functions correctly for Nadvi
    IF NOT public.is_sole_public_author(v_nadvi_id) THEN
        RAISE EXCEPTION 'POST-MIGRATION ASSERTION FAILED: is_sole_public_author returned FALSE for Nadvi';
    END IF;

    -- Assert impersonation-proof trigger is enabled and handles both INSERT and UPDATE
    IF (
        SELECT COUNT(*) 
        FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
          AND c.relname = 'authorized_authors'
          AND t.tgname = 'trg_limit_single_author' 
          AND t.tgenabled = 'O'
          AND (t.tgtype & 4 <> 0) 
          AND (t.tgtype & 16 <> 0) 
          AND NOT t.tgisinternal
    ) <> 1 THEN
        RAISE EXCEPTION 'POST-MIGRATION ASSERTION FAILED: trg_limit_single_author trigger not active for INSERT and UPDATE in pg_trigger';
    END IF;

    RAISE NOTICE 'SUCCESS: All post-migration assertions verified. Single-author Nadvi architecture is secure.';
END $$;

COMMIT;
