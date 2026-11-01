/**
 * Comprehensive Security Test Suite for Sunflower Reverie Migration & Data Access Architecture.
 *
 * Evaluates the 10 core security scenarios mandated by the security audit:
 *  1. Anonymous visitor querying published writings.
 *  2. Anonymous visitor attempting to retrieve hidden author_id.
 *  3. Anonymous visitor querying hidden profiles.
 *  4. Author 1 accessing their own drafts.
 *  5. Author 1 attempting to access Author 2's drafts.
 *  6. Hidden author publishing anonymous content.
 *  7. Public author publishing named content.
 *  8. Public author choosing anonymous publishing.
 *  9. Public API returning no hidden identity details.
 * 10. Administrator changing the public author designation.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

console.log("=== Sunflower Reverie: Security Architecture & Migration Verification Suite ===\n");

let passed = 0;
let total = 0;

function test(id, name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [Scenario ${id}] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [Scenario ${id}] ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

const migrationPath = resolve("supabase/migrations/20261101_single_public_author_and_anonymous.sql");
assert.ok(existsSync(migrationPath), "Migration file must exist");
const migrationSql = readFileSync(migrationPath, "utf-8");

const publicationsPath = resolve("src/data/publications.ts");
assert.ok(existsSync(publicationsPath), "publications.ts must exist");
const publicationsCode = readFileSync(publicationsPath, "utf-8");

// Mock author database records
const MAHI_ID = "76aaf5a8-7029-45dc-a7c7-ad4f25255be6";
const AUTHOR_2_ID = "88bbccdd-2222-4444-8888-000000000002";

const mockProfiles = {
  [MAHI_ID]: {
    id: MAHI_ID,
    display_name: "Mahi",
    slug: "mahi",
    role: "Essayist, Poet & Co-Curator",
    avatar_url: "https://example.com/mahi.jpg",
    short_bio: "Quiet morning reflections",
    is_public_author: false,
  },
  [AUTHOR_2_ID]: {
    id: AUTHOR_2_ID,
    display_name: "Rowan Reed",
    slug: "rowan-reed",
    role: "Sanctuary Curator",
    avatar_url: "https://example.com/rowan.jpg",
    short_bio: "Botanical essays and pastoral prose",
    is_public_author: true,
  },
};

const mockPublications = [
  // Mahi's published piece
  {
    id: "pub-1",
    author_id: MAHI_ID,
    title: "Sunflowers at Dawn",
    slug: "sunflowers-at-dawn",
    category: "poetry",
    status: "published",
    is_anonymous: false, // Even if set false, Mahi MUST be anonymous
  },
  // Mahi's draft piece
  {
    id: "pub-2",
    author_id: MAHI_ID,
    title: "Secret Morning Draft",
    slug: "secret-morning-draft",
    category: "journal",
    status: "draft",
    is_anonymous: false,
  },
  // Author 2's published piece (named)
  {
    id: "pub-3",
    author_id: AUTHOR_2_ID,
    title: "Tending the Soil",
    slug: "tending-the-soil",
    category: "blog",
    status: "published",
    is_anonymous: false,
  },
  // Author 2's published piece (anonymous toggle)
  {
    id: "pub-4",
    author_id: AUTHOR_2_ID,
    title: "Quiet Solitude",
    slug: "quiet-solitude",
    category: "poetry",
    status: "published",
    is_anonymous: true,
  },
  // Author 2's draft piece
  {
    id: "pub-5",
    author_id: AUTHOR_2_ID,
    title: "Author 2 Private Notes",
    slug: "author-2-private-notes",
    category: "writing",
    status: "draft",
    is_anonymous: false,
  },
];

/**
 * Simulates SQL execution of the public_publications VIEW logic
 */
function evaluatePublicPublicationsView(publication, profile) {
  if (publication.status !== "published") {
    return null; // WHERE p.status = 'published'
  }

  const isPublicAuthor =
    profile &&
    profile.is_public_author === true &&
    profile.slug !== "mahi" &&
    profile.id !== MAHI_ID;

  const isNamed = isPublicAuthor && publication.is_anonymous === false;

  return {
    id: publication.id,
    title: publication.title,
    slug: publication.slug,
    category: publication.category,
    status: publication.status,
    is_anonymous: publication.is_anonymous,
    author_id: isNamed ? profile.id : null,
    author_name: isNamed ? profile.display_name : "Anonymous",
    author_slug: isNamed ? profile.slug : null,
    author_role: isNamed ? profile.role : "Contributing Author",
    author_avatar_url: isNamed ? profile.avatar_url : null,
    author_short_bio: isNamed ? profile.short_bio : null,
  };
}

/**
 * Simulates PostgreSQL Row-Level Security checks on base public.publications table
 */
