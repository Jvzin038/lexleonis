create policy "admin read profiles" on public.profiles for select to authenticated using (public.is_admin());
create policy "admin read roles" on public.user_roles for select to authenticated using (public.is_admin());

-- Atomic conditional update used by server-side order/ticket logic (stock and lot counters).
create or replace function public.entity_update_many(t text, filter jsonb, set_values jsonb, inc_values jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare
  w text := 'true';
  s text := 'updated_date = now()';
  k text; v jsonb; op text; ov jsonb; n integer;
begin
  for k, v in select * from jsonb_each(coalesce(filter,'{}'::jsonb)) loop
    if jsonb_typeof(v) = 'object' then
      for op, ov in select * from jsonb_each(v) loop
        w := w || format(' and %I %s %L', k,
          case op when '$gte' then '>=' when '$gt' then '>' when '$lte' then '<=' when '$lt' then '<' when '$ne' then 'is distinct from' else '=' end,
          ov #>> '{}');
      end loop;
    elsif jsonb_typeof(v) = 'null' then
      w := w || format(' and %I is null', k);
    else
      w := w || format(' and %I = %L', k, v #>> '{}');
    end if;
  end loop;
  for k, v in select * from jsonb_each(coalesce(set_values,'{}'::jsonb)) loop
    s := s || format(', %I = (jsonb_populate_record(null::public.%I, jsonb_build_object(%L, %L::jsonb))).%I', k, t, k, v::text, k);
  end loop;
  for k, v in select * from jsonb_each(coalesce(inc_values,'{}'::jsonb)) loop
    s := s || format(', %I = coalesce(%I,0) + %s', k, k, (v #>> '{}')::numeric);
  end loop;
  execute format('update public.%I set %s where %s', t, s, w);
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.entity_update_many(text, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.entity_update_many(text, jsonb, jsonb, jsonb) to service_role;