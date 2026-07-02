create or replace function log_revision() returns trigger as $$
declare
  changed jsonb := '{}'::jsonb;
  key text;
begin
  for key in select jsonb_object_keys(to_jsonb(new)) loop
    if to_jsonb(old) -> key is distinct from to_jsonb(new) -> key then
      changed := changed || jsonb_build_object(key, jsonb_build_object(
        'from', to_jsonb(old) -> key, 'to', to_jsonb(new) -> key
      ));
    end if;
  end loop;
  if changed <> '{}'::jsonb then
    insert into revision_log (table_name, record_id, changed_fields, changed_by)
    values (TG_TABLE_NAME, new.id, changed, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer;

do $$
declare t text;
begin
  foreach t in array array['trajetoria_items','projects','albuns','ideas','news','events'] loop
    execute format('create trigger %1$I_revision after update on %1$I
      for each row execute function log_revision()', t);
  end loop;
end $$;
