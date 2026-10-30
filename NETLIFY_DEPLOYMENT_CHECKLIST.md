# Sunflower Reverie — Production Netlify Deployment Checklist

> **Target Platform:** Netlify (Free Starter Tier)  
> **Backend Service:** Supabase (Database, Auth, SSR Cookies, Storage)  
> **Framework:** Next.js 16.4.3 (Turbopack, App Router, React 19, Partial Prerendering)  
> **Deployment Mode:** Zero-Config OpenNext Serverless Deployment (SSR + Static Edge Caching)

---

## 1. Deployment Prerequisites

Before connecting the repository to Netlify, ensure the following are confirmed:

- [ ] **Git Repository:** Sunflower Reverie codebase pushed to GitHub, GitLab, or Bitbucket.
- [ ] **Clean State:** Zero build errors, zero ESLint warnings, and zero uncommitted secret files.
- [ ] **Supabase Project Active:** Supabase project is active and healthy (e.g. `https://shxitgbxfestrbhdukku.supabase.co`).
- [ ] **Author 1 Account Confirmed:** Author 1 registered in Supabase Authentication and recorded in `authorized_authors` table.
- [ ] **Database Migrations Applied:** `supabase/migrations/20261030_two_author_system.sql` applied in Supabase SQL Editor.
- [ ] **Storage Bucket Configured:** Public storage bucket `sunflower-assets` exists with 5MB file-size limit and isolated RLS folder policies.

---

## 2. Production Environment Variables

Configure these variables in **Netlify Dashboard -> Site Configuration -> Environment Variables**.

> [!IMPORTANT]
> **Privileged Credential Notice:** Do **NOT** add `SUPABASE_SERVICE_ROLE_KEY` to Netlify. Sunflower Reverie's architecture uses standard Supabase SSR (`@supabase/ssr`) where all author operations and storage tasks operate under the authenticated author's session context and are strictly enforced by PostgreSQL Row Level Security (RLS). Leaving the service-role key out eliminates superuser token exposure in hosting environments.

| Variable Name | Environment | Description / Example | Exposed to Browser? |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | All (Prod & Preview) | `https://shxitgbxfestrbhdukku.supabase.co` | Yes (Public API endpoint) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All (Prod & Preview) | Supabase `anon` / `public` API key (JWT token) | Yes (Safe with RLS) |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical site URL (e.g. `https://sunflower-reverie.netlify.app` or custom domain) | Yes (Used for OG cards & SEO) |

### Local vs. Production Values
- In local development (`.env.local`): `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- In Netlify production: Set `NEXT_PUBLIC_SITE_URL` to your live domain without a trailing slash (e.g., `https://your-site.netlify.app`).

---

## 3. Netlify Build & Runtime Configuration

Sunflower Reverie relies on **Netlify's official zero-configuration automatic framework detection**:

- **Framework Detection:** Next.js
- **Build Command:** `npm run build` (or `next build`)
- **Publish Directory:** `.next`
- **Functions Runtime:** Netlify automatically provisions the OpenNext server adapter (`opennextjs-netlify`), handling:
  - App Router streaming and Server Components
  - Server Actions with automatic CSRF/Origin validation
  - Partial Prerendering (PPR) and Cache Components
  - Node.js `src/proxy.ts` request interception and Supabase SSR session token refresh
  - Next.js Image Optimization

> [!NOTE]
> A `netlify.toml` file is **not required**. Netlify natively detects the Next.js framework configuration. Do not manually install or pin `@netlify/plugin-nextjs` unless specifically required by customized enterprise pipelines.
> 
> If you prefer explicit code-as-configuration in version control, you may create this minimal file:
> ```toml
> [build]
>   command = "npm run build"
>   publish = ".next"
> ```

---

## 4. Supabase Production URL Settings

After Netlify provisions your production domain (e.g. `https://sunflower-reverie.netlify.app`):

1. **Navigate to Supabase Dashboard:**
   - Select your project -> **Authentication** -> **URL Configuration**.

2. **Set Site URL:**
   - **Site URL:** `https://your-site.netlify.app` (replace with your actual Netlify domain or custom domain).

3. **Set Redirect URLs Allowlist:**
   Add both production and local development callback URLs so previews and local debugging continue working:
   ```text
   https://your-site.netlify.app/**
   https://your-site.netlify.app/auth/callback
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```

