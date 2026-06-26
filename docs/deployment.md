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

**Option A — ACL (simpler, requires "Block public access" off):**
- Leave `AWS_ACL=public-read` in env vars.
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

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
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
| `AWS_ACL` | `public-read` *(omit if using bucket policy)* |
| `CLIENT_URL` | your Vercel client URL *(set after client is deployed)* |

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

- `NODE_ENV !== 'production'` → no upload plugin configured → Strapi uses **local disk** (`public/uploads/`)
- `NODE_ENV === 'production'` → `@strapi/provider-upload-aws-s3` is active → all uploads go to **S3**

`config/middlewares.ts` applies the same `NODE_ENV` check for CORS:

- Development → `origin: '*'` (open)
- Production → `origin: [CLIENT_URL]` (restricted to deployed client)

---

## Next manual steps before data export/import

These are for a future session — do not do them yet:

1. Confirm Railway Strapi is running and admin is accessible.
2. Confirm S3 uploads work (upload a test image in admin).
3. Export content from local Strapi using `strapi export`.
4. Import into Railway Strapi using `strapi import`.
5. Set `CLIENT_URL` once Vercel deployment is ready.
6. Update `NEXT_PUBLIC_API_URL` in the Vercel client env to point to the Railway Strapi domain.
