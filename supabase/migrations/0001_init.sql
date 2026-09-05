-- Учёт телеком-стройки. См. spec/crm.md.
--
-- Сердце схемы — expenses.kind: 'reimbursable' (Home Depot, материалы: вернёт
-- управляющая компания, в прибыль не входит, идёт в отчёт с чеком) и 'own'
-- (Amazon, отели, бензин, страховки: наш расход, входит в делёж). Третьего
-- вида нет намеренно: он размыл бы главное разделение.

create extension if not exists "pgcrypto";

create type expense_kind as enum ('reimbursable', 'own');
create type pay_type as enum ('day_rate', 'fixed_amount', 'fixed_percent');
create type site_status as enum ('planned', 'active', 'done', 'invoiced', 'paid');

-- Объекты: вышки, площадки. Центр учёта: всё привязано к объекту.
create table sites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  gc_company  text,                       -- управляющая компания, кому идёт отчёт
  status      site_status not null default 'planned',
  starts_on   date,
  ends_on     date,
  notes       text,
  created_at  timestamptz not null default now()
);

-- Два партнёра, 50/50. Таблица, а не константа: доли могут измениться.
create table partners (
  id     uuid primary key default gen_random_uuid(),
  name   text not null,
  share  numeric(5,4) not null check (share > 0 and share <= 1)
);

-- Бригада до четырёх человек. Способ оплаты по умолчанию, на объекте
-- переопределяется в payroll.
create table workers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text,
  default_pay   pay_type not null default 'day_rate',
  default_rate  numeric(12,2),
  active        boolean not null default true
);

-- Расходы. Чек хранится — для reimbursable он обязателен в отчёте GC.
create table expenses (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid references sites(id) on delete set null,
  spent_on     date not null default current_date,
  amount       numeric(12,2) not null check (amount >= 0),
  kind         expense_kind not null,
  category     text not null,             -- materials, fuel, hotel, tickets, insurance, rental, amazon, other
  vendor       text,                       -- Home Depot, Amazon, ...
  receipt_path text,                       -- файл в storage
  note         text,
  entered_by   text,
  ocr_json     jsonb,                      -- что распознала модель, для проверки
  created_at   timestamptz not null default now()
);
create index on expenses (site_id, spent_on);
create index on expenses (kind, spent_on);

-- Зарплата: own-расход объекта, входит в делёж. Дни для day_rate берутся из
-- расписания на момент расчёта, но сумма фиксируется здесь — история не должна
-- меняться задним числом, если расписание поправят.
create table payroll (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  worker_id   uuid not null references workers(id),
  pay_type    pay_type not null,
  rate        numeric(12,2),               -- ставка в день, сумма, или процент (0-100)
  days        integer,                     -- для day_rate
  amount      numeric(12,2) not null,      -- итог, зафиксирован
  period_from date,
  period_to   date,
  paid_on     date,
  note        text
);

-- Что заплатила управляющая компания по объекту.
create table income (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  received_on date not null,
  amount      numeric(12,2) not null,
  note        text
);

-- Расписание: кто на каком объекте в какой день. Даёт дни для дневного рейта
-- и подстановку объекта при вводе расхода.
create table schedule (
  site_id    uuid not null references sites(id) on delete cascade,
  worker_id  uuid not null references workers(id) on delete cascade,
  work_day   date not null,
  primary key (worker_id, work_day)        -- один человек — один объект в день
);
create index on schedule (site_id, work_day);

-- Итог по объекту: прибыль считается без reimbursable — это не наши деньги.
create view site_totals as
select
  s.id, s.name, s.status,
  coalesce(i.total, 0)                                   as income,
  coalesce(e_own.total, 0)                               as own_expenses,
  coalesce(e_reimb.total, 0)                             as reimbursable,
  coalesce(p.total, 0)                                   as payroll,
  coalesce(i.total,0) - coalesce(e_own.total,0) - coalesce(p.total,0) as profit
from sites s
left join (select site_id, sum(amount) total from income  group by site_id) i      on i.site_id = s.id
left join (select site_id, sum(amount) total from expenses where kind='own'          group by site_id) e_own   on e_own.site_id = s.id
left join (select site_id, sum(amount) total from expenses where kind='reimbursable' group by site_id) e_reimb on e_reimb.site_id = s.id
left join (select site_id, sum(amount) total from payroll  group by site_id) p      on p.site_id = s.id;

insert into partners (name, share) values ('Eugene', 0.5), ('Partner', 0.5);
