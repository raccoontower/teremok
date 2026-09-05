'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { money, today } from '@/lib/money'
import { Sheet, SheetRow, STATUS, flash } from '@/components/ui'

type Guess = { vendor: string | null; total: number | null; spent_on: string | null; kind: 'reimbursable' | 'own'; category: string; confidence: string; items: { name: string; amount: number | null }[] }
type Props = { sites: { id: string; name: string; status: string }[]; guess: string | null; fromSchedule: boolean; partners: { id: string; name: string; is_owner: boolean }[] }
const CATS = ['materials', 'fuel', 'hotel', 'tickets', 'rental', 'insurance', 'amazon', 'food', 'other']

/** Главный сценарий: камера → чтение → подтверждение, ≤10 секунд одним
 *  пальцем. Пока модель читает чек, экран показывает скан и раскрывает поля
 *  по мере «прогресса» — прогресс условный, но ответ приходит за 3–6 с,
 *  и поля успевают появиться к его приходу. */
export function AddFlow({ sites, guess, fromSchedule, partners }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'camera' | 'reading' | 'confirm'>('camera')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prog, setProg] = useState(0)
  const [g, setG] = useState<Guess | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sheet, setSheet] = useState<'site' | 'cat' | 'payer' | null>(null)
  // по умолчанию платит владелец — так почти всегда и есть
  const [payer, setPayer] = useState(partners.find(p => p.is_owner)?.id || '')
  const [viewer, setViewer] = useState(false)
  const [site, setSite] = useState(guess || '')
  // редактируемые поля подтверждения
  const [vendor, setVendor] = useState(''); const [total, setTotal] = useState(''); const [date, setDate] = useState(today())
  const [kind, setKind] = useState<'reimbursable' | 'own'>('reimbursable'); const [cat, setCat] = useState('materials')
  // заметка: что именно куплено. По выписке из банка видно только «Amazon $170» —
  // управляющей компании нужно «25 коннекторов», иначе возмещать нечего.
  const [note, setNote] = useState('')

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  // условный прогресс: быстро до 0.85, дальше ждём ответ
  useEffect(() => {
    if (step !== 'reading') return
    // пока ответа нет — ползём до 0.6 (~4 с, столько и читает модель); пришёл — добираем до 1 за полсекунды
    const id = setInterval(() => setProg(p => (g ? Math.min(1, p + 0.03) : Math.min(0.6, p + 0.006))), 40)
    return () => clearInterval(id)
  }, [step, g])
  useEffect(() => { if (step === 'reading' && prog >= 1) setStep('confirm') }, [prog, step])

  async function onFile(f: File) {
    setFile(f); setPreview(URL.createObjectURL(f)); setErr(null); setG(null); setProg(0); setStep('reading')
    const fd = new FormData(); fd.append('file', f)
    const r = await fetch('/api/receipt', { method: 'POST', body: fd }); const j = await r.json().catch(() => ({ error: 'bad response' }))
    if (j.error) { setErr(j.error); setStep('confirm'); return }
    const gg = j as Guess
    setG(gg); setVendor(gg.vendor || ''); setTotal(gg.total != null ? gg.total.toFixed(2) : ''); setDate(gg.spent_on || today())
    setKind(gg.kind); setCat(gg.category || (gg.kind === 'reimbursable' ? 'materials' : 'other'))
  }
  function manual() { setG(null); setVendor(''); setTotal(''); setDate(today()); setKind('own'); setCat('other'); setNote(''); setStep('confirm') }

  async function save() {
    const amount = Number(total); if (!(amount >= 0) || !total) { setErr('Enter the total'); return }
    setBusy(true); setErr(null)
    const fd = new FormData()
    fd.append('amount', String(amount)); fd.append('kind', kind); fd.append('category', kind === 'reimbursable' ? 'materials' : cat)
    if (vendor.trim()) fd.append('vendor', vendor.trim()); fd.append('spent_on', date)
    if (site) fd.append('site_id', site); if (file) fd.append('file', file); if (g) fd.append('ocr', JSON.stringify(g))
    if (note.trim()) fd.append('note', note.trim())
    if (payer) fd.append('paid_by', payer)
    const r = await fetch('/api/expenses', { method: 'POST', body: fd }); const j = await r.json().catch(() => ({ error: 'bad response' }))
    setBusy(false)
    if (j.error) { setErr(j.error); return }
    flash(kind === 'reimbursable' ? { title: 'Added to the GC pile', sub: `${money(amount, true)} · profit unchanged`, tone: 'reimb' } : { title: 'Logged as own cost', sub: `${money(amount, true)} · cuts profit, split 50/50`, tone: 'own' })
    router.push('/'); router.refresh()
  }

  const siteName = sites.find(s => s.id === site)?.name || 'No site'
  const isReimb = kind === 'reimbursable'
  const kc = isReimb ? 'var(--reimb)' : 'var(--own)'
  const p = prog

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-24px)] max-w-[520px] flex-col">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
      <div className="flex flex-none items-center justify-between pb-3 pt-1.5">
        <button onClick={() => (step === 'camera' ? router.back() : setStep('camera'))} className="min-h-11 px-1 text-[15px] text-[var(--muted)]">{step === 'camera' ? 'Cancel' : 'Back'}</button>
        <div className="label">{step === 'camera' ? 'Receipt' : step === 'reading' ? 'Reading' : 'Check & save'}</div>
        <div className="w-[52px]" />
      </div>

      {step === 'camera' && (
        <div className="flex min-h-0 flex-1 flex-col pb-6">
          <button onClick={() => fileRef.current?.click()} className="relative min-h-[360px] flex-1 overflow-hidden rounded-[22px] border border-white/8 bg-[#0b0e13] p-0">
            <div className="absolute inset-0 opacity-50" style={{ background: 'repeating-linear-gradient(135deg,rgba(255,255,255,.035) 0 3px,transparent 3px 9px)' }} />
            {[['top-14 left-8 border-t-2 border-l-2 rounded-tl-lg'], ['top-14 right-8 border-t-2 border-r-2 rounded-tr-lg'], ['bottom-14 left-8 border-b-2 border-l-2 rounded-bl-lg'], ['bottom-14 right-8 border-b-2 border-r-2 rounded-br-lg']].map(([c]) => <div key={c} className={`absolute h-10 w-10 border-[var(--accent)] ${c}`} />)}
            <div className="mono breathe absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[11px] tracking-[.1em] text-[var(--dim)]">FILL THE FRAME WITH THE RECEIPT</div>
          </button>
          <div className="mt-5 flex flex-none items-stretch gap-3">
            {/* ручной ввод — основной путь владельца, поэтому он и крупнее */}
            <button onClick={manual} className="display flex-1 border border-white/20 bg-white/[.04] px-4 text-left text-[22px] leading-none text-[var(--fg)]">
              Manual<br />entry
              <div className="mono mt-1.5 text-[9px] font-normal tracking-[.14em] text-[var(--muted)]">TYPE THE AMOUNT</div>
            </button>
            <button onClick={() => fileRef.current?.click()} aria-label="Take photo" className="relative h-[92px] w-[92px] flex-none border-0 bg-transparent p-0">
              {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map(c => (
                <span key={c} className={`absolute h-5 w-5 border-[var(--accent)] ${c}`} />
              ))}
              <span className="absolute inset-[10px] bg-[var(--fg)]" />
              <span className="mono absolute -bottom-4 left-0 right-0 text-center text-[9px] tracking-[.14em] text-[var(--muted)]">SHOOT</span>
            </button>
          </div>
        </div>
      )}

      {step === 'reading' && (
        <div className="min-h-0 flex-1 overflow-y-auto pb-8">
          <div className="relative h-[238px] overflow-hidden rounded-[20px] border border-white/9 bg-[#0b0e13]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview && <img src={preview} alt="" className="h-full w-full object-cover opacity-70" />}
            <div className="sweep" />
            <div className="mono absolute bottom-3 left-3 rounded-none px-2 py-1 text-[10px] tracking-[.12em] text-[var(--accent)]" style={{ background: 'rgba(7,9,13,.8)' }}>READING {Math.round(p * 100)}%</div>
          </div>
          <div className="panel mt-5 rounded-[20px] p-5">
            <Row label="Vendor" show={!!g && p > 0.62}><span className="text-[17px] font-medium">{g?.vendor || (p > 0.85 ? '—' : '')}</span></Row>
            <Row label="Total" show><span className="num text-[30px]">{money((g?.total || 0) * Math.min(1, Math.max(0, (p - 0.62) / 0.3)), true)}</span></Row>
            <Row label="Date" show={!!g && p > 0.8}><span className="text-[15px]">{g?.spent_on || ''}</span></Row>
            <Row label="Kind" show={!!g && p > 0.9} last><span className="text-[15px]" style={{ color: g?.kind === 'own' ? 'var(--own)' : 'var(--reimb)' }}>{g ? (g.kind === 'own' ? 'Own cost · our money' : 'Reimbursable · GC pays back') : ''}</span></Row>
          </div>
          <div className="mono mt-4 text-center text-[11px] tracking-[.1em] text-[var(--dim)]">{g ? (fromSchedule ? 'MATCHED TO TODAY’S SCHEDULE' : 'READ') : 'FINDING VENDOR, TOTAL, DATE'}</div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="rise min-h-0 flex-1 overflow-y-auto pb-6">
          <div className="flex items-start gap-4">
            <button onClick={() => (preview ? setViewer(true) : fileRef.current?.click())} className="h-[94px] w-[74px] flex-none overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview ? <img src={preview} alt="" className="thumb h-full w-full" />
                       : <div className="thumb flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] leading-tight text-[var(--dim)]"><span className="text-lg">+</span>photo</div>}
            </button>
            <div className="min-w-0 flex-1">
              <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Vendor" className="label w-full bg-transparent text-[var(--fg)] placeholder:text-[var(--dim)]" />
              <div className="mt-1.5 flex items-baseline gap-1"><span className="num text-[40px] leading-none" style={{ color: kc }}>$</span>
                <input value={total} onChange={e => setTotal(e.target.value)} inputMode="decimal" placeholder="0.00" className="num w-full bg-transparent text-[40px] leading-none placeholder:text-[var(--dim)]" style={{ color: kc }} autoFocus={!g} /></div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-2 bg-transparent text-[13px] text-[var(--muted)]" />
            </div>
          </div>
          {g && g.confidence !== 'high' && <div className="mono mt-3 text-[11px] tracking-[.08em] text-[var(--own)]">CHECK THE TOTAL — LOW CONFIDENCE</div>}
          {err && <div className="mt-3 text-sm text-[var(--own)]">{err}</div>}

          <div className="mt-[22px] flex gap-2.5">
            <button onClick={() => setKind(isReimb ? 'own' : 'reimbursable')} className="min-h-[52px] flex-1 rounded-[14px] border px-3.5 text-left text-sm font-medium"
                    style={{ color: kc, borderColor: isReimb ? 'rgba(52,209,125,.34)' : 'rgba(242,177,52,.34)', background: isReimb ? 'rgba(52,209,125,.1)' : 'rgba(242,177,52,.1)' }}>
              {isReimb ? 'Reimbursable' : 'Own cost'}<div className="mt-0.5 text-[11px] font-normal text-[var(--muted)]">tap to flip</div>
            </button>
            <button onClick={() => setSheet('site')} className="glass min-h-[52px] flex-1 px-3.5 text-left text-sm font-medium">
              <span className="block truncate">{siteName}</span><div className="mt-0.5 text-[11px] font-normal text-[var(--muted)]">{fromSchedule && site === guess ? 'from schedule' : 'tap to change'}</div>
            </button>
          </div>
          {!isReimb && <button onClick={() => setSheet('cat')} className="glass mt-2.5 flex min-h-[44px] w-full items-center justify-between px-3.5 text-sm"><span className="text-[var(--muted)]">Category</span><span>{cat}</span></button>}
          {partners.length > 1 && (
            <button onClick={() => setSheet('payer')} className="glass mt-2.5 flex min-h-[44px] w-full items-center justify-between px-3.5 text-sm">
              <span className="text-[var(--muted)]">Paid by</span>
              <span>{partners.find(p => p.id === payer)?.name || '—'}</span>
            </button>
          )}

          {g && g.items.length > 0 && (
            <div className="panel mt-4 rounded-[18px] px-[18px] py-4">
              <div className="label-xs mb-3" style={{ fontSize: 11 }}>{g.items.length} line items</div>
              {g.items.map((it, i) => <div key={i} className="flex items-baseline justify-between gap-3.5 py-[7px]"><div className="min-w-0 text-sm text-[var(--fg-2)]">{it.name}</div><div className="num flex-none text-sm">{it.amount != null ? money(it.amount, true) : ''}</div></div>)}
            </div>
          )}

          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                    placeholder={isReimb ? 'What was bought — e.g. 25 connectors, 3/4 EMT' : 'Note (optional)'}
                    className="field mt-4 resize-none py-3 text-[15px] leading-snug" style={{ minHeight: 64 }} />

          <button onClick={save} disabled={busy} className="btn mt-4 min-h-[58px] w-full text-[17px]">{busy ? 'Saving…' : 'Save'}</button>
          <div className="mt-3 text-center text-xs text-[var(--muted)]">{isReimb ? 'Goes to the GC pile. Profit unchanged.' : 'Real cost. Cuts profit, split 50/50.'}</div>
        </div>
      )}

      {sheet === 'site' && (
        <Sheet title="Site" onClose={() => setSheet(null)}>
          {sites.map(s => <SheetRow key={s.id} label={s.name} sub={s.status} dot={(STATUS[s.status] || STATUS.planned).color} active={site === s.id} onClick={() => { setSite(s.id); setSheet(null) }} />)}
          <SheetRow label="No site" active={!site} onClick={() => { setSite(''); setSheet(null) }} />
        </Sheet>
      )}
      {sheet === 'payer' && (
        <Sheet title="Whose money" onClose={() => setSheet(null)}>
          {partners.map(p => <SheetRow key={p.id} label={p.name} sub={p.is_owner ? 'you — the default' : 'partner fronted this one'} active={payer === p.id} onClick={() => { setPayer(p.id); setSheet(null) }} />)}
        </Sheet>
      )}
      {sheet === 'cat' && (
        <Sheet title="Category" onClose={() => setSheet(null)}>
          {CATS.map(c => <SheetRow key={c} label={c} active={cat === c} onClick={() => { setCat(c); setSheet(null) }} />)}
        </Sheet>
      )}
      {viewer && preview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[rgba(4,6,9,.97)] p-[18px]" onClick={() => setViewer(false)}>
          <div className="flex items-center justify-between"><div className="text-[15px] font-medium">{vendor || 'Receipt'}</div><button className="h-11 w-11 rounded-none border border-white/12">✕</button></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="mt-[18px] min-h-0 flex-1 overflow-auto rounded-none border border-white/10"><img src={preview} alt="" className="mx-auto max-w-full" /></div>
        </div>
      )}
    </div>
  )
}

function Row({ label, show, last, children }: { label: string; show: boolean; last?: boolean; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-baseline justify-between transition-opacity duration-300" style={{ opacity: show ? 1 : 0 }}><div className="label">{label}</div><div>{children}</div></div>
      {!last && <div className="my-4 h-px bg-white/7" />}
    </>
  )
}
