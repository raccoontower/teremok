-- История выгрузок. Владелец отдаёт отчёты управляющей компании кусками по
-- датам, и главный вопрос при следующей отправке — «а за что я уже
-- отчитывался». Поэтому пишем каждую выгрузку: что, за какой период, на
-- какую сумму.
create table report_exports (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('gc', 'partner', 'link')),
  site_id     uuid references sites(id) on delete cascade,
  period_from date,
  period_to   date,
  format      text,                       -- csv, txt, link
  item_count  integer,
  total       numeric(12,2),
  created_at  timestamptz not null default now()
);
create index on report_exports (site_id, created_at desc);
