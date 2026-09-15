-- Закрыть таблицы от публичного доступа.
--
-- Supabase прислал критическое предупреждение: RLS выключен на всех десяти
-- таблицах. Это значит, что любой, у кого есть адрес проекта и публичный ключ,
-- читает и правит через PostgREST всю финансовую историю — расходы, доходы,
-- зарплаты, расчёты с партнёром.
--
-- В `lib/db.ts` стояло объяснение, почему RLS «на этом этапе не нужен»:
-- приложение закрытое, доступ только через свои API-роуты. Рассуждение
-- неверное. Закрытость приложения ничего не решает: PostgREST торчит наружу
-- независимо от него, а публичный ключ на то и публичный — он лежит в панели
-- Supabase и в переменных Vercel и рано или поздно окажется где-то ещё.
--
-- Политик не добавляем намеренно. Приложение ходит в базу ТОЛЬКО секретным
-- ключом с сервера (`import 'server-only'`, `SUPABASE_SECRET_KEY`), а роль
-- service_role обходит RLS целиком. Поэтому «RLS включён, политик нет» —
-- это ровно «изнутри всё работает, снаружи не видно ничего».
--
-- Если когда-нибудь появится доступ с клиента, политики надо будет написать
-- ЯВНО, а не отключать RLS обратно.
--
-- Применять ВРУЧНУЮ в Supabase SQL Editor. Безопасно повторять.

alter table expenses        enable row level security;
alter table income          enable row level security;
alter table partner_payouts enable row level security;
alter table partners        enable row level security;
alter table payroll         enable row level security;
alter table report_exports  enable row level security;
alter table schedule        enable row level security;
alter table site_notes      enable row level security;
alter table sites           enable row level security;
alter table workers         enable row level security;
