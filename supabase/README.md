# Supabase — Who's With Who?

Project URL: `https://sedfdxrlxvsouszmaxlg.supabase.co`

## One-time dashboard setup

1. **Enable Email auth**  
   Authentication → Providers → Email → Enable

2. **URL configuration (required for magic-link sign-in)**  
   On the **free tier**, Supabase only sends magic links (no custom OTP email template). Set:

   Authentication → **URL Configuration**:
   - **Site URL:** `https://ryazlee.github.io/whos-with-who/`
   - **Redirect URLs** (add both):
     - `http://localhost:5173/**`
     - `https://ryazlee.github.io/whos-with-who/**`

   If links point at `localhost:3000` or another wrong host, the Site URL above is still set incorrectly.

   Optional CLI (URLs only — no email template on free tier):

   ```bash
   npx supabase login
   npx supabase link --project-ref sedfdxrlxvsouszmaxlg
   npx supabase config push
   ```

   `config push` updates `site_url` / redirect URLs from `supabase/config.toml`. It will **not** change the email body unless you use custom SMTP or a paid plan.

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

- If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set → app uses Supabase with **email magic-link sign-in**.
- If not set → app falls back to in-browser mock data.