4. **Verify Password Recovery Email Template:**
   - Go to **Authentication** -> **Email Templates** -> **Reset Password**.
   - Confirm the anchor tag contains the token hash pattern:
     ```html
     <h2>Reset Secret Password</h2>
     <p>Follow this link to reset your password for Sunflower Reverie:</p>
     <p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/author/reset-password">Reset Secret Password</a></p>
     ```
   - *Note:* `{{ .SiteURL }}` dynamically resolves to your configured Supabase Site URL.

---

## 5. Step-by-Step Deployment Instructions

1. **Import Project to Netlify:**
   - Log in to [app.netlify.com](https://app.netlify.com).
   - Click **"Add new site"** -> **"Import an existing project"**.
   - Choose your Git provider (GitHub / GitLab / Bitbucket) and authorize repository access.
   - Select the `Sunflower-Reverie` repository and branch `main`.

2. **Configure Build Settings:**
   - **Base directory:** *(Leave blank)*
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

3. **Add Environment Variables:**
   - Expand the **Environment variables** section.
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Add `NEXT_PUBLIC_SITE_URL` (enter the provisional Netlify URL or final custom domain)

4. **Deploy Site:**
   - Click **"Deploy Sunflower-Reverie"**.
   - Monitor the build log. A successful build will compile all 28 static and partially prerendered routes in ~30–45 seconds.

5. **Post-Deploy URL Finalization:**
   - Copy the assigned site URL from the Netlify Overview page (e.g., `https://example-sunflower.netlify.app`).
   - If not set during initial setup, update `NEXT_PUBLIC_SITE_URL` in Netlify Environment Variables and trigger a quick redeploy.
   - Update the Supabase **Site URL** and **Redirect URLs** as specified in Section 4.

---

## 6. Free-Tier Resource & Limit Analysis

Sunflower Reverie is highly optimized for free-tier sustainability, but authors and site owners should be aware of platform quotas:

### Netlify Free Tier (Starter)
| Resource | Free Tier Quota | Sunflower Reverie Usage Pattern | Potential Bottleneck? |
| :--- | :--- | :--- | :--- |
| **Bandwidth** | 100 GB / month | Lightweight editorial text, fonts, and optimized images. | Very low risk (~50k+ monthly visits). |
| **Serverless Invocations** | 125,000 / month | Public reading pages are cached on the Netlify Edge CDN with 60-second revalidation (`revalidate: 60`). Only author dashboard, login, and Server Actions invoke functions. | Very low risk. Public readers rarely trigger serverless execution. |
| **Function Runtime** | 100 hours / month | Lightweight database reads and writes (<150ms per action). | Negligible. |
| **Build Minutes** | 300 minutes / month | Clean build takes ~40 seconds. | Allows ~400 deployments/month. |
| **Image CDN Transformations** | 1,000 source images / month | Cover images and portraits are transformed by Next.js Image Optimization. | **Moderate risk** if hundreds of large images are uploaded. Authors should keep images compressed. |

### Supabase Free Tier
| Resource | Free Tier Quota | Sunflower Reverie Usage Pattern | Potential Bottleneck? |
| :--- | :--- | :--- | :--- |
| **Database Storage** | 500 MB | Relational tables (`profiles`, `publications`, `authorized_authors`) consume < 2 MB. | Negligible. Sufficient for tens of thousands of manuscripts. |
| **Storage Bucket** | 1 GB total | `sunflower-assets` bucket with 5MB max upload limit per asset. | **Moderate risk** over time if authors upload uncompressed 5MB files. Clean-up logic actively removes old superseded covers and portraits. |
| **Storage Egress** | 2 GB / month | Transferred when images are fetched from Supabase CDN. | **Watch item:** If traffic surges, 2 GB egress can be reached. |
| **Active Users (MAU)** | 50,000 / month | Strict two-author system (MAU ≤ 2). | Zero risk. |
| **Inactivity Auto-Pause** | **7 days inactivity pause** | Free projects pause if no queries occur for 7 days. | **High operational awareness:** In an off-season with zero visitors, Supabase may pause the database. Visiting the site or author dashboard once a week prevents pausing. |

---

## 7. Production Smoke-Test Checklist

Perform these tests immediately following production deployment:

### Public Website
- [ ] **Home Page (`/`):** Loads with warm sunflower palette, Caveat/Kalam handwritten typography, and botanical layout.
- [ ] **About Page (`/about`):** Author cards display Author 1 ("Mahi") with portrait, bio, and quote.
- [ ] **Author Folio (`/authors/mahi`):** Loads Author 1's folio and published works listing.
- [ ] **Archive Listings:**
  - `/blogs` (Thoughts Beneath the Sun)
  - `/poetry` (Verses in Bloom)
  - `/journal` (Pages of Reflection)
  - `/writings` (Letters & Essays)
- [ ] **Empty States:** When 0 publications exist in an archive, displays the warm sunflower empty state rather than mock data.
- [ ] **Metadata & Robots:** Verify `/robots.txt` disallows `/author/` and `/sitemap.xml` returns valid XML.

### Author Portal & Security
- [ ] **Unauthenticated Access:** Navigate to `/author/dashboard`. Verify automatic HTTP 307 redirect to `/author/login`.
- [ ] **Login:** Log in with Author 1 credentials. Verify successful entry into `/author/dashboard`.
- [ ] **Profile Editor (`/author/dashboard/profile`):**
  - Verify existing Author 1 information loads.
  - Upload a test portrait (PNG or WebP < 5MB). Verify image renders with preview.
  - Click "Save Profile" and verify update on `/about` and `/authors/mahi`.
- [ ] **Manuscript Editor (`/author/dashboard/new`):**
  - Create a test draft blog entry.
  - Test the **"Insert Image"** toolbar button: upload an illustration, provide alt text, and verify `![alt](url)` insertion at the cursor.
  - Save as "Draft". Verify it appears on the dashboard with a Draft badge and does **not** appear on public `/blogs`.
  - Edit draft, change status to "Published", and save.
  - Verify it now appears immediately on public `/blogs` and `/blogs/<slug>`.
- [ ] **Password Recovery:**
  - Visit `/author/forgot-password` and enter author email.
  - Verify neutral confirmation message is displayed.
  - Click the recovery link in the received email; verify redirect to `/author/reset-password`.
  - Enter new password (≥ 8 characters) and confirm login with updated credentials.

---

## 8. Rollback & Troubleshooting Procedures

If an issue arises during deployment:

1. **Instant Netlify Rollback:**
   - Go to **Deploys** in the Netlify Dashboard.
   - Select the last known working deployment.
   - Click **"Publish deploy"**. Netlify rolls back the CDN edge instantly without rebuilding.

2. **Supabase Inactivity Unpause:**
   - If the site displays database connection errors (`Failed to fetch publications`), check the Supabase Dashboard.
   - If project is paused due to 7 days of inactivity, click **"Restore project"** (takes ~1–2 minutes).

3. **Image Loading Troubleshooting:**
   - If images show broken placeholders, verify that the image URL host matches `shxitgbxfestrbhdukku.supabase.co` and `next.config.ts` has the exact pattern `/storage/v1/object/public/sunflower-assets/**`.
   - Check Netlify build logs for any warnings related to image transformation limits.

4. **Session / Cookie Drops:**
   - Verify that your custom domain uses HTTPS. Browsers require HTTPS for secure cross-site cookies.
   - Ensure the Supabase Site URL matches your exact production protocol and domain (`https://`).

---

## 9. Outstanding Risks & Author Responsibilities

1. **Draft Image Visibility in Public Storage:**
   - Assets uploaded to Supabase Storage are stored in the public `sunflower-assets` bucket.
   - While unlisted, anyone with the exact direct asset URL can access the file even if the associated post is still in draft state.
   - *Recommendation:* Authors should avoid uploading confidential personal documents.

2. **Supabase Free-Tier Inactivity Auto-Pause:**
   - As noted in Section 6, Supabase free-tier databases pause after 7 consecutive days without database activity.
   - *Recommendation:* Set up a free uptime monitor (e.g. UptimeRobot, BetterStack) pinging `https://your-site.netlify.app` every few hours, or upgrade to Supabase Pro if continuous uninterrupted availability is required.

3. **Storage Quota Management:**
   - The free storage quota is 1 GB. Sunflower Reverie's automatic cleanup deletes superseded cover images and avatars, but inline images in published articles are preserved permanently.
   - *Recommendation:* Authors should resize photography before uploading (recommended dimensions: 1600px width, WebP or JPEG, under 1.5MB).

