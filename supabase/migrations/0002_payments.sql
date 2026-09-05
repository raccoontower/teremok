-- Выплаты и возмещение. См. spec/crm.md, экраны Crew / Partner split / GC report.
--
-- payroll становится журналом выплат бригаде: «заработано» приложение считает
-- живьём из расписания и ставки работника, а здесь лежит только то, что
-- реально выдано на руки. Поэтому объект и тип оплаты у выплаты необязательны.
alter table payroll alter column site_id drop not null;
alter table payroll alter column pay_type drop not null;

-- Выплаты партнёрам из прибыли: «взял себе» / «отдал партнёру».
create table partner_payouts (
  id          uuid primary key default gen_random_uuid(),
  partner_id  uuid not null references partners(id),
  site_id     uuid references sites(id) on delete set null,
  paid_on     date not null default current_date,
  amount      numeric(12,2) not null check (amount > 0),
  note        text
);

-- Когда GC вернул деньги за чек. Пока null — сумма висит в «reimbursable outstanding».
alter table expenses add column reimbursed_on date;
create index on expenses (kind, reimbursed_on);
