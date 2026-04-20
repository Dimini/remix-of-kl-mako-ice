insert into storage.buckets (id, name, public)
values ('candidate-programs', 'candidate-programs', false)
on conflict (id) do nothing;

create policy "Reviewers read program PDFs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'candidate-programs'
  and (has_role(auth.uid(), 'reviewer') or has_role(auth.uid(), 'admin'))
);

create policy "Reviewers upload program PDFs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'candidate-programs'
  and (has_role(auth.uid(), 'reviewer') or has_role(auth.uid(), 'admin'))
);

create policy "Reviewers update program PDFs"
on storage.objects for update
to authenticated
using (
  bucket_id = 'candidate-programs'
  and (has_role(auth.uid(), 'reviewer') or has_role(auth.uid(), 'admin'))
);

create policy "Reviewers delete program PDFs"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'candidate-programs'
  and (has_role(auth.uid(), 'reviewer') or has_role(auth.uid(), 'admin'))
);