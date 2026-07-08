-- Seed demo games (slugs work in URLs: /game/demo/play)

insert into public.tags (id, slug, label) values
  ('22222222-2222-4222-8222-000000000001', 'friend_group', 'Friend group'),
  ('22222222-2222-4222-8222-000000000002', 'singles_mixed', 'Singles mixed'),
  ('22222222-2222-4222-8222-000000000003', 'quick_round', 'Quick round'),
  ('22222222-2222-4222-8222-000000000004', 'reunion', 'Reunion'),
  ('22222222-2222-4222-8222-000000000005', 'long_round', 'Long round'),
  ('22222222-2222-4222-8222-000000000006', 'work_friends', 'Work friends')
on conflict (slug) do nothing;

-- Demo game
insert into public.games (
  id, slug, title, description, visibility, matching_mode, mode_locked, daily_eligible, published_at
) values (
  '11111111-1111-4111-8111-000000000001',
  'demo',
  'Friend Group Classics',
  'Who''s together? Who''s flying solo? Your group, your guesses.',
  'public',
  'tap_pairs',
  false,
  true,
  now()
) on conflict (id) do nothing;

insert into public.game_people (id, game_id, name, primary_image_url, sort_order) values
  ('11111111-1111-4111-8111-000000000101', '11111111-1111-4111-8111-000000000001', 'Alex', 'mock/people/alex.jpg', 0),
  ('11111111-1111-4111-8111-000000000102', '11111111-1111-4111-8111-000000000001', 'Brooke', 'mock/people/brooke.jpg', 1),
  ('11111111-1111-4111-8111-000000000103', '11111111-1111-4111-8111-000000000001', 'Casey', 'mock/people/casey.jpg', 2),
  ('11111111-1111-4111-8111-000000000104', '11111111-1111-4111-8111-000000000001', 'Dev', 'mock/people/dev.jpg', 3)
on conflict (id) do nothing;

insert into public.game_tags (game_id, tag_id)
select '11111111-1111-4111-8111-000000000001', t.id
from public.tags t
where t.slug in ('friend_group', 'singles_mixed', 'quick_round')
on conflict do nothing;

insert into public.game_relationship_groups (id, game_id, group_size) values
  ('33333333-3333-4333-8333-000000000101', '11111111-1111-4111-8111-000000000001', 2),
  ('33333333-3333-4333-8333-000000000102', '11111111-1111-4111-8111-000000000001', 1),
  ('33333333-3333-4333-8333-000000000103', '11111111-1111-4111-8111-000000000001', 1)
on conflict (id) do nothing;

insert into public.game_group_people (group_id, person_id, game_id) values
  ('33333333-3333-4333-8333-000000000101', '11111111-1111-4111-8111-000000000101', '11111111-1111-4111-8111-000000000001'),
  ('33333333-3333-4333-8333-000000000101', '11111111-1111-4111-8111-000000000102', '11111111-1111-4111-8111-000000000001'),
  ('33333333-3333-4333-8333-000000000102', '11111111-1111-4111-8111-000000000103', '11111111-1111-4111-8111-000000000001'),
  ('33333333-3333-4333-8333-000000000103', '11111111-1111-4111-8111-000000000104', '11111111-1111-4111-8111-000000000001')
on conflict do nothing;

-- College reunion
insert into public.games (
  id, slug, title, description, visibility, matching_mode, mode_locked, published_at
) values (
  '11111111-1111-4111-8111-000000000002',
  'college',
  'College Reunion',
  'Eight people, four pairs — like nothing ever changed.',
  'public',
  'match_all',
  true,
  now()
) on conflict (id) do nothing;

insert into public.game_people (id, game_id, name, primary_image_url, sort_order) values
  ('11111111-1111-4111-8111-000000000201', '11111111-1111-4111-8111-000000000002', 'Mia', 'mock/people/mia.jpg', 0),
  ('11111111-1111-4111-8111-000000000202', '11111111-1111-4111-8111-000000000002', 'Noah', 'mock/people/noah.jpg', 1),
  ('11111111-1111-4111-8111-000000000203', '11111111-1111-4111-8111-000000000002', 'Priya', 'mock/people/priya.jpg', 2),
  ('11111111-1111-4111-8111-000000000204', '11111111-1111-4111-8111-000000000002', 'Sam', 'mock/people/sam.jpg', 3),
  ('11111111-1111-4111-8111-000000000205', '11111111-1111-4111-8111-000000000002', 'Jordan', 'mock/people/jordan.jpg', 4),
  ('11111111-1111-4111-8111-000000000206', '11111111-1111-4111-8111-000000000002', 'Riley', 'mock/people/riley.jpg', 5),
  ('11111111-1111-4111-8111-000000000207', '11111111-1111-4111-8111-000000000002', 'Taylor', 'mock/people/taylor.jpg', 6),
  ('11111111-1111-4111-8111-000000000208', '11111111-1111-4111-8111-000000000002', 'Quinn', 'mock/people/quinn.jpg', 7)
