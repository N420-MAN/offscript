import { useState } from 'react'
import { DemoDone, DemoFooter, Photo } from './kit'

/** The selling half of Verticale: gallery, lot finder, mortgage simulator and the lead form. */

const MONO = '"DM Mono", monospace'
const PAPER = '#f2f1ec'
const BLUE = '#2438ff'
const INK = '#101114'

type Lot = { id: string; lvl: number; rooms: number; area: number; price: number; orient: string; status: 'dispo' | 'option' | 'vendu' }
const LOTS: Lot[] = [
  { id: 'A11', lvl: 1, rooms: 2, area: 86, price: 1720000, orient: 'Sud-Est', status: 'vendu' },
  { id: 'A12', lvl: 1, rooms: 2, area: 82, price: 1640000, orient: 'Nord-Ouest', status: 'dispo' },
  { id: 'A21', lvl: 2, rooms: 3, area: 104, price: 2180000, orient: 'Sud', status: 'dispo' },
  { id: 'A22', lvl: 2, rooms: 2, area: 88, price: 1810000, orient: 'Est', status: 'option' },
  { id: 'A31', lvl: 3, rooms: 3, area: 104, price: 2260000, orient: 'Sud', status: 'dispo' },
  { id: 'A32', lvl: 3, rooms: 3, area: 110, price: 2390000, orient: 'Sud-Ouest', status: 'vendu' },
  { id: 'A41', lvl: 4, rooms: 4, area: 148, price: 3450000, orient: 'Traversant', status: 'dispo' },
  { id: 'A51', lvl: 5, rooms: 4, area: 210, price: 5900000, orient: 'Panoramique', status: 'option' },
]
const STATUS = { dispo: ['Disponible', '#0f8a4b'], option: ['Sous option', '#b86e00'], vendu: ['Vendu', '#7a7a7a'] } as const
const mad = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ')

function Plan({ rooms }: { rooms: number }) {
  // a schematic plan: the living room, then one cell per bedroom
  return (
    <svg viewBox="0 0 120 80" className="h-16 w-24 shrink-0 md:h-20 md:w-28" fill="none" stroke={INK} strokeWidth="1.2" aria-hidden>
      <rect x="2" y="2" width="116" height="76" />
      <rect x="2" y="2" width="64" height="76" fill="rgba(36,56,255,0.08)" />
      {Array.from({ length: rooms }, (_, i) => (
        <rect key={i} x="66" y={2 + (i * 76) / rooms} width="52" height={76 / rooms} />
      ))}
      <line x1="2" y1="56" x2="40" y2="56" />
    </svg>
  )
}

function Gallery() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-28">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-3xl text-[clamp(2.4rem,6vw,5.4rem)] font-bold leading-[0.92] tracking-[-0.04em]">
          La résidence, <span style={{ color: BLUE }}>avant la livraison.</span>
        </h2>
        <p className="max-w-sm opacity-70">Appartement témoin meublé, ouvert sur rendez-vous du lundi au samedi.</p>
      </div>
      <div className="grid auto-rows-[15rem] gap-4 md:auto-rows-[18rem] md:grid-cols-4">
        {[
          ['residence/floor-1.jpg', 'La façade : pierre claire, petites fenêtres, dernier niveau entièrement vitré', 'md:col-span-2 md:row-span-2', '50% 30%'],
          ['residence/floor-3.jpg', 'Un séjour vide, baie vitrée sur toute la largeur', 'md:col-span-2', '50% 60%'],
          ['residence/floor-2.jpg', 'Une coursive lumineuse qui dessert les appartements', '', '50% 50%'],
          ['residence/floor-4.jpg', 'Le rooftop : pergola, tables et vue sur la ville', '', '50% 50%'],
        ].map(([src, alt, span, pos]) => (
          <figure key={src} className={`group overflow-hidden border border-black/10 ${span}`}>
            <Photo src={src} alt={alt} pos={pos} />
          </figure>
        ))}
      </div>
    </section>
  )
}

