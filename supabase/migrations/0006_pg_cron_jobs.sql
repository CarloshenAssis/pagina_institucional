create extension if not exists pg_cron;

-- Vira agendado -> publicado quando scheduled_at passa, a cada 5 minutos.
create or replace function publish_scheduled_content() returns void as $$
declare t text;
begin
  foreach t in array array['trajetoria_items','projects','albuns','ideas','news','events'] loop
    execute format($f$update %1$I set status = 'publicado', published_at = now()
      where status = 'agendado' and scheduled_at <= now()$f$, t);
  end loop;
end;
$$ language plpgsql security definer;

select cron.schedule('publish-scheduled-content', '*/5 * * * *',
  'select publish_scheduled_content();');

-- Apaga definitivamente registros na lixeira há mais de 30 dias, diário às 03:00.
create or replace function purge_trash() returns void as $$
declare t text;
begin
  foreach t in array array['trajetoria_items','projects','albuns','ideas','news','events','media_library','contact_messages'] loop
    execute format($f$delete from %1$I where deleted_at is not null and deleted_at < now() - interval '30 days'$f$, t);
  end loop;
end;
$$ language plpgsql security definer;

select cron.schedule('purge-trash', '0 3 * * *', 'select purge_trash();');

-- Limpeza da tabela de rate limit, diário às 03:10.
select cron.schedule('purge-rate-limit', '10 3 * * *',
  $$delete from contact_rate_limit where submitted_at < now() - interval '24 hours'$$);
