-- saveSettings faz UPDATE (não upsert) por chave — sem essa linha existir,
-- o campo novo nunca seria salvo pelo admin.
insert into global_settings (key, value) values ('google_site_verification', null);
