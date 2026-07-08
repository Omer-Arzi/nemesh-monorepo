# Nemesh Deployment Guide

Strapi server → Railway + PostgreSQL. Next.js client → Vercel (future step).

---

## AWS S3 Setup (do this first)

### 1. Create an S3 bucket

- Go to AWS Console → S3 → Create bucket.
- Region: choose one close to your users (e.g. `eu-central-1`, `us-east-1`).
- **Uncheck "Block all public access"** if you want direct public image URLs (ACL approach).
- Enable versioning: optional.
- Note the bucket name and region.

### 2. Set bucket public access (choose one approach)

**Option A — ACL (requires "Block public access" off, not recommended for new buckets):**
- Set `AWS_ACL=public-read` in Railway env vars.
- Images are served directly via `https://<bucket>.s3.<region>.amazonaws.com/<key>`.

**Option B — Bucket policy (recommended for new AWS accounts):**
- Keep "Block public access" ON, remove `AWS_ACL` from env vars.
- Add this bucket policy (replace `<BUCKET_NAME>`):
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::<BUCKET_NAME>/*"
      }
    ]
  }
  ```

### 3. Set S3 CORS policy

Add this CORS configuration to the bucket (S3 Console → Permissions → CORS):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

In production, tighten `AllowedOrigins` to your Strapi domain.

### 4. Create an IAM user

- Go to IAM → Users → Create user.
- Attach policy: **AmazonS3FullAccess** (or a scoped policy — see below).
- Generate access keys → save `AWS_ACCESS_KEY_ID` and `AWS_ACCESS_SECRET`.

**Scoped IAM policy (preferred over AmazonS3FullAccess):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::<BUCKET_NAME>/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::<BUCKET_NAME>"
    }
  ]
}
```

---

## Railway Setup

### 1. Create Railway project

- Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo.
- Connect the `nemesh` repository.

### 2. Add PostgreSQL service

- In the project, click **+ New** → **Database** → **PostgreSQL**.
- Railway will provision a database and inject `DATABASE_URL`, `DATABASE_HOST`, etc. automatically when you link it to the Strapi service.

### 3. Configure the Strapi service

- In the Strapi service settings → **Settings**:
  - **Root directory:** `server`
  - **Build command:** `npm run build`
  - **Start command:** `npm run start`
- Connect the PostgreSQL service so Railway injects `DATABASE_URL`.

### 4. Set environment variables

In the Strapi service → **Variables**, add:

> **`NODE_ENV=production` is the single most critical variable.**
> Without it, `config/plugins.ts` returns an empty config and Strapi silently uses local disk uploads.
> Files will appear in the admin panel but are written to the Railway ephemeral filesystem and lost on every redeploy.
> The startup log will print `[upload] provider: local` if this is missing.

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` ← **required for S3 to activate** |
| `HOST` | `0.0.0.0` |
| `PORT` | `1337` |
| `APP_KEYS` | 4 random base64 strings, comma-separated |
| `API_TOKEN_SALT` | random base64 string |
| `ADMIN_JWT_SECRET` | random base64 string |
| `TRANSFER_TOKEN_SALT` | random base64 string |
| `JWT_SECRET` | random base64 string |
| `ENCRYPTION_KEY` | random base64 string |
| `DATABASE_CLIENT` | `postgres` |
| `DATABASE_URL` | *(auto-injected by Railway when PG service is linked)* |
| `DATABASE_SSL` | `true` |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | `false` |
| `AWS_ACCESS_KEY_ID` | from IAM user |
| `AWS_ACCESS_SECRET` | from IAM user |
| `AWS_REGION` | e.g. `eu-central-1` |
| `AWS_BUCKET` | your bucket name |
| `AWS_BUCKET_URL` | `https://<bucket>.s3.<region>.amazonaws.com` |
| `AWS_ACL` | **leave unset** if bucket ACLs are disabled (default for new buckets); `public-read` only if ACLs are explicitly enabled |
| `CLIENT_URLS` | comma-separated list of exact allowed origins, e.g. `https://nemesh-client.vercel.app` |
| `VERCEL_PREVIEW_ORIGIN_PATTERNS` | comma-separated regex patterns for Vercel preview URLs (see CORS section below) |
| `CLIENT_URL` | *(legacy)* single allowed origin — superseded by `CLIENT_URLS` but still supported |

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```
Run 4× for `APP_KEYS` (comma-join them), once each for the rest.

### 5. Deploy and open admin

- Railway triggers a deploy automatically on push.
- After deploy, go to the service → **Settings** → generate a public domain (e.g. `nemesh-server.up.railway.app`).
- Open `https://<your-domain>/admin` → create first admin user.

---

## Local development

No changes needed. Local dev continues to use:
- Local PostgreSQL (configured via `.env`)
- Local disk uploads (`/server/public/uploads/`)
- CORS open to all origins

Copy `.env.example` → `.env` and fill in your local DB credentials.

---

## How local vs production uploads are selected

`config/plugins.ts` checks `NODE_ENV`:

- `NODE_ENV !== 'production'` → returns `{}` → Strapi uses **local disk** (`public/uploads/`)
- `NODE_ENV === 'production'` → `@strapi/provider-upload-aws-s3` is active → all uploads go to **S3**

If required S3 env vars are missing when `NODE_ENV=production`, Strapi **throws an error at startup** rather than falling back to local disk.

`config/middlewares.ts` applies the same `NODE_ENV` check for CORS:

- Development → `origin: '*'` (open)
- Production → function-based origin check (see CORS section below)

## Verifying S3 is active

**1. Check the Railway deploy log** — look for the startup line:
```
[upload] provider: aws-s3 | bucket: <name> | region: <region> | baseUrl: ...
```
If you see `[upload] provider: local` instead, `NODE_ENV` is not set to `production`.

**2. Upload a test image** in the Strapi admin (Media Library → + Add new assets).

**3. Check the URL of the uploaded file:**
- `https://<bucket>.s3.<region>.amazonaws.com/...` → S3 is working ✓
- `/uploads/...` → still using local disk, `NODE_ENV` or S3 vars are wrong ✗

**4. Check the S3 bucket** in the AWS Console → the file should appear under the uploads path.

---

## CORS Configuration

`config/middlewares.ts` implements function-based CORS in production so that Vercel preview deployments work without a Railway redeploy after every Vercel push.

### How it works

The `isAllowedCorsOrigin` helper is called for every browser request:

1. **No `Origin` header** → allowed (server-to-server, curl, non-browser)
2. **Exact match** in `CLIENT_URLS` or `CLIENT_URL` → allowed
3. **Regex match** against `VERCEL_PREVIEW_ORIGIN_PATTERNS` → allowed
4. **Everything else** → rejected (CORS error in the browser)

### Railway env vars

| Variable | Example | Notes |
|---|---|---|
| `CLIENT_URLS` | `https://nemesh-client.vercel.app` | Comma-separated exact origins. Add production + any fixed staging URLs here. |
| `VERCEL_PREVIEW_ORIGIN_PATTERNS` | see below | Comma-separated anchored regex patterns. |
| `CLIENT_URL` | *(legacy)* | Single origin form — still honoured but superseded by `CLIENT_URLS`. |

### Configuring Vercel preview patterns

Vercel preview URLs follow this format:
```
https://<project>-<hash>-<team-slug>.vercel.app
https://<project>-git-<branch>-<team-slug>.vercel.app
```

Set `VERCEL_PREVIEW_ORIGIN_PATTERNS` to match only your project's previews:

```
VERCEL_PREVIEW_ORIGIN_PATTERNS=^https://nemesh-client-[a-z0-9-]+-omer-arzis-projects\.vercel\.app$,^https://nemesh-client-[a-z0-9-]+\.vercel\.app$
```

**Pattern rules:**
- Each pattern is used as `new RegExp(pattern)` — anchor with `^` and `$`
- Use `\.` (single backslash in the env var file) for literal dots — prevents `xvercel-app` or similar from matching
- The character class `[a-z0-9-]+` matches the hash or branch slug Vercel inserts
- Never use `^https://.*\.vercel\.app$` — that allows any Vercel project

### Startup log

At startup, Railway logs:
```
[cors] Production: 1 exact origin(s), 2 preview pattern(s)
[cors] Allowed origins: https://nemesh-client.vercel.app
[cors] Preview patterns: ^https://nemesh-client-[a-z0-9-]+-omer-arzis-projects\.vercel\.app$, ...
```

Check this log after every Railway redeploy to confirm CORS is configured correctly.

### Verifying CORS behaviour

```bash
# Should succeed (production domain)
curl -I -H "Origin: https://nemesh-client.vercel.app" https://<railway-domain>/api/recipes

# Should succeed (preview domain matching pattern)
curl -I -H "Origin: https://nemesh-client-abc123-omer-arzis-projects.vercel.app" https://<railway-domain>/api/recipes

# Should be rejected (random vercel.app domain)
curl -I -H "Origin: https://evil-app.vercel.app" https://<railway-domain>/api/recipes
```

A rejected origin returns an empty (or missing) `Access-Control-Allow-Origin` header, not a 4xx status — CORS errors are enforced by the browser, not the server.

---

## SEO — Sitemap and Robots

The client generates `sitemap.xml` and `robots.txt` automatically via Next.js App Router conventions.

### How it works

| File | Route | Description |
|---|---|---|
| `client/src/app/sitemap.ts` | `/sitemap.xml` | Server-rendered sitemap. Fetches all published recipes and categories from Strapi at request time (or build time with SSG). |
| `client/src/app/robots.ts` | `/robots.txt` | Allows all user agents, points crawlers at `/sitemap.xml`. |

The sitemap includes:
- `/` — homepage (priority 1.0, changeFrequency daily)
- `/categories` — category listing (priority 0.8, weekly)
- All recipe pages via `recipe.slug` (priority 0.9, weekly, lastModified from `updatedAt`)
- All category pages via `category.slug` (priority 0.7, weekly)

If the Strapi fetch fails, the sitemap degrades gracefully and returns only the static URLs.

### Required environment variable (Vercel)

```
NEXT_PUBLIC_SITE_URL=https://nemesh-food.com
```

Without this, the sitemap URL base falls back to `https://nemesh-food.com` (hardcoded fallback) — still correct for production, but set the env var explicitly so staging/preview builds can override it.

### Verifying after deploy

```
https://nemesh-food.com/sitemap.xml   → should return XML with all recipe and category URLs
https://nemesh-food.com/robots.txt    → should list Sitemap: https://nemesh-food.com/sitemap.xml
```

Then go to **Google Search Console → Sitemaps → Add a new sitemap** and enter `sitemap.xml`.

### Structured data (JSON-LD)

| Schema type | Where generated | Pages |
|---|---|---|
| `WebSite` | `src/lib/seo/structuredData.ts` → `app/page.tsx` | Homepage only |
| `Recipe` | `src/lib/seo/structuredData.ts` → `app/recipes/[slug]/page.tsx` | Every recipe detail page |
| `BreadcrumbList` | `src/lib/seo/structuredData.ts` → `app/recipes/[slug]/page.tsx` | Every recipe detail page |

Rendered via `src/components/seo/StructuredData/` — a server component that injects a `<script type="application/ld+json">` tag. Optional fields are omitted if missing or not an absolute URL. No fake ratings or reviews are emitted.

**To test:** paste any recipe URL into the [Google Rich Results Test](https://search.google.com/test/rich-results) and verify Recipe + BreadcrumbList are detected.

---

## Next manual steps before data export/import

These are for a future session — do not do them yet:

1. Confirm Railway Strapi is running and admin is accessible.
2. Confirm S3 uploads work (upload a test image in admin).
3. Export content from local Strapi using `strapi export`.
4. Import into Railway Strapi using `strapi import`.
5. Set `CLIENT_URL` once Vercel deployment is ready.
6. Update `NEXT_PUBLIC_API_URL` in the Vercel client env to point to the Railway Strapi domain.
