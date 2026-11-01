-- ==============================================================================
-- Sunflower Reverie — Database Migration: Single Public Author & Secure Anonymous Publishing
-- File: supabase/migrations/20261101_single_public_author_and_anonymous.sql
-- ==============================================================================
-- SECURITY ARCHITECTURE & DEFENSE-IN-DEPTH:
-- 1. Dual-Layer Profile Visibility Protection:
--    - In PostgreSQL, table-level write grants allow modifying all columns, bypassing column-level REVOKEs.
--      Therefore, table-level INSERT/UPDATE is revoked from anon, authenticated, and PUBLIC, and re-granted
--      ONLY on specific safe editable columns, strictly omitting `is_public_author`.
--    - The trigger `protect_profile_public_visibility` is defined without SECURITY DEFINER (using standard
--      invoker privileges) so CURRENT_USER and SESSION_USER accurately reflect the caller rather than the function owner.
--    - An operation is administrative ONLY if executed in an admin database session (postgres/supabase_admin)
--      without a client JWT, or with the trusted service_role key.
--    - Absolute Failsafe: The trigger explicitly forbids designating Mahi as a public author under any circumstances.
-- 2. Database-Level Public/Private Data Separation:
--    - REVOKE ALL on `public.publications` from roles `anon` and `PUBLIC`.
--    - RLS policy on `public.publications` restricts SELECT to authenticated authors for their own rows only.
--    - Cross-author draft and post isolation on the base table: Author 1 cannot query Author 2's rows directly.
-- 3. Secure Public Projection View (`public.public_publications`):
--    - Created with `WITH (security_invoker = false)` and owned by `postgres` so it executes with definer
--      privileges to safely expose the sanitized public dataset without granting table privileges to anon.
--    - Strictly filters `WHERE status = 'published'`. Drafts can NEVER be returned.
--    - Redacts `author_id` (NULL) and sanitizes `author_name` ('Anonymous') for all anonymous publications,
--      un-designated public authors, and specifically Mahi (UUID: 76aaf5a8-7029-45dc-a7c7-ad4f25255be6).
--    - Explicitly sets view owner to `postgres`, revokes write operations from PUBLIC/anon/authenticated,
--      and grants SELECT to `anon` and `authenticated`.
-- 4. Storage Bucket Ownership & Shared Folder Isolation:
--    - Authors can upload to their own `{author_id}/*` folder or permitted shared folders (`writings`, `public`, `covers`).
--    - UPDATE and DELETE policies strictly enforce `owner_id = auth.uid()::text` (or `owner = auth.uid()`),
--      guaranteeing that neither author can overwrite, modify, transfer, or delete the other author's assets,
--      even inside shared folders.
--    - Preserves public SELECT access for reading assets in `sunflower-assets`.
-- 5. Least-Privilege Function Grants:
--    - Revokes execute permissions from PUBLIC/anon/authenticated on internal trigger functions.
--    - Grants execute only on `public.is_authorized_author(UUID)` as needed for RLS.
-- 6. Safe Transactional Execution:
--    - Entire migration is wrapped in a single explicit transaction (BEGIN ... COMMIT).
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. PROFILES: ADD `is_public_author` COLUMN (IDEMPOTENT & NON-DESTRUCTIVE)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'is_public_author'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN is_public_author BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- Specifically ensure Mahi is marked as hidden (private author).
-- Does NOT reset other profiles that an administrator may have already designated as public!
UPDATE public.profiles
SET is_public_author = FALSE
WHERE id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID OR slug = 'mahi';

-- Ensure any existing records with NULL are safely set to FALSE
UPDATE public.profiles
SET is_public_author = FALSE
WHERE is_public_author IS NULL;

-- Index for efficient public author queries
CREATE INDEX IF NOT EXISTS idx_profiles_public_author ON public.profiles (is_public_author);

-- ------------------------------------------------------------------------------
-- 2. PROFILES: PROTECT `is_public_author` FROM UNAUTHORIZED ELEVATION
-- ------------------------------------------------------------------------------
-- Layer 1: Revoke broad table-level write grants from client roles.
-- In PostgreSQL, table-level grants allow modifying all columns, bypassing column-level REVOKEs.
-- Therefore, table-level INSERT/UPDATE/DELETE is revoked from anon, authenticated, and PUBLIC:
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, PUBLIC;
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;

-- Grant column-specific write privileges to authenticated role on safe editable columns ONLY.
-- Notice that `is_public_author` and `id` (on update) are strictly omitted:
GRANT INSERT (id, display_name, slug, role, short_bio, full_bio, quote, avatar_url, social_links, interests, created_at, updated_at)
ON public.profiles TO authenticated;

