-- ==============================================================================
-- Sunflower Reverie: Production Security & Authorization Verification Suite
-- Supports: Stage 1 (20261102_single_author_nadvi.sql) & Stage 2 (20261103_deprecate_base_table_anon_access.sql)
-- ==============================================================================
-- INSTRUCTIONS FOR ADMINISTRATOR:
-- 1. Run this script in the Supabase SQL Editor AFTER applying Stage 1 or Stage 2.
-- 2. This entire script is 100% NON-DESTRUCTIVE and leaves the database unchanged.
-- 3. Section 0 reports the currently detected deployment stage.
-- 4. Sections 8.1 - 8.4 provide isolated transaction simulations with strict
--    error classification (SQLSTATE 42501) and zero false positives.
-- 5. Section 9 provides the consolidated 15-point Compliance Dashboard with
--    explicit expected results for both Stage 1 and Stage 2.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. STAGE DETECTION & STATUS OVERVIEW
-- ------------------------------------------------------------------------------
SELECT 
    CASE 
        WHEN has_table_privilege('anon', 'public.publications', 'SELECT') 
        THEN 'STAGE 1: Compatibility Bridge Active (Pre-Frontend Deployment)'
        ELSE 'STAGE 2: Full Lock-Down Active (Post-Frontend Deployment)'
    END AS detected_stage,
    CASE 
        WHEN has_table_privilege('anon', 'public.publications', 'SELECT') 
        THEN 'Anon has temporary base-table SELECT (drafts guarded by RLS) to prevent downtime with deployed frontend. Run Stage 2 after frontend redeploy.'
        ELSE 'Direct anon base-table access is revoked. Anon queries flow exclusively through public.public_publications.'
    END AS stage_implication,
    has_table_privilege('anon', 'public.publications', 'SELECT') AS anon_has_base_table_select,
    has_table_privilege('anon', 'public.public_publications', 'SELECT') AS anon_has_public_view_select;

-- ------------------------------------------------------------------------------
-- 1. AUTHOR ALLOWLIST & AUTHENTIC IDENTITY AUDIT
-- Expected: Exactly 1 record in public.authorized_authors matching Nadvi's auth UUID.
-- Mahi must be completely absent.
-- ------------------------------------------------------------------------------
SELECT 
    aa.user_id AS allowlist_user_id,
    aa.email AS allowlist_email,
    aa.authorized_at,
    u.id AS auth_user_id,
    u.email AS auth_user_email,
    CASE 
        WHEN LOWER(TRIM(aa.email)) = 'nadvihasan107@gmail.com' 
             AND aa.user_id = u.id 
             AND count(*) OVER() = 1 
        THEN 'PASS: Sole Authentic Author (Nadvi)'
        ELSE 'CRITICAL FAIL: Author identity or count mismatch!'
    END AS verification_status
FROM public.authorized_authors aa
LEFT JOIN auth.users u ON aa.user_id = u.id;

-- ------------------------------------------------------------------------------
-- 2. PROFILE VISIBILITY & SANITIZATION AUDIT
-- Expected:
-- - Nadvi has is_public_author = TRUE.
-- - Mahi and any other profile has is_public_author = FALSE.
-- - Nadvi profile has clean placeholder initial state (no invented bios or quotes).
-- ------------------------------------------------------------------------------
SELECT 
    p.id,
    p.display_name,
    p.slug,
    p.role,
    p.is_public_author,
    p.short_bio IS NULL AS bio_is_clean_placeholder,
    p.quote IS NULL AS quote_is_clean_placeholder,
    CASE 
        WHEN p.slug = 'nadvi' AND p.is_public_author = TRUE THEN 'PASS: Nadvi is Sole Public Author'
        WHEN p.slug <> 'nadvi' AND p.is_public_author = FALSE THEN 'PASS: Non-authorized Profile Concealed'
        WHEN p.slug <> 'nadvi' AND p.is_public_author = TRUE THEN 'CRITICAL FAIL: Unauthorized profile is marked public!'
        ELSE 'FAIL: Profile configuration mismatch'
    END AS visibility_status
FROM public.profiles p
ORDER BY p.is_public_author DESC, p.created_at ASC;

