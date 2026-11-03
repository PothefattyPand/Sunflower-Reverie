-- ==============================================================================
-- Sunflower Reverie: Administrator Content Inventory, Transfer & Retirement Guide
-- File: supabase/admin_mahi_inventory_and_retirement.sql
-- ==============================================================================
-- IMPORTANT SAFETY NOTICE:
-- 1. DO NOT execute this entire file as a single script.
-- 2. Stage 1 is READ-ONLY and can be executed at any time in Supabase SQL Editor.
-- 3. Stage 2 contains CONTENT TRANSITION OPTIONS that require explicit administrator
--    decision and approval.
-- 4. Stage 3 contains POST-MIGRATION VERIFICATION and the EMERGENCY ROLLBACK PLAN.
-- 5. No passwords are hardcoded or generated here.
-- ==============================================================================

-- ==============================================================================
-- STAGE 1: READ-ONLY CONTENT INVENTORY (SAFE TO RUN ANY TIME)
-- ==============================================================================

-- 1.1 Inspect Auth Users (Mahi vs Nadvi)
SELECT
    id AS user_id,
    email,
    created_at,
    last_sign_in_at,
    confirmed_at
FROM auth.users
WHERE email IN ('mahi03mrc@gmail.com', 'nadvihasan107@gmail.com')
   OR id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID;

-- 1.2 Inspect Authorized Authors Allowlist & Associated Profile
SELECT
    aa.user_id,
    aa.email,
    aa.authorized_at,
    p.display_name,
    p.slug,
    p.is_public_author,
    p.role
FROM public.authorized_authors aa
LEFT JOIN public.profiles p ON aa.user_id = p.id;

-- 1.3 Summary: Mahi's Publications by Status & Category
SELECT
    status,
    category,
    COUNT(*) AS total_manuscripts
FROM public.publications
WHERE author_id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
   OR author_id IN (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = 'mahi03mrc@gmail.com')
GROUP BY status, category
ORDER BY status, category;

-- 1.4 Detailed Inventory: All Publications Owned by Mahi
SELECT
    id,
    title,
    slug,
    category,
    status,
    published_at,
    created_at,
    updated_at,
    CASE WHEN cover_image IS NOT NULL THEN 'Yes' ELSE 'No' END AS has_cover_image
FROM public.publications
WHERE author_id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
   OR author_id IN (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = 'mahi03mrc@gmail.com')
ORDER BY created_at DESC;

-- 1.5 Storage Inventory: All Assets Owned by Mahi in sunflower-assets
SELECT
    id,
    name,
    bucket_id,
    owner,
    created_at,
    (metadata->>'size')::bigint AS size_bytes,
    metadata->>'mimetype' AS mime_type
FROM storage.objects
WHERE bucket_id = 'sunflower-assets'
  AND (
      owner = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
      OR (storage.foldername(name))[1] = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'
  );


-- ==============================================================================
-- STAGE 2: CONTENT TRANSITION OPTIONS (EXPLICIT ADMIN APPROVAL REQUIRED)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- OPTION 2A: TRANSFER APPROVED PUBLICATIONS FROM MAHI TO NADVI
-- ------------------------------------------------------------------------------
-- Use this option when the administrator approves transferring ownership of all
-- writings from Mahi to Nadvi.
-- NOTICE: The immutability trigger (trg_publication_author_immutable) is temporarily
-- disabled ONLY within this explicit transaction and immediately re-enabled.
/*
BEGIN;

DO $$
DECLARE
    v_nadvi_id UUID;
    v_mahi_id UUID := '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID;
    v_transferred_count INT;
BEGIN
    -- Verify confirmed Nadvi UID
    SELECT id INTO v_nadvi_id
    FROM auth.users
    WHERE LOWER(TRIM(email)) = 'nadvihasan107@gmail.com'
    LIMIT 1;

    IF v_nadvi_id IS NULL THEN
        RAISE EXCEPTION 'Transfer aborted: Nadvi (nadvihasan107@gmail.com) does not exist in auth.users.';
    END IF;

    -- Temporarily disable immutability trigger for this authorized maintenance transaction
    ALTER TABLE public.publications DISABLE TRIGGER trg_publication_author_immutable;

    -- Transfer all publications owned by Mahi to Nadvi
    UPDATE public.publications
    SET author_id = v_nadvi_id,
        is_anonymous = FALSE,
        updated_at = NOW()
    WHERE author_id = v_mahi_id
       OR author_id IN (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = 'mahi03mrc@gmail.com');

    GET DIAGNOSTICS v_transferred_count = ROW_COUNT;
    RAISE NOTICE 'SUCCESS: Transferred % publication(s) to Nadvi (UID: %)', v_transferred_count, v_nadvi_id;

    -- Immediately re-enable immutability trigger
    ALTER TABLE public.publications ENABLE TRIGGER trg_publication_author_immutable;
END $$;

COMMIT;
*/

