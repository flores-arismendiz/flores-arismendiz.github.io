insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wedding-media', 'wedding-media', true, 20971520, array['audio/mpeg'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can listen to wedding music" on storage.objects;
create policy "Public can listen to wedding music"
  on storage.objects for select to public
  using (bucket_id = 'wedding-media');

drop policy if exists "Users upload their own wedding music" on storage.objects;
create policy "Users upload their own wedding music"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'wedding-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users update their own wedding music" on storage.objects;
create policy "Users update their own wedding music"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'wedding-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'wedding-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users delete their own wedding music" on storage.objects;
create policy "Users delete their own wedding music"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'wedding-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
