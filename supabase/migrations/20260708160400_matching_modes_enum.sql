-- Add draw_lines matching mode (must be committed before use in next migration)

alter type public.matching_mode add value if not exists 'draw_lines';
