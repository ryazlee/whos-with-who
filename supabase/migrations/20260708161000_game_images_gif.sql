-- Allow animated GIF uploads for game person photos.

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'game-images';
