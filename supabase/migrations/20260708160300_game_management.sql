-- Creator game management: visibility updates and deletion
-- Uses public.resolve_game_id from initial schema (p_id_or_slug).

create or replace function public.update_game_visibility(
  p_game_ref text,
  p_visibility public.visibility
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_game_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_game_id := public.resolve_game_id(p_game_ref);

  if not exists (
    select 1
    from public.games g
    where g.id = v_game_id
      and g.creator_id = v_user_id
  ) then
    raise exception 'Not allowed';
  end if;

  update public.games
  set visibility = p_visibility
  where id = v_game_id;

  return jsonb_build_object('gameId', v_game_id, 'visibility', p_visibility::text);
end;
$$;

create or replace function public.delete_game(p_game_ref text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_game_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_game_id := public.resolve_game_id(p_game_ref);

  if not exists (
    select 1
    from public.games g
    where g.id = v_game_id
      and g.creator_id = v_user_id
  ) then
    raise exception 'Not allowed';
  end if;

  delete from public.games where id = v_game_id;

  return jsonb_build_object('gameId', v_game_id);
end;
$$;

grant execute on function public.update_game_visibility(text, public.visibility) to authenticated;
grant execute on function public.delete_game(text) to authenticated;
