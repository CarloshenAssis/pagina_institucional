-- Buckets de mídia. public-videos é desvio do spec original (vídeo era só
-- link externo): upload direto habilitado para vídeos curtos (≤50MB, teto
-- por arquivo do plano free). Vídeos longos continuam via link YouTube/Vimeo.
insert into storage.buckets (id, name, public) values
  ('public-images', 'public-images', true),
  ('public-pdfs', 'public-pdfs', true),
  ('public-videos', 'public-videos', true),
  ('private-assets', 'private-assets', false);

create policy "public_images_read" on storage.objects for select using (bucket_id = 'public-images');
create policy "public_images_write" on storage.objects for insert with check (bucket_id = 'public-images' and auth.role() = 'authenticated');
create policy "public_pdfs_read" on storage.objects for select using (bucket_id = 'public-pdfs');
create policy "public_pdfs_write" on storage.objects for insert with check (bucket_id = 'public-pdfs' and auth.role() = 'authenticated');
create policy "public_videos_read" on storage.objects for select using (bucket_id = 'public-videos');
create policy "public_videos_write" on storage.objects for insert with check (bucket_id = 'public-videos' and auth.role() = 'authenticated');
create policy "private_assets_all" on storage.objects for all using (bucket_id = 'private-assets' and auth.role() = 'authenticated') with check (bucket_id = 'private-assets' and auth.role() = 'authenticated');
