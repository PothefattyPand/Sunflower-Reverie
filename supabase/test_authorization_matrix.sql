-- ==============================================================================
-- Sunflower Reverie: Two-Author Authorization Test Matrix
-- ==============================================================================
-- This script validates all 10 security requirements in the database layer.
-- Run in the Supabase SQL Editor.
-- ==============================================================================

DO $$
DECLARE
    -- Mock test UUIDs
    v_author_a UUID := '11111111-1111-1111-1111-111111111111'::UUID;
    v_author_b UUID := '22222222-2222-2222-2222-222222222222'::UUID;
    v_unauthorized_user UUID := '99999999-9999-9999-9999-999999999999'::UUID;
    v_pub_a_id UUID := gen_random_uuid();
    v_pub_b_id UUID := gen_random_uuid();
    v_draft_a_id UUID := gen_random_uuid();
    v_test_count INT;
    v_error_caught BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'Starting Sunflower Reverie Authorization Test Matrix';
    RAISE NOTICE '=======================================================';

    -- Backup existing authorized_authors to restore cleanly after tests
    CREATE TEMP TABLE IF NOT EXISTS temp_authors_backup AS
    SELECT * FROM public.authorized_authors;

    DELETE FROM public.authorized_authors;

    -- Setup: Register Author A and Author B in authorized_authors
    INSERT INTO public.authorized_authors (user_id, email)
    VALUES (v_author_a, 'author_a@test.com'), (v_author_b, 'author_b@test.com');

    -- Setup: Profiles
    INSERT INTO public.profiles (id, display_name, slug)
    VALUES (v_author_a, 'Author A', 'author-a')
    ON CONFLICT (id) DO UPDATE SET display_name = 'Author A';

    INSERT INTO public.profiles (id, display_name, slug)
    VALUES (v_author_b, 'Author B', 'author-b')
    ON CONFLICT (id) DO UPDATE SET display_name = 'Author B';

    -- --------------------------------------------------------------------------
    -- TEST 0: Cannot add a 3rd author (Database trigger enforces max 2)
    -- --------------------------------------------------------------------------
    v_error_caught := FALSE;
    BEGIN
        INSERT INTO public.authorized_authors (user_id, email)
        VALUES (v_unauthorized_user, 'author_c@test.com');
    EXCEPTION WHEN OTHERS THEN
        v_error_caught := TRUE;
    END;

    IF v_error_caught THEN
        RAISE NOTICE '✓ TEST 0 PASSED: trg_limit_two_authors blocked inserting a 3rd author.';
    ELSE
        RAISE EXCEPTION '✗ TEST 0 FAILED: Database permitted registering a 3rd author!';
    END IF;

    -- --------------------------------------------------------------------------
    -- TEST 1: Author A can create and edit A's publications
    -- --------------------------------------------------------------------------
    -- Simulate authenticated session for Author A
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_author_a::text, 'role', 'authenticated')::text, true);

    INSERT INTO public.publications (
        id, author_id, title, slug, category, excerpt, body, status
    ) VALUES (
        v_pub_a_id, v_author_a, 'Author A Initial Post', 'author-a-post', 'blog', 'Excerpt', 'Body text', 'published'
    );

    UPDATE public.publications SET title = 'Author A Updated Post' WHERE id = v_pub_a_id;
    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE id = v_pub_a_id AND title = 'Author A Updated Post';
    IF v_test_count = 1 THEN
        RAISE NOTICE '✓ TEST 1 PASSED: Author A can create and edit own publications.';
    ELSE
        RAISE EXCEPTION '✗ TEST 1 FAILED: Author A could not create or edit own publication.';
    END IF;

    -- --------------------------------------------------------------------------
    -- TEST 2: Author B can create and edit B's publications
    -- --------------------------------------------------------------------------
    -- Simulate authenticated session for Author B
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_author_b::text, 'role', 'authenticated')::text, true);

    INSERT INTO public.publications (
        id, author_id, title, slug, category, excerpt, body, status
    ) VALUES (
        v_pub_b_id, v_author_b, 'Author B Initial Post', 'author-b-post', 'blog', 'Excerpt', 'Body text', 'published'
    );

    UPDATE public.publications SET title = 'Author B Updated Post' WHERE id = v_pub_b_id;
    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE id = v_pub_b_id AND title = 'Author B Updated Post';
    IF v_test_count = 1 THEN
        RAISE NOTICE '✓ TEST 2 PASSED: Author B can create and edit own publications.';
    ELSE
        RAISE EXCEPTION '✗ TEST 2 FAILED: Author B could not create or edit own publication.';
    END IF;

    -- --------------------------------------------------------------------------
    -- TEST 3: Author A cannot edit or delete Author B's publications
    -- --------------------------------------------------------------------------
    -- Switch back to Author A
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_author_a::text, 'role', 'authenticated')::text, true);

    UPDATE public.publications SET title = 'Hacked by Author A' WHERE id = v_pub_b_id;
    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE id = v_pub_b_id AND title = 'Hacked by Author A';
    IF v_test_count = 0 THEN
        RAISE NOTICE '✓ TEST 3A PASSED: Author A update on Author B piece had no effect (RLS blocked).';
    ELSE
        RAISE EXCEPTION '✗ TEST 3A FAILED: Author A was able to update Author B piece!';
    END IF;

    DELETE FROM public.publications WHERE id = v_pub_b_id;
    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE id = v_pub_b_id;
    IF v_test_count = 1 THEN
        RAISE NOTICE '✓ TEST 3B PASSED: Author A delete on Author B piece was rejected (RLS blocked).';
    ELSE
        RAISE EXCEPTION '✗ TEST 3B FAILED: Author A was able to delete Author B piece!';
    END IF;

    -- --------------------------------------------------------------------------
    -- TEST 4: Author B cannot edit or delete Author A's publications
    -- --------------------------------------------------------------------------
    -- Switch to Author B
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_author_b::text, 'role', 'authenticated')::text, true);

    UPDATE public.publications SET title = 'Hacked by Author B' WHERE id = v_pub_a_id;
    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE id = v_pub_a_id AND title = 'Hacked by Author B';
    IF v_test_count = 0 THEN
        RAISE NOTICE '✓ TEST 4A PASSED: Author B update on Author A piece had no effect (RLS blocked).';
    ELSE
        RAISE EXCEPTION '✗ TEST 4A FAILED: Author B was able to update Author A piece!';
    END IF;

    DELETE FROM public.publications WHERE id = v_pub_a_id;
    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE id = v_pub_a_id;
    IF v_test_count = 1 THEN
        RAISE NOTICE '✓ TEST 4B PASSED: Author B delete on Author A piece was rejected (RLS blocked).';
    ELSE
        RAISE EXCEPTION '✗ TEST 4B FAILED: Author B was able to delete Author A piece!';
    END IF;

    -- --------------------------------------------------------------------------
    -- TEST 5: Authors cannot change author_id to bypass ownership
    -- --------------------------------------------------------------------------
    -- Author A attempts to reassign ownership of own publication to Author B
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_author_a::text, 'role', 'authenticated')::text, true);

    v_error_caught := FALSE;
    BEGIN
        UPDATE public.publications SET author_id = v_author_b WHERE id = v_pub_a_id;
    EXCEPTION WHEN OTHERS THEN
        v_error_caught := TRUE;
    END;

    IF v_error_caught THEN
        RAISE NOTICE '✓ TEST 5 PASSED: Immutability trigger prevented modifying author_id.';
    ELSE
        RAISE EXCEPTION '✗ TEST 5 FAILED: Author was able to change author_id!';
    END IF;

    -- --------------------------------------------------------------------------
    -- TEST 6: Anonymous visitors cannot create content
    -- --------------------------------------------------------------------------
    -- Simulate anonymous visitor (role = 'anon', sub is null)
    PERFORM set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);

    v_error_caught := FALSE;
    BEGIN
        INSERT INTO public.publications (
            author_id, title, slug, category, excerpt, body, status
        ) VALUES (
            v_author_a, 'Anon Post', 'anon-post', 'blog', 'Excerpt', 'Body', 'published'
        );
    EXCEPTION WHEN OTHERS THEN
        v_error_caught := TRUE;
    END;

    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE slug = 'anon-post';
    IF v_error_caught OR v_test_count = 0 THEN
        RAISE NOTICE '✓ TEST 6 PASSED: Anonymous user cannot insert publications.';
    ELSE
        RAISE EXCEPTION '✗ TEST 6 FAILED: Anonymous user inserted publication!';
    END IF;

    -- --------------------------------------------------------------------------
    -- TEST 7: Unauthorized authenticated users cannot publish
    -- --------------------------------------------------------------------------
    -- User is logged in to Supabase Auth, but NOT in authorized_authors allowlist
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_unauthorized_user::text, 'role', 'authenticated')::text, true);

    v_error_caught := FALSE;
    BEGIN
        INSERT INTO public.publications (
            author_id, title, slug, category, excerpt, body, status
        ) VALUES (
            v_unauthorized_user, 'Unauthorized Post', 'unauthorized-post', 'blog', 'Excerpt', 'Body', 'published'
        );
    EXCEPTION WHEN OTHERS THEN
        v_error_caught := TRUE;
    END;

    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE slug = 'unauthorized-post';
    IF v_error_caught OR v_test_count = 0 THEN
        RAISE NOTICE '✓ TEST 7 PASSED: Non-allowlisted authenticated user cannot publish.';
    ELSE
        RAISE EXCEPTION '✗ TEST 7 FAILED: Non-allowlisted user was able to publish!';
    END IF;

    -- --------------------------------------------------------------------------
    -- TEST 8: Drafts are not publicly accessible
    -- --------------------------------------------------------------------------
    -- Author A creates a draft
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_author_a::text, 'role', 'authenticated')::text, true);
    INSERT INTO public.publications (
        id, author_id, title, slug, category, excerpt, body, status
    ) VALUES (
        v_draft_a_id, v_author_a, 'Author A Private Draft', 'author-a-draft', 'blog', 'Excerpt', 'Body', 'draft'
    );

    -- Anonymous visitor queries publications
    PERFORM set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE id = v_draft_a_id;
    IF v_test_count = 0 THEN
        RAISE NOTICE '✓ TEST 8A PASSED: Anonymous visitors cannot see drafts.';
    ELSE
        RAISE EXCEPTION '✗ TEST 8A FAILED: Anonymous visitor saw private draft!';
    END IF;

    -- Author B queries publications
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_author_b::text, 'role', 'authenticated')::text, true);
    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE id = v_draft_a_id;
    IF v_test_count = 0 THEN
        RAISE NOTICE '✓ TEST 8B PASSED: Author B cannot see Author A drafts.';
    ELSE
        RAISE EXCEPTION '✗ TEST 8B FAILED: Author B saw Author A private draft!';
    END IF;

    -- --------------------------------------------------------------------------
    -- TEST 9: Published posts are publicly readable
    -- --------------------------------------------------------------------------
    PERFORM set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
    SELECT COUNT(*) INTO v_test_count FROM public.publications WHERE id IN (v_pub_a_id, v_pub_b_id) AND status = 'published';
    IF v_test_count = 2 THEN
        RAISE NOTICE '✓ TEST 9 PASSED: Both authors published posts are publicly readable.';
    ELSE
        RAISE EXCEPTION '✗ TEST 9 FAILED: Published posts are not readable by public!';
    END IF;

    -- --------------------------------------------------------------------------
    -- TEST 10: Cross-author profile editing is rejected
    -- --------------------------------------------------------------------------
    -- Author A attempts to update Author B profile
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_author_a::text, 'role', 'authenticated')::text, true);
    UPDATE public.profiles SET display_name = 'Hacked Bio' WHERE id = v_author_b;

    SELECT COUNT(*) INTO v_test_count FROM public.profiles WHERE id = v_author_b AND display_name = 'Hacked Bio';
    IF v_test_count = 0 THEN
        RAISE NOTICE '✓ TEST 10 PASSED: Author A cannot edit Author B profile.';
    ELSE
        RAISE EXCEPTION '✗ TEST 10 FAILED: Author A edited Author B profile!';
    END IF;

    -- Clean up test records
    DELETE FROM public.publications WHERE id IN (v_pub_a_id, v_pub_b_id, v_draft_a_id);
    DELETE FROM public.profiles WHERE id IN (v_author_a, v_author_b);
    DELETE FROM public.authorized_authors WHERE user_id IN (v_author_a, v_author_b);

    -- Restore original authorized authors
    INSERT INTO public.authorized_authors
    SELECT * FROM temp_authors_backup
    ON CONFLICT (user_id) DO NOTHING;

    DROP TABLE IF EXISTS temp_authors_backup;

    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'ALL 10 AUTHORIZATION TESTS PASSED SUCCESSFULLY!';
    RAISE NOTICE '=======================================================';
END $$;

