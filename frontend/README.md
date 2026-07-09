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

## Link previews (iMessage, Messenger, etc.)

Shared links use Open Graph meta tags in `index.html` and `public/404.html`, plus `public/og-image.png` (1200×630). All shared URLs show the same site-wide card (title, description, branded image).

**Per-game previews** (e.g. game title and faces in the card) are not supported on GitHub Pages alone: chat crawlers fetch HTML without running JavaScript, so React cannot inject game-specific meta. That would need prerendering, a static HTML file per game at build time, or a server/edge endpoint that returns HTML with the right tags.

Constants live in `src/lib/brand.ts` (`APP_SITE_URL`, `APP_OG_IMAGE_URL`).

## Supabase database

Apply migrations before publishing games:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

See [`../supabase/README.md`](../supabase/README.md).