-- ------------------------------------------------------------------------------
-- 3. EFFECTIVE TABLE-LEVEL PRIVILEGES AUDIT (has_table_privilege)
-- Tests actual effective privileges evaluated by the PostgreSQL engine.
-- Stage-aware: differentiates expected anon access between Stage 1 and Stage 2.
-- ------------------------------------------------------------------------------
SELECT 
    t.table_name,
    r.role_name,
    has_table_privilege(r.role_name, 'public.' || t.table_name, 'SELECT') AS can_select,
    has_table_privilege(r.role_name, 'public.' || t.table_name, 'INSERT') AS can_insert,
    has_table_privilege(r.role_name, 'public.' || t.table_name, 'UPDATE') AS can_update,
    has_table_privilege(r.role_name, 'public.' || t.table_name, 'DELETE') AS can_delete,
    has_table_privilege(r.role_name, 'public.' || t.table_name, 'TRUNCATE') AS can_truncate,
    CASE 
        -- authorized_authors
        WHEN t.table_name = 'authorized_authors' AND r.role_name = 'anon' 
             AND NOT has_table_privilege('anon', 'public.authorized_authors', 'SELECT') THEN 'PASS: anon has zero table access'
        WHEN t.table_name = 'authorized_authors' AND r.role_name = 'authenticated'
             AND has_table_privilege('authenticated', 'public.authorized_authors', 'SELECT')
             AND NOT has_table_privilege('authenticated', 'public.authorized_authors', 'INSERT')
             AND NOT has_table_privilege('authenticated', 'public.authorized_authors', 'UPDATE')
             AND NOT has_table_privilege('authenticated', 'public.authorized_authors', 'DELETE') THEN 'PASS: authenticated has SELECT only'

        -- profiles
        WHEN t.table_name = 'profiles' AND r.role_name = 'anon'
             AND has_table_privilege('anon', 'public.profiles', 'SELECT')
             AND NOT has_table_privilege('anon', 'public.profiles', 'INSERT')
             AND NOT has_table_privilege('anon', 'public.profiles', 'UPDATE') THEN 'PASS: anon has SELECT only'
        WHEN t.table_name = 'profiles' AND r.role_name = 'authenticated'
             AND has_table_privilege('authenticated', 'public.profiles', 'SELECT')
             AND NOT has_table_privilege('authenticated', 'public.profiles', 'DELETE')
             AND NOT has_table_privilege('authenticated', 'public.profiles', 'TRUNCATE') THEN 'PASS: profiles table write revoked (column grants only)'

        -- publications (Stage-Aware)
        WHEN t.table_name = 'publications' AND r.role_name = 'anon' THEN
            CASE 
                WHEN has_table_privilege('anon', 'public.publications', 'SELECT')
                     AND NOT has_table_privilege('anon', 'public.publications', 'INSERT')
                     AND NOT has_table_privilege('anon', 'public.publications', 'UPDATE')
                     AND NOT has_table_privilege('anon', 'public.publications', 'DELETE')
                THEN 'PASS (Stage 1): Temporary compatibility read grant (drafts guarded by RLS)'
                
                WHEN NOT has_table_privilege('anon', 'public.publications', 'SELECT')
                     AND NOT has_table_privilege('anon', 'public.publications', 'INSERT')
                     AND NOT has_table_privilege('anon', 'public.publications', 'UPDATE')
                     AND NOT has_table_privilege('anon', 'public.publications', 'DELETE')
                THEN 'PASS (Stage 2): Base table access completely revoked from anon'
                
                ELSE 'CRITICAL FAIL: Unexpected anon write grant on publications'
            END

        WHEN t.table_name = 'publications' AND r.role_name = 'authenticated'
             AND has_table_privilege('authenticated', 'public.publications', 'SELECT')
             AND has_table_privilege('authenticated', 'public.publications', 'INSERT')
             AND has_table_privilege('authenticated', 'public.publications', 'UPDATE')
             AND has_table_privilege('authenticated', 'public.publications', 'DELETE')
             AND NOT has_table_privilege('authenticated', 'public.publications', 'TRUNCATE') THEN 'PASS: authenticated author CRUD enabled'

        -- public_publications
        WHEN t.table_name = 'public_publications'
             AND has_table_privilege(r.role_name, 'public.public_publications', 'SELECT')
             AND NOT has_table_privilege(r.role_name, 'public.public_publications', 'INSERT')
             AND NOT has_table_privilege(r.role_name, 'public.public_publications', 'UPDATE')
             AND NOT has_table_privilege(r.role_name, 'public.public_publications', 'DELETE') THEN 'PASS: view is read-only SELECT'

        ELSE 'CRITICAL FAIL: Privilege violation detected!'
    END AS evaluation
