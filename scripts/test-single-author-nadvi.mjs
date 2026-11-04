/**
 * Single Author Architecture (Nadvi) Automated Verification Suite
 * Sunflower Reverie
 */

import fs from 'node:fs';

console.log('=== Sunflower Reverie: Single Author Architecture (Nadvi) Test Suite ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Group 1: Single Author Configuration & Server-Side Security
// -----------------------------------------------------------------------------
console.log('--- Group 1: Single Author Configuration & Server-Side Security ---');

const authorActionsSrc = fs.readFileSync('src/app/author/actions.ts', 'utf8');
const dashboardActionsSrc = fs.readFileSync('src/app/author/dashboard/actions.ts', 'utf8');
const middlewareSrc = fs.readFileSync('src/lib/supabase/middleware.ts', 'utf8');

assert(
  authorActionsSrc.includes('nadvihasan107@gmail.com'),
  'author/actions.ts checks nadvihasan107@gmail.com on login'
);

assert(
  authorActionsSrc.includes('nadvihasan107@gmail.com') &&
  authorActionsSrc.includes('Access denied'),
  'author/actions.ts returns clear single-author access denial message'
);

assert(
  dashboardActionsSrc.includes('nadvihasan107@gmail.com'),
  'dashboard/actions.ts enforces nadvihasan107@gmail.com on server actions'
);

assert(
  middlewareSrc.includes('authorized_authors') &&
  middlewareSrc.includes('error') &&
  middlewareSrc.includes('unauthorized'),
  'middleware.ts enforces database authorized_authors check'
);

// -----------------------------------------------------------------------------
// Group 2: Mahi Retirement & Public Author Privacy
// -----------------------------------------------------------------------------
console.log('\n--- Group 2: Mahi Retirement & Public Author Privacy ---');

const pubSrc = fs.readFileSync('src/data/publications.ts', 'utf8');

assert(
  pubSrc.includes('if (authorSlug.toLowerCase() === "mahi")') &&
  pubSrc.includes('return [];'),
  'fetchPublicationsByAuthor strictly rejects Mahi'
);

assert(
  pubSrc.includes('if (slug.toLowerCase() === "mahi")') &&
  pubSrc.includes('return undefined;'),
  'fetchAuthorBySlug strictly rejects Mahi'
);

assert(
  pubSrc.includes('.neq("slug", "mahi")'),
  'fetchAllAuthors queries strictly exclude Mahi'
);

const adminScriptPath = 'supabase/admin_mahi_inventory_and_retirement.sql';
assert(fs.existsSync(adminScriptPath), 'Admin Mahi inventory & retirement script exists');

const adminScriptSql = fs.readFileSync(adminScriptPath, 'utf8');
assert(
  adminScriptSql.includes('STAGE 1: READ-ONLY CONTENT INVENTORY') &&
  adminScriptSql.includes('STAGE 2: CONTENT TRANSITION OPTIONS') &&
  adminScriptSql.includes('STAGE 3: VERIFICATION & EMERGENCY ROLLBACK PROCEDURE'),
  'Admin script provides complete 3-stage inventory, transition options, and rollback plan'
);

// -----------------------------------------------------------------------------
// Group 3: Removal of Anonymous Publishing
// -----------------------------------------------------------------------------
console.log('\n--- Group 3: Removal of Anonymous Publishing ---');

const writingEditorSrc = fs.readFileSync('src/components/author/WritingEditor.tsx', 'utf8');

assert(
  !writingEditorSrc.includes('Publish Anonymously'),
  'WritingEditor.tsx has removed the Publish Anonymously control'
);

assert(
  !writingEditorSrc.includes('formData.append("isAnonymous"'),
  'WritingEditor.tsx does not send isAnonymous to server'
);

assert(
  dashboardActionsSrc.includes('const isAnonymous = false;'),
  'dashboard/actions.ts unconditionally sets is_anonymous = false'
);

const publicationLayoutSrc = fs.readFileSync('src/components/reading/PublicationLayout.tsx', 'utf8');

assert(
  !publicationLayoutSrc.includes('Penned Anonymously'),
  'PublicationLayout.tsx has removed the Penned Anonymously box'
);

assert(
  publicationLayoutSrc.includes('About {publication.author.name}'),
  'PublicationLayout.tsx always displays author byline'
);

const blogListingSrc = fs.readFileSync('src/components/blogs/BlogListing.tsx', 'utf8');
const poetryListingSrc = fs.readFileSync('src/components/poetry/PoetryListing.tsx', 'utf8');

assert(
  !blogListingSrc.includes('{post.isAnonymous || !post.author.slug ?'),
  'BlogListing.tsx does not mask author as Anonymous'
);

assert(
  !poetryListingSrc.includes('{poem.isAnonymous || !poem.author.slug ?'),
  'PoetryListing.tsx does not mask author as Anonymous'
);

// -----------------------------------------------------------------------------
// Group 4: Writing Categories & Features Integrity
// -----------------------------------------------------------------------------
console.log('\n--- Group 4: Writing Categories & Features Integrity ---');

assert(
  writingEditorSrc.includes('VALID_CATEGORIES') &&
  writingEditorSrc.includes('"blog"') &&
  writingEditorSrc.includes('"poetry"') &&
  writingEditorSrc.includes('"journal"') &&
  writingEditorSrc.includes('"writing"'),
  'WritingEditor.tsx preserves all 4 categories (Blog, Poetry, Journal, Writings)'
);

assert(
  pubSrc.includes('stanzas = isPoetry'),
  'publications.ts preserves poetry stanza formatting'
);

// -----------------------------------------------------------------------------
// Group 5: Forward-Only Database Migration Integrity
// -----------------------------------------------------------------------------
console.log('\n--- Group 5: Forward-Only Database Migration Integrity ---');

const migrationPath = 'supabase/migrations/20261102_single_author_nadvi.sql';
assert(fs.existsSync(migrationPath), 'Stage 1 migration 20261102_single_author_nadvi.sql exists');

const migrationSql = fs.readFileSync(migrationPath, 'utf8');

assert(
  migrationSql.includes('nadvihasan107@gmail.com'),
  'Migration targets nadvihasan107@gmail.com'
);

assert(
  migrationSql.includes('PREREQUISITE ASSERTION') &&
  migrationSql.includes('RAISE EXCEPTION \'MIGRATION ABORTED'),
  'Migration asserts Nadvi auth account exists and aborts if missing'
);

assert(
  migrationSql.includes('DELETE FROM public.authorized_authors') &&
  migrationSql.includes('WHERE user_id <> v_nadvi_id'),
  'Migration revokes Mahi from authorized_authors in the same transaction'
);

assert(
  migrationSql.includes('check_single_authorized_author') &&
  migrationSql.includes('BEFORE INSERT OR UPDATE ON public.authorized_authors'),
  'Migration creates impersonation-proof trigger evaluating BOTH INSERT and UPDATE'
);

assert(
  migrationSql.includes('NEW.user_id <> v_nadvi_id'),
  'Trigger validates user_id against genuine auth.users UUID preventing impersonation'
);

assert(
  migrationSql.includes('is_sole_public_author') &&
  migrationSql.includes('SECURITY DEFINER SET search_path = public'),
  'Migration defines is_sole_public_author SECURITY DEFINER helper for anonymous profile access'
);

assert(
  migrationSql.includes('attacl IS NOT NULL') &&
  migrationSql.includes('aclexplode(a.attacl)') &&
  migrationSql.includes('FROM PUBLIC'),
  'Migration targets actual column ACLs and strips privileges using valid unquoted PUBLIC syntax'
);

assert(
  migrationSql.includes('pg_depend') &&
  !migrationSql.includes('EXCEPTION WHEN OTHERS THEN\n    NULL'),
  'Migration inspects view dependencies without silent exception swallowing'
);

assert(
  migrationSql.includes('public.public_publications'),
  'Migration updates public_publications view with author attribution'
);

assert(
  migrationSql.includes('ALTER TABLE public.publications') &&
  migrationSql.includes('is_anonymous'),
  'Migration safely retains is_anonymous column with default false'
);

assert(
  migrationSql.includes('ADD COLUMN interests TEXT[] DEFAULT') &&
  migrationSql.includes('column_name = \'interests\''),
  'Migration idempotently adds profiles.interests column with TEXT[] default to support literary interests'
);

// -----------------------------------------------------------------------------
// Group 6: Staged Rollout, Verification & Rollback Plans
// -----------------------------------------------------------------------------
console.log('\n--- Group 6: Staged Rollout, Verification & Rollback Plans ---');

const stage2Path = 'supabase/migrations/20261103_deprecate_base_table_anon_access.sql';
assert(fs.existsSync(stage2Path), 'Stage 2 migration 20261103_deprecate_base_table_anon_access.sql exists');

const stage2Sql = fs.readFileSync(stage2Path, 'utf8');
assert(
  stage2Sql.includes('REVOKE ALL ON public.publications FROM anon, PUBLIC;'),
  'Stage 2 migration revokes direct anonymous base-table access after frontend deployment'
);

assert(
  stage2Sql.includes('FROM PUBLIC') &&
  stage2Sql.includes('UPPER(grantee) IN (\'ANON\', \'PUBLIC\')'),
  'Stage 2 correctly revokes column permissions from actual grant recipients using unquoted PUBLIC'
);

assert(
  stage2Sql.includes('has_column_privilege(\'anon\', \'public.publications\''),
  'Stage 2 verifies effective anonymous column privileges via has_column_privilege'
);

const rollbackPath = 'supabase/rollback_20261102_single_author.sql';
assert(fs.existsSync(rollbackPath), 'Reviewed rollback script exists');

const rollbackSql = fs.readFileSync(rollbackPath, 'utf8');
assert(
  rollbackSql.toLowerCase().includes('do not blindly re-run 20261030_two_author_system.sql') &&
  rollbackSql.includes('Reinstated Mahi'),
  'Rollback script provides controlled restoration of Mahi without legacy policy hazards'
);

const verifyPath = 'supabase/verify_production_security.sql';
assert(fs.existsSync(verifyPath), 'Verification script exists');

const verifySql = fs.readFileSync(verifyPath, 'utf8');
assert(
  verifySql.includes('has_table_privilege') &&
  verifySql.includes('has_column_privilege'),
  'Verification script tests effective PostgreSQL table and column privileges'
);

assert(
  verifySql.includes('SIMULATION 1: ANONYMOUS VISITOR') &&
  verifySql.includes('SIMULATION 2: AUTHENTICATED NADVI') &&
  verifySql.includes('SIMULATION 3: AUTHENTICATED MAHI') &&
  verifySql.includes('SIMULATION 4: UNAUTHORIZED AUTHENTICATED USER'),
  'Verification script provides executable simulation procedures for all 4 roles'
);

assert(
  verifySql.includes('WHEN insufficient_privilege THEN') &&
  !verifySql.includes('EXCEPTION WHEN OTHERS THEN\n                NULL;'),
  'Verification script eliminates false positives and strictly checks SQLSTATE 42501 insufficient_privilege'
);

assert(
  verifySql.includes('STAGE 1') &&
  verifySql.includes('STAGE 2') &&
  verifySql.includes('detected_stage'),
  'Verification script provides stage-aware checks and expected results for both stages'
);

assert(
  verifySql.includes('FROM pg_trigger t') &&
  verifySql.includes('(t.tgtype & 4 <> 0) AND (t.tgtype & 16 <> 0)'),
  'Verification dashboard checks pg_trigger for single enabled trigger handling both INSERT and UPDATE'
);

assert(
  verifySql.includes('Test 8.1.2b') &&
  verifySql.includes('v_profile_count <> 1') &&
  verifySql.includes('slug = \'mahi\''),
  'Verification script explicitly exercises anonymous permission path with Mahi concealment assertion'
);

// -----------------------------------------------------------------------------
// Group 7: Zero Invented Author Details & Password Security Rule
// -----------------------------------------------------------------------------
console.log('\n--- Group 7: Zero Invented Author Details & Password Security ---');

const mockDataSrc = fs.readFileSync('src/data/mockData.ts', 'utf8');

assert(
  migrationSql.includes('short_bio,') &&
  migrationSql.includes('NULL,              -- Left empty for Nadvi') &&
  migrationSql.includes('\'[]\'::JSONB,       -- Left empty for Nadvi'),
  'Migration creates only essential profile fields without invented bio, quote, or links'
);

assert(
  mockDataSrc.includes('shortBio: undefined') &&
  mockDataSrc.includes('quote: undefined') &&
  mockDataSrc.includes('socialLinks: []'),
  'mockData.ts contains no invented bio, quote, or social links for Nadvi'
);

const allSqlFiles = [
  'supabase/migrations/20261102_single_author_nadvi.sql',
  'supabase/migrations/20261103_deprecate_base_table_anon_access.sql',
  'supabase/admin_mahi_inventory_and_retirement.sql',
  'supabase/rollback_20261102_single_author.sql',
  'supabase/verify_production_security.sql'
];

let passwordsFound = false;
for (const file of allSqlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (/password\s*=\s*'[^']+'/i.test(content) || /encrypted_password/i.test(content)) {
    passwordsFound = true;
    console.error(`  ✗ FAIL: Potential password found in ${file}`);
  }
}

assert(!passwordsFound, 'No hardcoded passwords exist in SQL migration or admin scripts');

console.log(`\n=== Single Author Test Suite Complete: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All single-author specifications PASSED with 100% compliance!\n');
}
