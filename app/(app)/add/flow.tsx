'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { money, today } from '@/lib/money'
import { Sheet, SheetRow, STATUS, flash } from '@/components/ui'

type Props = { sites: { id: string; name: string; status: string }[]; guess: string | null; fromSchedule: boolean; partners: { id: string; name: string; is_owner: boolean }[] }
const CATS = ['materials', 'fuel', 'hotel', 'tickets', 'rental', 'insurance', 'amazon', 'food', 'other']

/** Сценарий: снимок или картинка из галереи → сумма руками → Save.
 *
 *  Чтение чека моделью убрано (решение владельца 21.09.2026). Оно угадывало
 *  сумму не всегда, а перебить неверную цифру дольше, чем набрать её сразу;
 *  плюс каждый чек стоил вызова Gemini. Фотография теперь нужна как
 *  доказательство для управляющей компании, а не как источник данных.
 *
 *  Снимков два входа: `capture="environment"` открывает камеру сразу, вход
 *  без `capture` — галерею (на iOS он же предлагает выбор «снять / выбрать»).
 *  Раньше вход был один и с `capture`, поэтому картинку из галереи —
 *  присланную в мессенджер, скачанную из письма — добавить было нельзя. */
export function AddFlow({ sites, guess, fromSchedule, partners }: Props) {
  const router = useRouter()
  const camRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'start' | 'confirm'>('start')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
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

  function onFile(f: File) {
    if (preview) URL.revokeObjectURL(preview)
    setFile(f); setPreview(URL.createObjectURL(f)); setErr(null); setStep('confirm')
  }
  function manual() { setFile(null); setPreview(null); setVendor(''); setTotal(''); setDate(today()); setKind('own'); setCat('other'); setNote(''); setStep('confirm') }

  async function save() {
    const amount = Number(total); if (!(amount >= 0) || !total) { setErr('Enter the total'); return }
    setBusy(true); setErr(null)
    const fd = new FormData()
    fd.append('amount', String(amount)); fd.append('kind', kind); fd.append('category', kind === 'reimbursable' ? 'materials' : cat)
    if (vendor.trim()) fd.append('vendor', vendor.trim()); fd.append('spent_on', date)
    // Возмещаемое к объекту больше не привязывается (решение владельца
    // 18.09.2026): материал закупают сразу под несколько площадок, и выбор
    // объекта на чеке был догадкой, которая потом попадала в отчёт.
    if (site && kind === 'own') fd.append('site_id', site)
    if (file) fd.append('file', file)
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

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-24px)] max-w-[520px] flex-col">
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
      <div className="flex flex-none items-center justify-between pb-3 pt-1.5">
        <button onClick={() => (step === 'start' ? router.back() : setStep('start'))} className="min-h-11 px-1 text-[15px] text-[var(--muted)]">{step === 'start' ? 'Cancel' : 'Back'}</button>
        <div className="label">{step === 'start' ? 'Receipt' : 'Amount & save'}</div>
        <div className="w-[52px]" />
      </div>

      {step === 'start' && (
        <div className="flex min-h-0 flex-1 flex-col pb-6">
          <button onClick={() => camRef.current?.click()} className="relative min-h-[360px] flex-1 overflow-hidden rounded-[22px] border border-white/8 bg-[#0b0e13] p-0">
            <div className="absolute inset-0 opacity-50" style={{ background: 'repeating-linear-gradient(135deg,rgba(255,255,255,.035) 0 3px,transparent 3px 9px)' }} />
            {[['top-14 left-8 border-t-2 border-l-2 rounded-tl-lg'], ['top-14 right-8 border-t-2 border-r-2 rounded-tr-lg'], ['bottom-14 left-8 border-b-2 border-l-2 rounded-bl-lg'], ['bottom-14 right-8 border-b-2 border-r-2 rounded-br-lg']].map(([c]) => <div key={c} className={`absolute h-10 w-10 border-[var(--accent)] ${c}`} />)}
            <div className="mono breathe absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[11px] tracking-[.1em] text-[var(--dim)]">TAP TO SHOOT THE RECEIPT</div>
          </button>

          {/* Три входа, все равноправные: снять, взять из галереи, обойтись
              без фото. Галереи раньше не было вовсе. */}
          <div className="mt-5 flex flex-none items-stretch gap-3">
            <button onClick={() => camRef.current?.click()} aria-label="Take photo" className="relative h-[92px] w-[92px] flex-none border-0 bg-transparent p-0">
              {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map(c => (
                <span key={c} className={`absolute h-5 w-5 border-[var(--accent)] ${c}`} />
              ))}
              <span className="absolute inset-[10px] bg-[var(--fg)]" />
              <span className="mono absolute -bottom-4 left-0 right-0 text-center text-[9px] tracking-[.14em] text-[var(--muted)]">SHOOT</span>
            </button>
            <button onClick={() => galleryRef.current?.click()} className="display h-[92px] flex-1 border border-white/20 bg-white/[.04] px-4 text-left text-[20px] leading-none text-[var(--fg)]">
              From<br />gallery
              <div className="mono mt-1.5 text-[9px] font-normal tracking-[.14em] text-[var(--muted)]">PICK A PHOTO</div>
            </button>
          </div>
          <button onClick={manual} className="glass mt-3 min-h-[52px] w-full px-4 text-left text-[15px]">
            No photo — just the amount
            <div className="mono mt-0.5 text-[9px] tracking-[.14em] text-[var(--muted)]">TYPE IT IN</div>
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="rise min-h-0 flex-1 overflow-y-auto pb-6">
          <div className="flex items-start gap-4">
            <button onClick={() => (preview ? setViewer(true) : galleryRef.current?.click())} className="h-[94px] w-[74px] flex-none overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview ? <img src={preview} alt="" className="thumb h-full w-full" />
                       : <div className="thumb flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] leading-tight text-[var(--dim)]"><span className="text-lg">+</span>photo</div>}
            </button>
            <div className="min-w-0 flex-1">
              <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Vendor" className="label w-full bg-transparent text-[var(--fg)] placeholder:text-[var(--dim)]" />
              <div className="mt-1.5 flex items-baseline gap-1"><span className="num text-[40px] leading-none" style={{ color: kc }}>$</span>
                <input value={total} onChange={e => setTotal(e.target.value)} inputMode="decimal" placeholder="0.00" className="num w-full bg-transparent text-[40px] leading-none placeholder:text-[var(--dim)]" style={{ color: kc }} autoFocus /></div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-2 bg-transparent text-[13px] text-[var(--muted)]" />
            </div>
          </div>
          {err && <div className="mt-3 text-sm text-[var(--own)]">{err}</div>}

          <div className="mt-[22px] flex gap-2.5">
            <button onClick={() => setKind(isReimb ? 'own' : 'reimbursable')} className="min-h-[52px] flex-1 rounded-[14px] border px-3.5 text-left text-sm font-medium"
                    style={{ color: kc, borderColor: isReimb ? 'rgba(52,209,125,.34)' : 'rgba(242,177,52,.34)', background: isReimb ? 'rgba(52,209,125,.1)' : 'rgba(242,177,52,.1)' }}>
              {isReimb ? 'Reimbursable' : 'Own cost'}<div className="mt-0.5 text-[11px] font-normal text-[var(--muted)]">tap to flip</div>
            </button>
            {isReimb ? (
              <div className="glass flex min-h-[52px] flex-1 flex-col justify-center px-3.5 text-sm">
                <span className="text-[var(--muted)]">Materials pile</span>
                <span className="mt-0.5 text-[11px] text-[var(--dim)]">no site needed</span>
              </div>
            ) : (
              <button onClick={() => setSheet('site')} className="glass min-h-[52px] flex-1 px-3.5 text-left text-sm font-medium">
                <span className="block truncate">{siteName}</span><div className="mt-0.5 text-[11px] font-normal text-[var(--muted)]">{fromSchedule && site === guess ? 'from schedule' : 'tap to change'}</div>
              </button>
            )}
          </div>
          {!isReimb && <button onClick={() => setSheet('cat')} className="glass mt-2.5 flex min-h-[44px] w-full items-center justify-between px-3.5 text-sm"><span className="text-[var(--muted)]">Category</span><span>{cat}</span></button>}
          {partners.length > 1 && (
            <button onClick={() => setSheet('payer')} className="glass mt-2.5 flex min-h-[44px] w-full items-center justify-between px-3.5 text-sm">
              <span className="text-[var(--muted)]">Paid by</span>
              <span>{partners.find(p => p.id === payer)?.name || '—'}</span>
            </button>
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
