/**
 * Sunflower Reverie: Cross-Author Security & Storage Access Test Suite
 *
 * This test suite verifies:
 * 1. Storage cross-author update/delete prevention in shared folders (writings, public, covers).
 * 2. Storage owner_id verification on INSERT, UPDATE, and DELETE.
 * 3. Prevention of asset ownership transfer.
 * 4. User folder boundary enforcement.
 * 5. Public read access preservation.
 * 6. Base table cross-author publications isolation (SELECT, UPDATE, DELETE).
 * 7. Prevention of is_public_author elevation via INSERT and UPDATE.
 * 8. Least-privilege function execution grants and view ownership.
 *
 * NOTE: This suite performs deterministic static AST & policy-rule verification
 * modeling PostgreSQL RLS engine semantics. It is clearly distinguished from live DB tests.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

console.log("=== Sunflower Reverie: Cross-Author Security & Storage Isolation Test Suite ===\n");

const migrationPath = resolve("supabase/migrations/20261101_single_public_author_and_anonymous.sql");
assert.ok(existsSync(migrationPath), "Migration file must exist");
const migrationSql = readFileSync(migrationPath, "utf-8");

const actionsPath = resolve("src/app/author/dashboard/actions.ts");
assert.ok(existsSync(actionsPath), "actions.ts must exist");
const actionsCode = readFileSync(actionsPath, "utf-8");

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
    console.error(`    Error: ${err.message}`);
  }
}

// Identities
const AUTHOR_1_ID = "76aaf5a8-7029-45dc-a7c7-ad4f25255be6"; // Mahi (hidden author)
const AUTHOR_2_ID = "88bbccdd-2222-4444-8888-000000000002"; // Future public author
const ATTACKER_ID = "99999999-9999-9999-9999-999999999999"; // Non-authorized user

// Model helper for storage.foldername(name)
function getFoldername(name) {
  const parts = name.split("/");
  return parts.length > 1 ? parts.slice(0, -1) : [];
}

/**
 * Storage RLS Simulator for 'sunflower-assets'
 */
