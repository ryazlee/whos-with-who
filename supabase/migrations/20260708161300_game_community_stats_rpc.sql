-- Community guess aggregates for the game stats page.

create or replace function public.get_game_community_stats(p_game_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public.community_stats_for_game(public.resolve_game_id(p_game_id));
$$;

grant execute on function public.get_game_community_stats(text) to anon, authenticated;
