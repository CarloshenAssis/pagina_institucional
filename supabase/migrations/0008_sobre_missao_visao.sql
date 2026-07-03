-- Missão/Visão não existiam em lugar nenhum (nem schema, nem admin, nem público).
alter table sobre add column mission_text text;
alter table sobre add column vision_text text;
