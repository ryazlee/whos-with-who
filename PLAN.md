# Who's With Who? — Product & Implementation Plan

A party-game web app where friend groups upload photos, define who's with who, and others guess the pairings. Built with **React + TypeScript** (static SPA on **GitHub Pages**) and **Supabase** (Postgres, Auth, Storage, RLS).

---

## 0) Goals

- Creators build **games** with photos, correct relationship groupings, and optional metadata.
- Players take games anonymously or signed-in, see their score, and explore what the crowd thinks.
- **Public** games appear on discovery; **unlisted** games are playable only via direct link (`/game/:id`).
- **Daily Challenge** features one public game per day.
- Creators (and invited editors) view analytics; community sees aggregate prediction signals.

---

## 1) Terminology

| Term | Usage |
|------|-------|
| **Game** | User-created experience (not "quiz") |
| **Daily Challenge** | Featured game-of-the-day |
| **Tag** | Searchable label describing game type/difficulty |
| **Relationship group** | Correct answer unit: single (1), couple (2), throuple (3+) |

**Code / DB naming:** `games`, `game_people`, `game_attempts`, `daily_challenges`, `tags`.

---

## 2) Core product decisions (locked)

### 2.1 Visibility

| | **Public** | **Unlisted** |
|---|------------|--------------|
| On home / popular / search | Yes | No |
| Playable via `/game/:id` | Yes | Yes |
| Daily challenge eligible | Yes (if opted in) | No |
| Link sharing | Yes | Yes — anyone with link can play/view |

Unlisted = not discoverable, not secret. No join code required for v1.

### 2.2 Identity & display names

- **Anonymous play:** enabled via Supabase Anonymous Auth (stable `user_id` for attempts).
- **Display name:** if no account, client generates a random name, stores in `localStorage`, reuses on return visits.
- **Snapshot:** `display_name_snapshot` stored on each `game_attempt` for stable analytics.
- **Signed-in users:** profile display name overrides random name when available.

### 2.3 Creators & editors

- **Owners must have an account** to create and publish games.
- **Editors:** owners can invite other authenticated users to edit a game.
- **No anonymous creators** in v1. (Optional later: draft-as-anon, require auth at publish.)

### 2.4 Relationship complexity (phased)

| Phase | Support |
|-------|---------|
| **v1** | Singles + couples (relationship groups of size 1 or 2) |
| **Later** | Throuples (size 3+) — tag `throuples_present` can exist early, gameplay ships later |

### 2.5 Results visibility

Players see **both**:

1. **Personal:** score + per-person correctness breakdown.
2. **Community belief:**
   - Per person: top predicted partner(s) + selection %.
   - Global: most popular predicted couples / "crowd favorites" summary.

---

## 3) Matching modes

Configurable per game via `matching_mode` enum. Ship incrementally.

| Mode | Description | v1 |
|------|-------------|-----|
| `match_all` | All people shown; assign each a partner (or "single") | **Yes** |
| `one_by_one` | Same logic, one person at a time | Later |
| `pick_one` | One person + multiple-choice partners | Later |
| `yes_no_pairs` | Curated pair prompts, Yes/No | Later |

### Scoring model (personal performance)

Use a consistent **0–100 scale** for player performance (100 = best, 0 = worst).

**v1 scoring (`match_all`, singles + couples):**
- Each person is treated as **one scoring question**.
- Player selects **0 or 1 partner per person**.
  - If the game includes any **single-capable people** (relationship groups where the correct group size is `1`), the UI must offer an explicit **“Single”** choice for every person shown.
  - The player’s selection must be one of:
    - a partner (a specific person), or
    - **Single** (explicitly).
- Let `correct_count` be the number of people where the submitted selection matches the correct relationship group.
- Let `total_questions` be the total number of people in the game.
- `accuracy = correct_count / total_questions`
- `score_100 = round(100 * accuracy)` (stored on the attempt).

**Granularity:**
- Store `correct_count` and `total_questions` so results can show both:
  - `score_100` (0–100), and
  - `correct_count/total_questions` (the more granular breakdown).
