-- Game description + custom tags on publish and update

create or replace function public.link_game_tags(p_game_id uuid, p_tags jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tag jsonb;
  v_tag_slug text;
  v_tag_label text;
  v_tag_id uuid;
begin
  for v_tag in select * from jsonb_array_elements(coalesce(p_tags, '[]'::jsonb))
  loop
    v_tag_slug := lower(
      regexp_replace(
        trim(coalesce(v_tag->>'slug', v_tag #>> '{}')),
        '[^a-z0-9]+',
        '_',
        'g'
      )
    );
    v_tag_slug := trim(both '_' from v_tag_slug);

    if v_tag_slug = '' or length(v_tag_slug) < 2 then
      continue;
    end if;

    v_tag_slug := left(v_tag_slug, 40);
    v_tag_label := coalesce(
      nullif(trim(v_tag->>'label'), ''),
      initcap(replace(v_tag_slug, '_', ' '))
    );

    insert into public.tags (slug, label)
    values (v_tag_slug, v_tag_label)
    on conflict (slug) do update set label = excluded.label;

    select t.id into v_tag_id from public.tags t where t.slug = v_tag_slug;

    insert into public.game_tags (game_id, tag_id)
    values (p_game_id, v_tag_id)
    on conflict do nothing;
  end loop;
end;
$$;

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
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if coalesce(trim(p_payload->>'title'), '') = '' then
    raise exception 'Title is required';
  end if;

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
    id, slug, creator_id, title, description, visibility,
    matching_mode, mode_locked, allowed_matching_modes, published_at
  )
  values (
    v_game_id,
    v_slug,
    v_user_id,
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

create or replace function public.update_game_details(
  p_game_ref text,
  p_description text,
  p_tags jsonb
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
  set description = left(coalesce(p_description, ''), 2000)
  where id = v_game_id;

  delete from public.game_tags where game_id = v_game_id;
  perform public.link_game_tags(v_game_id, p_tags);

  return jsonb_build_object('gameId', v_game_id);
end;
$$;

grant execute on function public.update_game_details(text, text, jsonb) to authenticated;