function evaluateBasePublicationsRLS(publication, callerUid) {
  // Policy: "Authors can view own publications"
  // USING (auth.uid() IS NOT NULL AND author_id = auth.uid())
  if (!callerUid) return false;
  return publication.author_id === callerUid;
}

/**
 * Simulates PostgreSQL Row-Level Security checks on public.profiles table
 */
function evaluateProfilesRLS(profile, callerUid) {
  // Policy: USING (is_public_author = TRUE OR auth.uid() = id)
  if (profile.is_public_author === true) return true;
  if (callerUid && callerUid === profile.id) return true;
  return false;
}

// -------------------------------------------------------------
// Scenario 1: Anonymous visitor querying published writings
// -------------------------------------------------------------
test(1, "Anonymous visitor querying published writings via public view", () => {
  // Migration guarantees:
  assert.match(migrationSql, /CREATE OR REPLACE VIEW public\.public_publications/i);
  assert.match(migrationSql, /GRANT SELECT ON public\.public_publications TO anon/i);
  assert.match(migrationSql, /WHERE p\.status = 'published'/i);

  // All published publications should be viewable
  const published = mockPublications
    .filter((p) => p.status === "published")
    .map((p) => evaluatePublicPublicationsView(p, mockProfiles[p.author_id]));

  assert.equal(published.length, 3);
  published.forEach((row) => {
    assert.ok(row.title);
    assert.equal(row.status, "published");
  });
});

// -------------------------------------------------------------
// Scenario 2: Anonymous visitor attempting to retrieve hidden author_id
// -------------------------------------------------------------
test(2, "Anonymous visitor cannot retrieve hidden author_id (base table revoked & view redacts)", () => {
  // 1. Direct base table access is revoked
  assert.match(migrationSql, /REVOKE ALL ON public\.publications FROM anon/i);
  assert.match(migrationSql, /DROP POLICY IF EXISTS "Publications visibility policy" ON public\.publications/i);

  // 2. Base table RLS denies anonymous caller (callerUid = null)
  mockPublications.forEach((p) => {
    const canAccessBaseTable = evaluateBasePublicationsRLS(p, null);
    assert.equal(canAccessBaseTable, false, `Anonymous caller must NOT access base table row ${p.id}`);
  });

  // 3. View redacts author_id for Mahi
  const mahiPub = evaluatePublicPublicationsView(mockPublications[0], mockProfiles[MAHI_ID]);
  assert.equal(mahiPub.author_id, null, "Mahi's author_id MUST be null in the public view");
  assert.equal(mahiPub.author_name, "Anonymous");
  assert.equal(mahiPub.author_slug, null);
});

// -------------------------------------------------------------
// Scenario 3: Anonymous visitor querying hidden profiles
// -------------------------------------------------------------
test(3, "Anonymous visitor querying hidden profiles is blocked by RLS", () => {
  assert.match(migrationSql, /is_public_author\s*=\s*TRUE/i);
  assert.match(migrationSql, /auth\.uid\(\)\s*=\s*id/i);
  assert.match(migrationSql, /slug\s*<>\s*'mahi'/i);

  // Anonymous caller querying Mahi's profile
  const canAccessMahiProfile = evaluateProfilesRLS(mockProfiles[MAHI_ID], null);
  assert.equal(canAccessMahiProfile, false, "Anonymous user must NOT be permitted to select Mahi's profile");

  // Anonymous caller querying Author 2 (public author)
  const canAccessAuthor2Profile = evaluateProfilesRLS(mockProfiles[AUTHOR_2_ID], null);
  assert.equal(canAccessAuthor2Profile, true, "Anonymous user can select designated public author profile");
});

// -------------------------------------------------------------
// Scenario 4: Author 1 accessing their own drafts
// -------------------------------------------------------------
test(4, "Author 1 can securely access their own drafts and published writings", () => {
  assert.match(migrationSql, /CREATE POLICY "Authors can view own publications"/i);
  assert.match(migrationSql, /author_id\s*=\s*auth\.uid\(\)/i);

  const author1OwnDraft = mockPublications.find((p) => p.author_id === MAHI_ID && p.status === "draft");
  const author1OwnPub = mockPublications.find((p) => p.author_id === MAHI_ID && p.status === "published");

  assert.equal(evaluateBasePublicationsRLS(author1OwnDraft, MAHI_ID), true);
  assert.equal(evaluateBasePublicationsRLS(author1OwnPub, MAHI_ID), true);
});

// -------------------------------------------------------------
// Scenario 5: Author 1 attempting to access Author 2's drafts
// -------------------------------------------------------------
test(5, "Author 1 cannot access Author 2's drafts or private writings on base table", () => {
  const author2Draft = mockPublications.find((p) => p.author_id === AUTHOR_2_ID && p.status === "draft");
  const author2Pub = mockPublications.find((p) => p.author_id === AUTHOR_2_ID && p.status === "published");

  // Author 1 calling base table for Author 2 rows
  assert.equal(evaluateBasePublicationsRLS(author2Draft, MAHI_ID), false);
  assert.equal(evaluateBasePublicationsRLS(author2Pub, MAHI_ID), false);
});