- If you later need even finer granularity for charts/leaderboards, store an additional `accuracy_scaled = round(1000 * accuracy)` (0–1000) without changing semantics.

---

## 4) Tags & search

Tags describe game type and help discovery. Many-to-many via `game_tags`.

### Launch tags

| Slug | Label | Meaning |
|------|-------|---------|
| `stable_pairs` | Stable pairs | Mostly consistent pairings; easier |
| `singles_mixed` | Singles mixed in | Some people are correctly single |
| `throuples_present` | Throuples | Contains throuples (gameplay support later) |
| `metadata_light` | Light metadata | Creator hides most person details |
| `metadata_heavy` | Full metadata | Age, location, extra photos revealed |
| `quick_round` | Quick round | Few people, fast play |
| `long_round` | Long round | Larger group |

### Search UX

- Home: filter chips or tag picker.
- `/search?tags=stable_pairs,singles_mixed` — AND filter on selected tags.
- Popular games leaderboard respects active tag filters.

---

## 5) Person metadata & difficulty

Creators attach rich data; game settings control what takers see.

### Per-person fields (`game_people`)

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | |
| `primary_image_url` | Yes | Supabase Storage |
| `age` | No | Integer |
| `ethnicity` | No | Free text |
| `location` | No | Free text |

### Additional photos (`game_person_images`)

- Multiple images per person.
- Used for harder modes or visual-only guessing.

### Game presentation settings (`game_presentation_settings`)

| Setting | Type | Purpose |
|---------|------|---------|
| `reveal_age` | bool | Show age to takers |
| `reveal_ethnicity` | bool | Show ethnicity |
| `reveal_location` | bool | Show location |
| `additional_photos_mode` | enum | `none` / `all` / `first_n` |
| `additional_photos_count` | int | When mode = `first_n` |

**Easy mode:** reveal metadata + extra photos.  
**Hard mode:** photos only (or minimal hints).

Auto-tag games as `metadata_light` or `metadata_heavy` based on presentation settings.

---

## 6) Data model

### 6.1 Enums

```sql
create type visibility as enum ('public', 'unlisted');
create type matching_mode as enum ('match_all', 'one_by_one', 'pick_one', 'yes_no_pairs');
create type editor_role as enum ('owner', 'editor');
create type additional_photos_mode as enum ('none', 'all', 'first_n');
```

### 6.2 Tables

#### `profiles`
- `id` uuid PK → `auth.users.id`
- `display_name` text
- `avatar_url` text nullable
- `created_at` timestamptz

#### `games`
- `id` uuid PK
- `creator_id` uuid → `profiles.id`
- `title` text
- `description` text nullable
- `visibility` visibility
- `matching_mode` matching_mode
- `daily_eligible` bool default false
- `published_at` timestamptz nullable
- `created_at` timestamptz

#### `tags`
- `id` uuid PK
- `slug` text unique
- `label` text

#### `game_tags`
- `game_id` uuid → `games.id`
- `tag_id` uuid → `tags.id`
- PK (`game_id`, `tag_id`)

#### `game_people`
- `id` uuid PK
- `game_id` uuid → `games.id`
- `name` text
- `age` int nullable
- `ethnicity` text nullable
- `location` text nullable
- `primary_image_url` text
- `sort_order` int default 0

#### `game_person_images`
- `id` uuid PK
- `game_person_id` uuid → `game_people.id`
- `image_url` text
- `sort_order` int default 0

#### `game_presentation_settings`
- `game_id` uuid PK → `games.id`
- `reveal_age` bool default false
- `reveal_ethnicity` bool default false
- `reveal_location` bool default false
- `additional_photos_mode` additional_photos_mode default 'none'
- `additional_photos_count` int default 0

#### `game_relationship_groups` (correct answers)
- `id` uuid PK
- `game_id` uuid → `games.id`
- `group_size` int (1 = single, 2 = couple; 3+ later)

#### `game_group_people`
- `group_id` uuid → `game_relationship_groups.id`
- `person_id` uuid → `game_people.id`
- PK (`group_id`, `person_id`)
- Unique (`game_id`, `person_id`) — each person in exactly one group

