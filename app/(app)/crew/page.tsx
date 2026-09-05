import { crewData } from '@/lib/queries'
import { money, initials } from '@/lib/money'
import { CrewActions, PayButton } from './actions'

export const dynamic = 'force-dynamic'
const PAY_LABEL = { day_rate: (r: number) => `${money(r)} / day`, fixed_amount: (r: number) => `${money(r)} / site`, fixed_percent: (r: number) => `${r}% of site income` }

export default async function Crew() {
  const d = await crewData()
  return (
    <div className="lg:max-w-[720px]">
      <div className="flex items-end justify-between">
        <div>
          <div className="serif text-[30px]">Crew</div>
          <div className="label mt-1">Owed now · <span className="text-[var(--own)]">{money(d.owed)}</span></div>
        </div>
        <CrewActions />
      </div>
      <div className="mt-5 flex flex-col gap-2.5">
        {d.workers.map(w => (
          <div key={w.id} className="panel p-[18px]" style={w.active ? undefined : { opacity: .5 }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/12 text-xs text-[var(--fg-2)]">{initials(w.name)}</div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-medium">{w.name}</div>
                <div className="mt-0.5 text-xs text-[var(--muted)]">{PAY_LABEL[w.default_pay](w.default_rate || 0)} · {w.default_pay === 'day_rate' ? `${w.days} ${w.days === 1 ? 'day' : 'days'}` : `${w.sites} ${w.sites === 1 ? 'site' : 'sites'}`}</div>
              </div>
              <PayButton worker={{ id: w.id, name: w.name, owed: w.owed, default_pay: w.default_pay, default_rate: w.default_rate, active: w.active }} sites={d.sites} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/7 pt-3.5">
              <div><div className="label-xs">Earned</div><div className="num mt-1 text-base">{money(w.earned)}</div></div>
              <div><div className="label-xs">Paid</div><div className="num mt-1 text-base text-[var(--muted)]">{money(w.paid)}</div></div>
              <div><div className="label-xs text-[var(--own)]">Owed</div><div className="num mt-1 text-base text-[var(--own)]">{money(w.owed)}</div></div>
            </div>
          </div>
        ))}
        {!d.workers.length && <div className="row px-4 py-6 text-center text-sm text-[var(--muted)]">No crew yet. Add up to four people.</div>}
      </div>
    </div>
  )
}