function Finder() {
  const [rooms, setRooms] = useState(0)
  const [onlyFree, setOnlyFree] = useState(false)
  const list = LOTS.filter((l) => (rooms ? l.rooms === rooms : true) && (onlyFree ? l.status === 'dispo' : true))
  return (
    <section id="lots" className="px-6 pb-24 md:px-12 md:pb-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <h2 className="text-[clamp(2.4rem,6vw,5.4rem)] font-bold leading-[0.92] tracking-[-0.04em]">Les appartements</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm" style={{ fontFamily: MONO }}>
          {[0, 2, 3, 4].map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={rooms === r}
              onClick={() => setRooms(r)}
              className="min-h-11 border px-4 transition-[transform,background-color,color] hover:-translate-y-0.5 active:scale-95"
              style={{ borderColor: INK, background: rooms === r ? INK : 'transparent', color: rooms === r ? PAPER : INK }}
            >
              {r === 0 ? 'Tous' : `${r} ch.`}
            </button>
          ))}
          <label className="ml-2 flex min-h-11 cursor-pointer items-center gap-2 px-2">
            <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} className="h-4 w-4 accent-[#2438ff]" /> Disponibles
          </label>
        </div>
      </div>
      <ul className="border-t-2" style={{ borderColor: INK }}>
        {list.map((l) => (
          <li key={l.id} className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2 border-b border-black/15 py-5 transition-colors hover:bg-black/[0.03] md:grid-cols-[auto_5rem_1.3fr_0.8fr_1.4fr_9rem]">
            <Plan rooms={l.rooms} />
            <p className="text-3xl font-bold tracking-tight">{l.id}</p>
            <p className="col-span-2 text-sm md:col-span-1" style={{ fontFamily: MONO }}>
              Niveau {l.lvl} · {l.rooms} ch. · {l.orient}
            </p>
            <p className="text-2xl font-bold tabular-nums">{l.area} m²</p>
            <p className="tabular-nums">
              <span className="text-xs opacity-60" style={{ fontFamily: MONO }}>
                à partir de{' '}
              </span>
              <span className="text-lg font-bold">{mad(l.price)} MAD</span>
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: STATUS[l.status][1] }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS[l.status][1] }} />
              {STATUS[l.status][0]}
            </span>
          </li>
        ))}
        {list.length === 0 && <li className="py-10 opacity-60">Aucun lot ne correspond. Laissez-nous vos critères, nous vous prévenons.</li>}
      </ul>
    </section>
  )
}

