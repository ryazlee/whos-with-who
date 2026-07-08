-- Storage for game person photos + publish_game RPC

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'game-images',
  'game-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set public = excluded.public;

create policy "game_images_public_read"
  on storage.objects for select
  using (bucket_id = 'game-images');

create policy "game_images_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'game-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "game_images_auth_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'game-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

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

  insert into public.games (
    id, slug, creator_id, title, description, visibility,
    matching_mode, mode_locked, published_at
  )
  values (
    v_game_id,
    v_slug,
    v_user_id,
    trim(p_payload->>'title'),
    coalesce(p_payload->>'description', ''),
    coalesce((p_payload->>'visibility')::public.visibility, 'public'),
    coalesce((p_payload->>'matching_mode')::public.matching_mode, 'tap_pairs'),
    coalesce((p_payload->>'mode_locked')::boolean, false),
    now()
  );

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
