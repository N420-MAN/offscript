import { useState } from 'react'
import { DemoDone, DemoFooter, Photo } from './kit'
import { BRASS, BRASS_LIGHT, GREEN, INK, PAPER, PHOTO, SERIF, STONE } from './residenceTheme'

/** The selling half of Verticale: the skyline gallery, the lot finder, the neighbourhood, the simulator, the lead. */

const RULE = 'rgba(28,27,24,0.15)'
const display = { fontFamily: SERIF, fontVariationSettings: '"opsz" 72' } as const
const label = 'text-[0.68rem] uppercase tracking-[0.22em]'

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
const STATUS = { dispo: ['Disponible', '#2f6b4f'], option: ['Sous option', BRASS], vendu: ['Vendu', '#8a857c'] } as const
const mad = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ')

/** A schematic plan: the living room, then one cell per bedroom. */
function Plan({ rooms }: { rooms: number }) {
  return (
    <svg viewBox="0 0 80 120" className="h-20 w-[3.3rem] shrink-0 md:h-24 md:w-16" fill="none" stroke={INK} strokeWidth="1" aria-hidden>
      <rect x="1" y="1" width="78" height="118" />
      <rect x="1" y="1" width="78" height="56" fill="rgba(166,124,69,0.16)" />
      {Array.from({ length: rooms }, (_, i) => (
        <rect key={i} x={1 + (i * 78) / rooms} y="57" width={78 / rooms} height="62" />
      ))}
    </svg>
  )
}

/** The gallery stands like a skyline: four tall frames of different heights, aligned on the ground. */
function Gallery() {
  const frames = [
    { ...PHOTO.facade, h: 'md:h-[100%]', pos: '50% 30%', n: 'Façade' },
    { ...PHOTO.living, h: 'md:h-[74%]', pos: '40% 50%', n: 'Séjour' },
    { ...PHOTO.hall, h: 'md:h-[88%]', pos: '50% 50%', n: 'Coursive' },
    { ...PHOTO.roof, h: 'md:h-[62%]', pos: '30% 50%', n: 'Rooftop' },
  ]
  return (
    <section className="px-5 py-24 md:px-12 md:py-32">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <h2 data-rise className="max-w-3xl text-[clamp(2.4rem,5.6vw,5.2rem)] leading-[1]" style={display}>
          La résidence, <em style={{ color: BRASS }}>avant la livraison.</em>
        </h2>
        <p data-rise className="max-w-xs opacity-70">
          Appartement témoin meublé au rez-de-chaussée, ouvert sur rendez-vous du lundi au samedi.
        </p>
      </div>
      <div className="mt-14 grid grid-cols-2 items-end gap-3 md:h-[78vh] md:grid-cols-4 md:gap-4">
        {frames.map((fr) => (
          <figure key={fr.src} data-rise className={`group relative h-64 overflow-hidden sm:h-80 ${fr.h}`}>
            <Photo src={fr.src} alt={fr.alt} pos={fr.pos} />
            <span className="absolute left-3 top-3 text-[0.66rem] uppercase tracking-[0.22em] text-white drop-shadow" aria-hidden>
              {fr.n}
            </span>
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
    <section id="lots" className="scroll-mt-4 px-5 pb-24 md:px-12 md:pb-32">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b pb-8" style={{ borderColor: INK }}>
        <h2 className="text-[clamp(2.4rem,5.6vw,5.2rem)] leading-[1]" style={display}>
          Les appartements
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[0, 2, 3, 4].map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={rooms === r}
              onClick={() => setRooms(r)}
              className="min-h-11 border px-4 transition-[transform,background-color,color] hover:-translate-y-0.5 active:scale-95"
              style={{ borderColor: INK, background: rooms === r ? INK : 'transparent', color: rooms === r ? PAPER : INK }}
            >
              {r === 0 ? 'Tous' : `${r} chambres`}
            </button>
          ))}
          <label className="ml-1 flex min-h-11 cursor-pointer items-center gap-2 px-2">
            <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} className="h-4 w-4 accent-[#a67c45]" /> Disponibles seulement
          </label>
        </div>
      </div>
      <ul>
        {list.map((l) => (
          <li key={l.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-2 border-b py-5 transition-colors hover:bg-[#e7dfd1]/50 md:grid-cols-[auto_6rem_1.2fr_0.8fr_1.3fr_9rem] md:gap-x-8" style={{ borderColor: RULE }}>
            <Plan rooms={l.rooms} />
            <p className="text-[2rem] leading-none md:text-[2.4rem]" style={display}>
              {l.id}
            </p>
            <span className="inline-flex items-center gap-2 justify-self-end text-sm md:order-last md:justify-self-start" style={{ color: STATUS[l.status][1] }}>
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS[l.status][1] }} />
              {STATUS[l.status][0]}
            </span>
            <p className={`col-span-3 text-sm opacity-75 md:col-span-1 ${label}`}>
              Niveau {l.lvl} · {l.rooms} ch. · {l.orient}
            </p>
            <p className="col-span-1 text-2xl tabular-nums md:col-span-1" style={{ fontFamily: SERIF }}>
              {l.area} m²
            </p>
            <p className="col-span-2 text-right tabular-nums md:col-span-1 md:text-left">
              <span className="text-xs opacity-60">dès </span>
              <span className="text-lg font-semibold">{mad(l.price)} MAD</span>
            </p>
          </li>
        ))}
        {list.length === 0 && <li className="py-10 opacity-60">Aucun lot ne correspond. Laissez-nous vos critères, nous vous prévenons dès qu’un lot se libère.</li>}
      </ul>
    </section>
  )
}

