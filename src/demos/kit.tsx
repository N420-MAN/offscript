import { useMemo, useState } from 'react'
import credits from './credits.json'

/**
 * Shared pieces for the demo sites: photographs, a booking day/slot picker, the honest "demo" confirmation and the
 * photo credits line. Each demo keeps its own look; these only carry behaviour and structure.
 */

type Credit = { title: string; author: string; license: string; source: string }
const CREDITS = credits as Record<string, Credit>

/** A photograph from /public/media. Fills its frame; zooms a touch when its card is hovered (`group`). */
export function Photo({
  src,
  alt,
  className = '',
  pos,
  eager,
  zoom = true,
}: {
  src: string
  alt: string
  className?: string
  pos?: string
  eager?: boolean
  zoom?: boolean
}) {
  return (
    <img
      src={`/media/${src}`}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      className={`h-full w-full object-cover ${zoom ? 'transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]' : ''} ${className}`}
      style={pos ? { objectPosition: pos } : undefined}
    />
  )
}

const DAYS_FR = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

export interface Day {
  key: string
  date: Date
  weekday: string
  label: string
  closed: boolean
}

/** The next `n` days from today, with `closedOn` weekdays (0 = Sunday) marked closed. */
export function useDays(n: number, closedOn: number[] = []): Day[] {
  return useMemo(() => {
    const out: Day[] = []
    const now = new Date()
    for (let i = 0; i < n; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
      out.push({
        key: d.toISOString().slice(0, 10),
        date: d,
        weekday: i === 0 ? 'auj.' : i === 1 ? 'demain' : DAYS_FR[d.getDay()],
        label: `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`,
        closed: closedOn.includes(d.getDay()),
      })
    }
    return out
  }, [n, closedOn])
}

/** Deterministic "already booked" slots, so the grid looks lived-in and stays stable between renders. */
export function isTaken(dayKey: string, slot: string, rate = 0.3) {
  let h = 0
  for (const c of dayKey + slot) h = (h * 31 + c.charCodeAt(0)) % 1000
  return h / 1000 < rate
}

export function DayPicker({
  days,
  value,
  onChange,
  tone,
}: {
  days: Day[]
  value: string
  onChange: (k: string) => void
  tone: { on: string; onText: string; line: string }
}) {
  return (
    <div role="radiogroup" aria-label="Choisir un jour" className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
      {days.map((d) => {
        const on = d.key === value
        return (
          <button
            key={d.key}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={d.closed}
            onClick={() => onChange(d.key)}
            className="flex min-w-[4.6rem] shrink-0 snap-start flex-col items-center rounded-2xl border px-3 py-3 text-sm transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
            style={{ background: on ? tone.on : 'transparent', color: on ? tone.onText : undefined, borderColor: on ? tone.on : tone.line }}
          >
            <span className="text-[0.72rem] uppercase tracking-wider opacity-75">{d.weekday}</span>
            <span className="mt-0.5 font-semibold">{d.closed ? 'fermé' : d.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function SlotGrid({
  slots,
  dayKey,
  value,
  onChange,
  tone,
  rate,
}: {
  slots: string[]
  dayKey: string
  value: string
  onChange: (s: string) => void
  tone: { on: string; onText: string; line: string }
  rate?: number
}) {
  return (
    <div role="radiogroup" aria-label="Choisir un horaire" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((s) => {
        const taken = isTaken(dayKey, s, rate)
        const on = s === value
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={taken}
            onClick={() => onChange(s)}
            className="min-h-11 rounded-xl border px-2 py-2.5 text-sm font-medium tabular-nums transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 disabled:hover:translate-y-0"
            style={{ background: on ? tone.on : 'transparent', color: on ? tone.onText : undefined, borderColor: on ? tone.on : tone.line }}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}

/** The end of a demo booking flow: says plainly that nothing was sent, and offers to start again. */
export function DemoDone({ title, lines, onReset, tone }: { title: string; lines: string[]; onReset: () => void; tone: { on: string; onText: string } }) {
  return (
    <div role="status" className="flex flex-col items-start gap-4">
      <span className="grid h-12 w-12 place-items-center rounded-full text-xl" style={{ background: tone.on, color: tone.onText }} aria-hidden>
        ✓
      </span>
      <p className="text-2xl font-semibold">{title}</p>
      <ul className="space-y-1 opacity-80">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <p className="text-sm opacity-60">Site de démonstration : aucune demande n’a été envoyée.</p>
      <button type="button" onClick={onReset} className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100">
        Recommencer
      </button>
    </div>
  )
}

/** One quiet footer line naming the demo as a demo, with the photo credits it needs (licences ask for attribution). */
export function DemoFooter({ name, folders, className = '' }: { name: string; folders: string[]; className?: string }) {
  const [open, setOpen] = useState(false)
  const list = Object.entries(CREDITS).filter(([k]) => folders.some((f) => k.startsWith(f + '/')))
  return (
    <div className={`text-xs ${className}`}>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 opacity-60">
        <span>© {name} · site de démonstration conçu par OFFSCRIPT</span>
        {list.length > 0 && (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="underline underline-offset-4 hover:opacity-100">
            Crédits photos
          </button>
        )}
      </p>
      {open && (
        <ul className="mt-3 max-w-3xl space-y-1 opacity-70">
          {list.map(([, c]) => (
            <li key={c.source}>
              <a href={c.source} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                {c.title.replace(/^File:/, '').replace(/\.jpe?g$/i, '')}
              </a>{' '}
              — {c.author || 'Wikimedia Commons'}, {c.license}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
