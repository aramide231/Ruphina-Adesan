# Ruphina Adesan website

Personal site for Evang. Dr. Ruphina Ojo Adesan. React app deployed on Vercel. Editable content is powered by Supabase.

## Local development

```bash
npm install
cp .env.example .env
# fill in REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
npm start
```

## Admin dashboard (Supabase)

The public site reads text and image URLs from Supabase. She edits them at **`/admin`** (no link in the public nav — share that URL with her).

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Open **Project Settings → API** and copy:
   - Project URL → `REACT_APP_SUPABASE_URL`
   - `anon` `public` key → `REACT_APP_SUPABASE_ANON_KEY`

### 2. Run the database + storage SQL

In Supabase → **SQL Editor**, paste and run [`supabase/schema.sql`](supabase/schema.sql).

That creates:

- `site_content` table (one JSON document, `id = 1`)
- RLS: anyone can read; only signed-in users can write
- Public Storage bucket `site-media` with matching policies

If the bucket insert fails, create a **public** bucket named `site-media` under **Storage**, then re-run the storage policies section of the SQL file.

### 3. Create the admin login

1. Supabase → **Authentication → Users → Add user**
2. Create one user with email + password (the credentials she will use on `/admin`)
3. Confirm the user if your project requires email confirmation (or disable confirmations for this single admin project under Auth settings)

### 4. Add env vars on Vercel

In the Vercel project → **Settings → Environment Variables**:

| Name | Value |
| --- | --- |
| `REACT_APP_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | your anon public key |

Redeploy after saving env vars (CRA bakes these in at build time).

### 5. First edit

1. Open `https://your-domain/admin`
2. Sign in with the Auth user
3. Edit text / upload photos
4. Click **Save**

Until the first successful save, the site uses the built-in defaults in `src/data/defaultContent.js`.

## Routes

- `/` — home
- `/links` — link tree
- `/admin` — content editor (Supabase Auth)

## Scripts

- `npm start` — local dev
- `npm run build` — production build
- `npm test` — tests