function Quartier() {
  const places = [
    ['4 min', 'à pied', 'Tramway, station la plus proche'],
    ['6 min', 'à pied', 'La corniche et l’océan'],
    ['8 min', 'en voiture', 'Mosquée Hassan II'],
    ['10 min', 'en voiture', 'Gare Casa-Port'],
    ['35 min', 'en voiture', 'Aéroport Mohammed V'],
  ]
  return (
    <section id="quartier" className="scroll-mt-4 grid gap-0 md:grid-cols-[1fr_1.15fr]" style={{ background: STONE }}>
      <div className="relative h-[60vh] overflow-hidden md:h-auto">
        <Photo {...PHOTO.roof} pos="50% 60%" />
      </div>
      <div className="px-5 py-20 md:px-14 md:py-28">
        <p className={label} style={{ color: BRASS }}>
          Le quartier
        </p>
        <h2 data-rise className="mt-4 text-[clamp(2.3rem,4.8vw,4.4rem)] leading-[1]" style={display}>
          Bourgogne, entre la ville <em>et l’océan.</em>
        </h2>
        <ol className="mt-12">
          {places.map(([t, how, what]) => (
            <li key={what} className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-t py-4 md:grid-cols-[8rem_1fr]" style={{ borderColor: RULE }}>
              <span className="text-[1.9rem] leading-none tabular-nums md:text-[2.3rem]" style={{ fontFamily: SERIF }}>
                {t}
              </span>
              <span>
                <span className="block">{what}</span>
                <span className="text-sm opacity-60">{how}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
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
  const field = (name: string, value: number, set: (v: number) => void, min: number, max: number, step: number, unit: string, show = String(value)) => (
    <label className="block border-t pt-4" style={{ borderColor: RULE }}>
      <span className="flex items-baseline justify-between gap-4">
        <span className={`${label} opacity-60`}>{name}</span>
        <span className="text-xl tabular-nums" style={{ fontFamily: SERIF }}>
          {show} {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-3 w-full accent-[#a67c45]" />
    </label>
  )
  return (
    <section className="px-5 py-24 md:px-12 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1.15fr_1fr] md:gap-16">
        <div className="space-y-6">
          <h2 className="text-[clamp(2.3rem,4.8vw,4.4rem)] leading-[1]" style={display}>
            Votre mensualité, <em style={{ color: BRASS }}>avant la visite.</em>
          </h2>
          {field('Prix du bien', price, setPrice, 1200000, 6000000, 10000, 'MAD', mad(price))}
          {field('Apport', down, setDown, 10, 60, 1, '%')}
          {field('Durée', years, setYears, 7, 25, 1, 'ans')}
          {field('Taux', rate, setRate, 3, 7, 0.05, '%', rate.toFixed(2).replace('.', ','))}
        </div>
        <div className="flex flex-col justify-between p-7 text-[#f5f1e9] md:p-10" style={{ background: GREEN }}>
          <div>
            <p className={label} style={{ color: BRASS_LIGHT }}>
              Mensualité estimée
            </p>
            <p className="mt-4 text-[clamp(3rem,6.4vw,5.6rem)] leading-none tabular-nums" style={display} aria-live="polite">
              {mad(Math.round(monthly))}
              <span className="ml-2 text-2xl">MAD</span>
            </p>
            <p className="mt-5 opacity-75">
              Pour {mad(Math.round(loan))} MAD empruntés sur {years} ans.
            </p>
          </div>
          <p className="mt-10 border-t pt-5 text-sm opacity-70" style={{ borderColor: 'rgba(245,241,233,0.2)' }}>
            Simulation indicative, hors assurance et frais de notaire. Nos banques partenaires répondent sous 48 h, y compris pour les Marocains résidant à l’étranger.
          </p>
        </div>
      </div>
    </section>
  )
}

function Lead() {
  const [kind, setKind] = useState<'brochure' | 'visite' | 'video'>('brochure')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const KINDS = [
    ['brochure', 'Brochure', 'Plans, prix et calendrier'],
    ['visite', 'Visite témoin', 'Sur place, à Casablanca'],
    ['video', 'Visite vidéo', 'Depuis l’étranger'],
  ] as const
  if (done)
    return (
      <DemoDone
        tone={{ on: BRASS, onText: PAPER }}
        title={kind === 'brochure' ? 'La brochure est en route.' : kind === 'visite' ? 'Visite demandée.' : 'Visite vidéo demandée.'}
        lines={[
          kind === 'brochure' ? 'Plans, prix et calendrier de livraison.' : kind === 'visite' ? 'Un conseiller vous rappelle pour fixer l’heure.' : 'Un conseiller vous appelle en vidéo à l’heure qui vous convient.',
          `Au nom de ${name}`,
        ]}
        onReset={() => setDone(false)}
      />
    )
  return (
    <form
      noValidate
      className="space-y-7"
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim().length < 2) return setErr('Indiquez votre nom.')
        if (!/^[+\d][\d\s.-]{7,}$/.test(phone.trim())) return setErr('Indiquez un numéro de téléphone valide.')
        setErr('')
        setDone(true)
      }}
    >
      <div role="radiogroup" aria-label="Votre demande" className="grid gap-2 sm:grid-cols-3">
        {KINDS.map(([k, t, d]) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className="border p-4 text-left transition-[transform,background-color,color] hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ borderColor: kind === k ? BRASS_LIGHT : 'rgba(245,241,233,0.25)', background: kind === k ? 'rgba(210,173,116,0.12)' : 'transparent' }}
          >
            <span className="block text-lg" style={{ fontFamily: SERIF }}>
              {t}
            </span>
            <span className="mt-1 block text-sm opacity-60">{d}</span>
          </button>
        ))}
      </div>
      {(
        [
          ['Nom', name, setName, 'text', 'name'],
          ['Téléphone ou WhatsApp', phone, setPhone, 'tel', 'tel'],
        ] as const
      ).map(([name2, v, set, type, ac]) => (
        <label key={name2} className="block">
          <span className={`mb-2 block opacity-60 ${label}`}>{name2}</span>
          <input value={v} onChange={(e) => set(e.target.value)} type={type} autoComplete={ac} className="min-h-11 w-full border-0 border-b bg-transparent text-xl outline-none focus:border-[#d2ad74]" style={{ borderColor: 'rgba(245,241,233,0.3)' }} />
        </label>
      ))}
      {err && (
        <p role="alert" className="text-sm text-[#f0b8a0]">
          {err}
        </p>
      )}
      <button type="submit" className="w-full py-4 text-sm font-semibold uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: BRASS_LIGHT, color: INK }}>
        {kind === 'brochure' ? 'Recevoir la brochure' : 'Demander la visite'}
      </button>
    </form>
  )
}

export default function ResidenceSales() {
  return (
    <>
      <Gallery />
      <Finder />
      <Quartier />
      <Simulator />
      <section id="contact" className="scroll-mt-4 px-5 pb-10 pt-24 text-[#f5f1e9] md:px-12 md:pt-32" style={{ background: GREEN }}>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.98]" style={display}>
              Choisissez <em style={{ color: BRASS_LIGHT }}>votre étage.</em>
            </h2>
            <p className="mt-6 max-w-md text-lg opacity-75">Recevez les plans et la grille de prix, visitez l’appartement témoin, ou faites la visite en vidéo depuis l’étranger.</p>
            <dl className="mt-12 grid max-w-md grid-cols-2 gap-6 border-t pt-6 text-sm" style={{ borderColor: 'rgba(245,241,233,0.2)' }}>
              <div>
                <dt className={`opacity-50 ${label}`}>Bureau de vente</dt>
                <dd className="mt-2 text-base">Bourgogne, Casablanca</dd>
              </div>
              <div>
                <dt className={`opacity-50 ${label}`}>Horaires</dt>
                <dd className="mt-2 text-base">Lun.–sam. · 9h30–19h</dd>
              </div>
            </dl>
          </div>
          <div className="min-w-0 border p-6 md:p-10" style={{ borderColor: 'rgba(245,241,233,0.18)' }}>
            <Lead />
          </div>
        </div>
        <div className="mt-24 flex flex-wrap items-end justify-between gap-6 border-t pt-8" style={{ borderColor: 'rgba(245,241,233,0.15)' }}>
          <p className="text-[clamp(3rem,10vw,9rem)] leading-[0.8] tracking-[-0.02em]" style={{ ...display, color: 'rgba(245,241,233,0.12)' }} aria-hidden>
            Verticale
          </p>
          <DemoFooter name="Verticale" folders={['residence']} />
        </div>
      </section>
    </>
  )
}
