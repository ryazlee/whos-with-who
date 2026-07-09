-- Guest plays contribute to community stats (answers persisted; no auth account required).

alter table public.game_attempts
  alter column user_id drop not null;

alter table public.game_attempts
  drop constraint if exists game_attempts_game_id_user_id_key;

create unique index game_attempts_one_per_user
  on public.game_attempts (game_id, user_id)
  where user_id is not null;

create index if not exists game_attempts_game_id_idx
  on public.game_attempts (game_id);

create or replace function public.grade_guest_attempt(
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
  v_attempt_id uuid;
  v_total int;
  v_correct int;
  v_score int;
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

  v_attempt_id := gen_random_uuid();

  insert into public.game_attempts (
    id, game_id, user_id, display_name_snapshot, score_100, correct_count, total_questions
  )
  values (v_attempt_id, v_game_id, null, p_display_name, 0, 0, v_total);

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

grant execute on function public.grade_guest_attempt(text, jsonb, text) to anon, authenticated;