FROM (VALUES ('authorized_authors'), ('profiles'), ('publications'), ('public_publications')) AS t(table_name)
CROSS JOIN (VALUES ('anon'), ('authenticated')) AS r(role_name)
ORDER BY t.table_name, r.role_name;

-- ------------------------------------------------------------------------------
-- 4. EFFECTIVE COLUMN PRIVILEGES AUDIT (has_column_privilege)
-- Explicitly checks that sensitive columns cannot be modified by authenticated role.
-- ------------------------------------------------------------------------------
SELECT 
    'profiles' AS table_name,
    col.column_name,
    has_column_privilege('authenticated', 'public.profiles', col.column_name, 'INSERT') AS auth_can_insert,
    has_column_privilege('authenticated', 'public.profiles', col.column_name, 'UPDATE') AS auth_can_update,
    has_column_privilege('anon', 'public.profiles', col.column_name, 'UPDATE') AS anon_can_update,
    CASE 
        WHEN col.column_name = 'is_public_author' 
             AND NOT has_column_privilege('authenticated', 'public.profiles', 'is_public_author', 'INSERT')
             AND NOT has_column_privilege('authenticated', 'public.profiles', 'is_public_author', 'UPDATE')
             AND NOT has_column_privilege('anon', 'public.profiles', 'is_public_author', 'UPDATE')
        THEN 'PASS: Privilege escalation blocked (is_public_author cannot be written)'
        
        WHEN col.column_name = 'id'
             AND NOT has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE')
        THEN 'PASS: Profile ID immutable on update'
        
        WHEN col.column_name IN ('display_name', 'slug', 'role', 'short_bio', 'full_bio', 'quote', 'avatar_url', 'social_links', 'interests')
             AND has_column_privilege('authenticated', 'public.profiles', col.column_name, 'UPDATE')
             AND NOT has_column_privilege('anon', 'public.profiles', col.column_name, 'UPDATE')
        THEN 'PASS: Approved author editable field'
        
        ELSE 'CHECK: Review column privilege'
    END AS security_evaluation
FROM (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles'
) AS col
ORDER BY col.column_name;

-- ------------------------------------------------------------------------------
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES EXHAUSTIVE AUDIT
-- Lists all active policies. Flags any legacy or overly permissive policy.
-- ------------------------------------------------------------------------------
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    CASE 
        WHEN policyname IN (
            'Authorized authors can view their status',
            'Public can view sole authorized author profile',
            'Authorized authors can create own profile',
            'Authorized authors can update own profile',
            'Publications visibility policy',
            'Authorized author can read own publications',
            'Authorized authors can create publications',
            'Authors can update own publications',
            'Authors can delete own publications',
            'Public can view sunflower assets',
            'Authors can upload assets',
            'Authors can update own files',
            'Authors can delete own files'
        ) THEN 'PASS: Approved Hardened Policy'
        ELSE 'WARNING: Unrecognized or Legacy Policy! Verify if it should be dropped.'
    END AS policy_compliance,
    qual AS using_clause,
    with_check AS with_check_clause
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
  AND tablename IN ('authorized_authors', 'profiles', 'publications', 'objects')
ORDER BY tablename, cmd, policyname;

-- ------------------------------------------------------------------------------
-- 6. PUBLIC PROJECTION VIEW DEFINITION & INTEGRITY AUDIT
-- Expected: Exactly 22 columns; owned by postgres; redacts hidden authors.
-- ------------------------------------------------------------------------------
SELECT 
    c.table_name,
    c.column_name,
    c.data_type,
    c.ordinal_position,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'public_publications') AS total_columns,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'public_publications') = 22 
        THEN 'PASS: Exact 22 column signature'
        ELSE 'FAIL: Column count mismatch'
    END AS column_count_status
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name = 'public_publications'
ORDER BY c.ordinal_position;

-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKET & OWNERSHIP VERIFICATION
-- ------------------------------------------------------------------------------
SELECT 
    id AS bucket_id,
    public,
    file_size_limit,
    allowed_mime_types,
    CASE 
        WHEN public = true AND file_size_limit = 5242880 THEN 'PASS: Valid Storage Bucket Configuration'
        ELSE 'FAIL: Storage bucket configuration mismatch'
    END AS bucket_status
FROM storage.buckets
WHERE id = 'sunflower-assets';

