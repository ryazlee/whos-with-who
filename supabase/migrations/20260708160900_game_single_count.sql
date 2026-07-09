-- Expose how many people are correctly single in a game (group_size = 1).

create or replace function public.game_single_count(p_game_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.game_relationship_groups grg
  where grg.game_id = p_game_id and grg.group_size = 1;
$$;

grant execute on function public.game_single_count(uuid) to anon, authenticated;
