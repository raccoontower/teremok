# STATUS — teremok

Обновлено: 2026-09-05

## Что это

Учёт телеком-стройки на **teremok.live** (старая доска объявлений снесена).
Спека — `spec/crm.md`, дизайн-бриф — `spec/design-brief.md`, макет —
Claude Design «Teremok» (реализован целиком). Код в корне репозитория
`raccoontower/teremok`, Vercel деплоит `main` сам.

## Работает (проверено локально в браузере на 390×844 и 1280)

- **Вход** — один пароль (`APP_PASSWORD`), cookie на 30 дней, `proxy.ts`.
- **Home** — прибыль месяца = доход − своё − зарплаты; отдельно «Reimbursable
  outstanding» (все чеки, которые GC ещё не вернул). Переключатель месяца.
- **Add** — камера → чтение (Gemini) → подтверждение → Save; вид расхода
  переключается тапом, объект подставляется из расписания на сегодня;
  ручной ввод для Amazon/отелей. Чек — в бакет `receipts`.
- **Sites** — список с прибылью и висящим reimbursable; объект: статус,
  доход от GC, кто работал (дни, заработано), лента, кнопка GC report.
- **Crew** — до 4 человек; day rate / фикс за объект / % от дохода объекта;
  «заработано» считается из расписания, «выплачено» — из `payroll`.
- **Week** — неделя, тап по дню → объект + состав.
- **Partner split** — по месяцу и за всё время; выплаты партнёрам.
- **GC report** — reimbursable по объекту с чеками; Export PDF (печать),
  Share link (подписанная ссылка без логина на 30 дней, `/share/<token>`),
  «GC paid this back» → снимает с outstanding.
- Десктоп: сайдбар, главная в две колонки.

## Подключения

- Ключи: `~/projects/env/teremok.env` (Supabase, APP_*, теперь и GEMINI_API_KEY).
- В Vercel должны стоять: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `GEMINI_API_KEY`,
  `APP_SECRET`, `APP_PASSWORD` — владелец поставил, редеплой сделан.
- База — только через пулер `aws-0-us-west-2.pooler.supabase.com:6543`;
  миграции `.venv-db/bin/python` + psycopg, файлы `supabase/migrations/`
  (0001 схема, 0002 выплаты + `expenses.reimbursed_on`).
- Локальная проверка: `npx next start -p 3123`, скриншоты — playwright из
  BuildRight-Academy-v2.

## Не работает — домен

**teremok.live не открывается ниоткуда.** DNS у Hostinger (dns-parking.com)
отдаёт на apex A `18.204.152.241` (мёртвый EC2 старого сайта), при этом
резолверы Google/Cloudflare получают от того же Hostinger `216.198.79.1`
(Vercel) — их анкаст несогласован. Vercel на SNI `teremok.live` вешает
TLS-рукопожатие: сертификат не выпущен, домен не проверен. Что делать
владельцу — в JOURNAL за 2026-09-05. Проще всего перевести NS домена на
`ns1.vercel-dns.com` / `ns2.vercel-dns.com`.

## Дальше

- Проверить прод после починки DNS: вход, чек, сохранение.
- Пересылка чеков письмом (Amazon, билеты) — фаза 3 спеки.
- Правка/удаление записи из ленты (API `PATCH/DELETE /api/expenses/[id]`
  уже есть, экрана нет).
