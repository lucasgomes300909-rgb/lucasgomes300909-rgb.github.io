-- Public marketing images; only the store administrator may modify files.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('studio-banners','studio-banners',true,8000000,array['image/webp']) on conflict(id) do nothing;
create policy studio_banner_admin on storage.objects for all to authenticated
using (bucket_id='studio-banners' and public.studio_is_admin())
with check (bucket_id='studio-banners' and public.studio_is_admin());
