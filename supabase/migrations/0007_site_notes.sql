-- Заметки по объекту. Не одно поле, а журнал с датами: бригада уезжает на
-- выходные, и в понедельник важно не «последнее состояние», а что именно и
-- когда оставили. Фото по той же причине — снял, как оставил, и не
-- вспоминаешь.
create table site_notes (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references sites(id) on delete cascade,
  body       text not null,
  photo_path text,
  created_at timestamptz not null default now()
);
create index on site_notes (site_id, created_at desc);
