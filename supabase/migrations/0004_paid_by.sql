-- Кто фактически заплатил. Владелец покупает почти всё со своей карты, и это
-- не «просто расход»: он вложил свои деньги в общее дело, поэтому партнёр
-- обязан вернуть ему свою долю. Без этой колонки делёж занижает его позицию
-- ровно на половину всего, что он оплатил лично.
alter table partners add column is_owner boolean not null default false;
alter table expenses add column paid_by uuid references partners(id);
alter table payroll  add column paid_by uuid references partners(id);
create index on expenses (paid_by);

-- Реальные имена вместо заглушек.
update partners set name = 'Yauheni Butko',      is_owner = true  where name = 'Eugene';
update partners set name = 'Aliaksandr Shubich', is_owner = false where name = 'Partner';

-- Всё, что уже внесено, оплачено владельцем — других плательщиков не было.
update expenses set paid_by = (select id from partners where is_owner) where paid_by is null;
update payroll  set paid_by = (select id from partners where is_owner) where paid_by is null;
