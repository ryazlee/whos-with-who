# Supabase — Who's With Who?

Project URL: `https://sedfdxrlxvsouszmaxlg.supabase.co`

## One-time dashboard setup

1. **Enable Email auth (OTP)**  
   Authentication → Providers → Email → Enable  
   Turn on **Confirm email** if you want verified addresses (optional for OTP).

2. **Site URL** (for redirect links in emails)  
   Authentication → URL Configuration:  
   - Site URL: `https://ryazlee.github.io/whos-with-who/`  
   - Redirect URLs: add `http://localhost:5173/**` for local dev

3. **GitHub integration** (if not done)  
   Project Settings → Integrations → GitHub → connect this repo.  
   Migrations in `supabase/migrations/` apply on push to the linked branch.

4. **GitHub Actions secrets** (for GitHub Pages builds)  
   Repository → Settings → Secrets → Actions:
   - `VITE_SUPABASE_URL` = `https://sedfdxrlxvsouszmaxlg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your project's **anon public** key (Settings → API)

5. **Local dev** — copy keys into `frontend/.env.local`:
   ```bash
   cp frontend/.env.example frontend/.env.local
   # paste anon key into VITE_SUPABASE_ANON_KEY
   ```

## Apply database schema (required — fixes 404 errors)

The app needs tables in your Supabase project. If you see **404 on `/rest/v1/games`** or similar, the schema has not been applied yet.

**Option A — Supabase CLI (recommended):**
```bash
npx supabase link --project-ref sedfdxrlxvsouszmaxlg
npx supabase db push
```

**Option B — SQL Editor in dashboard:**  
Open [Supabase SQL Editor](https://supabase.com/dashboard/project/sedfdxrlxvsouszmaxlg/sql/new), then run each file in order:
1. `supabase/migrations/20260708160000_initial_schema.sql`
2. `supabase/migrations/20260708160100_seed_demo_games.sql`

After applying, reload the app — you should see the demo games on Home.

## Seed data

Migration `20260708160100_seed_demo_games.sql` inserts three playable games with slugs `demo`, `college`, and `office` so routes like `/game/demo/play` keep working.

## App behavior

- If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set → app uses Supabase with **email code sign-in**.
- If not set → app falls back to in-browser mock data.
