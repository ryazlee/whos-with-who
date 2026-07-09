-- Store creator display name on games for public cards and lobby

alter table public.games
  add column if not exists creator_display_name text not null default '';

update public.games g
set creator_display_name = coalesce(nullif(trim(p.display_name), ''), 'Player')
from public.profiles p
where g.creator_id = p.id
  and coalesce(trim(g.creator_display_name), '') = '';

create policy "profiles_select_game_creators"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.games g
      where g.creator_id = profiles.id
        and g.published_at is not null
    )
  );

grant select on public.profiles to anon;

create or replace function public.publish_game(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_game_id uuid;
  v_slug text;
  v_person jsonb;
  v_group jsonb;
  v_group_id uuid;
  v_person_id uuid;
  v_person_ids jsonb;
  v_i int;
  v_allowed_modes public.matching_mode[];
  v_creator_name text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if coalesce(trim(p_payload->>'title'), '') = '' then
    raise exception 'Title is required';
  end if;

  v_creator_name := left(
    coalesce(
      nullif(trim(p_payload->>'creator_display_name'), ''),
      (select nullif(trim(p.display_name), '') from public.profiles p where p.id = v_user_id),
      'Player'
    ),
    120
  );

  v_game_id := gen_random_uuid();
  v_slug := coalesce(nullif(trim(p_payload->>'slug'), ''), v_game_id::text);

  if exists (select 1 from public.games g where g.slug = v_slug) then
    v_slug := v_slug || '-' || substr(v_game_id::text, 1, 8);
  end if;

  if jsonb_typeof(p_payload->'allowed_matching_modes') = 'array'
     and jsonb_array_length(p_payload->'allowed_matching_modes') > 0 then
    select coalesce(array_agg((value #>> '{}')::public.matching_mode), array[]::public.matching_mode[])
    into v_allowed_modes
    from jsonb_array_elements(p_payload->'allowed_matching_modes') as value;
  else
    v_allowed_modes := array['tap_pairs', 'match_all', 'draw_lines']::public.matching_mode[];
  end if;

  insert into public.games (
    id, slug, creator_id, creator_display_name, title, description, visibility,
    matching_mode, mode_locked, allowed_matching_modes, published_at
  )
  values (
    v_game_id,
    v_slug,
    v_user_id,
    v_creator_name,
    trim(p_payload->>'title'),
    left(coalesce(p_payload->>'description', ''), 2000),
    coalesce((p_payload->>'visibility')::public.visibility, 'public'),
    coalesce((p_payload->>'matching_mode')::public.matching_mode, 'tap_pairs'),
    coalesce((p_payload->>'mode_locked')::boolean, false),
    v_allowed_modes,
    now()
  );

  perform public.link_game_tags(v_game_id, p_payload->'tags');

  for v_person in select * from jsonb_array_elements(coalesce(p_payload->'people', '[]'::jsonb))
  loop
    insert into public.game_people (id, game_id, name, primary_image_url, sort_order)
    values (
      (v_person->>'id')::uuid,
      v_game_id,
      trim(v_person->>'name'),
      v_person->>'image_url',
      coalesce((v_person->>'sort_order')::int, 0)
    );
  end loop;

  for v_group in select * from jsonb_array_elements(coalesce(p_payload->'groups', '[]'::jsonb))
  loop
    v_person_ids := v_group->'person_ids';
    if jsonb_array_length(v_person_ids) < 1 then
      continue;
    end if;

    v_group_id := gen_random_uuid();
    insert into public.game_relationship_groups (id, game_id, group_size)
    values (v_group_id, v_game_id, jsonb_array_length(v_person_ids));

    for v_i in 0 .. jsonb_array_length(v_person_ids) - 1
    loop
      v_person_id := (v_person_ids->>v_i)::uuid;
      insert into public.game_group_people (group_id, person_id, game_id)
      values (v_group_id, v_person_id, v_game_id);
    end loop;
  end loop;

  return jsonb_build_object('gameId', v_game_id, 'slug', v_slug);
end;
$$;

grant execute on function public.publish_game(jsonb) to authenticated;
