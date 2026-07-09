-- Full game update for creators: metadata, people, relationships, matching modes

create or replace function public.get_game_for_edit(p_game_ref text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_game_id uuid;
  v_game public.games%rowtype;
  v_people jsonb;
  v_relationships jsonb;
  v_tags jsonb;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_game_id := public.resolve_game_id(p_game_ref);

  select * into v_game
  from public.games g
  where g.id = v_game_id
    and g.creator_id = v_user_id
    and g.published_at is not null;

  if not found then
    raise exception 'Not allowed';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', gp.id,
        'name', gp.name,
        'imageUrl', gp.primary_image_url,
        'sortOrder', gp.sort_order
      )
      order by gp.sort_order
    ),
    '[]'::jsonb
  )
  into v_people
  from public.game_people gp
  where gp.game_id = v_game_id;

  select coalesce(
    jsonb_object_agg(
      ggp.person_id::text,
      case
        when grg.group_size = 1 then null
        else (
          select ggp2.person_id::text
          from public.game_group_people ggp2
          where ggp2.group_id = ggp.group_id
            and ggp2.person_id <> ggp.person_id
          limit 1
        )
      end
    ),
    '{}'::jsonb
  )
  into v_relationships
  from public.game_group_people ggp
  join public.game_relationship_groups grg on grg.id = ggp.group_id
  where grg.game_id = v_game_id;

  select coalesce(
    jsonb_agg(t.slug order by t.slug),
    '[]'::jsonb
  )
  into v_tags
  from public.game_tags gt
  join public.tags t on t.id = gt.tag_id
  where gt.game_id = v_game_id;

  return jsonb_build_object(
    'gameId', v_game_id,
    'slug', v_game.slug,
    'title', v_game.title,
    'description', v_game.description,
    'tags', v_tags,
    'visibility', v_game.visibility::text,
    'matchingMode', v_game.matching_mode::text,
    'modeLocked', v_game.mode_locked,
    'allowedMatchingModes', to_jsonb(v_game.allowed_matching_modes::text[]),
    'people', v_people,
    'relationships', v_relationships
  );
end;
$$;

create or replace function public.update_game(
  p_game_ref text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_game_id uuid;
  v_person jsonb;
  v_group jsonb;
  v_group_id uuid;
  v_person_id uuid;
  v_person_ids jsonb;
  v_i int;
  v_allowed_modes public.matching_mode[];
  v_payload_person_ids uuid[];
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if coalesce(trim(p_payload->>'title'), '') = '' then
    raise exception 'Title is required';
  end if;

  v_game_id := public.resolve_game_id(p_game_ref);

  if not exists (
    select 1
    from public.games g
    where g.id = v_game_id
      and g.creator_id = v_user_id
      and g.published_at is not null
  ) then
    raise exception 'Not allowed';
  end if;

  select coalesce(array_agg((value->>'id')::uuid), array[]::uuid[])
  into v_payload_person_ids
  from jsonb_array_elements(coalesce(p_payload->'people', '[]'::jsonb)) as value;

  if exists (
    select 1
    from public.game_people gp
    where gp.game_id = v_game_id
      and gp.id <> all (v_payload_person_ids)
      and exists (
        select 1
        from public.game_attempt_answers gaa
        where gaa.person_id = gp.id
      )
  ) then
    raise exception 'Cannot remove people who already have play data';
  end if;

  if jsonb_typeof(p_payload->'allowed_matching_modes') = 'array'
     and jsonb_array_length(p_payload->'allowed_matching_modes') > 0 then
    select coalesce(array_agg((value #>> '{}')::public.matching_mode), array[]::public.matching_mode[])
    into v_allowed_modes
    from jsonb_array_elements(p_payload->'allowed_matching_modes') as value;
  else
    v_allowed_modes := array['tap_pairs', 'match_all', 'draw_lines']::public.matching_mode[];
  end if;

  update public.games
  set
    title = trim(p_payload->>'title'),
    description = left(coalesce(p_payload->>'description', ''), 2000),
    visibility = coalesce((p_payload->>'visibility')::public.visibility, visibility),
    matching_mode = coalesce(
      (p_payload->>'matching_mode')::public.matching_mode,
      matching_mode
    ),
    mode_locked = coalesce((p_payload->>'mode_locked')::boolean, mode_locked),
    allowed_matching_modes = v_allowed_modes
  where id = v_game_id;

  delete from public.game_tags where game_id = v_game_id;
  perform public.link_game_tags(v_game_id, p_payload->'tags');

  delete from public.game_people gp
  where gp.game_id = v_game_id
    and gp.id <> all (v_payload_person_ids);

  for v_person in select * from jsonb_array_elements(coalesce(p_payload->'people', '[]'::jsonb))
  loop
    v_person_id := (v_person->>'id')::uuid;

    if exists (select 1 from public.game_people gp where gp.id = v_person_id and gp.game_id = v_game_id) then
      update public.game_people
      set
        name = trim(v_person->>'name'),
        primary_image_url = v_person->>'image_url',
        sort_order = coalesce((v_person->>'sort_order')::int, 0)
      where id = v_person_id and game_id = v_game_id;
    else
      insert into public.game_people (id, game_id, name, primary_image_url, sort_order)
      values (
        v_person_id,
        v_game_id,
        trim(v_person->>'name'),
        v_person->>'image_url',
        coalesce((v_person->>'sort_order')::int, 0)
      );
    end if;
  end loop;

  delete from public.game_relationship_groups where game_id = v_game_id;

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

  return jsonb_build_object('gameId', v_game_id);
end;
$$;

grant execute on function public.get_game_for_edit(text) to authenticated;
grant execute on function public.update_game(text, jsonb) to authenticated;