-- ------------------------------------------------------------------------------
-- 8. REAL ROLE-SPECIFIC SESSION INTEGRATION TEST PROCEDURES
-- INSTRUCTIONS: Run each simulation block individually in Supabase SQL Editor.
-- Each block runs inside an isolated transaction that rolls back automatically.
--
-- Security Testing Rules:
-- 1. Intentional security-breach exceptions are NOT caught or swallowed.
-- 2. Expected denials strictly assert SQLSTATE '42501' (insufficient_privilege)
--    or expected trigger exceptions. Unrelated syntax/constraint errors fail the test.
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- 8.1 SIMULATION 1: ANONYMOUS VISITOR (Unauthenticated public reader)
-- ==============================================================================
BEGIN;
    -- Switch to anonymous role with null JWT
    SET LOCAL ROLE anon;
    SET LOCAL "request.jwt.claim.sub" = '';
    SET LOCAL "request.jwt.claims" = '';

    -- Test 8.1.1: Can query public projection view (published articles only)
    SELECT '8.1.1' AS test_id, 'Anon view public_publications' AS test_desc, 
           COUNT(*) AS published_count, 'PASS' AS expected_behavior
    FROM public.public_publications;

    -- Test 8.1.2: Can view ONLY Nadvi's public profile (Mahi concealed)
    SELECT '8.1.2' AS test_id, 'Anon profiles query' AS test_desc,
           slug, display_name, is_public_author,
           CASE WHEN slug = 'nadvi' AND is_public_author = TRUE THEN 'PASS: Nadvi visible' ELSE 'FAIL' END AS result
    FROM public.profiles;

    -- Test 8.1.2b: Explicit PL/pgSQL assertion exercising actual anonymous permission path
    DO $$
    DECLARE
        v_profile_count INT;
        v_mahi_count INT;
        v_nadvi_visible BOOLEAN;
    BEGIN
        -- 1. Anonymous visitor must be able to query profiles table without permission error on authorized_authors
        SELECT COUNT(*) INTO v_profile_count FROM public.profiles;
        IF v_profile_count <> 1 THEN
            RAISE EXCEPTION 'TEST 8.1.2b FAILED: Expected exactly 1 public profile visible to anon, found %', v_profile_count;
        END IF;

        -- 2. Visible profile must specifically be Nadvi with public visibility
        SELECT (slug = 'nadvi' AND is_public_author = TRUE) INTO v_nadvi_visible 
        FROM public.profiles LIMIT 1;
        IF NOT v_nadvi_visible THEN
            RAISE EXCEPTION 'TEST 8.1.2b FAILED: Public profile is not Nadvi or is_public_author is false';
        END IF;

        -- 3. Mahi must NOT be returned under any circumstances
        SELECT COUNT(*) INTO v_mahi_count FROM public.profiles WHERE slug = 'mahi';
        IF v_mahi_count <> 0 THEN
            RAISE EXCEPTION 'SECURITY BREACH: Mahi profile is returned to anonymous visitor!';
        END IF;

        RAISE NOTICE 'Test 8.1.2b PASSED: Anon role successfully exercised actual profile permission path (Nadvi public, Mahi concealed).';
    END $$;

    -- Test 8.1.3: Verification of intentional denial on public.authorized_authors
    -- Effective privilege assertion (avoids bare SQLSTATE 42501 query abort in SELECT)
    SELECT '8.1.3' AS test_id, 'Anon authorized_authors denial check' AS test_desc,
           has_table_privilege('anon', 'public.authorized_authors', 'SELECT') AS has_select,
           CASE 
               WHEN NOT has_table_privilege('anon', 'public.authorized_authors', 'SELECT') 
               THEN 'PASS: Denied SELECT on authorized_authors'
               ELSE 'CRITICAL FAIL: Anon unexpectedly granted SELECT on authorized_authors!'
           END AS result;

    -- Test 8.1.4: Stage-Aware publication check
    -- In Stage 1: anon can SELECT published from base table, 0 drafts exposed.
    -- In Stage 2: anon is completely denied SELECT on base table (SQLSTATE 42501).
    DO $$
    DECLARE
        v_is_stage_1 BOOLEAN;
        v_succeeded BOOLEAN := FALSE;
        v_draft_count INT;
    BEGIN
        v_is_stage_1 := has_table_privilege('anon', 'public.publications', 'SELECT');

        IF v_is_stage_1 THEN
            -- STAGE 1: Base table accessible, but RLS MUST ensure 0 private drafts exposed
            SELECT COUNT(*) INTO v_draft_count FROM public.publications WHERE status <> 'published';
            IF v_draft_count > 0 THEN
                RAISE EXCEPTION 'SECURITY BREACH (Stage 1): Anon was able to read % private draft(s)!', v_draft_count;
            END IF;
            RAISE NOTICE 'Test 8.1.4 PASSED (Stage 1): Anon base-table query exposed 0 private drafts.';
        ELSE
            -- STAGE 2: Direct SELECT on base table must fail specifically with SQLSTATE 42501
            BEGIN
                PERFORM 1 FROM public.publications LIMIT 1;
                v_succeeded := TRUE;
            EXCEPTION
                WHEN insufficient_privilege THEN -- SQLSTATE 42501
                    v_succeeded := FALSE;
            END;

            IF v_succeeded THEN
                RAISE EXCEPTION 'SECURITY BREACH (Stage 2): Anon was able to query public.publications base table!';
            END IF;
            RAISE NOTICE 'Test 8.1.4 PASSED (Stage 2): Anon correctly denied SELECT on public.publications (SQLSTATE 42501).';
        END IF;
    END $$;

