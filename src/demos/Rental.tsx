import { useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/red-hat-display'
import '@fontsource/dm-mono/400.css'
import { DemoDone, DemoFooter, Photo } from './kit'

gsap.registerPlugin(ScrollTrigger)

/**
 * Rihla — a car rental agency in Marrakech and Casablanca. The brief every agency at Menara or Mohammed V has: show
 * the fleet with real prices, deliver at the terminal, and take the booking (often from abroad) without a credit card.
 * Its sign is the Moroccan kilometre marker, the white post with the red cap that lines every road in the country.
 */

const SANS = '"Red Hat Display Variable", system-ui, sans-serif'
const MONO = '"DM Mono", ui-monospace, monospace'
const CHALK = '#f7f5f0'
const SAND = '#ece3d2'
const INK = '#141414'
const RED = '#d7261e'
const LINE = 'rgba(20,20,20,0.14)'

type Cat = 'Citadine' | 'Berline' | 'SUV' | '7 places' | '4x4'
type Car = { id: string; name: string; cat: Cat; seats: number; bags: number; gear: 'Manuelle' | 'Automatique'; fuel: 'Diesel' | 'Essence'; day: number; deposit: number; pos?: string; alt: string }

const CARS: Car[] = [
  { id: 'logan', name: 'Dacia Logan', cat: 'Berline', seats: 5, bags: 3, gear: 'Manuelle', fuel: 'Diesel', day: 280, deposit: 5000, alt: 'Une Dacia Logan blanche garée sur un parking', pos: '45% 55%' },
  { id: 'clio', name: 'Renault Clio 5', cat: 'Citadine', seats: 5, bags: 2, gear: 'Manuelle', fuel: 'Essence', day: 300, deposit: 5000, alt: 'Une Renault Clio bleue vue de trois quarts avant' },
  { id: '208', name: 'Peugeot 208', cat: 'Citadine', seats: 5, bags: 2, gear: 'Automatique', fuel: 'Essence', day: 380, deposit: 6000, alt: 'Une Peugeot 208 jaune vue de trois quarts avant' },
  { id: 'duster', name: 'Dacia Duster', cat: 'SUV', seats: 5, bags: 3, gear: 'Manuelle', fuel: 'Diesel', day: 450, deposit: 8000, alt: 'Un Dacia Duster orange vu de face' },
  { id: 'jogger', name: 'Dacia Jogger', cat: '7 places', seats: 7, bags: 4, gear: 'Manuelle', fuel: 'Essence', day: 520, deposit: 8000, alt: 'Un Dacia Jogger cuivré, monospace sept places' },
  { id: 'tucson', name: 'Hyundai Tucson', cat: 'SUV', seats: 5, bags: 4, gear: 'Automatique', fuel: 'Diesel', day: 750, deposit: 12000, alt: 'Un Hyundai Tucson rouge vu de profil', pos: '50% 60%' },
  { id: 'prado', name: 'Toyota Land Cruiser Prado', cat: '4x4', seats: 7, bags: 5, gear: 'Automatique', fuel: 'Diesel', day: 1400, deposit: 20000, alt: 'Un Toyota Land Cruiser Prado gris, pneus tout-terrain' },
]
const CATS: ('Toutes' | Cat)[] = ['Toutes', 'Citadine', 'Berline', 'SUV', '7 places', '4x4']

const PLACES = ['Aéroport Marrakech-Ménara', 'Marrakech · livraison à l’hôtel ou au riad', 'Aéroport Casablanca Mohammed V', 'Casablanca · agence du Maârif', 'Gare de Marrakech'] as const
const city = (p: string) => (p.includes('Casablanca') ? 'Casablanca' : 'Marrakech')

const OPTIONS = [
  { id: 'driver', t: 'Conducteur additionnel', p: 50 },
  { id: 'seat', t: 'Siège bébé ou rehausseur', p: 30 },
  { id: 'cover', t: 'Rachat de franchise', p: 90 },
  { id: 'wifi', t: 'Routeur Wi-Fi 4G', p: 40 },
] as const

const ROUTES = [
  { to: 'AÏT BENHADDOU', km: 185, from: 'Depuis Marrakech', t: 'Le col du Tichka', d: 'La N9 grimpe à 2 260 m en lacets, puis redescend vers les kasbahs et le ksar d’Aït Benhaddou.', time: '3 h 30', car: 'Clio, Duster', src: 'rental/tichka.jpg', alt: 'Les lacets de la route du Tichka dans le Haut Atlas' },
  { to: 'ESSAOUIRA', km: 190, from: 'Depuis Marrakech', t: 'L’océan en fin de matinée', d: 'Une route droite à travers les arganiers, le port bleu et la Skala au bout.', time: '2 h 45', car: 'Logan, Clio', src: 'rental/essaouira.jpg', alt: 'Les barques bleues du port d’Essaouira au pied de la Skala' },
  { to: 'BOUMALNE DADÈS', km: 115, from: 'Depuis Ouarzazate', t: 'La route des mille kasbahs', d: 'La vallée du Dadès, ses gorges rouges et ses jardins en terrasses, à faire sur deux jours.', time: '2 h', car: 'Duster, Tucson', src: 'rental/dades.jpg', alt: 'La route des gorges du Dadès au-dessus de la rivière et des jardins' },
  { to: 'MERZOUGA', km: 555, from: 'Depuis Marrakech', t: 'Les dunes de l’Erg Chebbi', d: 'Deux jours de route par le Tichka et le Todra, une nuit au bivouac au pied des dunes.', time: '2 jours', car: 'Prado, Tucson', src: 'rental/dunes.jpg', alt: 'Un chamelier et son dromadaire au coucher du soleil sur les dunes de l’Erg Chebbi' },
]

const mad = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ')
/** Longer rentals cost less per day, as in every agency: −10 % from three days, −20 % from a week. */
const rate = (car: Car, days: number) => Math.round((car.day * (days >= 7 ? 0.8 : days >= 3 ? 0.9 : 1)) / 5) * 5
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fr = (s: string) => new Date(s + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
const plus = (s: string, n: number) => {
  const d = new Date(s + 'T12:00')
  d.setDate(d.getDate() + n)
  return iso(d)
}

/** The kilometre marker: a white post with a red cap, the destination and the distance. */
function Borne({ to, km, small }: { to: string; km: number; small?: boolean }) {
  return (
    <div className={`relative shrink-0 ${small ? 'w-[4.6rem]' : 'w-[6.5rem] md:w-[7.5rem]'}`} aria-hidden>
      <div className="overflow-hidden rounded-t-[999px] border-2 bg-white shadow-[0_18px_30px_-18px_rgba(0,0,0,0.6)]" style={{ borderColor: INK }}>
        <div className={`${small ? 'h-6' : 'h-11 md:h-12'}`} style={{ background: RED }} />
        <div className={`flex flex-col items-center justify-center text-center ${small ? 'gap-0.5 px-1 py-2' : 'gap-1 px-2 py-4'}`} style={{ color: INK }}>
          <span className={`font-extrabold uppercase leading-[1.05] ${small ? 'text-[0.5rem]' : 'text-[0.62rem] md:text-[0.7rem]'}`}>{to}</span>
          <span className={`font-black tabular-nums leading-none ${small ? 'text-lg' : 'text-[2rem] md:text-[2.3rem]'}`} data-km={small ? undefined : km}>
            {km}
          </span>
        </div>
      </div>
      <div className={`mx-auto ${small ? 'h-2 w-[80%]' : 'h-4 w-[84%]'} border-x-2 border-b-2 bg-white`} style={{ borderColor: INK }} />
    </div>
  )
}

function Spec({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border px-2.5 py-1 text-[0.72rem]" style={{ borderColor: LINE }}>
      {children}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[0.68rem] uppercase tracking-[0.16em] opacity-60" style={{ fontFamily: MONO }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const control = 'min-h-12 w-full rounded-xl border bg-white px-3 text-[0.95rem] outline-none transition-colors focus:border-[#141414]'

export default function Rental() {
  const root = useRef<HTMLDivElement>(null)
  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return iso(d)
  }, [])
  const [from, setFrom] = useState<string>(PLACES[0])
  const [back, setBack] = useState<string>('same')
  const [start, setStart] = useState(tomorrow)
  const [days, setDays] = useState(5)
  const [cat, setCat] = useState<(typeof CATS)[number]>('Toutes')
  const [carId, setCarId] = useState('duster')
  const [opts, setOpts] = useState<string[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [flight, setFlight] = useState('')
  const [pay, setPay] = useState<'livraison' | 'acompte'>('livraison')
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const car = CARS.find((c) => c.id === carId)!
  const end = plus(start, days)
  const backPlace = back === 'same' ? from : back
  const oneWay = city(backPlace) !== city(from) ? 600 : 0
  const optTotal = OPTIONS.filter((o) => opts.includes(o.id)).reduce((s, o) => s + o.p * days, 0)
  const total = rate(car, days) * days + optTotal + oneWay
  const list = CARS.filter((c) => cat === 'Toutes' || c.cat === cat)

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  useGSAP(
    () => {
      gsap.from('[data-hero-img]', { scale: 1.18, duration: 2.6, ease: 'expo.out' })
      gsap.from('[data-rise]', { yPercent: 110, duration: 1.3, stagger: 0.09, ease: 'expo.out', delay: 0.2 })
      gsap.from('[data-search]', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', delay: 0.55 })
      // the road: a red line draws down the itineraries as they cross the screen, and each marker counts its kilometres
      gsap.fromTo('[data-road]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-routes]', start: 'top 70%', end: 'bottom 70%', scrub: true } })
      gsap.utils.toArray<HTMLElement>('[data-stop]').forEach((el) => {
        const borne = el.querySelector('[data-borne]')
        const n = el.querySelector<HTMLElement>('[data-km]')
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 72%', once: true } })
        tl.from(borne, { y: 60, rotate: -8, opacity: 0, duration: 0.9, ease: 'back.out(1.6)' })
        tl.from(el.querySelector('[data-stop-img]'), { clipPath: 'inset(0 100% 0 0 round 22px)', duration: 1.1, ease: 'expo.inOut' }, 0.05)
        if (n) {
          const km = Number(n.dataset.km)
          const o = { v: 0 }
          tl.to(o, { v: km, duration: 1.1, ease: 'power2.out', onUpdate: () => (n.textContent = String(Math.round(o.v))) }, 0.1)
        }
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} style={{ background: CHALK, color: INK, fontFamily: SANS }}>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden text-white">
        <div data-hero-img className="absolute inset-0">
          <Photo eager zoom={false} src="rental/hairpins.jpg" alt="Une route de montagne en lacets dans l’Atlas, vue d’en haut, avec quelques voitures" pos="50% 50%" />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.55) 42%, rgba(10,10,10,0.05) 75%), linear-gradient(0deg, rgba(10,10,10,0.55), transparent 40%)' }} />

        <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-12">
          <a href="#flotte" onClick={(e) => (e.preventDefault(), go('flotte'))} className="flex items-center gap-2.5 text-2xl font-black tracking-[-0.03em]">
            <span className="grid h-8 w-6 place-items-end overflow-hidden rounded-t-full border-2 border-white bg-white" aria-hidden>
              <span className="block h-3 w-full" style={{ background: RED, alignSelf: 'start' }} />
            </span>
            Rihla
          </a>
          <nav aria-label="Rihla" className="hidden items-center gap-8 text-sm font-semibold md:flex">
            {[
              ['flotte', 'Flotte et prix'],
              ['itineraires', 'Itinéraires'],
              ['conditions', 'Conditions'],
            ].map(([id, t]) => (
              <a key={id} href={`#${id}`} onClick={(e) => (e.preventDefault(), go(id))} className="opacity-85 transition-opacity hover:opacity-100">
                {t}
              </a>
            ))}
          </nav>
          <a href="#reserver" onClick={(e) => (e.preventDefault(), go('reserver'))} className="rounded-full px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: RED }}>
            Réserver
          </a>
        </header>

        <div className="relative z-10 mt-auto px-5 pb-6 md:px-12 md:pb-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold backdrop-blur" style={{ fontFamily: MONO }}>
            <span className="h-2 w-2 rounded-full" style={{ background: RED }} /> Marrakech · Casablanca · 24h/24 aux aéroports
          </p>
          <h1 className="max-w-[15ch] text-[clamp(2.9rem,8vw,7.4rem)] font-black leading-[0.92] tracking-[-0.045em]">
            {['Votre voiture', 'vous attend', 'à l’aéroport.'].map((l) => (
              <span key={l} className="block overflow-hidden pb-[0.06em]">
                <span data-rise className="block">
                  {l}
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">Livrée au terminal ou devant votre riad, avec le plein. Kilométrage illimité, assurance incluse, caution sans carte de crédit.</p>

          {/* Search */}
          <form
            data-search
            onSubmit={(e) => {
              e.preventDefault()
              go('flotte')
            }}
            className="mt-8 grid gap-3 rounded-[22px] bg-white p-3 text-[#141414] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] md:grid-cols-[1.4fr_1.2fr_1fr_auto_auto] md:items-end md:p-4"
          >
            <Field label="Prise en charge">
              <select value={from} onChange={(e) => setFrom(e.target.value)} className={control} style={{ borderColor: LINE }}>
                {PLACES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Restitution">
              <select value={back} onChange={(e) => setBack(e.target.value)} className={control} style={{ borderColor: LINE }}>
                <option value="same">Au même endroit</option>
                {PLACES.filter((p) => p !== from).map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Départ">
              <input type="date" min={tomorrow} value={start} onChange={(e) => e.target.value && setStart(e.target.value)} className={control} style={{ borderColor: LINE }} />
            </Field>
            <div>
              <span className="mb-1.5 block text-[0.68rem] uppercase tracking-[0.16em] opacity-60" style={{ fontFamily: MONO }}>
                Durée
              </span>
              <div className="flex min-h-12 items-center rounded-xl border" style={{ borderColor: LINE }}>
                <button type="button" aria-label="Un jour de moins" onClick={() => setDays((d) => Math.max(1, d - 1))} className="h-12 w-11 text-xl transition-transform active:scale-90">
                  −
                </button>
                <span className="w-20 text-center font-bold tabular-nums" aria-live="polite">
                  {days} {days > 1 ? 'jours' : 'jour'}
                </span>
                <button type="button" aria-label="Un jour de plus" onClick={() => setDays((d) => Math.min(30, d + 1))} className="h-12 w-11 text-xl transition-transform active:scale-90">
                  +
                </button>
              </div>
            </div>
            <button type="submit" className="min-h-12 rounded-xl px-7 font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.97]" style={{ background: RED }}>
              Voir les prix
            </button>
          </form>
        </div>
      </section>

      {/* Promises */}
      <section className="border-b px-5 py-6 md:px-12" style={{ borderColor: LINE, background: SAND }}>
        <ul className="grid gap-4 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-4">
          {['Kilométrage illimité, partout au Maroc', 'Assurance tous risques incluse', 'Caution en espèces ou par virement', 'Assistance routière 24h/24, 7j/7'].map((t) => (
            <li key={t} className="flex items-center gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs text-white" style={{ background: INK }} aria-hidden>
                ✓
              </span>
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Fleet */}
      <section id="flotte" className="scroll-mt-4 px-5 py-20 md:px-12 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: RED, fontFamily: MONO }}>
              {days} {days > 1 ? 'jours' : 'jour'} · du {fr(start)} au {fr(end)}
            </p>
            <h2 className="text-[clamp(2.4rem,5.5vw,4.8rem)] font-black leading-[0.95] tracking-[-0.04em]">La flotte, prix tout compris.</h2>
          </div>
          <div role="radiogroup" aria-label="Catégorie" className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={cat === c}
                onClick={() => setCat(c)}
                className="min-h-11 rounded-full border px-4 text-sm font-semibold transition-[transform,background-color,color] hover:-translate-y-0.5 active:scale-95"
                style={{ borderColor: cat === c ? INK : LINE, background: cat === c ? INK : 'transparent', color: cat === c ? CHALK : INK }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const r = rate(c, days)
            const on = c.id === carId
            // the 4x4 closes the list on its own row: give it the row, photo beside the text
            const wide = cat === 'Toutes' && c.id === 'prado'
            return (
              <li key={c.id} className={`min-w-0 ${wide ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
                <article
                  className={`group flex h-full flex-col overflow-hidden rounded-[22px] border bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-40px_rgba(0,0,0,0.5)] ${wide ? 'lg:grid lg:grid-cols-[1.6fr_1fr]' : ''}`}
                  style={{ borderColor: on ? RED : LINE, boxShadow: on ? `0 0 0 2px ${RED}` : undefined }}
                >
                  <div className={`relative aspect-[16/10] overflow-hidden ${wide ? 'lg:aspect-[21/9]' : ''}`}>
                    <Photo src={`rental/${c.id}.jpg`} alt={c.alt} pos={c.pos} />
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold">{c.cat}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-2xl font-extrabold tracking-[-0.02em]">{c.name}</h3>
                    <p className="text-sm opacity-60">ou similaire</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <Spec>{c.seats} places</Spec>
                      <Spec>{c.bags} valises</Spec>
                      <Spec>{c.gear}</Spec>
                      <Spec>{c.fuel}</Spec>
                      <Spec>Clim</Spec>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                      <div>
                        <p className="text-3xl font-black tabular-nums tracking-[-0.03em]">
                          {mad(r)} <span className="text-base font-bold">MAD/j</span>
                        </p>
                        <p className="text-sm tabular-nums opacity-60">
                          {mad(r * days)} MAD pour {days} j
                        </p>
                        <p className="text-xs tabular-nums opacity-50">Caution {mad(c.deposit)} MAD</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCarId(c.id)
                          go('reserver')
                        }}
                        className="min-h-11 shrink-0 rounded-full px-5 text-sm font-bold transition-[transform,background-color] hover:-translate-y-0.5 active:scale-95"
                        style={{ background: on ? RED : INK, color: '#fff' }}
                      >
                        {on ? 'Choisie' : 'Choisir'}
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
        <p className="mt-6 text-sm opacity-60">Prix par jour dégressifs : −10 % dès 3 jours, −20 % dès 7 jours. Livraison gratuite aux aéroports et dans Marrakech intra-muros.</p>
      </section>

      {/* Itineraries */}
      <section id="itineraires" className="scroll-mt-4 px-5 py-20 text-white md:px-12 md:py-28" style={{ background: INK }}>
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className="text-[clamp(2.4rem,5.5vw,4.8rem)] font-black leading-[0.95] tracking-[-0.04em]">
            Où l’emmener <span style={{ color: RED }}>?</span>
          </h2>
          <p className="max-w-sm text-white/70">Quatre routes que nos clients font le plus, avec la voiture qu’on leur conseille. Le kilométrage reste illimité.</p>
        </div>

        <ol data-routes className="relative mt-16">
          <span data-road className="absolute bottom-0 hidden md:block left-[3.2rem] top-0 w-[6px] origin-top md:left-[3.7rem]" style={{ background: `repeating-linear-gradient(${RED} 0 26px, transparent 26px 40px)` }} aria-hidden />
          {ROUTES.map((r) => (
            <li key={r.to} data-stop className="relative grid gap-6 pb-16 last:pb-0 md:grid-cols-[7.5rem_1.1fr_1fr] md:gap-10">
              <div data-borne className="relative z-10">
                <Borne to={r.to} km={r.km} />
              </div>
              <div data-stop-img className="group relative aspect-[16/10] overflow-hidden rounded-[22px] md:aspect-auto md:min-h-[19rem]">
                <Photo src={r.src} alt={r.alt} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55" style={{ fontFamily: MONO }}>
                  {r.from} · {r.time}
                </p>
                <h3 className="mt-3 text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-[1] tracking-[-0.03em]">{r.t}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-white/75">{r.d}</p>
                <p className="mt-5 text-sm">
                  <span className="text-white/55">Voiture conseillée : </span>
                  <span className="font-bold">{r.car}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Conditions */}
      <section id="conditions" className="scroll-mt-4 px-5 py-20 md:px-12 md:py-28">
        <h2 className="max-w-3xl text-[clamp(2.4rem,5.5vw,4.8rem)] font-black leading-[0.95] tracking-[-0.04em]">Des conditions écrites en clair.</h2>
        <dl className="mt-14 grid gap-px overflow-hidden rounded-[22px] border sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: LINE, background: LINE }}>
          {[
            ['21 ans', 'Âge minimum, avec deux ans de permis. Le permis étranger suffit pour un séjour.'],
            ['0 MAD', 'De frais de livraison à Ménara, Mohammed V et dans Marrakech.'],
            ['60 min', 'D’attente offerte si votre vol a du retard : nous suivons le numéro de vol.'],
            ['Plein/plein', 'Vous recevez la voiture le plein fait, vous la rendez comme elle est partie.'],
          ].map(([k, v]) => (
            <div key={k} className="bg-white p-6 md:p-8">
              <dt className="text-[clamp(2rem,3.5vw,3rem)] font-black tracking-[-0.04em]" style={{ color: RED }}>
                {k}
              </dt>
              <dd className="mt-3 leading-relaxed opacity-75">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Booking */}
      <section id="reserver" className="scroll-mt-4 px-5 pb-20 md:px-12 md:pb-28">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          {/* Summary */}
          <div className="min-w-0 rounded-[22px] p-6 md:p-8" style={{ background: SAND }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ fontFamily: MONO, color: RED }}>
              Votre location
            </p>
            <div className="mt-5 flex items-center gap-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                <Photo src={`rental/${car.id}.jpg`} alt="" pos={car.pos} zoom={false} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold tracking-[-0.02em]">{car.name}</p>
                <p className="text-sm opacity-65">
                  {car.cat} · {car.gear} · {car.seats} places
                </p>
              </div>
            </div>
            <dl className="mt-6 space-y-3 border-t pt-5 text-sm" style={{ borderColor: LINE }}>
              <div className="flex justify-between gap-4">
                <dt className="opacity-60">Départ</dt>
                <dd className="text-right font-semibold">
                  {fr(start)} · {from}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="opacity-60">Retour</dt>
                <dd className="text-right font-semibold">
                  {fr(end)} · {backPlace}
                </dd>
              </div>
            </dl>
            <fieldset className="mt-6 border-t pt-5" style={{ borderColor: LINE }}>
              <legend className="sr-only">Options</legend>
              <ul className="space-y-2">
                {OPTIONS.map((o) => (
                  <li key={o.id}>
                    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl bg-white/60 px-3">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={opts.includes(o.id)}
                          onChange={(e) => setOpts((s) => (e.target.checked ? [...s, o.id] : s.filter((x) => x !== o.id)))}
                          className="h-4 w-4 accent-[#d7261e]"
                        />
                        {o.t}
                      </span>
                      <span className="text-sm tabular-nums opacity-70">{o.p} MAD/j</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
            <div className="mt-6 space-y-1.5 border-t pt-5 text-sm tabular-nums" style={{ borderColor: LINE }}>
              <p className="flex justify-between">
                <span className="opacity-60">
                  {days} j × {mad(rate(car, days))} MAD
                </span>
                <span>{mad(rate(car, days) * days)} MAD</span>
              </p>
              {optTotal > 0 && (
                <p className="flex justify-between">
                  <span className="opacity-60">Options</span>
                  <span>{mad(optTotal)} MAD</span>
                </p>
              )}
              {oneWay > 0 && (
                <p className="flex justify-between">
                  <span className="opacity-60">Retour dans une autre ville</span>
                  <span>{mad(oneWay)} MAD</span>
                </p>
              )}
              <p className="flex items-baseline justify-between pt-3">
                <span className="font-semibold">Total</span>
                <span className="text-4xl font-black tracking-[-0.03em]" aria-live="polite">
                  {mad(total)} MAD
                </span>
              </p>
              <p className="pt-1 text-xs opacity-60">Caution restituée au retour : {mad(car.deposit)} MAD.</p>
            </div>
          </div>

          {/* Form */}
          <div className="min-w-0 rounded-[22px] border bg-white p-6 md:p-10" style={{ borderColor: LINE }}>
            {done ? (
              <DemoDone
                tone={{ on: RED, onText: '#fff' }}
                title="Votre voiture est réservée."
                lines={[`${car.name} · ${fr(start)} → ${fr(end)}`, `${from}${flight ? ` · vol ${flight.toUpperCase()}` : ''}`, `Total ${mad(total)} MAD, ${pay === 'livraison' ? 'payé à la livraison' : 'acompte de 20 % en ligne'}`, `Au nom de ${name}`]}
                onReset={() => setDone(false)}
              />
            ) : (
              <form
                noValidate
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (name.trim().length < 2) return setErr('Indiquez le nom du conducteur principal.')
                  if (!/^[+\d][\d\s.-]{7,}$/.test(phone.trim())) return setErr('Indiquez un numéro WhatsApp ou de téléphone valide.')
                  setErr('')
                  setDone(true)
                }}
              >
                <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-black leading-[0.95] tracking-[-0.04em]">Réservez en deux minutes.</h2>
                <p className="opacity-70">Confirmation sur WhatsApp, puis le nom de l’agent qui vous attendra avec la pancarte à la sortie du terminal.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Conducteur principal">
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={control} style={{ borderColor: LINE }} />
                  </Field>
                  <Field label="WhatsApp ou téléphone">
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" inputMode="tel" className={control} style={{ borderColor: LINE }} />
                  </Field>
                </div>
                <Field label="Numéro de vol (facultatif)">
                  <input value={flight} onChange={(e) => setFlight(e.target.value)} placeholder="Ex. AT 801" className={control} style={{ borderColor: LINE }} />
                </Field>
                <div role="radiogroup" aria-label="Paiement" className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ['livraison', 'Payer à la livraison', 'Espèces ou carte, à la remise des clés'],
                      ['acompte', 'Acompte de 20 %', 'En ligne, le reste à la livraison'],
                    ] as const
                  ).map(([k, t, d]) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={pay === k}
                      onClick={() => setPay(k)}
                      className="rounded-xl border p-4 text-left transition-[transform,border-color] hover:-translate-y-0.5 active:scale-[0.98]"
                      style={{ borderColor: pay === k ? RED : LINE, boxShadow: pay === k ? `inset 0 0 0 1px ${RED}` : undefined }}
                    >
                      <span className="block font-bold">{t}</span>
                      <span className="mt-1 block text-sm opacity-65">{d}</span>
                    </button>
                  ))}
                </div>
                {err && (
                  <p role="alert" className="text-sm font-semibold" style={{ color: RED }}>
                    {err}
                  </p>
                )}
                <button type="submit" className="w-full rounded-xl py-4 text-lg font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: RED }}>
                  Réserver · {mad(total)} MAD
                </button>
                <p className="text-center text-xs opacity-55">Annulation gratuite jusqu’à 48 h avant le départ.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t px-5 py-20 md:px-12 md:py-24" style={{ borderColor: LINE }}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <h2 className="text-[clamp(2.2rem,4.5vw,3.8rem)] font-black leading-[0.95] tracking-[-0.04em]">Les questions qu’on nous pose.</h2>
          <div className="divide-y border-y" style={{ borderColor: LINE }}>
            {[
              ['Faut-il une carte de crédit ?', 'Non. La caution peut être versée en espèces ou par virement, et vous est rendue au retour de la voiture.'],
              ['Mon permis étranger est-il accepté ?', 'Oui, pour un séjour touristique. Le permis international n’est demandé que si le vôtre n’est pas en alphabet latin.'],
              ['Et si mon vol arrive en pleine nuit ?', 'Nous livrons 24h/24 à Ménara et Mohammed V. Un agent suit votre vol et vous attend à la sortie avec votre nom.'],
              ['Puis-je rendre la voiture dans une autre ville ?', 'Oui, entre Marrakech et Casablanca, pour un forfait de 600 MAD affiché avant de réserver.'],
            ].map(([q, a]) => (
              <details key={q} className="group py-5" style={{ borderColor: LINE }}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-bold">
                  {q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border text-lg transition-transform group-open:rotate-45" style={{ borderColor: LINE }} aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl leading-relaxed opacity-75">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 pb-10 pt-16 text-white md:px-12" style={{ background: INK }}>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex items-end gap-5">
            <Borne to="RIHLA" km={0} small />
            <p className="max-w-xs text-2xl font-extrabold leading-tight tracking-[-0.02em]">Les clés vous attendent à l’arrivée.</p>
          </div>
          <div className="text-sm">
            <p className="mb-3 text-[0.68rem] uppercase tracking-[0.16em] text-white/50" style={{ fontFamily: MONO }}>
              Agences
            </p>
            <p>Guéliz, Marrakech</p>
            <p>Maârif, Casablanca</p>
            <p className="mt-2 text-white/60">Comptoirs aux aéroports Ménara et Mohammed V</p>
          </div>
          <div className="text-sm">
            <p className="mb-3 text-[0.68rem] uppercase tracking-[0.16em] text-white/50" style={{ fontFamily: MONO }}>
              Horaires
            </p>
            <p>Agences : 8h30–20h, 7j/7</p>
            <p>Aéroports et assistance : 24h/24</p>
          </div>
        </div>
        <div className="mt-14 border-t border-white/15 pt-6">
          <DemoFooter name="Rihla" folders={['rental']} />
        </div>
      </footer>
    </div>
  )
}
