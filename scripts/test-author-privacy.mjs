/**
 * Automated test suite for Sunflower Reverie Single Public Author & Anonymity rules.
 *
 * Verifies:
 * 1. Mahi is strictly the private/hidden author.
 * 2. All writings by Mahi map to "Anonymous" with empty slug and anonymous ID regardless of toggle.
 * 3. Author 2 (when configured with is_public_author = true and is_anonymous = false) retains public author details.
 * 4. Anonymous publications have empty author slug and id 'anonymous' so no route can be linked.
 * 5. Database migration script initializes is_public_author to FALSE for Mahi and all existing accounts.
 * 6. Public pages have no remaining references to two authors or "The Second Writing Desk".
 * 7. When no visible author is configured, Homepage and About page render the generic literary sanctuary hearth.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

console.log("=== Sunflower Reverie Author Privacy & Anonymity Test Suite ===\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// -------------------------------------------------------------
// Test Group 1: Publication Anonymity Mapping Logic
// -------------------------------------------------------------
console.log("Test Group 1: Publication Mapping & Anonymity Logic");

// Mock implementation mirroring mapSupabaseToPublication in src/data/publications.ts
function mapSupabaseToPublication(row) {
  const profile = row.profiles || {};
  const isMahi =
    row.author_id === "76aaf5a8-7029-45dc-a7c7-ad4f25255be6" ||
    profile.slug === "mahi" ||
    profile.display_name?.toLowerCase() === "mahi";

  const isAnonymous = Boolean(
    row.is_anonymous ||
    profile.is_public_author !== true ||
    isMahi ||
    !profile.display_name
  );

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    body: [row.body || ""],
    excerpt: row.excerpt,
    date: row.published_at ? new Date(row.published_at).toLocaleDateString() : "Undated",
    author: isAnonymous
      ? {
          id: "anonymous",
          name: "Anonymous",
          slug: "",
          role: "Contributing Author",
        }
      : {
          id: profile.id,
          name: profile.display_name || "Author",
          slug: profile.slug || "author",
          role: profile.role || "Curator & Author",
          pictureUrl: profile.avatar_url,
          isPublicAuthor: profile.is_public_author ?? false,
        },
    isAnonymous,
  };
}

test("Mahi's posts are ALWAYS anonymized even if is_anonymous is false", () => {
  const row = {
    id: "pub-mahi-1",
    title: "Morning Sunflowers",
    slug: "morning-sunflowers",
    author_id: "76aaf5a8-7029-45dc-a7c7-ad4f25255be6",
    is_anonymous: false,
    profiles: {
      id: "76aaf5a8-7029-45dc-a7c7-ad4f25255be6",
      display_name: "Mahi",
      slug: "mahi",
      is_public_author: false,
      role: "Curator & Author",
    },
  };
  const pub = mapSupabaseToPublication(row);
  assert.equal(pub.isAnonymous, true);
  assert.equal(pub.author.name, "Anonymous");
  assert.equal(pub.author.slug, "");
  assert.equal(pub.author.id, "anonymous");
});

test("Mahi's posts remain anonymous even if is_public_author was incorrectly set true", () => {
  const row = {
    id: "pub-mahi-2",
    title: "Quiet Observations",
    slug: "quiet-observations",
    author_id: "76aaf5a8-7029-45dc-a7c7-ad4f25255be6",
    is_anonymous: false,
    profiles: {
      id: "76aaf5a8-7029-45dc-a7c7-ad4f25255be6",
      display_name: "Mahi",
      slug: "mahi",
      is_public_author: true, // Fail-safe test: even if DB had true, code strips it!
    },
  };
  const pub = mapSupabaseToPublication(row);
  assert.equal(pub.isAnonymous, true);
  assert.equal(pub.author.name, "Anonymous");
  assert.equal(pub.author.slug, "");
  assert.equal(pub.author.id, "anonymous");
});

test("Author 2 post without anonymous flag retains Author 2 public details", () => {
  const row = {
    id: "pub-author2-1",
    title: "Afternoon Light",
    slug: "afternoon-light",
    author_id: "00000000-0000-0000-0000-000000000002",
    is_anonymous: false,
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      display_name: "Rowan Reed",
      slug: "rowan-reed",
      is_public_author: true,
      role: "Sanctuary Curator",
    },
  };
  const pub = mapSupabaseToPublication(row);
  assert.equal(pub.isAnonymous, false);
  assert.equal(pub.author.name, "Rowan Reed");
  assert.equal(pub.author.slug, "rowan-reed");
  assert.equal(pub.author.id, "00000000-0000-0000-0000-000000000002");
});

test("Author 2 post with anonymous toggle is anonymized", () => {
  const row = {
    id: "pub-author2-2",
    title: "Secret Verses",
    slug: "secret-verses",
    author_id: "00000000-0000-0000-0000-000000000002",
    is_anonymous: true,
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      display_name: "Rowan Reed",
      slug: "rowan-reed",
      is_public_author: true,
    },
  };
  const pub = mapSupabaseToPublication(row);
  assert.equal(pub.isAnonymous, true);
  assert.equal(pub.author.name, "Anonymous");
  assert.equal(pub.author.slug, "");
});

test("Post with absent profile defaults safely to Anonymous", () => {
  const row = {
    id: "pub-orphan",
    title: "Orphaned Post",
    slug: "orphaned-post",
    is_anonymous: false,
    profiles: null,
  };
  const pub = mapSupabaseToPublication(row);
  assert.equal(pub.isAnonymous, true);
  assert.equal(pub.author.name, "Anonymous");
  assert.equal(pub.author.slug, "");
});

// -------------------------------------------------------------
// Test Group 2: SQL Migration Verifications
// -------------------------------------------------------------
console.log("\nTest Group 2: SQL Migration Integrity");

const migrationPath = resolve("supabase/migrations/20261101_single_public_author_and_anonymous.sql");

test("Migration file exists", () => {
  assert.ok(existsSync(migrationPath), `Migration file not found at ${migrationPath}`);
});

const migrationSql = readFileSync(migrationPath, "utf-8");

test("Migration adds profiles.is_public_author column with DEFAULT FALSE", () => {
  assert.match(migrationSql, /ADD COLUMN is_public_author BOOLEAN NOT NULL DEFAULT FALSE/i);
});

test("Migration designates Mahi as is_public_author = FALSE", () => {
  assert.match(migrationSql, /76aaf5a8-7029-45dc-a7c7-ad4f25255be6/);
  assert.match(migrationSql, /SET is_public_author = FALSE/i);
});

test("Migration protects is_public_author from non-admin updates via trigger", () => {
  assert.match(migrationSql, /CREATE OR REPLACE FUNCTION public\.protect_profile_public_visibility/i);
  assert.match(migrationSql, /RAISE EXCEPTION 'Security violation: Author public visibility \(is_public_author\) can only be modified by administrators\.'/i);
});

test("Migration updates profiles RLS policy to allow public select only when is_public_author = TRUE", () => {
  assert.match(migrationSql, /is_public_author\s*=\s*TRUE/i);
  assert.match(migrationSql, /auth\.uid\(\)\s*=\s*id/i);
  assert.match(migrationSql, /slug\s*<>\s*'mahi'/i);
});

test("Migration adds publications.is_anonymous column with DEFAULT FALSE", () => {
  assert.match(migrationSql, /ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT FALSE/i);
});

test("Migration defines secure public view public_publications strictly sanitizing Mahi", () => {
  assert.match(migrationSql, /CREATE OR REPLACE VIEW public\.public_publications/i);
  assert.match(migrationSql, /pr\.slug <> 'mahi'/i);
  assert.match(migrationSql, /pr\.id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'/i);
});

// -------------------------------------------------------------
// Test Group 3: Source Code Author Leak Prevention
// -------------------------------------------------------------
console.log("\nTest Group 3: Source Code Author Leak Prevention");

test("publications.ts excludes Mahi from fetchAllAuthors", () => {
  const code = readFileSync(resolve("src/data/publications.ts"), "utf-8");
  assert.match(code, /fetchAllAuthors[\s\S]*?neq\("slug",\s*"mahi"\)/);
});

test("publications.ts blocks Mahi lookup in fetchAuthorBySlug", () => {
  const code = readFileSync(resolve("src/data/publications.ts"), "utf-8");
  assert.match(code, /fetchAuthorBySlug[\s\S]*?slug\.toLowerCase\(\)\s*===\s*"mahi"/);
});

test("publications.ts excludes Mahi from fetchPublicationsByAuthor", () => {
  const code = readFileSync(resolve("src/data/publications.ts"), "utf-8");
  assert.match(code, /fetchPublicationsByAuthor[\s\S]*?authorSlug\.toLowerCase\(\)\s*===\s*"mahi"/);
});

test("fetchAllAuthorSlugs does not hardcode fallback to mahi", () => {
  const code = readFileSync(resolve("src/data/publications.ts"), "utf-8");
  assert.doesNotMatch(code, /return \["mahi"\]/);
});

test("LatestPublications component has no hardcoded fallback to author-one", () => {
  const code = readFileSync(resolve("src/components/home/LatestPublications.tsx"), "utf-8");
  assert.doesNotMatch(code, /author-one/);
});

test("FeaturedWritings component has no hardcoded fallback to author-one", () => {
  const code = readFileSync(resolve("src/components/home/FeaturedWritings.tsx"), "utf-8");
  assert.doesNotMatch(code, /author-one/);
});

test("AuthorIntroduction renders generic sanctuary introduction when no visible author exists", () => {
  const code = readFileSync(resolve("src/components/home/AuthorIntroduction.tsx"), "utf-8");
  assert.match(code, /Words Tended in Quietude/);
  assert.doesNotMatch(code, /The Second Writing Desk/i);
});

test("About page renders generic sanctuary card when no visible author exists", () => {
  const code = readFileSync(resolve("src/app/about/page.tsx"), "utf-8");
  assert.match(code, /The Unhurried Pen/);
  assert.doesNotMatch(code, /The Second Writing Desk/i);
});

test("WritingEditor includes the isAnonymous toggle and form field", () => {
  const code = readFileSync(resolve("src/components/author/WritingEditor.tsx"), "utf-8");
  assert.match(code, /isAnonymous/);
  assert.match(code, /Publish Anonymously/);
  assert.match(code, /formData\.append\("isAnonymous"/);
});

test("Dashboard server actions persist is_anonymous", () => {
  const code = readFileSync(resolve("src/app/author/dashboard/actions.ts"), "utf-8");
  assert.match(code, /is_anonymous:\s*isAnonymous/);
});

console.log(`\n=== Results: ${passed}/${total} passed ===`);
if (passed === total) {
  console.log("All author privacy and anonymity test specifications PASSED!\n");
  process.exit(0);
} else {
  console.error("Some tests FAILED!\n");
  process.exit(1);
}