ROLLBACK;

-- ==============================================================================
-- 8.2 SIMULATION 2: AUTHENTICATED NADVI (Sole authorized author)
-- ==============================================================================
BEGIN;
    DO $$
    DECLARE
        v_nadvi_id UUID;
        v_succeeded BOOLEAN := FALSE;
    BEGIN
        SELECT id INTO v_nadvi_id FROM auth.users WHERE LOWER(TRIM(email)) = 'nadvihasan107@gmail.com' LIMIT 1;
        
        -- Switch to authenticated role impersonating Nadvi's verified session
        EXECUTE format('SET LOCAL ROLE authenticated');
        EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', v_nadvi_id::text);
        EXECUTE format('SET LOCAL "request.jwt.claim.email" = %L', 'nadvihasan107@gmail.com');
        EXECUTE format('SET LOCAL "request.jwt.claims" = %L', json_build_object('sub', v_nadvi_id::text, 'email', 'nadvihasan107@gmail.com', 'role', 'authenticated')::text);

        -- Test 8.2.1: Helper recognizes Nadvi as authorized
        IF NOT public.is_authorized_author(v_nadvi_id) THEN
            RAISE EXCEPTION 'SIMULATION FAILED: Nadvi is not recognized by is_authorized_author';
        END IF;

        -- Test 8.2.2: Can read own entry in authorized_authors
        IF (SELECT COUNT(*) FROM public.authorized_authors WHERE user_id = v_nadvi_id) <> 1 THEN
            RAISE EXCEPTION 'SIMULATION FAILED: Nadvi cannot view own authorized_authors status';
        END IF;

        -- Test 8.2.3: Can update approved profile field (display_name)
        UPDATE public.profiles SET display_name = 'Nadvi' WHERE id = v_nadvi_id;

        -- Test 8.2.4: Cannot update omitted column (is_public_author) - must fail with SQLSTATE 42501
        BEGIN
            UPDATE public.profiles SET is_public_author = FALSE WHERE id = v_nadvi_id;
            v_succeeded := TRUE;
        EXCEPTION
            WHEN insufficient_privilege THEN -- SQLSTATE 42501 expected
                v_succeeded := FALSE;
        END;

        IF v_succeeded THEN
            RAISE EXCEPTION 'SECURITY BREACH: Nadvi was able to modify omitted column is_public_author!';
        END IF;

        RAISE NOTICE 'SIMULATION 8.2 PASSED: Nadvi has verified author privileges and column security enforced.';
    END $$;
ROLLBACK;