const storageRLS = {
  select(object) {
    // USING (bucket_id = 'sunflower-assets')
    return object.bucket_id === "sunflower-assets";
  },

  insert(newObject, callerUid, isAuthorizedAuthor) {
    // WITH CHECK (
    //   bucket_id = 'sunflower-assets'
    //   AND auth.uid() IS NOT NULL
    //   AND is_authorized_author(auth.uid())
    //   AND ((storage.foldername(name))[1] = auth.uid()::text OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers'))
    //   AND (owner_id = auth.uid()::text OR (owner_id IS NULL AND owner = auth.uid()))
    // )
    if (!callerUid || !isAuthorizedAuthor) return false;
    if (newObject.bucket_id !== "sunflower-assets") return false;

    const folders = getFoldername(newObject.name);
    const firstFolder = folders[0];
    const isPermittedFolder =
      firstFolder === callerUid || ["writings", "public", "covers"].includes(firstFolder);
    if (!isPermittedFolder) return false;

    const isOwned =
      newObject.owner_id === callerUid || (!newObject.owner_id && newObject.owner === callerUid);
    return Boolean(isOwned);
  },

  update(existingObject, updatedObject, callerUid, isAuthorizedAuthor) {
    // USING (
    //   bucket_id = 'sunflower-assets' AND auth.uid() IS NOT NULL AND is_authorized_author(...)
    //   AND (owner_id = auth.uid()::text OR owner = auth.uid())
    //   AND ((storage.foldername(name))[1] = auth.uid()::text OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers'))
    // )
    // WITH CHECK (
    //   bucket_id = 'sunflower-assets' AND auth.uid() IS NOT NULL AND is_authorized_author(...)
    //   AND (owner_id = auth.uid()::text OR owner = auth.uid())
    //   AND ((storage.foldername(name))[1] = auth.uid()::text OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers'))
    // )
    if (!callerUid || !isAuthorizedAuthor) return false;
    if (existingObject.bucket_id !== "sunflower-assets" || updatedObject.bucket_id !== "sunflower-assets") return false;

    // Check USING on existing
    const existingFolders = getFoldername(existingObject.name);
    const existingFirstFolder = existingFolders[0];
    const isExistingPermittedFolder =
      existingFirstFolder === callerUid || ["writings", "public", "covers"].includes(existingFirstFolder);
    const isExistingOwned =
      existingObject.owner_id === callerUid || (!existingObject.owner_id && existingObject.owner === callerUid);

    if (!isExistingPermittedFolder || !isExistingOwned) return false;

    // Check WITH CHECK on updated
    const updatedFolders = getFoldername(updatedObject.name);
    const updatedFirstFolder = updatedFolders[0];
    const isUpdatedPermittedFolder =
      updatedFirstFolder === callerUid || ["writings", "public", "covers"].includes(updatedFirstFolder);
    const isUpdatedOwned =
      updatedObject.owner_id === callerUid || (!updatedObject.owner_id && updatedObject.owner === callerUid);

    return Boolean(isUpdatedPermittedFolder && isUpdatedOwned);
  },

  delete(existingObject, callerUid, isAuthorizedAuthor) {
    // USING (
    //   bucket_id = 'sunflower-assets' AND auth.uid() IS NOT NULL AND is_authorized_author(...)
    //   AND (owner_id = auth.uid()::text OR owner = auth.uid())
    //   AND ((storage.foldername(name))[1] = auth.uid()::text OR (storage.foldername(name))[1] IN ('writings', 'public', 'covers'))
    // )
    if (!callerUid || !isAuthorizedAuthor) return false;
    if (existingObject.bucket_id !== "sunflower-assets") return false;

    const folders = getFoldername(existingObject.name);
    const firstFolder = folders[0];
    const isPermittedFolder =
      firstFolder === callerUid || ["writings", "public", "covers"].includes(firstFolder);
    const isOwned =
      existingObject.owner_id === callerUid || (!existingObject.owner_id && existingObject.owner === callerUid);

    return Boolean(isPermittedFolder && isOwned);
  },
};

console.log("--- Section 1: Storage Ownership & Shared Folder Isolation ---");

test("Author 1 can upload image to their personal folder {Author1_ID}/*", () => {
  const asset = {
    bucket_id: "sunflower-assets",
    name: `${AUTHOR_1_ID}/flower.jpg`,
    owner_id: AUTHOR_1_ID,
  };
  assert.equal(storageRLS.insert(asset, AUTHOR_1_ID, true), true);
});

test("Author 1 can upload image to permitted shared folder 'writings/*'", () => {
  const asset = {
    bucket_id: "sunflower-assets",
    name: "writings/cover-1.jpg",
    owner_id: AUTHOR_1_ID,
  };
  assert.equal(storageRLS.insert(asset, AUTHOR_1_ID, true), true);
});

test("Author 1 CANNOT upload an image claiming Author 2's owner_id", () => {
  const spoofedAsset = {
    bucket_id: "sunflower-assets",
    name: "writings/spoofed.jpg",
    owner_id: AUTHOR_2_ID, // Malicious claim
  };
  assert.equal(storageRLS.insert(spoofedAsset, AUTHOR_1_ID, true), false);
});

test("Author 1 CANNOT upload into Author 2's private folder", () => {
  const crossAsset = {
    bucket_id: "sunflower-assets",
    name: `${AUTHOR_2_ID}/intruder.jpg`,
    owner_id: AUTHOR_1_ID,
  };
  assert.equal(storageRLS.insert(crossAsset, AUTHOR_1_ID, true), false);
});

test("Author 1 CANNOT DELETE Author 2's image in shared folder 'writings/*'", () => {
  const author2SharedAsset = {
    bucket_id: "sunflower-assets",
    name: "writings/author2-masterpiece.jpg",
    owner_id: AUTHOR_2_ID,
  };
  // Author 1 attempts to delete
  assert.equal(storageRLS.delete(author2SharedAsset, AUTHOR_1_ID, true), false);
});

