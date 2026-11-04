-- ==============================================================================
-- Sunflower Reverie: Single Author Architecture - Stage 2 Lock-Down
-- Migration: 20261103_deprecate_base_table_anon_access.sql
-- ==============================================================================
-- PURPOSE:
-- Final hardening of publication access after the updated frontend has been deployed
-- to Netlify. The new frontend reads exclusively from public.public_publications.
--
-- EXECUTION ORDER:
-- 1. Apply 20261102_single_author_nadvi.sql (Stage 1: allows temporary anon base-table SELECT).
-- 2. Deploy updated frontend to Netlify and smoke test.
-- 3. Apply THIS script (Stage 2) to eliminate all direct anonymous base-table access.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. PREREQUISITE ASSERTION: PUBLIC VIEW MUST EXIST AND BE OPERATIONAL
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_col_count INT;
BEGIN
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'public_publications';

    IF v_col_count <> 22 THEN
        RAISE EXCEPTION 'STAGE 2 ABORTED: public.public_publications view does not exist or has invalid column count (found %, expected 22). Please ensure 20261102_single_author_nadvi.sql was applied first.', v_col_count;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. REVOKE BASE TABLE ACCESS FROM ANONYMOUS ROLE AND PUBLIC
-- ------------------------------------------------------------------------------
-- Revoke all table-level access on public.publications from anon and PUBLIC
REVOKE ALL ON public.publications FROM anon, PUBLIC;

-- Revoke any column-level access on public.publications from anon and PUBLIC
-- Uses valid PostgreSQL unquoted keyword for PUBLIC and identifier quoting for roles
DO $$
DECLARE
    cp RECORD;
BEGIN
    FOR cp IN (
        SELECT column_name, grantee, privilege_type
        FROM information_schema.column_privileges
        WHERE table_schema = 'public'
          AND table_name = 'publications'
          AND UPPER(grantee) IN ('ANON', 'PUBLIC')
    ) LOOP
        IF UPPER(cp.grantee) = 'PUBLIC' THEN
            EXECUTE format(
                'REVOKE %s (%I) ON public.publications FROM PUBLIC',
                cp.privilege_type, cp.column_name
            );
        ELSE
            EXECUTE format(
                'REVOKE %s (%I) ON public.publications FROM %I',
                cp.privilege_type, cp.column_name, cp.grantee
            );
        END IF;
    END LOOP;
END $$;

-- Ensure authenticated authors retain their publication management rights (governed by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publications TO authenticated;
GRANT ALL ON public.publications TO postgres, service_role;

-- ------------------------------------------------------------------------------
-- 3. TIGHTEN PUBLICATIONS RLS SELECT POLICY
-- ------------------------------------------------------------------------------
-- Since anon no longer has table SELECT grant, tighten policy to authenticated author only
DROP POLICY IF EXISTS "Publications visibility policy" ON public.publications;

CREATE POLICY "Authorized author can read own publications"
ON public.publications FOR SELECT
USING (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_authorized_author(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 4. ASSERTION: CONFIRM EFFECTIVE ANONYMOUS LOCKOUT VIA PRIVILEGE FUNCTIONS
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    col RECORD;
BEGIN
    -- Check 1: Table-level SELECT must be false
    IF has_table_privilege('anon', 'public.publications', 'SELECT') THEN
        RAISE EXCEPTION 'STAGE 2 ASSERTION FAILED: anon still has effective SELECT on public.publications';
    END IF;

    -- Check 2: No column-level SELECT on publications for anon
    FOR col IN (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'publications'
    ) LOOP
        IF has_column_privilege('anon', 'public.publications', col.column_name, 'SELECT') THEN
            RAISE EXCEPTION 'STAGE 2 ASSERTION FAILED: anon has effective column SELECT on public.publications (%)', col.column_name;
        END IF;
    END LOOP;

    -- Check 3: Public projection view MUST remain readable
    IF NOT has_table_privilege('anon', 'public.public_publications', 'SELECT') THEN
        RAISE EXCEPTION 'STAGE 2 ASSERTION FAILED: anon does not have SELECT on public.public_publications view';
    END IF;

    RAISE NOTICE 'SUCCESS: Stage 2 lock-down verified. Direct anonymous base-table access eliminated.';
END $$;

COMMIT;
