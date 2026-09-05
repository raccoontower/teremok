import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">сентябрь 2026</p>
        <h1 className="mt-2 text-3xl font-semibold">Учёт</h1>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Доход','—'],['Своё','—'],['Зарплаты','—'],['Прибыль','—']].map(([k,v]) => (
          <div key={k} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="text-xs text-[var(--muted)]">{k}</div>
            <div className="num mt-1 text-2xl font-semibold">{v}</div>
          </div>
        ))}
      </div>
      <p className="text-sm text-[var(--muted)]">Цифры появятся после подключения базы.</p>
      <Link href="/add" className="inline-block rounded-full bg-white px-6 py-3 font-medium text-black">+ Расход</Link>
    </div>
  )
}