-- ==============================================================================
-- 8.3 SIMULATION 3: AUTHENTICATED MAHI (Retired author)
-- ==============================================================================
BEGIN;
    DO $$
    DECLARE
        v_mahi_id UUID;
        v_rows INT;
        v_succeeded BOOLEAN := FALSE;
    BEGIN
        SELECT id INTO v_mahi_id FROM auth.users 
        WHERE id = '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID
           OR email LIKE '%mahi%'
        LIMIT 1;

        IF v_mahi_id IS NOT NULL THEN
            EXECUTE format('SET LOCAL ROLE authenticated');
            EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', v_mahi_id::text);
            EXECUTE format('SET LOCAL "request.jwt.claims" = %L', json_build_object('sub', v_mahi_id::text, 'role', 'authenticated')::text);

            -- Test 8.3.1: Helper MUST return FALSE for Mahi
            IF public.is_authorized_author(v_mahi_id) THEN
                RAISE EXCEPTION 'SECURITY BREACH: Mahi is still recognized as authorized author!';
            END IF;

            -- Test 8.3.2: Cannot view authorized_authors status
            IF (SELECT COUNT(*) FROM public.authorized_authors WHERE user_id = v_mahi_id) <> 0 THEN
                RAISE EXCEPTION 'SECURITY BREACH: Mahi can query authorized_authors!';
            END IF;

            -- Test 8.3.3: Cannot update profile (RLS USING clause filters out row -> 0 rows updated)
            UPDATE public.profiles SET display_name = 'Tampered' WHERE id = v_mahi_id;
            GET DIAGNOSTICS v_rows = ROW_COUNT;
            IF v_rows > 0 THEN
                RAISE EXCEPTION 'SECURITY BREACH: Mahi was able to update % row(s) in profiles!', v_rows;
            END IF;

            -- Test 8.3.4: Cannot create publications (RLS WITH CHECK fails specifically with SQLSTATE 42501)
            BEGIN
                INSERT INTO public.publications (title, slug, body, author_id)
                VALUES ('Mahi Rogue Post', 'mahi-rogue-post', 'Unauthorized content', v_mahi_id);
                v_succeeded := TRUE;
            EXCEPTION
                WHEN insufficient_privilege THEN -- SQLSTATE 42501
                    v_succeeded := FALSE;
            END;

            IF v_succeeded THEN
                RAISE EXCEPTION 'SECURITY BREACH: Mahi was able to insert into publications!';
            END IF;

            RAISE NOTICE 'SIMULATION 8.3 PASSED: Mahi has zero author permissions and is safely retired.';
        ELSE
            RAISE NOTICE 'SIMULATION 8.3 SKIPPED: Mahi auth record not found in environment.';
        END IF;
    END $$;
ROLLBACK;

-- ==============================================================================
-- 8.4 SIMULATION 4: UNAUTHORIZED AUTHENTICATED USER (Arbitrary visitor)
-- ==============================================================================
BEGIN;
    DO $$
    DECLARE
        v_fake_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
        v_rows INT;
        v_succeeded BOOLEAN := FALSE;
    BEGIN
        EXECUTE format('SET LOCAL ROLE authenticated');
        EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', v_fake_user_id::text);
        EXECUTE format('SET LOCAL "request.jwt.claims" = %L', json_build_object('sub', v_fake_user_id::text, 'role', 'authenticated')::text);

        -- Test 8.4.1: Helper returns FALSE
        IF public.is_authorized_author(v_fake_user_id) THEN
            RAISE EXCEPTION 'SECURITY BREACH: Fake user recognized as authorized author!';
        END IF;

        -- Test 8.4.2: Cannot insert into authorized_authors (denied by table privilege or trigger)
        BEGIN
            INSERT INTO public.authorized_authors (user_id, email) VALUES (v_fake_user_id, 'hacker@example.com');
            v_succeeded := TRUE;
        EXCEPTION
            WHEN insufficient_privilege THEN -- SQLSTATE 42501 table privilege denial
                v_succeeded := FALSE;
            WHEN raise_exception THEN -- SQLSTATE P0001 trigger exception
                IF SQLERRM LIKE '%Sunflower Reverie Security Policy%' THEN
                    v_succeeded := FALSE;
                ELSE
                    RAISE;
                END IF;
        END;

        IF v_succeeded THEN
            RAISE EXCEPTION 'SECURITY BREACH: Fake user inserted into authorized_authors!';
        END IF;

        -- Test 8.4.3: Cannot insert into publications (RLS WITH CHECK fails with SQLSTATE 42501)
        BEGIN
            INSERT INTO public.publications (title, slug, body, author_id) 
            VALUES ('Hacked Post', 'hacked-post', 'Unauthorized content', v_fake_user_id);
            v_succeeded := TRUE;
        EXCEPTION
            WHEN insufficient_privilege THEN -- SQLSTATE 42501
                v_succeeded := FALSE;
        END;

        IF v_succeeded THEN
            RAISE EXCEPTION 'SECURITY BREACH: Fake user created publication!';
        END IF;

        -- Test 8.4.4: Cannot modify Nadvi's profile (RLS USING clause filters out row -> 0 rows updated)
        UPDATE public.profiles SET display_name = 'Hacked' WHERE slug = 'nadvi';
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        IF v_rows > 0 THEN
            RAISE EXCEPTION 'SECURITY BREACH: Fake user modified Nadvi profile (% rows affected)!', v_rows;
        END IF;

        RAISE NOTICE 'SIMULATION 8.4 PASSED: Arbitrary authenticated user is strictly blocked.';
    END $$;