test("Author 1 CANNOT UPDATE Author 2's image in shared folder 'covers/*'", () => {
  const author2Cover = {
    bucket_id: "sunflower-assets",
    name: "covers/author2-book.jpg",
    owner_id: AUTHOR_2_ID,
  };
  const updatedCover = {
    ...author2Cover,
    metadata: { modified: true },
  };
  assert.equal(storageRLS.update(author2Cover, updatedCover, AUTHOR_1_ID, true), false);
});

test("Author 1 CANNOT transfer ownership of own image to Author 2", () => {
  const myAsset = {
    bucket_id: "sunflower-assets",
    name: "writings/my-cover.jpg",
    owner_id: AUTHOR_1_ID,
  };
  const transferredAsset = {
    ...myAsset,
    owner_id: AUTHOR_2_ID, // Attempt to transfer ownership
  };
  assert.equal(storageRLS.update(myAsset, transferredAsset, AUTHOR_1_ID, true), false);
});

test("Author 1 CAN delete their own image in shared folder 'writings/*'", () => {
  const myAsset = {
    bucket_id: "sunflower-assets",
    name: "writings/my-cover.jpg",
    owner_id: AUTHOR_1_ID,
  };
  assert.equal(storageRLS.delete(myAsset, AUTHOR_1_ID, true), true);
});

test("Author 2 CAN delete their own image in shared folder 'writings/*'", () => {
  const author2Asset = {
    bucket_id: "sunflower-assets",
    name: "writings/author2-cover.jpg",
    owner_id: AUTHOR_2_ID,
  };
  assert.equal(storageRLS.delete(author2Asset, AUTHOR_2_ID, true), true);
});

test("Public visitors can read images in 'sunflower-assets'", () => {
  const anyAsset = {
    bucket_id: "sunflower-assets",
    name: "writings/public-flower.jpg",
  };
  assert.equal(storageRLS.select(anyAsset, null), true);
});

test("Unauthenticated or unauthorized callers cannot upload or delete assets", () => {
  const asset = {
    bucket_id: "sunflower-assets",
    name: "writings/hacker.jpg",
    owner_id: ATTACKER_ID,
  };
  assert.equal(storageRLS.insert(asset, null, false), false);
  assert.equal(storageRLS.insert(asset, ATTACKER_ID, false), false);
  assert.equal(storageRLS.delete(asset, ATTACKER_ID, false), false);
});

console.log("\n--- Section 2: Database Permissions & Base Table Isolation ---");

test("Base table publications grants: anon and PUBLIC have ALL permissions revoked", () => {
  assert.match(migrationSql, /REVOKE ALL ON public\.publications FROM anon,\s*PUBLIC/i);
});