on conflict (id) do nothing;

insert into public.game_tags (game_id, tag_id)
select '11111111-1111-4111-8111-000000000002', t.id
from public.tags t where t.slug in ('reunion', 'long_round')
on conflict do nothing;

insert into public.game_relationship_groups (id, game_id, group_size) values
  ('33333333-3333-4333-8333-000000000201', '11111111-1111-4111-8111-000000000002', 2),
  ('33333333-3333-4333-8333-000000000202', '11111111-1111-4111-8111-000000000002', 2),
  ('33333333-3333-4333-8333-000000000203', '11111111-1111-4111-8111-000000000002', 2),
  ('33333333-3333-4333-8333-000000000204', '11111111-1111-4111-8111-000000000002', 2)
on conflict (id) do nothing;

insert into public.game_group_people (group_id, person_id, game_id) values
  ('33333333-3333-4333-8333-000000000201', '11111111-1111-4111-8111-000000000201', '11111111-1111-4111-8111-000000000002'),
  ('33333333-3333-4333-8333-000000000201', '11111111-1111-4111-8111-000000000202', '11111111-1111-4111-8111-000000000002'),
  ('33333333-3333-4333-8333-000000000202', '11111111-1111-4111-8111-000000000203', '11111111-1111-4111-8111-000000000002'),
  ('33333333-3333-4333-8333-000000000202', '11111111-1111-4111-8111-000000000204', '11111111-1111-4111-8111-000000000002'),
  ('33333333-3333-4333-8333-000000000203', '11111111-1111-4111-8111-000000000205', '11111111-1111-4111-8111-000000000002'),
  ('33333333-3333-4333-8333-000000000203', '11111111-1111-4111-8111-000000000206', '11111111-1111-4111-8111-000000000002'),
  ('33333333-3333-4333-8333-000000000204', '11111111-1111-4111-8111-000000000207', '11111111-1111-4111-8111-000000000002'),
  ('33333333-3333-4333-8333-000000000204', '11111111-1111-4111-8111-000000000208', '11111111-1111-4111-8111-000000000002')
on conflict do nothing;

-- Office party
insert into public.games (
  id, slug, title, description, visibility, matching_mode, mode_locked, published_at
) values (
  '11111111-1111-4111-8111-000000000003',
  'office',
  'Office Party',
  'Small crew after hours. Two couples walked in — who?',
  'unlisted',
  'tap_pairs',
  true,
  now()
) on conflict (id) do nothing;

insert into public.game_people (id, game_id, name, primary_image_url, sort_order) values
  ('11111111-1111-4111-8111-000000000301', '11111111-1111-4111-8111-000000000003', 'Chris', 'mock/people/chris.jpg', 0),
  ('11111111-1111-4111-8111-000000000302', '11111111-1111-4111-8111-000000000003', 'Dana', 'mock/people/dana.jpg', 1),
  ('11111111-1111-4111-8111-000000000303', '11111111-1111-4111-8111-000000000003', 'Eli', 'mock/people/eli.jpg', 2),
  ('11111111-1111-4111-8111-000000000304', '11111111-1111-4111-8111-000000000003', 'Faye', 'mock/people/faye.jpg', 3)
on conflict (id) do nothing;

insert into public.game_tags (game_id, tag_id)
select '11111111-1111-4111-8111-000000000003', t.id
from public.tags t where t.slug in ('work_friends', 'quick_round')
on conflict do nothing;

insert into public.game_relationship_groups (id, game_id, group_size) values
  ('33333333-3333-4333-8333-000000000301', '11111111-1111-4111-8111-000000000003', 2),
  ('33333333-3333-4333-8333-000000000302', '11111111-1111-4111-8111-000000000003', 2)
on conflict (id) do nothing;

insert into public.game_group_people (group_id, person_id, game_id) values
  ('33333333-3333-4333-8333-000000000301', '11111111-1111-4111-8111-000000000301', '11111111-1111-4111-8111-000000000003'),
  ('33333333-3333-4333-8333-000000000301', '11111111-1111-4111-8111-000000000304', '11111111-1111-4111-8111-000000000003'),
  ('33333333-3333-4333-8333-000000000302', '11111111-1111-4111-8111-000000000302', '11111111-1111-4111-8111-000000000003'),
  ('33333333-3333-4333-8333-000000000302', '11111111-1111-4111-8111-000000000303', '11111111-1111-4111-8111-000000000003')
on conflict do nothing;

-- Daily challenge (upsert today → demo)
insert into public.daily_challenges (date, game_id)
values (current_date, '11111111-1111-4111-8111-000000000001')
on conflict (date) do update set game_id = excluded.game_id;
