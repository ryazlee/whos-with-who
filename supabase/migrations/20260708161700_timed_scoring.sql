-- Time-aware scoring: correctness dominates (90%), speed adds up to 10% within tier.
-- score_100 stores tenths (0–1000); display as score_100 / 10.

drop function if exists public.submit_attempt(text, jsonb, text);
drop function if exists public.grade_guest_attempt(text, jsonb, text);

alter table public.game_attempts
  drop constraint if exists game_attempts_score_100_check;

alter table public.game_attempts
  add column if not exists duration_ms int check (duration_ms is null or duration_ms >= 0);

update public.game_attempts
set score_100 = score_100 * 10
where score_100 <= 100 and duration_ms is null;

alter table public.game_attempts
  add constraint game_attempts_score_100_check check (score_100 between 0 and 1000);

create or replace function public.scoring_target_ms(p_total int)
returns int
language sql
immutable
as $$
  select greatest(45000, p_total * 30000);
$$;

create or replace function public.compute_attempt_score(
  p_correct int,
  p_total int,
  p_duration_ms int
)
returns int
language sql
immutable
as $$
  select least(
    1000,
    greatest(
      0,
      round(
        (1000.0 * p_correct / greatest(p_total, 1))
        * (
          0.9
          + 0.1 * greatest(
            0,
            1 - least(
              1.0,
              coalesce(p_duration_ms, 0)::numeric / greatest(public.scoring_target_ms(p_total), 1)
            )
          )
        )
      )::int
    )
  );
$$;

create or replace function public.submit_attempt(
  p_game_id text,
  p_answers jsonb,
  p_display_name text,
  p_duration_ms int default null
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
  v_duration int;
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

  v_duration := greatest(0, coalesce(p_duration_ms, 0));
  v_attempt_id := gen_random_uuid();

  insert into public.game_attempts (
    id, game_id, user_id, display_name_snapshot, score_100, correct_count, total_questions, duration_ms,
    started_at, completed_at
  )
  values (
    v_attempt_id, v_game_id, v_user_id, p_display_name, 0, 0, v_total, v_duration,
    now() - (v_duration * interval '1 millisecond'), now()
  );

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

  v_score := public.compute_attempt_score(v_correct, v_total, v_duration);

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
    'durationMs', v_duration,
    'perPerson', coalesce(v_per_person, '[]'::jsonb),
    'communityPerPerson', coalesce(v_community, '[]'::jsonb)
  );
end;
$$;

create or replace function public.grade_guest_attempt(
  p_game_id text,
  p_answers jsonb,
  p_display_name text,
  p_duration_ms int default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_attempt_id uuid;
  v_total int;
  v_correct int;
  v_score int;
  v_duration int;
  v_people jsonb;
  v_per_person jsonb;
  v_community jsonb;
begin
  v_game_id := public.resolve_game_id(p_game_id);

  if not exists (
    select 1 from public.games g where g.id = v_game_id and g.published_at is not null
  ) then
    raise exception 'Game not playable';
  end if;

  select count(*)::int into v_total
  from public.game_people gp where gp.game_id = v_game_id;

  if v_total = 0 then
    raise exception 'Game has no people';
  end if;

  v_duration := greatest(0, coalesce(p_duration_ms, 0));
  v_attempt_id := gen_random_uuid();

  insert into public.game_attempts (
    id, game_id, user_id, display_name_snapshot, score_100, correct_count, total_questions, duration_ms,
    started_at, completed_at
  )
  values (
    v_attempt_id, v_game_id, null, p_display_name, 0, 0, v_total, v_duration,
    now() - (v_duration * interval '1 millisecond'), now()
  );

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

  v_score := public.compute_attempt_score(v_correct, v_total, v_duration);

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
    'durationMs', v_duration,
    'perPerson', coalesce(v_per_person, '[]'::jsonb),
    'communityPerPerson', coalesce(v_community, '[]'::jsonb)
  );
end;
$$;

create or replace function public.get_attempt_result(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.game_attempts%rowtype;
  v_people jsonb;
  v_per_person jsonb;
begin
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
    'durationMs', v_attempt.duration_ms,
    'perPerson', coalesce(v_per_person, '[]'::jsonb),
    'communityPerPerson', public.community_stats_for_game(v_attempt.game_id)
  );
end;
$$;

create or replace function public.game_leaderboard(p_game_id text, p_limit int default 10)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with ranked as (
    select
      ga.id as attempt_id,
      ga.display_name_snapshot as display_name,
      ga.score_100,
      ga.correct_count,
      ga.duration_ms,
      ga.completed_at,
      row_number() over (
        order by ga.score_100 desc, ga.duration_ms asc nulls last, ga.completed_at asc
      )::int as rank
    from public.game_attempts ga
    where ga.game_id = public.resolve_game_id(p_game_id)
    order by ga.score_100 desc, ga.duration_ms asc nulls last, ga.completed_at asc
    limit greatest(1, least(coalesce(p_limit, 10), 50))
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'attemptId', r.attempt_id,
        'displayName', r.display_name,
        'score100', r.score_100,
        'correctCount', r.correct_count,
        'durationMs', r.duration_ms,
        'completedAt', r.completed_at,
        'rank', r.rank
      )
      order by r.rank
    ),
    '[]'::jsonb
  )
  from ranked r;
$$;

grant execute on function public.submit_attempt(text, jsonb, text, int) to authenticated;
grant execute on function public.grade_guest_attempt(text, jsonb, text, int) to anon, authenticated;