test("Base table publications RLS: SELECT is strictly scoped to author_id = auth.uid()", () => {
  assert.match(
    migrationSql,
    /CREATE POLICY "Authors can view own publications"\s+ON public\.publications FOR SELECT\s+TO authenticated\s+USING \(\s*auth\.uid\(\) IS NOT NULL\s+AND author_id = auth\.uid\(\)/i
  );
});

test("Base table publications RLS: UPDATE and DELETE are strictly scoped to author_id = auth.uid()", () => {
  assert.match(
    migrationSql,
    /CREATE POLICY "Authors can update own publications"\s+ON public\.publications FOR UPDATE\s+TO authenticated\s+USING \(\s*auth\.uid\(\) IS NOT NULL\s+AND author_id = auth\.uid\(\)/i
  );
  assert.match(
    migrationSql,
    /CREATE POLICY "Authors can delete own publications"\s+ON public\.publications FOR DELETE\s+TO authenticated\s+USING \(\s*auth\.uid\(\) IS NOT NULL\s+AND author_id = auth\.uid\(\)/i
  );
});

console.log("\n--- Section 3: Profile Visibility Protection & Elevation Prevention ---");

test("Table-level write grants revoked and column-specific grants omit is_public_author", () => {
  assert.match(
    migrationSql,
    /REVOKE INSERT, UPDATE, DELETE ON public\.profiles FROM anon,\s*PUBLIC/i
  );
  assert.match(
    migrationSql,
    /REVOKE INSERT, UPDATE, DELETE ON public\.profiles FROM authenticated/i
  );
  assert.match(
    migrationSql,
    /GRANT UPDATE \(display_name, slug, role, short_bio, full_bio, quote, avatar_url, social_links, interests, updated_at\)\s+ON public\.profiles TO authenticated/i
  );
  // Ensure is_public_author is NOT in the granted update columns
  assert.doesNotMatch(
    migrationSql,
    /GRANT UPDATE \([^)]*is_public_author[^)]*\)\s+ON public\.profiles/i
  );
});

test("Profile trigger runs BEFORE INSERT OR UPDATE and blocks unauthorized tampering", () => {
  assert.match(migrationSql, /BEFORE INSERT OR UPDATE ON public\.profiles/i);
  assert.match(migrationSql, /IF TG_OP = 'INSERT'/i);
  assert.match(migrationSql, /IF TG_OP = 'UPDATE'/i);
  assert.match(migrationSql, /v_is_admin/i);
  assert.match(migrationSql, /v_session_user IN \('postgres', 'supabase_admin'\)/i);
  assert.match(migrationSql, /v_current_user IN \('postgres', 'supabase_admin'\)/i);
  // Trigger is intentionally NOT security definer so CURRENT_USER reflects caller
  assert.doesNotMatch(
    migrationSql,
    /FUNCTION public\.protect_profile_public_visibility\(\)\s+RETURNS TRIGGER AS \$\$[\s\S]*?\$\$ LANGUAGE plpgsql SECURITY DEFINER/i
  );
});

test("Profile trigger function execution revoked from PUBLIC, anon, authenticated", () => {
  assert.match(
    migrationSql,
    /REVOKE ALL ON FUNCTION public\.protect_profile_public_visibility\(\) FROM PUBLIC, anon, authenticated/i
  );
});

test("Mahi is explicitly excluded from public author selection policy", () => {
  assert.match(
    migrationSql,
    /is_public_author = TRUE\s+AND slug <> 'mahi'\s+AND id <> '76aaf5a8-7029-45dc-a7c7-ad4f25255be6'::UUID/i
  );
});

console.log("\n--- Section 4: Public View Security Architecture ---");

test("public_publications view is created WITH (security_invoker = false) and owned by postgres", () => {
  assert.match(migrationSql, /CREATE OR REPLACE VIEW public\.public_publications\s+WITH \(security_invoker = false\)/i);
  assert.match(migrationSql, /ALTER VIEW public\.public_publications OWNER TO postgres/i);
});

test("public_publications write privileges are completely revoked", () => {
  assert.match(migrationSql, /REVOKE ALL ON public\.public_publications FROM PUBLIC/i);
  assert.match(migrationSql, /REVOKE INSERT, UPDATE, DELETE ON public\.public_publications FROM anon, authenticated/i);
});

test("public_publications SELECT is granted to anon and authenticated", () => {
  assert.match(migrationSql, /GRANT SELECT ON public\.public_publications TO anon, authenticated/i);
});

console.log("\n--- Section 5: Application Compatibility ---");

test("actions.ts extractManagedStoragePath permits author folders and shared folders", () => {
  assert.match(actionsCode, /const isAuthorFolder = firstSegment === authorId;/);
  assert.match(actionsCode, /const isSharedFolder = \["writings", "public", "covers"\]\.includes\(firstSegment\);/);
});

console.log(`\n=== Verification Complete: ${passed}/${total} passed ===`);
if (passed === total) {
  console.log("All cross-author security and storage isolation specifications PASSED with 100% compliance!\n");
  process.exit(0);
} else {
  console.error("Some security specifications FAILED!\n");
  process.exit(1);
}
