-- Who's With Who — initial schema, RLS, RPCs

create extension if not exists "pgcrypto";

create type public.visibility as enum ('public', 'unlisted');
create type public.matching_mode as enum ('match_all', 'tap_pairs');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Player'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  creator_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text not null default '',
  visibility public.visibility not null default 'public',
  matching_mode public.matching_mode not null default 'tap_pairs',
  mode_locked boolean not null default false,
  daily_eligible boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.game_tags (
  game_id uuid not null references public.games (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (game_id, tag_id)
);

create table public.game_people (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  name text not null,
  primary_image_url text not null,
  sort_order int not null default 0
);

create index game_people_game_id_sort on public.game_people (game_id, sort_order);

create table public.game_relationship_groups (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  group_size int not null check (group_size >= 1)
);

create table public.game_group_people (
  group_id uuid not null references public.game_relationship_groups (id) on delete cascade,
  person_id uuid not null references public.game_people (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  primary key (group_id, person_id),
  unique (game_id, person_id)
);

create table public.game_attempts (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name_snapshot text not null,
  score_100 int not null check (score_100 between 0 and 100),
  correct_count int not null check (correct_count >= 0),
  total_questions int not null check (total_questions >= 1),
  started_at timestamptz not null default now(),
  completed_at timestamptz not null default now(),
  unique (game_id, user_id)
);

create table public.game_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.game_attempts (id) on delete cascade,
  person_id uuid not null references public.game_people (id) on delete cascade,
  selected_partner_id uuid references public.game_people (id) on delete set null,
  is_correct boolean not null,
  unique (attempt_id, person_id)
);

create table public.daily_challenges (
  date date primary key,
  game_id uuid not null references public.games (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.resolve_game_id(p_id_or_slug text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  begin
    v_id := p_id_or_slug::uuid;
    if exists (select 1 from public.games g where g.id = v_id) then
      return v_id;
    end if;
  exception when invalid_text_representation then
    null;
  end;

  select g.id into v_id from public.games g where g.slug = p_id_or_slug;
  if v_id is null then
    raise exception 'Game not found';
  end if;
  return v_id;
end;
$$;

create or replace function public.correct_partner_id(p_person_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select ggp2.person_id
  from public.game_group_people ggp
  join public.game_group_people ggp2
    on ggp2.group_id = ggp.group_id and ggp2.person_id <> ggp.person_id
  where ggp.person_id = p_person_id
  limit 1;
$$;

create or replace function public.community_stats_for_game(p_game_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with counts as (
    select
      gaa.person_id,
      gaa.selected_partner_id,
      count(*)::int as cnt
    from public.game_attempt_answers gaa
    join public.game_attempts ga on ga.id = gaa.attempt_id
    where ga.game_id = p_game_id
    group by gaa.person_id, gaa.selected_partner_id
  ),
  totals as (
    select person_id, sum(cnt)::int as total from counts group by person_id
  ),
  top_pick as (
    select distinct on (c.person_id)
      c.person_id,
      c.selected_partner_id as top_partner_id,
      c.cnt
    from counts c
    order by c.person_id, c.cnt desc, c.selected_partner_id nulls last
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'personId', gp.id,
        'topPartnerId', tp.top_partner_id,
        'topPercent', round(100.0 * tp.cnt / greatest(t.total, 1))::int,
        'singlePercent', coalesce(
          round(100.0 * s.cnt / greatest(t.total, 1))::int,
          0
        )
      )
      order by gp.sort_order
    ),
    '[]'::jsonb
  )
  from public.game_people gp
  join totals t on t.person_id = gp.id
  left join top_pick tp on tp.person_id = gp.id
  left join counts s on s.person_id = gp.id and s.selected_partner_id is null
  where gp.game_id = p_game_id;
$$;

create or replace function public.game_allows_singles(p_game_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.game_relationship_groups grg
    where grg.game_id = p_game_id and grg.group_size = 1
  );
$$;

create or replace view public.popular_games_v
with (security_invoker = true)
as
select
  g.id,
  g.slug,
  g.title,
  g.description,
  g.visibility::text as visibility,
  g.matching_mode::text as matching_mode,
  g.mode_locked,
  coalesce(ac.cnt, 0)::int as attempt_count,
  coalesce(pc.cnt, 0)::int as people_count,
  coalesce(
    (
      select jsonb_agg(t.slug order by t.slug)
      from public.game_tags gt
      join public.tags t on t.id = gt.tag_id
      where gt.game_id = g.id
    ),
    '[]'::jsonb
  ) as tags,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object('id', p.id, 'name', p.name, 'imageUrl', p.primary_image_url)
        order by p.sort_order
      )
      from (
        select p2.id, p2.name, p2.primary_image_url, p2.sort_order
        from public.game_people p2
        where p2.game_id = g.id
        order by p2.sort_order
        limit 5
      ) p
    ),
    '[]'::jsonb
  ) as preview_people
from public.games g
left join lateral (
  select count(*)::int as cnt from public.game_attempts ga where ga.game_id = g.id
) ac on true
left join lateral (
  select count(*)::int as cnt from public.game_people gp where gp.game_id = g.id
) pc on true
where g.published_at is not null
  and g.visibility in ('public', 'unlisted');

create or replace function public.submit_attempt(
  p_game_id text,
  p_answers jsonb,
  p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_user_id uuid;
  v_attempt_id uuid;
  v_total int;
  v_correct int;
  v_score int;
  v_people jsonb;
  v_per_person jsonb;
  v_community jsonb;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_game_id := public.resolve_game_id(p_game_id);

  if not exists (
    select 1 from public.games g where g.id = v_game_id and g.published_at is not null
  ) then
    raise exception 'Game not playable';
  end if;

  if exists (
    select 1 from public.game_attempts ga
    where ga.game_id = v_game_id and ga.user_id = v_user_id
  ) then
    raise exception 'You already played this game';
  end if;

  select count(*)::int into v_total
  from public.game_people gp where gp.game_id = v_game_id;

  if v_total = 0 then
    raise exception 'Game has no people';
  end if;

  v_attempt_id := gen_random_uuid();

  insert into public.game_attempts (
    id, game_id, user_id, display_name_snapshot, score_100, correct_count, total_questions
  )
  values (v_attempt_id, v_game_id, v_user_id, p_display_name, 0, 0, v_total);

  with answer_rows as (
    select
      (a ->> 'person_id')::uuid as person_id,
      nullif(a ->> 'selected_partner_id', '')::uuid as selected_partner_id
    from jsonb_array_elements(p_answers) as a
  )
  insert into public.game_attempt_answers (attempt_id, person_id, selected_partner_id, is_correct)
  select
    v_attempt_id,
    ar.person_id,
    ar.selected_partner_id,
    (
      ar.selected_partner_id is not distinct from public.correct_partner_id(ar.person_id)
    )
  from answer_rows ar
  join public.game_people gp on gp.id = ar.person_id and gp.game_id = v_game_id;

  select count(*) filter (where gaa.is_correct)::int into v_correct
  from public.game_attempt_answers gaa
  where gaa.attempt_id = v_attempt_id;

  v_score := round(100.0 * v_correct / v_total)::int;

  update public.game_attempts
  set score_100 = v_score, correct_count = v_correct
  where id = v_attempt_id;

  select jsonb_agg(
    jsonb_build_object('id', gp.id, 'name', gp.name, 'imageUrl', gp.primary_image_url)
    order by gp.sort_order
  )
  into v_people
  from public.game_people gp where gp.game_id = v_game_id;

  select jsonb_agg(
    jsonb_build_object(
      'personId', gaa.person_id,
      'selectedPartnerId', gaa.selected_partner_id,
      'correctPartnerId', public.correct_partner_id(gaa.person_id),
      'isCorrect', gaa.is_correct
    )
    order by gp.sort_order
  )
  into v_per_person
  from public.game_attempt_answers gaa
  join public.game_people gp on gp.id = gaa.person_id
  where gaa.attempt_id = v_attempt_id;

  v_community := public.community_stats_for_game(v_game_id);

  return jsonb_build_object(
    'attemptId', v_attempt_id,
    'gameId', v_game_id,
    'people', coalesce(v_people, '[]'::jsonb),
    'displayNameSnapshot', p_display_name,
    'score100', v_score,
    'correctCount', v_correct,
    'totalQuestions', v_total,
    'perPerson', coalesce(v_per_person, '[]'::jsonb),
    'communityPerPerson', coalesce(v_community, '[]'::jsonb)
  );
end;
$$;

create or replace function public.get_attempt_result(p_attempt_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_attempt public.game_attempts%rowtype;
  v_people jsonb;
  v_per_person jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_attempt
  from public.game_attempts ga
  where ga.id = p_attempt_id and ga.user_id = auth.uid();

  if not found then
    raise exception 'Attempt not found';
  end if;

  select jsonb_agg(
    jsonb_build_object('id', gp.id, 'name', gp.name, 'imageUrl', gp.primary_image_url)
    order by gp.sort_order
  )
  into v_people
  from public.game_people gp where gp.game_id = v_attempt.game_id;

  select jsonb_agg(
    jsonb_build_object(
      'personId', gaa.person_id,
      'selectedPartnerId', gaa.selected_partner_id,
      'correctPartnerId', public.correct_partner_id(gaa.person_id),
      'isCorrect', gaa.is_correct
    )
    order by gp.sort_order
  )
  into v_per_person
  from public.game_attempt_answers gaa
  join public.game_people gp on gp.id = gaa.person_id
  where gaa.attempt_id = p_attempt_id;

  return jsonb_build_object(
    'attemptId', v_attempt.id,
    'gameId', v_attempt.game_id,
    'people', coalesce(v_people, '[]'::jsonb),
    'displayNameSnapshot', v_attempt.display_name_snapshot,
    'score100', v_attempt.score_100,
    'correctCount', v_attempt.correct_count,
    'totalQuestions', v_attempt.total_questions,
    'perPerson', coalesce(v_per_person, '[]'::jsonb),
    'communityPerPerson', public.community_stats_for_game(v_attempt.game_id)
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.tags enable row level security;
alter table public.games enable row level security;
alter table public.game_tags enable row level security;
alter table public.game_people enable row level security;
alter table public.game_relationship_groups enable row level security;
alter table public.game_group_people enable row level security;
alter table public.game_attempts enable row level security;
alter table public.game_attempt_answers enable row level security;
alter table public.daily_challenges enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "tags_select_all" on public.tags for select using (true);
create policy "games_select_published" on public.games for select using (published_at is not null);
create policy "game_tags_select" on public.game_tags for select using (
  exists (select 1 from public.games g where g.id = game_id and g.published_at is not null)
);
create policy "game_people_select" on public.game_people for select using (
  exists (select 1 from public.games g where g.id = game_id and g.published_at is not null)
);
create policy "relationship_groups_deny" on public.game_relationship_groups for select using (false);
create policy "group_people_deny" on public.game_group_people for select using (false);
create policy "attempts_select_own" on public.game_attempts for select using (auth.uid() = user_id);
create policy "attempt_answers_select_own" on public.game_attempt_answers for select using (
  exists (select 1 from public.game_attempts ga where ga.id = attempt_id and ga.user_id = auth.uid())
);
create policy "daily_select_all" on public.daily_challenges for select using (true);

grant usage on schema public to anon, authenticated;
grant select on public.popular_games_v to anon, authenticated;
grant select on public.tags to anon, authenticated;
grant select on public.games to anon, authenticated;
grant select on public.game_tags to anon, authenticated;
grant select on public.game_people to anon, authenticated;
grant select on public.game_attempts to anon, authenticated;
grant select on public.game_attempt_answers to anon, authenticated;
grant select on public.daily_challenges to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant execute on function public.resolve_game_id(text) to anon, authenticated;
grant execute on function public.game_allows_singles(uuid) to anon, authenticated;
grant execute on function public.submit_attempt(text, jsonb, text) to authenticated;
grant execute on function public.get_attempt_result(uuid) to authenticated;
