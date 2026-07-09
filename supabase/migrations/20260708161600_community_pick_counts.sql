-- Include raw pick counts in community stats (alongside percent).

create or replace function public.community_stats_for_game(p_game_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with counts as (
    select
      gaa.person_id,
      gaa.selected_partner_id,
      count(*)::int as cnt
    from public.game_attempt_answers gaa
    join public.game_attempts ga on ga.id = gaa.attempt_id
    where ga.game_id = p_game_id
    group by gaa.person_id, gaa.selected_partner_id
  ),
  totals as (
    select person_id, sum(cnt)::int as total from counts group by person_id
  ),
  pick_rows as (
    select
      c.person_id,
      c.selected_partner_id as partner_id,
      c.cnt,
      round(100.0 * c.cnt / greatest(t.total, 1))::int as pct
    from counts c
    join totals t on t.person_id = c.person_id
  ),
  per_person as (
    select
      pr.person_id,
      jsonb_agg(
        jsonb_build_object(
          'partnerId', pr.partner_id,
          'percent', pr.pct,
          'count', pr.cnt
        )
        order by pr.cnt desc, pr.partner_id nulls last
      ) as picks
    from pick_rows pr
    group by pr.person_id
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'personId', gp.id,
        'picks', coalesce(pp.picks, '[]'::jsonb),
        'topPartnerId', pp.picks->0->'partnerId',
        'topPercent', coalesce((pp.picks->0->>'percent')::int, 0),
        'singlePercent', coalesce(
          (
            select (elem->>'percent')::int
            from jsonb_array_elements(coalesce(pp.picks, '[]'::jsonb)) elem
            where elem->'partnerId' = 'null'::jsonb
            limit 1
          ),
          0
        )
      )
      order by gp.sort_order
    ),
    '[]'::jsonb
  )
  from public.game_people gp
  join totals t on t.person_id = gp.id
  left join per_person pp on pp.person_id = gp.id
  where gp.game_id = p_game_id;
$$;
