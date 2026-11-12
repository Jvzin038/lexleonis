drop policy if exists "anyone create" on public.contact_message;
create policy "anyone create" on public.contact_message for insert to anon, authenticated
with check (
  length(btrim(coalesce(name, ''))) between 1 and 120
  and length(btrim(coalesce(email, ''))) between 3 and 255
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(btrim(coalesce(message, ''))) between 1 and 5000
  and length(coalesce(subject, '')) <= 200
  and length(coalesce(phone, '')) <= 40
  and coalesce(status, 'new') = 'new'
  and admin_note is null
);