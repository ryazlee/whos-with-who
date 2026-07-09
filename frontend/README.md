# Who's With Who? — frontend

## Local development

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

- `VITE_SUPABASE_URL` — from Supabase → Project Settings → API
- `VITE_SUPABASE_ANON_KEY` — the **anon public** key (same page)

Restart the dev server after changing env vars:

```bash
npm run dev
```

Open Create — you should see **Sign in to publish**, not a Supabase setup warning.

## GitHub Pages deploy

The build reads Supabase vars from **GitHub Actions secrets** (not from `.env.local`).

In the repo on GitHub: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|--------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | anon public key from Supabase |

Push to `main` or run the **Deploy to GitHub Pages** workflow to rebuild.

## Supabase database

Apply migrations before publishing games:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

See [`../supabase/README.md`](../supabase/README.md).