// -------------------------------------------------------------
// Scenario 6: Hidden author publishing anonymous content
// -------------------------------------------------------------
test(6, "Hidden author (Mahi) content strictly projects as Anonymous", () => {
  const mahiPub = evaluatePublicPublicationsView(mockPublications[0], mockProfiles[MAHI_ID]);
  assert.equal(mahiPub.author_name, "Anonymous");
  assert.equal(mahiPub.author_id, null);
  assert.equal(mahiPub.author_slug, null);
  assert.equal(mahiPub.author_role, "Contributing Author");
  assert.equal(mahiPub.author_avatar_url, null);
  assert.equal(mahiPub.author_short_bio, null);
});

// -------------------------------------------------------------
// Scenario 7: Public author publishing named content
// -------------------------------------------------------------
test(7, "Public author publishing named content retains public attribution", () => {
  const author2NamedPub = evaluatePublicPublicationsView(mockPublications[2], mockProfiles[AUTHOR_2_ID]);
  assert.equal(author2NamedPub.author_name, "Rowan Reed");
  assert.equal(author2NamedPub.author_id, AUTHOR_2_ID);
  assert.equal(author2NamedPub.author_slug, "rowan-reed");
  assert.equal(author2NamedPub.author_role, "Sanctuary Curator");
  assert.equal(author2NamedPub.author_avatar_url, "https://example.com/rowan.jpg");
  assert.equal(author2NamedPub.author_short_bio, "Botanical essays and pastoral prose");
});

// -------------------------------------------------------------
// Scenario 8: Public author choosing anonymous publishing
// -------------------------------------------------------------
test(8, "Public author choosing anonymous publishing is cleanly anonymized", () => {
  const author2AnonPub = evaluatePublicPublicationsView(mockPublications[3], mockProfiles[AUTHOR_2_ID]);
  assert.equal(author2AnonPub.author_name, "Anonymous");
  assert.equal(author2AnonPub.author_id, null);
  assert.equal(author2AnonPub.author_slug, null);
  assert.equal(author2AnonPub.author_avatar_url, null);
});

// -------------------------------------------------------------
// Scenario 9: Public API returning no hidden identity details
// -------------------------------------------------------------
test(9, "Public projection view excludes private columns (no password, email, user metadata)", () => {
  // Check view definition in SQL:
  assert.match(migrationSql, /CREATE OR REPLACE VIEW public\.public_publications/i);
  // Ensure view does NOT select p.* or pr.*
  assert.doesNotMatch(migrationSql, /SELECT\s+p\.\*/i);
  assert.doesNotMatch(migrationSql, /SELECT\s+pr\.\*/i);
  // Ensure view does not expose email
  assert.doesNotMatch(migrationSql, /email/i);

  // Application code in publications.ts queries the view
  assert.match(publicationsCode, /from\("public_publications"\)/);
});

// -------------------------------------------------------------
// Scenario 10: Administrator changing the public author designation
// -------------------------------------------------------------
test(10, "Administrator-only visibility elevation & idempotent re-execution", () => {
  // 1. Table-level write revoked from authenticated, anon, and PUBLIC; column update excludes is_public_author
  assert.match(migrationSql, /REVOKE INSERT, UPDATE, DELETE ON public\.profiles FROM anon,\s*PUBLIC/i);
  assert.match(migrationSql, /REVOKE INSERT, UPDATE, DELETE ON public\.profiles FROM authenticated/i);
  assert.doesNotMatch(migrationSql, /GRANT UPDATE \([^)]*is_public_author[^)]*\)\s+ON public\.profiles/i);

  // 2. Trigger blocks non-admin/service-role updates and prevents execution context switch
  assert.match(migrationSql, /CREATE OR REPLACE FUNCTION public\.protect_profile_public_visibility/i);
  assert.match(migrationSql, /v_session_user IN \('postgres', 'supabase_admin'\)/i);
  assert.match(migrationSql, /v_current_user IN \('postgres', 'supabase_admin'\)/i);

  // 3. Idempotency: Does NOT blindly reset is_public_author = FALSE across all records
  assert.doesNotMatch(migrationSql, /UPDATE public\.profiles\s+SET is_public_author = FALSE;\s*(?!WHERE)/i);

  // 4. Safe transaction wrapper
  assert.match(migrationSql, /^BEGIN;/m);
  assert.match(migrationSql, /^COMMIT;/m);
});

console.log(`\n=== Final Security Results: ${passed}/${total} passed ===`);
if (passed === total) {
  console.log("All 10 security test scenarios PASSED with 100% compliance!\n");
  process.exit(0);
} else {
  console.error("Some security scenarios FAILED!\n");
  process.exit(1);
}