-- ------------------------------------------------------------------------------
-- OPTION 2B: ARCHIVE MAHI PUBLICATIONS (UNPUBLISH TO DRAFTS)
-- ------------------------------------------------------------------------------
-- Use this option if Mahi's writings should be preserved in the database for
-- records, but unpublished so they do not appear in the public sanctuary.
/*
BEGIN;
UPDATE public.publications
SET status = 'draft',
    updated_at = NOW()
WHERE author_id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
   OR author_id IN (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = 'mahi03mrc@gmail.com');
COMMIT;
*/

-- ------------------------------------------------------------------------------
-- OPTION 2C: SELECTIVE TRANSFER BY ID
-- ------------------------------------------------------------------------------
-- Use this option to transfer only specific publications by ID.
/*
BEGIN;
ALTER TABLE public.publications DISABLE TRIGGER trg_publication_author_immutable;

UPDATE public.publications
SET author_id = (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = 'nadvihasan107@gmail.com'),
    is_anonymous = FALSE,
    updated_at = NOW()
WHERE id IN (
    '00000000-0000-0000-0000-000000000000'::UUID -- Replace with specific approved publication IDs
);

ALTER TABLE public.publications ENABLE TRIGGER trg_publication_author_immutable;
COMMIT;
*/


-- ==============================================================================
-- STAGE 3: VERIFICATION & EMERGENCY ROLLBACK PROCEDURE
-- ==============================================================================

-- 3.1 Post-Migration Verification Queries
-- Verify exactly 1 authorized author exists:
SELECT
    COUNT(*) AS total_authorized,
    CASE WHEN COUNT(*) = 1 THEN 'PASSED: Exactly 1 author' ELSE 'FAILED: Check allowlist' END AS status
FROM public.authorized_authors;

-- Confirm Nadvi is the authorized user:
SELECT
    user_id,
    email,
    authorized_at
FROM public.authorized_authors;

-- Confirm Mahi cannot authenticate or bypass RLS (Mahi UID should return zero rows on authorized_authors):
SELECT EXISTS (
    SELECT 1 FROM public.authorized_authors
    WHERE user_id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
       OR LOWER(TRIM(email)) = 'mahi03mrc@gmail.com'
) AS mahi_is_still_authorized; -- Must return FALSE

-- Confirm Nadvi's profile is public and Mahi's profile is hidden:
SELECT
    id,
    display_name,
    slug,
    is_public_author
FROM public.profiles
WHERE id IN (
    SELECT user_id FROM public.authorized_authors
    UNION
    SELECT '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
);

-- ------------------------------------------------------------------------------
-- 3.2 EMERGENCY ROLLBACK PLAN
-- ------------------------------------------------------------------------------
-- If Nadvi cannot log in or an unexpected production issue arises:
-- To temporarily restore Mahi's access while diagnosing Nadvi's credentials:
/*
BEGIN;
-- Drop single author trigger temporarily
DROP TRIGGER IF EXISTS trg_limit_single_author ON public.authorized_authors;

-- Re-add Mahi to allowlist
INSERT INTO public.authorized_authors (user_id, email, authorized_at)
VALUES (
    '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID,
    'mahi03mrc@gmail.com',
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

COMMIT;
*/
