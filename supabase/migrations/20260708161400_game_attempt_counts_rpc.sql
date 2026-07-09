-- Accurate play counts including guest attempts (RLS hides rows from direct selects).

create or replace function public.game_attempt_counts(p_game_ids uuid[])
returns table(game_id uuid, play_count int)
language sql
stable
security definer
set search_path = public
as $$
  select ga.game_id, count(*)::int as play_count
  from public.game_attempts ga
  join public.games g on g.id = ga.game_id and g.published_at is not null
  where ga.game_id = any(p_game_ids)
  group by ga.game_id;
$$;

grant execute on function public.game_attempt_counts(uuid[]) to anon, authenticated;
