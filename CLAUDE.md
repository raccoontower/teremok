@AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Осторожно с базой

Локальный `npx next start` работает с **той же боевой базой Supabase**, что
и teremok.live: отдельного окружения нет. Владелец пользуется приложением
каждый день, поэтому:

- не сеять тестовые данные; если без них никак — помечать каждую запись
  `entered_by=<метка>` и удалять сразу после проверки;
- перед удалением чего-либо сверяться, что запись твоя, а не его;
- деструктивные запросы — только с фильтром по своей метке, никогда
  `delete` по всей таблице.

## Правки разметки

Замены в `.tsx` делать только с проверкой, что якорь найден (`assert old in s`).
Один раз правка молча прошла мимо: строка изменилась после сплошной замены
скруглений, блок не вставился, и владелец увидел на проде экран без нового
функционала.