#### `game_editors`
- `game_id` uuid → `games.id`
- `user_id` uuid → `profiles.id`
- `role` editor_role
- PK (`game_id`, `user_id`)

#### `game_attempts`
- `id` uuid PK
- `game_id` uuid → `games.id`
- `user_id` uuid → `profiles.id` (anon auth OK)
- `display_name_snapshot` text
- `score_100` int (0–100)
- `correct_count` int
- `total_questions` int
- `started_at` timestamptz
- `completed_at` timestamptz nullable

#### `game_attempt_answers`
- `id` uuid PK
- `attempt_id` uuid → `game_attempts.id`
- `person_id` uuid → `game_people.id`
- `selected_partner_id` uuid nullable → `game_people.id` (null = guessed single)
- `is_correct` bool

#### `daily_challenges`
- `date` date PK
- `game_id` uuid → `games.id`
- `created_at` timestamptz

### 6.3 Key views / RPCs (for analytics)

**`community_predictions_per_person`** (view or RPC):
- For each `person_id` in a game: `selected_partner_id`, count, percentage of attempts.

**`community_popular_couples`** (view or RPC):
- Pairs `(person_a, person_b)` where both were mutually selected, ranked by frequency.
- Include "predicted singles" as `(person_id, null)` entries.

**`game_leaderboard`** (view or RPC):
- Per game: `display_name_snapshot`, `score_100`, `completed_at` — for scoreboard on results page.

**`popular_games`** (view or RPC):
- Public games ranked by attempt count (and optionally avg score, lowest avg accuracy for "hardest").

---

## 7) RLS & security

### Read
- `games` where `visibility = 'public'` — anyone.
- `games` where `visibility = 'unlisted'` — anyone with `id` (direct link).
- `game_people`, images, presentation settings — readable for playable games.
- **Do not expose** `game_relationship_groups` / `game_group_people` to players before submit (use server-side scoring RPC).

### Write
- `games`, `game_people`, groups, tags, presentation: creator or editor only.
- `game_attempts` + `game_attempt_answers`: any authenticated user (including anon) for playable games.
- `game_editors`: owner only can invite/remove.

### Scoring
- Prefer a Supabase RPC `submit_attempt(game_id, answers[])` that:
  1. Loads correct groups server-side.
  2. Computes score.
  3. Inserts attempt + answers with `is_correct`.
  4. Returns attempt id + score.
- Prevents client-side answer leakage.

---

## 8) Frontend routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | No | Daily challenge, popular games, tag filters |
| `/search` | No | Tag-filtered game list |
| `/game/:id` | No | Lobby — title, tags, player count, Play |
| `/game/:id/play` | Anon OK | Gameplay UI |
| `/attempt/:id/result` | Anon OK | Personal score + community predictions |
| `/create` | Required | Game creation wizard |
| `/game/:id/edit` | Owner/editor | Edit people, metadata, tags, settings |
| `/game/:id/stats` | Owner/editor | Creator analytics |
| `/me` | Required | My games, my attempts |

### Display name (client)

```ts
const STORAGE_KEY = 'www_display_name';

function getDisplayName(): string {
  let name = localStorage.getItem(STORAGE_KEY);
  if (!name) {
    name = generateRandomName(); // e.g. "CleverOtter42"
    localStorage.setItem(STORAGE_KEY, name);
  }
  return name;
}
```

Pass `display_name_snapshot` to `submit_attempt` RPC.

---

## 9) Results page layout

### Section A — Your score
### Section A — Your performance (0–100)
- `Score: 0–100` (computed as `score_100`)
- More granular clarity: `Correct: X / total` (from `correct_count/total_questions`)
- Per-person breakdown: ✓ / ✗ with correct answer revealed after submit

### Section B — What people think (per person)
- For each person: bar chart or list of top predicted partners + %
- Singles: "% guessed single"

### Section C — Crowd favorites (global)
- "Most predicted couples" — pairs ranked by how often both were mutually selected
- "Biggest surprises" — pairs with high prediction % that were wrong

