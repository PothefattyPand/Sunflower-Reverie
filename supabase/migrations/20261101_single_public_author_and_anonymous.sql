-- ==============================================================================
-- Sunflower Reverie — Database Migration: Single Public Author & Anonymous Publishing
-- File: supabase/migrations/20261101_single_public_author_and_anonymous.sql
-- ==============================================================================
-- 1. Adds `is_public_author` to `profiles` (DEFAULT FALSE).
-- 2. Sets Mahi (UUID: 76aaf5a8-7029-45dc-a7c7-ad4f25255be6) to FALSE (hidden).
--    Author 2 will be set to TRUE when configured by an administrator.
-- 3. Protects `is_public_author` so authors cannot modify their own visibility flag.
-- 4. Updates `profiles` RLS so public queries only return public authors.
-- 5. Adds `is_anonymous` to `publications` (default FALSE).
-- 6. Creates a public-safe projection view `public.public_publications` ensuring zero
--    leakage of hidden author account UUIDs, names, avatars, or profile slugs.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADD `is_public_author` TO `profiles`
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

-- Mahi (UUID: 76aaf5a8-7029-45dc-a7c7-ad4f25255be6) is the private/hidden author.
-- All existing profiles default to FALSE (hidden) until the public author is designated.
UPDATE public.profiles
SET is_public_author = FALSE;

-- Explicitly ensure Mahi's record is marked FALSE (private author)
UPDATE public.profiles
SET is_public_author = FALSE
WHERE id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6' OR slug = 'mahi';

-- Index for public author queries
CREATE INDEX IF NOT EXISTS idx_profiles_public_author ON public.profiles (is_public_author);

-- ------------------------------------------------------------------------------
-- 2. TRIGGER: PREVENT AUTHORS FROM ELEVATING PUBLIC VISIBILITY THEMSELVES
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_public_visibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent authenticated authors from changing their own is_public_author status
    IF NEW.is_public_author IS DISTINCT FROM OLD.is_public_author THEN
        IF auth.role() = 'authenticated' THEN
            RAISE EXCEPTION 'Security violation: Author public visibility (is_public_author) can only be modified by administrators.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_public_visibility ON public.profiles;
CREATE TRIGGER trg_protect_profile_public_visibility
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_public_visibility();

-- ------------------------------------------------------------------------------
-- 3. UPDATE PROFILES RLS POLICY (PUBLIC SELECT RESTRICTION)
-- ------------------------------------------------------------------------------
-- Public visitors can only view profiles marked as public.
-- Logged-in authors can always view their own profile.
DROP POLICY IF EXISTS "Public can view author profiles" ON public.profiles;
CREATE POLICY "Public can view author profiles"
ON public.profiles FOR SELECT
USING (
    is_public_author = TRUE
    OR auth.uid() = id
);

-- ------------------------------------------------------------------------------
-- 4. ADD `is_anonymous` TO `publications`
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
-- 5. PUBLIC-SAFE PROJECTION VIEW: `public_publications`
-- ------------------------------------------------------------------------------
-- This view strips all identifying author metadata (name, slug, avatar, bio,
-- and author_id UUID) whenever:
--   a) The publication has is_anonymous = TRUE, OR
--   b) The author has is_public_author = FALSE (hidden author), OR
--   c) The author is Mahi (UUID: 76aaf5a8-7029-45dc-a7c7-ad4f25255be6 / slug 'mahi').
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_publications AS
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
        WHEN pr.is_public_author = TRUE AND p.is_anonymous = FALSE AND pr.slug <> 'mahi' AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6' THEN pr.id
        ELSE NULL
    END AS author_id,
    CASE
        WHEN pr.is_public_author = TRUE AND p.is_anonymous = FALSE AND pr.slug <> 'mahi' AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6' THEN pr.display_name
        ELSE 'Anonymous'
    END AS author_name,
    CASE
        WHEN pr.is_public_author = TRUE AND p.is_anonymous = FALSE AND pr.slug <> 'mahi' AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6' THEN pr.slug
        ELSE NULL
    END AS author_slug,
    CASE
        WHEN pr.is_public_author = TRUE AND p.is_anonymous = FALSE AND pr.slug <> 'mahi' AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6' THEN pr.role
        ELSE 'Contributing Author'
    END AS author_role,
    CASE
        WHEN pr.is_public_author = TRUE AND p.is_anonymous = FALSE AND pr.slug <> 'mahi' AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6' THEN pr.avatar_url
        ELSE NULL
    END AS author_avatar_url,
    CASE
        WHEN pr.is_public_author = TRUE AND p.is_anonymous = FALSE AND pr.slug <> 'mahi' AND pr.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6' THEN pr.short_bio
        ELSE NULL
    END AS author_short_bio
FROM public.publications p
JOIN public.profiles pr ON p.author_id = pr.id
WHERE p.status = 'published';

-- Grant public read permissions on the sanitized view
GRANT SELECT ON public.public_publications TO anon, authenticated;

-- ==============================================================================
-- INSTRUCTIONS FOR WHEN AUTHOR 2 IS ADDED:
-- To designate Author 2 as the single publicly visible author, run:
--   UPDATE public.profiles SET is_public_author = TRUE WHERE id = '<author-2-uuid>';
-- ==============================================================================
