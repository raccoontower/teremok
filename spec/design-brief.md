# Design brief — Teremok (промпт для Claude Design)

Скопировать целиком в Claude Design как первое сообщение. Ниже — дословный промпт.

---

Design a mobile-first web app called **Teremok** — a private money tracker for a
small US telecom-construction crew (cell towers). One owner uses it, mostly
**on a phone, on a job site, often in bright sun, with gloves half off**. It
replaces a spreadsheet and a folder of paper receipts. The tone is calm,
premium, dark. Think Linear × Mercury × the Instrument Serif dark-glass
landing style: black background, glass panels with a faint lit edge, big
tabular numbers, one accent color, lots of air. Beautiful is required — but
every wow moment must make a number easier to read, not harder.

## The one idea the whole design must express

Money in this business comes in two colors, and confusing them is the
costliest mistake:

- **Reimbursable** (green): Home Depot, electrical supply, materials. The
  crew pays now, the general contractor (GC) pays it back later. It is NOT an
  expense — it never reduces profit — but it MUST be logged with a receipt
  photo, because that's what gets sent to the GC to get the money back.
- **Own** (amber): Amazon, hotels, flights, fuel, insurance, tool rental,
  crew wages. Real cost. Reduces profit and is split 50/50 with one partner.

Every screen that shows money must make the two visually unmistakable
without reading a label: color, position, or shape. Profit is always
computed from **own** only. Reimbursable sits beside it like a "waiting to
come back" pile, never mixed in.

## Primary flow (must be the fastest thing in the app)

**Add expense from a receipt photo, ≤10 seconds, one thumb.**
1. Big camera button on the home screen (bottom, thumb zone).
2. Take photo → AI reads vendor, total, date, line items → screen shows
   them already filled, with the kind (reimbursable/own) pre-guessed from
   the vendor and a site pre-guessed from today's schedule.
3. One tap **Save**. Wrong guess → tap the pill to flip kind, tap site to
   change. Never a blank form as the default.
Design the "reading the receipt" moment as the wow: the photo, a scan
sweep, fields resolving into place with tabular numbers ticking up. Then a
crisp confirmation that shows *which pile* the money went to.

Manual entry (Amazon, hotel, flights) is a secondary path: same fields,
no photo, three taps.

## Screens

1. **Home** — this month: Income, Own expenses, Wages, **Profit**, and beside
   them, visibly separate, **Reimbursable outstanding** (what the GC still owes).
   Below: recent entries as a feed, each with kind color, vendor, amount,
   site, tiny receipt thumbnail. Sticky camera button.
2. **Add expense** — the flow above.
3. **Sites (towers)** — list of job sites with status (planned / active /
   done / invoiced / paid) and per-site: income, own, wages, profit,
   reimbursable, and a "GC report" button. Site detail = same numbers +
   timeline of entries + who worked which days.
4. **Crew & wages** — up to 4 workers. Each has pay type: day rate, fixed
   amount per site, or % of site income. Show days worked (from schedule),
   what's earned, what's paid, what's owed.
5. **Schedule** — week view, who is on which site each day. Tap a day to
   assign. This feeds day-rate wages and the site pre-guess when adding
   expenses.
6. **Partner split** — per site and per month: income − own − wages =
   profit, each partner's half, what's already paid out, what's owed.
   Reimbursable shown separately and explicitly excluded.
7. **GC report** — for one site and period: the list of reimbursable
   purchases with date, vendor, amount and receipt photo, plus a total.
   One button: export PDF / share link. This is the thing the owner today
   assembles by hand.
8. **Login** — a single password field, nothing else. One user.

## Visual system

- Background #07090d, panels #0e1218, hairline borders at 8% white, text
  #eef1f5, muted #8a93a3. Accent for actions: #2a73e8.
- Semantic colors carry meaning only: reimbursable #34d17d, own #f2b134.
  No other saturated color anywhere.
- Type: a clean sans for UI, **tabular numerals everywhere money appears**,
  large sizes for totals (28–40px on phone).
- Glass: near-transparent panels with a 1px gradient edge lit at top,
  subtle grain, no drop shadows. Motion only where it explains: numbers
  count, the receipt scan sweep, kind pill flipping color.
- Touch targets ≥ 44px. Bottom sheet for pickers. Thumb-zone primary
  actions. Test at 390×844 first; desktop is a wider version, not a
  different product.
- Dark only. High contrast: this is used outdoors.

## Constraints

- English UI (crew and GC are US); labels short, jobsite vocabulary
  (site, GC, day rate), no accounting jargon.
- Never show reimbursable inside profit math, even in charts.
- Receipt photo is a first-class object: visible thumbnails, full-screen
  viewer, always attached to the GC report.
- No onboarding, no empty-state illustrations with mascots. Empty state =
  the camera button and one line.

Deliver: home, add-expense (three states: camera → reading → confirm),
site detail, partner split, GC report, login. Phone first at 390 wide;
one desktop variant of home.