### Section D — Leaderboard (this game)
- Top scores by `display_name_snapshot`

---

## 10) Daily challenge

**Approach:** store in `daily_challenges` table (stable per-day experience).

- Selection criteria: `visibility = public`, `daily_eligible = true`, minimum N people (e.g. 5), not already featured in last 30 days.
- Scheduler: Supabase `pg_cron` or Edge Function on a schedule.
- Home page: `SELECT * FROM daily_challenges WHERE date = CURRENT_DATE`.

---

## 11) Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + TypeScript + Vite |
| Routing | React Router |
| Styling | TBD (Tailwind recommended) |
| Backend | Supabase (Postgres, Auth, Storage, RLS, RPC) |
| Hosting | GitHub Pages (static `dist/`) |
| CI | GitHub Actions → build → deploy to `gh-pages` branch |

### Env vars (client-safe)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 12) Milestones

### M1 — Foundation
- [ ] Supabase project + schema migrations (all tables, enums)
- [ ] RLS policies (read public/unlisted, write attempts, creator/editor CRUD)
- [ ] `submit_attempt` RPC with server-side scoring
- [ ] React scaffold (Vite + TS + Router)
- [ ] Supabase client + generated types
- [ ] GitHub Pages deploy pipeline

### M2 — MVP gameplay
- [ ] Game creation wizard (auth required): title, visibility, people + photos, couples/singles
- [ ] `match_all` play UI
- [ ] Results page: personal score + per-person breakdown
- [ ] Anonymous auth + localStorage display name

### M3 — Community results
- [ ] Per-person prediction aggregates on results page
- [ ] Global "crowd favorites" section
- [ ] In-game leaderboard (top scores)

### M4 — Discovery & tags
- [ ] Seed tags
- [ ] Tag assignment in creator
- [ ] Home search/filter by tags
- [ ] Popular games leaderboard

### M5 — Metadata & difficulty
- [ ] Person metadata fields (age, ethnicity, location)
- [ ] Additional photos upload
- [ ] Presentation settings (reveal toggles)
- [ ] Auto-tag `metadata_light` / `metadata_heavy`

### M6 — Editors & unlisted
- [ ] `game_editors` invite flow
- [ ] Edit permissions in UI
- [ ] Unlisted games hidden from discovery, playable by link

### M7 — Daily challenge
- [ ] `daily_challenges` table + selection job
- [ ] Home page daily hero

### M8 — Extra matching modes (later)
- [ ] `one_by_one`, `pick_one`, `yes_no_pairs`

### M9 — Throuples (later)
- [ ] Relationship groups size 3+
- [ ] Matching mode that supports multi-partner selection
- [ ] Enable `throuples_present` tag gameplay

---

## 13) Open items (deferred)

- Join codes for extra-unlisted privacy (not needed v1)
- Anonymous draft → publish-with-auth flow
- Real-time live results (Supabase Realtime) during group play sessions
- Image moderation / reporting for public games
- OAuth providers beyond email (Google, etc.)

---

## 14) Success criteria for v1 launch

1. Creator signs in, builds a game with 6+ people, publishes public or unlisted.
2. Friend opens link (no account), gets random display name, plays `match_all`, sees score.
3. Results show personal breakdown + community "who people think is with who."
4. Public games appear on home with tag filters.
5. Creator sees attempt count and score distribution in stats.

---

## 15) Minimal mobile-first (portrait) UX constraints

The app should feel effortless on a phone in portrait mode:

### Gameplay UI
- Single screen / one-column layout (avoid side-by-side panels on mobile).
- Large touch targets and minimal controls per step (prefer tap/select over complex drag unless the matching mode requires it).
- Persistent bottom action area (primary CTA: “Next”, “Submit”, “Skip”, etc.).
- Preload images for the next 1–2 people to reduce perceived latency.

### Results UI
- Show the most important info first:
  - Score (0–100) + correct count
  - Then community belief highlights (top predicted partners / singles rate)
- Avoid heavy charts by default; use simple bars/percent rows that fit on mobile width.
- Make per-person breakdown collapsible/scrollable with clear affordances (“Tap a person to see details”).
