-- ==============================================================================
-- Sunflower Reverie: Production Two-Author Database Schema & Security Architecture
-- Migration: 20261030_two_author_system.sql
-- ==============================================================================
-- Enforces:
-- 1. Three core application tables: authorized_authors, profiles, publications.
-- 2. Strict two-author maximum limit enforced at the database engine level.
-- 3. Row Level Security: public read of published posts; strict author-only writes.
-- 4. Immutable publication authorship (author_id cannot be modified once set).
-- 5. Isolated storage bucket policies scoped to {author_id}/* folders.
-- 6. Safe, idempotent Author 1 registration (UID: 76aaf5a8-7029-45dc-a7c7-ad4f25255be6).
-- 7. Zero sample data insertion — clean slate for production author manuscripts.
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. AUTHORIZED AUTHORS ALLOWLIST (MAX 2 ACCOUNTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.authorized_authors (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    authorized_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger Function: Enforce strict maximum of 2 authors
CREATE OR REPLACE FUNCTION public.check_max_authorized_authors()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.authorized_authors) >= 2 THEN
        RAISE EXCEPTION 'Sunflower Reverie security limit: Exactly two authors are permitted. Cannot add additional authors.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_limit_two_authors ON public.authorized_authors;
CREATE TRIGGER trg_limit_two_authors
BEFORE INSERT ON public.authorized_authors
FOR EACH ROW EXECUTE FUNCTION public.check_max_authorized_authors();

-- Helper Function: Is user an authorized author?
-- Explicitly defines search_path = public for security
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

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Co-Curator & Author',
    short_bio TEXT,
    full_bio TEXT,
    quote TEXT,
    avatar_url TEXT,
    social_links JSONB DEFAULT '[]'::JSONB,
    interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- ------------------------------------------------------------------------------
-- 3. PUBLICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    subtitle TEXT,
    slug TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('blog', 'poetry', 'journal', 'writing')),
    writing_subtype TEXT CHECK (writing_subtype IN ('essay', 'short-story', 'letter', 'reflection', 'creative-prose') OR writing_subtype IS NULL),
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    cover_image TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    reading_time TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_global_slug UNIQUE (slug),
    CONSTRAINT unique_category_slug UNIQUE (category, slug)
);

CREATE INDEX IF NOT EXISTS idx_publications_category_status ON public.publications (category, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_publications_author_status ON public.publications (author_id, status);
CREATE INDEX IF NOT EXISTS idx_publications_slug ON public.publications (slug);
CREATE INDEX IF NOT EXISTS idx_publications_published_at ON public.publications (published_at DESC);

-- Trigger: Immutability enforcement on author_id
CREATE OR REPLACE FUNCTION public.enforce_publication_author_immutable()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.author_id IS DISTINCT FROM OLD.author_id THEN
        RAISE EXCEPTION 'Security violation: publication ownership (author_id) is immutable and cannot be transferred.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_publication_author_immutable ON public.publications;
CREATE TRIGGER trg_publication_author_immutable
BEFORE UPDATE ON public.publications
FOR EACH ROW EXECUTE FUNCTION public.enforce_publication_author_immutable();

-- Trigger: Automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_touch_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_publications_updated_at ON public.publications;
CREATE TRIGGER trg_touch_publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.authorized_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- --- Authorized Authors Policies ---
DROP POLICY IF EXISTS "Authorized authors can view their status" ON public.authorized_authors;
CREATE POLICY "Authorized authors can view their status"
ON public.authorized_authors FOR SELECT
USING (auth.uid() = user_id);

-- --- Profiles Policies ---
DROP POLICY IF EXISTS "Public can view author profiles" ON public.profiles;
CREATE POLICY "Public can view author profiles"
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authorized authors can create own profile" ON public.profiles;
CREATE POLICY "Authorized authors can create own profile"
ON public.profiles FOR INSERT
WITH CHECK (
    auth.uid() = id
    AND public.is_authorized_author(auth.uid())
);

DROP POLICY IF EXISTS "Authorized authors can update own profile" ON public.profiles;
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

-- --- Publications Policies ---
DROP POLICY IF EXISTS "Publications visibility policy" ON public.publications;
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

DROP POLICY IF EXISTS "Authorized authors can create publications" ON public.publications;
CREATE POLICY "Authorized authors can create publications"
ON public.publications FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_authorized_author(auth.uid())
);

DROP POLICY IF EXISTS "Authors can update own publications" ON public.publications;
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

DROP POLICY IF EXISTS "Authors can delete own publications" ON public.publications;
CREATE POLICY "Authors can delete own publications"
ON public.publications FOR DELETE
USING (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_authorized_author(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKET & ASSET POLICIES
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

DROP POLICY IF EXISTS "Public can view sunflower assets" ON storage.objects;
CREATE POLICY "Public can view sunflower assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'sunflower-assets');

DROP POLICY IF EXISTS "Authors can upload to own folder" ON storage.objects;
CREATE POLICY "Authors can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'sunflower-assets'
    AND auth.uid() IS NOT NULL
    AND public.is_authorized_author(auth.uid())
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authors can update own files" ON storage.objects;
CREATE POLICY "Authors can update own files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'sunflower-assets'
    AND auth.uid() IS NOT NULL
    AND public.is_authorized_author(auth.uid())
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authors can delete own files" ON storage.objects;
CREATE POLICY "Authors can delete own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'sunflower-assets'
    AND auth.uid() IS NOT NULL
    AND public.is_authorized_author(auth.uid())
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ------------------------------------------------------------------------------
-- 6. AUTHOR 1 REGISTRATION (IDEMPOTENT & CONTENT-SAFE)
-- ------------------------------------------------------------------------------
-- Automatically connects the existing Supabase Auth user to Author 1.
-- Does NOT insert sample publications.
-- Does NOT transfer existing publications between authors.
-- Does NOT overwrite existing profile data if rerun.
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_target_uid UUID := '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID;
    v_user RECORD;
    v_author_one_slug TEXT := 'mahi';
    v_author_one_name TEXT := 'Mahi';
BEGIN
    -- Locate author user by confirmed UID or email
    SELECT id, email, created_at INTO v_user
    FROM auth.users
    WHERE id = v_target_uid OR email = 'mahi03mrc@gmail.com'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_user.id IS NULL THEN
        RAISE NOTICE 'Notice: User % not found in auth.users. Please create the account in Authentication -> Users.', v_target_uid;
    ELSE
        -- 1. Insert into authorized_authors allowlist (idempotent: does nothing if already present)
        INSERT INTO public.authorized_authors (user_id, email)
        VALUES (v_user.id, v_user.email)
        ON CONFLICT (user_id) DO NOTHING;

        -- 2. Insert initial profile (idempotent: does NOT overwrite existing customized profile data)
        INSERT INTO public.profiles (
            id, display_name, slug, role, short_bio, full_bio, quote, social_links
        ) VALUES (
            v_user.id,
            v_author_one_name,
            v_author_one_slug,
            'Essayist, Poet & Co-Curator',
            'Dedicated to quiet morning reflections, classical nature poetry, and the unhurried craft of contemplative prose.',
            v_author_one_name || ' writes from the eastern perimeter of the sanctuary, where the morning sun first touches the row of sunflowers. With a deep affection for classical lyric poetry, quiet essays, and pastoral philosophy, their writings explore how stillness and gentle observation restore our connection to language.',
            'Words quiet as dawn, enduring as sunflowers.',
            json_build_array(
                json_build_object('platform', 'Substack', 'url', 'https://substack.com'),
                json_build_object('platform', 'Goodreads', 'url', 'https://goodreads.com'),
                json_build_object('platform', 'Email', 'url', 'mailto:' || v_user.email)
            )::jsonb
        ) ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE 'SUCCESS: Author 1 (UID: %, Email: %) registered safely in Sunflower Reverie!', v_user.id, v_user.email;
    END IF;
END $$;