GRANT UPDATE (display_name, slug, role, short_bio, full_bio, quote, avatar_url, social_links, interests, updated_at)
ON public.profiles TO authenticated;

-- Ensure database administrators and service_role retain full administrative rights
GRANT ALL ON public.profiles TO postgres, service_role;

-- Layer 2: Trigger enforcing admin-only modifications on INSERT and UPDATE.
-- Note: Intentionally NOT SECURITY DEFINER so that CURRENT_USER and SESSION_USER accurately
-- reflect the caller's role, avoiding PostgreSQL's execution context switch to the function owner.
CREATE OR REPLACE FUNCTION public.protect_profile_public_visibility()
RETURNS TRIGGER AS $$
DECLARE
    v_jwt_role TEXT;
    v_session_user TEXT;
    v_current_user TEXT;
    v_is_admin BOOLEAN := FALSE;
BEGIN
    v_jwt_role := COALESCE(
        current_setting('request.jwt.claim.role', true),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'role'),
        ''
    );
    v_session_user := SESSION_USER;
    v_current_user := CURRENT_USER;

    -- An operation is considered administrative ONLY if:
    -- 1. Executed directly via database superuser/admin (postgres/supabase_admin) without an unprivileged JWT
    -- 2. OR executed via trusted service_role key
    IF (v_session_user IN ('postgres', 'supabase_admin') AND v_current_user IN ('postgres', 'supabase_admin') AND v_jwt_role NOT IN ('authenticated', 'anon'))
       OR v_jwt_role = 'service_role' THEN
        v_is_admin := TRUE;
    END IF;

    -- Failsafe: Mahi can NEVER be made public under any circumstances, even by an administrator
    IF (NEW.id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID OR NEW.slug = 'mahi') AND NEW.is_public_author IS TRUE THEN
        RAISE EXCEPTION 'Security violation: Mahi is designated as a permanently hidden author and cannot be made public.';
    END IF;

    IF TG_OP = 'INSERT' THEN
        -- If an author inserts a new profile, force is_public_author to FALSE unless run by admin / service_role
        IF NEW.is_public_author IS TRUE AND NOT v_is_admin THEN
            NEW.is_public_author := FALSE;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If an author updates their profile, disallow changing is_public_author
        IF NEW.is_public_author IS DISTINCT FROM OLD.is_public_author AND NOT v_is_admin THEN
            RAISE EXCEPTION 'Security violation: Author public visibility (is_public_author) can only be modified by administrators.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Revoke direct execution of trigger function from unprivileged roles
REVOKE ALL ON FUNCTION public.protect_profile_public_visibility() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_profile_public_visibility ON public.profiles;
CREATE TRIGGER trg_protect_profile_public_visibility
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_public_visibility();

-- ------------------------------------------------------------------------------
-- 3. PROFILES: ROW LEVEL SECURITY FOR PUBLIC SELECT
-- ------------------------------------------------------------------------------
-- Public visitors can only view profiles marked as public (and never Mahi).
-- Logged-in authors can view their own profile.
DROP POLICY IF EXISTS "Public can view author profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view public author profiles or own profile" ON public.profiles;

CREATE POLICY "Public can view public author profiles or own profile"
ON public.profiles FOR SELECT
USING (
    (
        is_public_author = TRUE
        AND slug <> 'mahi'
        AND id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
    )
    OR (
        auth.uid() IS NOT NULL
        AND auth.uid() = id
    )
);

-- ------------------------------------------------------------------------------
-- 4. PUBLICATIONS: ADD `is_anonymous` COLUMN
-- ------------------------------------------------------------------------------
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
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_publications_anonymous ON public.publications (is_anonymous);

-- ------------------------------------------------------------------------------
-- 5. PUBLICATIONS: SECURE BASE TABLE ACCESS & CROSS-AUTHOR ISOLATION
-- ------------------------------------------------------------------------------
-- A. Revoke all direct privileges on base publications table from anonymous and public roles
REVOKE ALL ON public.publications FROM anon, PUBLIC;

-- B. Ensure authenticated authors have necessary CRUD grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publications TO authenticated;

-- C. Ensure postgres and service_role retain full access
GRANT ALL ON public.publications TO postgres, service_role;

-- D. Drop old permissive visibility policies
DROP POLICY IF EXISTS "Publications visibility policy" ON public.publications;
DROP POLICY IF EXISTS "Authors can view own publications" ON public.publications;