function Simulator() {
  const [price, setPrice] = useState(2180000)
  const [down, setDown] = useState(20)
  const [years, setYears] = useState(20)
  const [rate, setRate] = useState(4.5)
  const loan = price * (1 - down / 100)
  const r = rate / 100 / 12
  const n = years * 12
  const monthly = r ? (loan * r) / (1 - Math.pow(1 + r, -n)) : loan / n
  const field = (label: string, value: number, set: (v: number) => void, min: number, max: number, step: number, unit: string, show = String(value)) => (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm" style={{ fontFamily: MONO }}>
        <span className="uppercase tracking-[0.14em] opacity-60">{label}</span>
        <span className="text-base font-bold tabular-nums">
          {show} {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-3 w-full accent-[#2438ff]" />
    </label>
  )
  return (
    <section className="px-6 pb-24 md:px-12 md:pb-28">
      <div className="grid gap-10 border-2 p-6 md:grid-cols-[1.2fr_1fr] md:p-10" style={{ borderColor: INK }}>
        <div className="space-y-7">
          <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[0.95] tracking-[-0.03em]">Simulez votre mensualité</h2>
          {field('Prix du bien', price, setPrice, 1200000, 6000000, 10000, 'MAD', mad(price))}
          {field('Apport', down, setDown, 10, 60, 1, '%')}
          {field('Durée', years, setYears, 7, 25, 1, 'ans')}
          {field('Taux', rate, setRate, 3, 7, 0.05, '%', rate.toFixed(2).replace('.', ','))}
        </div>
        <div className="flex flex-col justify-between p-6" style={{ background: BLUE, color: PAPER }}>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] opacity-75" style={{ fontFamily: MONO }}>
              Mensualité estimée
            </p>
            <p className="mt-2 text-[clamp(2.8rem,6vw,4.6rem)] font-bold leading-none tabular-nums" aria-live="polite">
              {mad(Math.round(monthly))} <span className="text-2xl">MAD</span>
            </p>
            <p className="mt-4 text-sm opacity-80">
              Montant emprunté {mad(Math.round(loan))} MAD sur {years} ans.
            </p>
          </div>
          <p className="mt-8 text-xs opacity-75">Simulation indicative, hors assurance et frais de notaire. Nos banques partenaires répondent sous 48 h.</p>
        </div>
      </div>
    </section>
  )
}

function Lead() {
  const [kind, setKind] = useState<'brochure' | 'visite'>('brochure')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  if (done)
    return (
      <DemoDone
        tone={{ on: BLUE, onText: PAPER }}
        title={kind === 'brochure' ? 'La brochure est en route.' : 'Visite demandée.'}
        lines={[kind === 'brochure' ? 'Plans, prix et calendrier de livraison.' : 'Un conseiller vous rappelle pour fixer l’heure.', `Au nom de ${name}`]}
        onReset={() => setDone(false)}
      />
    )
  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim().length < 2) return setErr('Indiquez votre nom.')
        if (!/^[+\d][\d\s.-]{7,}$/.test(phone.trim())) return setErr('Indiquez un numéro de téléphone valide.')
        setErr('')
        setDone(true)
      }}
    >
      <div role="radiogroup" aria-label="Votre demande" className="grid grid-cols-2 gap-2" style={{ fontFamily: MONO }}>
        {(['brochure', 'visite'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className="min-h-12 border text-sm uppercase tracking-[0.12em] transition-colors"
            style={{ borderColor: 'rgba(242,241,236,0.4)', background: kind === k ? PAPER : 'transparent', color: kind === k ? INK : PAPER }}
          >
            {k === 'brochure' ? 'Brochure' : 'Visite témoin'}
          </button>
        ))}
      </div>
      {[
        ['Nom', name, setName, 'text', 'name'],
        ['Téléphone', phone, setPhone, 'tel', 'tel'],
      ].map(([label, v, set, type, ac]) => (
        <label key={label as string} className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] opacity-60" style={{ fontFamily: MONO }}>
            {label as string}
          </span>
          <input
            value={v as string}
            onChange={(e) => (set as (s: string) => void)(e.target.value)}
            type={type as string}
            autoComplete={ac as string}
            className="min-h-11 w-full border-0 border-b border-white/30 bg-transparent text-lg outline-none focus:border-white"
          />
        </label>
      ))}
      {err && (
        <p role="alert" className="text-sm text-[#ff9b8a]">
          {err}
        </p>
      )}
      <button type="submit" className="w-full py-4 text-sm uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: BLUE, color: PAPER, fontFamily: MONO }}>
        {kind === 'brochure' ? 'Recevoir la brochure' : 'Demander une visite'}
      </button>
    </form>
  )
}

export default function ResidenceSales() {
  return (
    <>
      <Gallery />
      <Finder />
      <Simulator />
      <section id="contact" className="px-6 py-24 md:px-12 md:py-28" style={{ background: INK, color: PAPER }}>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-[clamp(2.4rem,6vw,5.4rem)] font-bold leading-[0.92] tracking-[-0.04em]">
              Choisissez votre <span style={{ color: '#8f9bff' }}>étage.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg opacity-75">Recevez la brochure, les plans et la grille de prix, ou réservez la visite de l’appartement témoin.</p>
            <dl className="mt-10 space-y-5 text-sm" style={{ fontFamily: MONO }}>
              <div>
                <dt className="uppercase tracking-[0.16em] opacity-50">Bureau de vente</dt>
                <dd className="mt-1 text-base">Quartier Bourgogne, Casablanca</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.16em] opacity-50">Horaires</dt>
                <dd className="mt-1 text-base">Lun.–sam. · 9h30–19h</dd>
              </div>
            </dl>
          </div>
          <div className="min-w-0 border border-white/15 p-6 md:p-9">
            <Lead />
          </div>
        </div>
        <DemoFooter name="Verticale" folders={['residence']} className="mt-16" />
      </section>
    </>
  )
}
