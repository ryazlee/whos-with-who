-- Top scores for a game (shown on the results screen).

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
      ga.completed_at,
      row_number() over (
        order by ga.score_100 desc, ga.correct_count desc, ga.completed_at asc
      )::int as rank
    from public.game_attempts ga
    where ga.game_id = public.resolve_game_id(p_game_id)
    order by ga.score_100 desc, ga.correct_count desc, ga.completed_at asc
    limit greatest(1, least(coalesce(p_limit, 10), 50))
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'attemptId', r.attempt_id,
        'displayName', r.display_name,
        'score100', r.score_100,
        'correctCount', r.correct_count,
        'completedAt', r.completed_at,
        'rank', r.rank
      )
      order by r.rank
    ),
    '[]'::jsonb
  )
  from ranked r;
$$;

grant execute on function public.game_leaderboard(text, int) to anon, authenticated;