-- E. Enforce strict author-only SELECT policy on the base table.
-- Cross-author isolation: Each author can ONLY see their own publications (drafts + published).
-- Anonymous users cannot see any rows on the base table.
CREATE POLICY "Authors can view own publications"
ON public.publications FOR SELECT
TO authenticated
USING (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_authorized_author(auth.uid())
);

-- F. Re-affirm strict author-only write policies on the base table
DROP POLICY IF EXISTS "Authorized authors can create publications" ON public.publications;
CREATE POLICY "Authorized authors can create publications"
ON public.publications FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_authorized_author(auth.uid())
);

DROP POLICY IF EXISTS "Authors can update own publications" ON public.publications;
CREATE POLICY "Authors can update own publications"
ON public.publications FOR UPDATE
TO authenticated
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

DROP POLICY IF EXISTS "Authors can delete own publications" ON public.publications;
CREATE POLICY "Authors can delete own publications"
ON public.publications FOR DELETE
TO authenticated
USING (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_authorized_author(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 6. PUBLIC-SAFE PROJECTION VIEW: `public_publications`
-- ------------------------------------------------------------------------------
-- Security definer view (security_invoker = false) owned by postgres provides the curated public dataset.
-- 1. Strictly filters status = 'published' (drafts are never accessible).
-- 2. Strips all identifying author metadata (name, slug, avatar, bio, and author_id UUID) whenever:
--    a) The publication has is_anonymous = TRUE, OR
--    b) The author has is_public_author = FALSE (hidden author), OR
--    c) The author is Mahi (UUID: 76aaf5a8-7029-45dc-a7c7-ad4f25255be6 / slug 'mahi').
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_publications
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
    -- Strictly sanitize author identity for public consumption
    CASE
        WHEN pr.is_public_author = TRUE
             AND p.is_anonymous = FALSE
             AND pr.slug <> 'mahi'
             AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
        THEN pr.id
        ELSE NULL
    END AS author_id,
    CASE
        WHEN pr.is_public_author = TRUE
             AND p.is_anonymous = FALSE
             AND pr.slug <> 'mahi'
             AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
        THEN pr.display_name
        ELSE 'Anonymous'
    END AS author_name,
    CASE
        WHEN pr.is_public_author = TRUE
             AND p.is_anonymous = FALSE
             AND pr.slug <> 'mahi'
             AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
        THEN pr.slug
        ELSE NULL
    END AS author_slug,
    CASE
        WHEN pr.is_public_author = TRUE
             AND p.is_anonymous = FALSE
             AND pr.slug <> 'mahi'
             AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
        THEN pr.role
        ELSE 'Contributing Author'
    END AS author_role,
    CASE
        WHEN pr.is_public_author = TRUE
             AND p.is_anonymous = FALSE
             AND pr.slug <> 'mahi'
             AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
        THEN pr.avatar_url
        ELSE NULL
    END AS author_avatar_url,
    CASE
        WHEN pr.is_public_author = TRUE
             AND p.is_anonymous = FALSE
             AND pr.slug <> 'mahi'
             AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
        THEN pr.short_bio
        ELSE NULL
    END AS author_short_bio
FROM public.publications p
LEFT JOIN public.profiles pr ON p.author_id = pr.id
WHERE p.status = 'published';

-- Explicitly assign view ownership to postgres
ALTER VIEW public.public_publications OWNER TO postgres;

-- Revoke write privileges on view from PUBLIC, anon, and authenticated
REVOKE ALL ON public.public_publications FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE ON public.public_publications FROM anon, authenticated;

-- Grant SELECT on the sanitized view to public visitors and authors
GRANT SELECT ON public.public_publications TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKET: STRICT AUTHOR OWNERSHIP & SHARED FOLDER ISOLATION
-- ------------------------------------------------------------------------------
-- Drop all previous policies to avoid any permissive-policy bypasses
DROP POLICY IF EXISTS "Public can view sunflower assets" ON storage.objects;
DROP POLICY IF EXISTS "Authors can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Authors can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update own assets" ON storage.objects;
DROP POLICY IF EXISTS "Authors can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Authors can delete assets" ON storage.objects;
DROP POLICY IF EXISTS "Authors can delete own assets" ON storage.objects;

-- A. Public read access for sunflower-assets
CREATE POLICY "Public can view sunflower assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'sunflower-assets');