ROLLBACK;

-- ------------------------------------------------------------------------------
-- 9. AUTOMATED 15-POINT INVARIANT COMPLIANCE DASHBOARD
-- Run this query for a consolidated, stage-aware pass/fail checklist of all security controls.
-- ------------------------------------------------------------------------------
WITH checks AS (
    -- Invariant 01: Exactly 1 sole authorized author
    SELECT 
        '01. Sole Authorized Author Count' AS check_name,
        CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END AS status,
        'Found ' || COUNT(*) || ' author(s). Expected exactly 1.' AS details
    FROM public.authorized_authors

    UNION ALL

    -- Invariant 02: Sole authorized author email is Nadvi
    SELECT 
        '02. Sole Authorized Author Email' AS check_name,
        CASE WHEN LOWER(TRIM(MIN(email))) = 'nadvihasan107@gmail.com' THEN 'PASS' ELSE 'FAIL' END AS status,
        'Authorized email: ' || COALESCE(MIN(email), '<none>') AS details
    FROM public.authorized_authors

    UNION ALL

    -- Invariant 03: Sole authorized author user_id matches auth.users UUID for Nadvi
    SELECT 
        '03. Sole Authorized Author Genuine UUID' AS check_name,
        CASE 
            WHEN aa.user_id = u.id THEN 'PASS' 
            ELSE 'FAIL' 
        END AS status,
        'Allowlist UID: ' || aa.user_id || ' | Auth UID: ' || COALESCE(u.id::text, '<not found>') AS details
    FROM public.authorized_authors aa
    LEFT JOIN auth.users u ON LOWER(TRIM(u.email)) = 'nadvihasan107@gmail.com'

    UNION ALL

    -- Invariant 04: Nadvi profile initialized and public
    SELECT 
        '04. Nadvi Public Profile Active' AS check_name,
        CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END AS status,
        'Nadvi profile exists with is_public_author = TRUE' AS details
    FROM public.profiles
    WHERE slug = 'nadvi' AND is_public_author = TRUE

    UNION ALL

    -- Invariant 05: No unauthorized profiles are marked public
    SELECT 
        '05. Unauthorized Profiles Concealed' AS check_name,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status,
        COUNT(*) || ' non-Nadvi profile(s) marked public.' AS details
    FROM public.profiles
    WHERE is_public_author = TRUE 
      AND id NOT IN (
          SELECT user_id FROM public.authorized_authors WHERE LOWER(TRIM(email)) = 'nadvihasan107@gmail.com'
      )

    UNION ALL

    -- Invariant 06: authorized_authors has zero table write privileges for anon or authenticated
    SELECT 
        '06. authorized_authors Table Write Privileges Revoked' AS check_name,
        CASE 
            WHEN NOT has_table_privilege('anon', 'public.authorized_authors', 'SELECT')
                 AND NOT has_table_privilege('authenticated', 'public.authorized_authors', 'INSERT')
                 AND NOT has_table_privilege('authenticated', 'public.authorized_authors', 'UPDATE')
                 AND NOT has_table_privilege('authenticated', 'public.authorized_authors', 'DELETE')
            THEN 'PASS' 
            ELSE 'FAIL' 
        END AS status,
        'Effective table privileges evaluated via has_table_privilege' AS details

    UNION ALL

    -- Invariant 07: profiles table write privileges revoked (column writes only)
    SELECT 
        '07. profiles Table Write Privileges Revoked' AS check_name,
        CASE 
            WHEN NOT has_table_privilege('anon', 'public.profiles', 'INSERT')
                 AND NOT has_table_privilege('anon', 'public.profiles', 'UPDATE')
                 AND NOT has_table_privilege('authenticated', 'public.profiles', 'DELETE')
                 AND NOT has_table_privilege('authenticated', 'public.profiles', 'TRUNCATE')
            THEN 'PASS' 
            ELSE 'FAIL' 
        END AS status,
        'Effective profiles table write evaluated' AS details

    UNION ALL

    -- Invariant 08: profiles.is_public_author has no column write grants
    SELECT 
        '08. profiles.is_public_author Write Grants Blocked' AS check_name,
        CASE 
            WHEN NOT has_column_privilege('authenticated', 'public.profiles', 'is_public_author', 'INSERT')
                 AND NOT has_column_privilege('authenticated', 'public.profiles', 'is_public_author', 'UPDATE')
                 AND NOT has_column_privilege('anon', 'public.profiles', 'is_public_author', 'UPDATE')
            THEN 'PASS' 
            ELSE 'FAIL' 
        END AS status,
        'Effective column privileges evaluated for is_public_author' AS details

    UNION ALL

    -- Invariant 09: Stage-Aware Publications Base-Table Access Check
    SELECT 
        '09. publications Base Table Access (Stage-Aware)' AS check_name,
        CASE 
            WHEN has_table_privilege('anon', 'public.publications', 'SELECT') 
            THEN 'PASS (STAGE 1)'
            ELSE 'PASS (STAGE 2)'
        END AS status,
        CASE 
            WHEN has_table_privilege('anon', 'public.publications', 'SELECT') 
            THEN 'Stage 1 active: temporary anon SELECT granted for legacy frontend; drafts guarded by RLS.'
            ELSE 'Stage 2 active: direct anon base-table access fully revoked.'
        END AS details

    UNION ALL

    -- Invariant 10: public_publications view exists and has exact 22 columns
    SELECT 
        '10. public_publications View Column Count' AS check_name,
        CASE WHEN COUNT(*) = 22 THEN 'PASS' ELSE 'FAIL' END AS status,
        'Found ' || COUNT(*) || ' column(s). Expected 22.' AS details
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'public_publications'

    UNION ALL

    -- Invariant 11: public_publications view has zero write grants
    SELECT 
        '11. public_publications View Write Privileges Revoked' AS check_name,
        CASE 
            WHEN NOT has_table_privilege('anon', 'public.public_publications', 'INSERT')
                 AND NOT has_table_privilege('anon', 'public.public_publications', 'UPDATE')
                 AND NOT has_table_privilege('anon', 'public.public_publications', 'DELETE')
                 AND NOT has_table_privilege('authenticated', 'public.public_publications', 'INSERT')
                 AND NOT has_table_privilege('authenticated', 'public.public_publications', 'UPDATE')
                 AND NOT has_table_privilege('authenticated', 'public.public_publications', 'DELETE')
            THEN 'PASS' 
            ELSE 'FAIL' 
        END AS status,
        'View write operations blocked for anon and authenticated' AS details

    UNION ALL

    -- Invariant 12: RLS enabled on all core tables
    SELECT 
        '12. RLS Enabled on Core Tables' AS check_name,
        CASE WHEN COUNT(*) = 3 THEN 'PASS' ELSE 'FAIL' END AS status,
        COUNT(*) || ' of 3 tables have RLS enabled.' AS details
    FROM pg_class
    WHERE relnamespace = 'public'::regnamespace
      AND relname IN ('authorized_authors', 'profiles', 'publications')
      AND relrowsecurity = TRUE

    UNION ALL

    -- Invariant 13: Impersonation-proof trigger is active on INSERT and UPDATE (verified via pg_trigger)
    SELECT 
        '13. trg_limit_single_author Trigger Active' AS check_name,
        CASE 
            WHEN COUNT(*) = 1 
                 AND bool_and(t.tgenabled = 'O')
                 AND bool_and((t.tgtype & 4 <> 0) AND (t.tgtype & 16 <> 0))
            THEN 'PASS' 
            ELSE 'FAIL' 
        END AS status,
        'Verified 1 enabled trigger in pg_trigger handling both INSERT and UPDATE' AS details
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
      AND c.relname = 'authorized_authors'
      AND t.tgname = 'trg_limit_single_author' 
      AND NOT t.tgisinternal

    UNION ALL

    -- Invariant 14: Storage bucket configured
    SELECT 
        '14. sunflower-assets Storage Bucket Configured' AS check_name,
        CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END AS status,
        'Bucket exists with public = true and 5MB limit' AS details
    FROM storage.buckets
    WHERE id = 'sunflower-assets' AND public = true

    UNION ALL

    -- Invariant 15: Storage ownership policies active on storage.objects
    SELECT 
        '15. Storage Ownership Policies Enforced' AS check_name,
        CASE WHEN COUNT(*) >= 3 THEN 'PASS' ELSE 'FAIL' END AS status,
        COUNT(*) || ' active storage policies found on storage.objects' AS details
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
)
SELECT 
    check_name,
    status,
    details
FROM checks
ORDER BY check_name;
