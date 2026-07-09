# Supabase — Who's With Who?

Project URL: `https://sedfdxrlxvsouszmaxlg.supabase.co`

## One-time dashboard setup

1. **Enable Email auth (OTP)**  
   Authentication → Providers → Email → Enable  
   Turn on **Confirm email** if you want verified addresses (optional for OTP).

2. **Email template for 6-digit codes (not magic links)**  
   Authentication → Email Templates → **Magic Link**  
   Supabase uses this template for `signInWithOtp`. To send a numeric code instead of a link, include `{{ .Token }}` in the body and remove `{{ .ConfirmationURL }}`. Example body snippet:
   ```html
   <p>Your sign-in code is: <strong>{{ .Token }}</strong></p>
   ```
   The app verifies codes with `verifyOtp({ type: 'email' })` — no redirect URL is required.

3. **Site URL** (optional for OTP; needed only if you use magic links or OAuth)  
   Authentication → URL Configuration:  
   - Site URL: `https://ryazlee.github.io/whos-with-who/`  
   - Redirect URLs: add `http://localhost:5173/**` for local dev

4. **GitHub integration** (if not done)  
   Project Settings → Integrations → GitHub → connect this repo.  
   Migrations in `supabase/migrations/` apply on push to the linked branch.

5. **GitHub Actions secrets** (for GitHub Pages builds)  
   Repository → Settings → Secrets → Actions:
   - `VITE_SUPABASE_URL` = `https://sedfdxrlxvsouszmaxlg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your project's **anon public** key (Settings → API)

6. **Local dev** — copy keys into `frontend/.env.local`:
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

**Publishing games** also needs migration `20260708160200_publish_game.sql` (storage bucket + `publish_game` RPC).

**Managing games** (visibility, delete) needs `20260708160300_game_management.sql`.

**Draw lines mode + allowed modes** needs:
- `20260708160400_matching_modes_enum.sql` (adds enum value)
- `20260708160401_matching_modes_apply.sql` (column + publish_game; must run after enum migration)

**Description + custom tags** needs `20260708160500_game_description_tags.sql`.

**Creator display name on games** needs `20260708160600_creator_display_name.sql`.

## Seed data

Migration `20260708160100_seed_demo_games.sql` inserts three playable games with slugs `demo`, `college`, and `office` so routes like `/game/demo/play` keep working.

## App behavior

- If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set → app uses Supabase with **email code sign-in**.
- If not set → app falls back to in-browser mock data.