-- B. Author upload access:
-- Authors can upload new objects to their own folder OR permitted shared folders (writings, public, covers).
-- Enforces that owner_id matches the uploading author so ownership cannot be spoofed.
CREATE POLICY "Authors can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'sunflower-assets'
    AND auth.uid() IS NOT NULL
    AND public.is_authorized_author(auth.uid())
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers')
    )
    AND (
        owner_id = (select auth.uid()::text)
        OR (owner_id IS NULL AND owner = auth.uid())
    )
);

-- C. Author update access:
-- Authors can update ONLY objects they own (owner_id / owner match auth.uid()).
-- USING and WITH CHECK conditions prevent authors from modifying others' files
-- and prevent transferring ownership of an existing object.
CREATE POLICY "Authors can update own assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'sunflower-assets'
    AND auth.uid() IS NOT NULL
    AND public.is_authorized_author(auth.uid())
    AND (
        owner_id = (select auth.uid()::text)
        OR owner = auth.uid()
    )
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
        owner_id = (select auth.uid()::text)
        OR owner = auth.uid()
    )
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers')
    )
);

-- D. Author delete access:
-- Authors can delete ONLY objects they own (owner_id / owner match auth.uid()).
-- Neither author can delete the other's images in shared folders (writings, public, covers).
CREATE POLICY "Authors can delete own assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'sunflower-assets'
    AND auth.uid() IS NOT NULL
    AND public.is_authorized_author(auth.uid())
    AND (
        owner_id = (select auth.uid()::text)
        OR owner = auth.uid()
    )
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers')
    )
);

-- ------------------------------------------------------------------------------
-- 8. DATABASE FUNCTIONS: LEAST-PRIVILEGE SECURITY HARDENING
-- ------------------------------------------------------------------------------
-- Ensure only authorized helper functions can be executed by client roles.
GRANT EXECUTE ON FUNCTION public.is_authorized_author(UUID) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.protect_profile_public_visibility() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_max_authorized_authors() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_publication_author_immutable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

COMMIT;

-- ==============================================================================
-- POST-MIGRATION INSTRUCTIONS & OPERATIONAL RUNBOOK
-- ==============================================================================
--
-- A. PRE-MIGRATION BACKUP PREREQUISITE:
--    In the Supabase Dashboard, navigate to Database -> Backups and trigger a manual
--    backup snapshot before executing this migration.
--
-- B. DESIGNATING AUTHOR 2 AS THE SINGLE PUBLIC AUTHOR:
--    When Author 2 is invited and ready to appear publicly, run this single command
--    in the Supabase SQL Editor (as database admin) or via service_role:
--
--      UPDATE public.profiles
--      SET is_public_author = TRUE
--      WHERE id = '<author-2-uuid>';
--
--    (Note: Attempting to designate Mahi will be blocked by the trigger failsafe).
--
-- C. CONSERVATIVE, IDENTITY-SAFE ROLLBACK PROCEDURE (IF REQUIRED):
--    If a rollback is ever necessary, NEVER restore broad permissions or USING (true),
--    as that would expose Mahi's profile and raw author UUIDs!
--    Execute the following conservative rollback in the SQL Editor:
--
--      BEGIN;
--      -- 1. Ensure profiles remains private for hidden authors (Mahi is NEVER exposed)
--      DROP POLICY IF EXISTS "Public can view public author profiles or own profile" ON public.profiles;
--      CREATE POLICY "Public can view public author profiles or own profile"
--      ON public.profiles FOR SELECT
--      USING (
--          (is_public_author = TRUE AND slug <> 'mahi' AND id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID)
--          OR (auth.uid() IS NOT NULL AND auth.uid() = id)
--      );
--
--      -- 2. Keep raw base publications table blocked from anonymous role
--      REVOKE ALL ON public.publications FROM anon, PUBLIC;
--
--      -- 3. Restore storage to author-isolated folder policies
--      DROP POLICY IF EXISTS "Authors can upload assets" ON storage.objects;
--      DROP POLICY IF EXISTS "Authors can update own assets" ON storage.objects;
--      DROP POLICY IF EXISTS "Authors can delete own assets" ON storage.objects;
--
--      CREATE POLICY "Authors can upload to own folder"
--      ON storage.objects FOR INSERT TO authenticated
--      WITH CHECK (
--          bucket_id = 'sunflower-assets'
--          AND auth.uid() IS NOT NULL
--          AND public.is_authorized_author(auth.uid())
--          AND (storage.foldername(name))[1] = auth.uid()::text
--      );
--      COMMIT;
-- ==============================================================================
