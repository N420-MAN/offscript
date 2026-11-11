import { useCallback, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/big-shoulders-display'
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/noto-kufi-arabic'
import { DemoDone, DemoFooter, Photo } from './kit'
import RentalDrive from './RentalDrive'

gsap.registerPlugin(ScrollTrigger)

/**
 * Rihla — car rental in Marrakech and Casablanca. The page opens on the road itself: scroll and you drive the
 * Tizi n'Tichka at dusk, kilometre posts counting down to Ouarzazate, while the dashboard reads out the distance and
 * the altitude. The fleet hangs on the agency's key board; take a key and the car rolls onto the display.
 */

const SIGN = '"Big Shoulders Display Variable", "Arial Narrow", sans-serif'
const SANS = '"Instrument Sans Variable", system-ui, sans-serif'
const ARABIC = '"Noto Kufi Arabic Variable", sans-serif'
const NIGHT = '#1c1838'
const BOARD = '#262150'
const DUSK = '#ff9a62'
const HAZE = '#eceaf3'
const POST = '#f6f4ef'
const RED = '#d8261c'
const INK = '#17142e'
const LINE = 'rgba(23,20,46,0.14)'
const LINE_D = 'rgba(246,244,239,0.16)'

type Cat = 'Citadine' | 'Berline' | 'SUV' | '7 places' | '4x4'
type Car = { id: string; name: string; cat: Cat; seats: number; bags: number; gear: 'Manuelle' | 'Automatique'; fuel: 'Diesel' | 'Essence'; day: number; deposit: number; pos?: string; alt: string }

const CARS: Car[] = [
  { id: 'logan', name: 'Dacia Logan', cat: 'Berline', seats: 5, bags: 3, gear: 'Manuelle', fuel: 'Diesel', day: 280, deposit: 5000, alt: 'Une Dacia Logan blanche garée sur un parking', pos: '45% 55%' },
  { id: 'clio', name: 'Renault Clio 5', cat: 'Citadine', seats: 5, bags: 2, gear: 'Manuelle', fuel: 'Essence', day: 300, deposit: 5000, alt: 'Une Renault Clio bleue vue de trois quarts avant' },
  { id: '208', name: 'Peugeot 208', cat: 'Citadine', seats: 5, bags: 2, gear: 'Automatique', fuel: 'Essence', day: 380, deposit: 6000, alt: 'Une Peugeot 208 jaune vue de trois quarts avant' },
  { id: 'duster', name: 'Dacia Duster', cat: 'SUV', seats: 5, bags: 3, gear: 'Manuelle', fuel: 'Diesel', day: 450, deposit: 8000, alt: 'Un Dacia Duster orange vu de face' },
  { id: 'jogger', name: 'Dacia Jogger', cat: '7 places', seats: 7, bags: 4, gear: 'Manuelle', fuel: 'Essence', day: 520, deposit: 8000, alt: 'Un Dacia Jogger cuivré, monospace sept places' },
  { id: 'tucson', name: 'Hyundai Tucson', cat: 'SUV', seats: 5, bags: 4, gear: 'Automatique', fuel: 'Diesel', day: 750, deposit: 12000, alt: 'Un Hyundai Tucson rouge vu de profil', pos: '50% 60%' },
  { id: 'prado', name: 'Land Cruiser Prado', cat: '4x4', seats: 7, bags: 5, gear: 'Automatique', fuel: 'Diesel', day: 1400, deposit: 20000, alt: 'Un Toyota Land Cruiser Prado gris, pneus tout-terrain' },
]
/** Key fobs are coloured by category, as on a real agency board. */
const FOB: Record<Cat, string> = { Citadine: '#ffd23f', Berline: '#5b8cff', SUV: DUSK, '7 places': '#3ccf96', '4x4': RED }
const CATS: ('Toutes' | Cat)[] = ['Toutes', 'Citadine', 'Berline', 'SUV', '7 places', '4x4']

const PLACES = ['Aéroport Marrakech-Ménara', 'Marrakech, livraison à l’hôtel ou au riad', 'Aéroport Casablanca Mohammed V', 'Casablanca, agence du Maârif', 'Gare de Marrakech'] as const
const city = (p: string) => (p.includes('Casablanca') ? 'Casablanca' : 'Marrakech')

const OPTIONS = [
  { id: 'driver', t: 'Conducteur additionnel', p: 50 },
  { id: 'seat', t: 'Siège bébé ou rehausseur', p: 30 },
  { id: 'cover', t: 'Rachat de franchise', p: 90 },
  { id: 'wifi', t: 'Routeur Wi-Fi 4G', p: 40 },
] as const

const ROUTES = [
  { ar: 'ورزازات', to: 'Ouarzazate', km: 196, t: 'Le col du Tichka', d: 'La N9 grimpe à 2 260 m en lacets, puis redescend vers les kasbahs et Aït Benhaddou.', time: '3 h 30 depuis Marrakech', car: 'Clio ou Duster', src: 'rental/tichka.jpg', alt: 'Les lacets de la route du Tichka dans le Haut Atlas' },
  { ar: 'الصويرة', to: 'Essaouira', km: 190, t: 'L’océan avant midi', d: 'Une route droite à travers les arganiers, le port bleu et la Skala au bout.', time: '2 h 45 depuis Marrakech', car: 'Logan ou Clio', src: 'rental/essaouira.jpg', alt: 'Les barques bleues du port d’Essaouira au pied de la Skala' },
  { ar: 'قلعة مكونة', to: 'Dadès', km: 115, t: 'La route des kasbahs', d: 'La vallée du Dadès, ses gorges rouges et ses jardins en terrasses, sur deux jours.', time: '2 h depuis Ouarzazate', car: 'Duster ou Tucson', src: 'rental/dades.jpg', alt: 'La route des gorges du Dadès au-dessus de la rivière et des jardins' },
  { ar: 'مرزوكة', to: 'Merzouga', km: 555, t: 'Les dunes de l’Erg Chebbi', d: 'Deux jours par le Tichka et le Todra, une nuit au bivouac au pied des dunes.', time: '2 jours depuis Marrakech', car: 'Prado ou Tucson', src: 'rental/dunes.jpg', alt: 'Un chamelier et son dromadaire au coucher du soleil sur les dunes de l’Erg Chebbi' },
]

/** The stops along the drive: what Rihla promises, told at the kilometre where it matters. */
const STOPS = [
  { from: 0.2, to: 0.42, big: 'Kilométrage illimité', small: 'Le Tichka, Merzouga, l’océan : roulez autant que vous voulez, c’est compris dans le prix.' },
  { from: 0.46, to: 0.68, big: '2 260 m, assuré', small: 'Assurance tous risques incluse, et une dépanneuse jusqu’en haut du col, 24 heures sur 24.' },
  { from: 0.72, to: 0.93, big: 'Rendez-la où vous voulez', small: 'Marrakech, Casablanca ou Ouarzazate : le forfait de retour est affiché avant de réserver.' },
]

const mad = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ')
/** Longer rentals cost less per day: −10 % from three days, −20 % from a week. */
const rate = (car: Car, days: number) => Math.round((car.day * (days >= 7 ? 0.8 : days >= 3 ? 0.9 : 1)) / 5) * 5
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fr = (s: string) => new Date(s + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
const plus = (s: string, n: number) => {
  const d = new Date(s + 'T12:00')
  d.setDate(d.getDate() + n)
  return iso(d)
}

/** The kilometre post: white body, red cap, the town in Arabic and in capitals, the distance. */
function Borne({ ar, to, km, className = '' }: { ar: string; to: string; km: number; className?: string }) {
  return (
    <div className={`relative w-[7.2rem] shrink-0 select-none ${className}`} aria-hidden>
      <div className="overflow-hidden rounded-t-[999px] shadow-[0_24px_40px_-22px_rgba(0,0,0,0.7)]" style={{ background: POST, color: INK }}>
        <div className="h-12" style={{ background: RED }} />
        <div className="flex flex-col items-center px-2 pb-3 pt-2 text-center">
          <span className="text-[1.05rem] font-bold leading-tight" style={{ fontFamily: ARABIC }}>
            {ar}
          </span>
          <span className="text-[0.95rem] font-extrabold uppercase leading-none tracking-wide" style={{ fontFamily: SIGN }}>
            {to}
          </span>
          <span className="mt-1 text-[2.9rem] font-black leading-none tabular-nums" style={{ fontFamily: SIGN }} data-km={km}>
            {km}
          </span>
        </div>
      </div>
      <div className="mx-auto h-5 w-[84%]" style={{ background: '#d8d3ca' }} />
    </div>
  )
}

function Field({ label, children, dark }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <label className="block min-w-0">
      <span className={`mb-1.5 block text-[0.8rem] ${dark ? 'text-white/60' : 'opacity-60'}`}>{label}</span>
      {children}
    </label>
  )
}
const control = 'min-h-12 w-full rounded-lg border bg-white px-3 text-[0.95rem] text-[#17142e] outline-none transition-colors focus:border-[#17142e]'

/** One key on the board: a ring on its hook and a coloured fob with the car's number, model and price. */
function KeyTag({ car, n, on, off, days, onPick }: { car: Car; n: number; on: boolean; off: boolean; days: number; onPick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const swing = () => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(ref.current, { rotation: 0 }, { keyframes: { rotation: [7, -5, 3, -1.5, 0] }, duration: 1.1, ease: 'power1.out' })
  }
  return (
    <div className="flex flex-col items-center">
      <span className="mb-[-6px] h-3 w-3 rounded-full" style={{ background: '#8f88b8', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)' }} aria-hidden />
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={on}
        disabled={off}
        onPointerEnter={swing}
        onClick={() => {
          swing()
          onPick()
        }}
        className="group flex w-full origin-top flex-col items-center outline-offset-4 transition-[opacity,transform] duration-300 disabled:opacity-20"
        style={{ transform: on ? 'translateY(10px)' : undefined }}
      >
        <span className="h-9 w-9 rounded-full border-[3px]" style={{ borderColor: on ? POST : '#a9a3c9' }} aria-hidden />
        <span
          className="relative -mt-2 flex w-full flex-col items-center rounded-[16px] px-2 pb-4 pt-6 text-center shadow-[0_18px_30px_-18px_rgba(0,0,0,0.8)] transition-shadow"
          style={{ background: FOB[car.cat], color: INK, boxShadow: on ? `0 0 0 3px ${POST}, 0 24px 40px -16px rgba(0,0,0,.8)` : undefined }}
        >
          <span className="absolute top-2 h-2.5 w-2.5 rounded-full" style={{ background: BOARD }} aria-hidden />
          <span className="text-[2.6rem] font-black leading-none tabular-nums" style={{ fontFamily: SIGN }}>
            {String(n).padStart(2, '0')}
          </span>
          <span className="mt-1 text-[0.82rem] font-semibold leading-tight">{car.name}</span>
          <span className="mt-1 text-[0.78rem] tabular-nums opacity-75">{mad(rate(car, days))} MAD/j</span>
        </span>
      </button>
    </div>
  )
}

export default function Rental() {
  const root = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const kmEl = useRef<HTMLSpanElement>(null)
  const altEl = useRef<HTMLSpanElement>(null)
  const leftEl = useRef<HTMLSpanElement>(null)
  const stage = useRef<HTMLDivElement>(null)
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

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const onHud = useCallback((km: number, alt: number) => {
    if (kmEl.current) kmEl.current.textContent = String(km).padStart(3, '0')
    if (altEl.current) altEl.current.textContent = mad(alt)
    if (leftEl.current) leftEl.current.textContent = String(196 - km)
  }, [])

  const pick = (id: string) => {
    if (id === carId) return
    setCarId(id)
    if (stage.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // the new car rolls onto the display from the right
      gsap.fromTo(stage.current, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' })
      gsap.fromTo(stage.current.querySelector('img'), { xPercent: 12, scale: 1.08 }, { xPercent: 0, scale: 1, duration: 1.1, ease: 'expo.out' })
    }
  }

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      gsap.from('[data-rise]', { yPercent: 110, duration: 1.3, stagger: 0.08, ease: 'expo.out', delay: 0.35 })
      gsap.from('[data-search]', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', delay: 0.7 })
      gsap.from('[data-hud]', { opacity: 0, y: 20, duration: 1, ease: 'power3.out', delay: 1 })
      if (reduced) {
        progress.current = 0.5
        return
      }
      // the drive: the road section holds the screen while the scroll moves the car along the pass
      // query inside this page only: the studio's home page stays mounted underneath and uses the same markers
      const stops = Array.from(root.current!.querySelectorAll<HTMLElement>('[data-stop]'))
      const intro = root.current!.querySelector<HTMLElement>('[data-intro]')
      ScrollTrigger.create({
        trigger: '[data-drive]',
        start: 'top top',
        end: '+=420%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          progress.current = p
          if (intro) {
            const o = 1 - Math.min(1, p / 0.09)
            intro.style.opacity = String(o)
            intro.style.transform = `translateY(${-p * 600}px)`
            intro.style.pointerEvents = o < 0.2 ? 'none' : 'auto'
          }
          stops.forEach((el, i) => {
            const s = STOPS[i]
            const fin = Math.min(1, Math.max(0, (p - s.from) / 0.05))
            const fout = Math.min(1, Math.max(0, (s.to - p) / 0.05))
            const o = Math.min(fin, fout)
            el.style.opacity = String(o)
            el.style.transform = `translateY(${(1 - fin) * 40 - (1 - fout) * 40}px)`
          })
        },
      })
      // itineraries: each post rises from the ground and counts its kilometres
      Array.from(root.current!.querySelectorAll<HTMLElement>('[data-route]')).forEach((el) => {
        const n = el.querySelector<HTMLElement>('[data-km]')
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 75%', once: true } })
        tl.from(el.querySelector('[data-borne]'), { y: 80, opacity: 0, duration: 0.9, ease: 'back.out(1.5)' })
        tl.from(el.querySelector('[data-route-img]'), { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, 0)
        if (n) {
          const km = Number(n.dataset.km)
          const o = { v: 0 }
          tl.to(o, { v: km, duration: 1.2, ease: 'power2.out', onUpdate: () => (n.textContent = String(Math.round(o.v))) }, 0.15)
        }
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} style={{ background: NIGHT, color: POST, fontFamily: SANS }}>
      {/* The drive */}
      <section data-drive className="relative h-[100svh] overflow-hidden">
        <RentalDrive progress={progress} onHud={onHud} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(28,24,56,0.55) 0%, rgba(28,24,56,0) 26%, rgba(28,24,56,0) 55%, rgba(28,24,56,0.7) 100%)' }} />

        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 md:px-10">
          <a href="#flotte" onClick={(e) => (e.preventDefault(), go('flotte'))} className="flex items-center gap-3">
            <span className="block h-9 w-7 overflow-hidden rounded-t-full" style={{ background: POST }} aria-hidden>
              <span className="block h-3.5" style={{ background: RED }} />
            </span>
            <span className="text-[2rem] font-black leading-none tracking-wide" style={{ fontFamily: SIGN }}>
              RIHLA
            </span>
            <span className="text-lg font-bold leading-none opacity-80" style={{ fontFamily: ARABIC }}>
              رحلة
            </span>
          </a>
          <nav aria-label="Rihla" className="hidden items-center gap-8 text-[0.95rem] md:flex">
            {[
              ['flotte', 'La flotte'],
              ['routes', 'Itinéraires'],
              ['conditions', 'Conditions'],
            ].map(([id, t]) => (
              <a key={id} href={`#${id}`} onClick={(e) => (e.preventDefault(), go(id))} className="opacity-80 transition-opacity hover:opacity-100">
                {t}
              </a>
            ))}
          </nav>
          <a href="#reserver" onClick={(e) => (e.preventDefault(), go('reserver'))} className="rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: POST, color: INK }}>
            Réserver
          </a>
        </header>

        {/* the first screen: where you pick the car up */}
        <div data-intro className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6 md:px-10 md:pb-10">
          <h1 className="max-w-[12ch] text-[clamp(3rem,10vw,9.5rem)] font-black uppercase leading-[0.84] tracking-[-0.01em]" style={{ fontFamily: SIGN }}>
            {['La route', 'commence', 'à l’aéroport'].map((l) => (
              <span key={l} className="block overflow-hidden">
                <span data-rise className="block">
                  {l}
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-5 hidden max-w-lg text-lg leading-relaxed text-white/85 sm:block">Votre voiture vous attend au terminal de Ménara ou de Mohammed V, le plein fait. Kilométrage illimité, sans carte de crédit.</p>
          <form
            data-search
            onSubmit={(e) => {
              e.preventDefault()
              go('flotte')
            }}
            className="mt-7 grid max-w-5xl gap-3 rounded-2xl p-3 backdrop-blur-md md:grid-cols-[1.35fr_1.2fr_1fr_auto_auto] md:items-end md:p-4"
            style={{ background: 'rgba(28,24,56,0.72)', border: `1px solid ${LINE_D}` }}
          >
            <Field label="Prise en charge" dark>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className={control} style={{ borderColor: 'transparent' }}>
                {PLACES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <div className="hidden md:block"><Field label="Restitution" dark>
              <select value={back} onChange={(e) => setBack(e.target.value)} className={control} style={{ borderColor: 'transparent' }}>
                <option value="same">Au même endroit</option>
                {PLACES.filter((p) => p !== from).map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field></div>
            <div className="hidden md:block"><Field label="Départ" dark>
              <input type="date" min={tomorrow} value={start} onChange={(e) => e.target.value && setStart(e.target.value)} className={control} style={{ borderColor: 'transparent' }} />
            </Field></div>
            <div className="hidden md:block">
              <span className="mb-1.5 block text-[0.8rem] text-white/60">Durée</span>
              <div className="flex min-h-12 items-center rounded-lg bg-white text-[#17142e]">
                <button type="button" aria-label="Un jour de moins" onClick={() => setDays((d) => Math.max(1, d - 1))} className="h-12 w-11 text-xl transition-transform active:scale-90">
                  −
                </button>
                <span className="w-20 text-center font-semibold tabular-nums" aria-live="polite">
                  {days} {days > 1 ? 'jours' : 'jour'}
                </span>
                <button type="button" aria-label="Un jour de plus" onClick={() => setDays((d) => Math.min(30, d + 1))} className="h-12 w-11 text-xl transition-transform active:scale-90">
                  +
                </button>
              </div>
            </div>
            <button type="submit" className="min-h-12 rounded-lg px-7 font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.97]" style={{ background: RED }}>
              Voir les voitures
            </button>
          </form>
        </div>

        {/* the stops along the way */}
        {STOPS.map((s) => (
          <div key={s.big} data-stop className="pointer-events-none absolute bottom-28 left-5 z-10 max-w-xl opacity-0 md:bottom-16 md:left-10">
            <p className="text-[clamp(3rem,7.4vw,7rem)] font-black uppercase leading-[0.86]" style={{ fontFamily: SIGN }}>
              {s.big}
            </p>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/85">{s.small}</p>
          </div>
        ))}

        {/* the dashboard */}
        <div data-hud className="absolute right-5 top-20 z-10 md:top-auto md:bottom-10 flex items-end gap-5 rounded-2xl px-4 py-2.5 backdrop-blur-md md:right-10 md:gap-8 md:px-7 md:py-4" style={{ background: 'rgba(28,24,56,0.6)', border: `1px solid ${LINE_D}` }}>
          <div>
            <p className="text-xs text-white/60">Parcourus</p>
            <p className="text-[2.2rem] font-black leading-none tabular-nums md:text-[3rem]" style={{ fontFamily: SIGN }}>
              <span ref={kmEl}>000</span> <span className="text-lg md:text-xl">km</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60">Altitude</p>
            <p className="text-[2.2rem] font-black leading-none tabular-nums md:text-[3rem]" style={{ fontFamily: SIGN, color: DUSK }}>
              <span ref={altEl}>470</span> <span className="text-lg md:text-xl">m</span>
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-white/60">Ouarzazate</p>
            <p className="text-[2.2rem] font-black leading-none tabular-nums md:text-[3rem]" style={{ fontFamily: SIGN }}>
              <span ref={leftEl}>196</span> <span className="text-lg md:text-xl">km</span>
            </p>
          </div>
        </div>
      </section>

      {/* The key board */}
      <section id="flotte" className="scroll-mt-0 px-5 py-20 md:px-10 md:py-28" style={{ background: NIGHT }}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-3xl text-[clamp(3rem,7vw,6.4rem)] font-black uppercase leading-[0.86]" style={{ fontFamily: SIGN }}>
            Prenez une clé
          </h2>
          <p className="max-w-sm text-white/70">
            Prix pour {days} {days > 1 ? 'jours' : 'jour'}, du {fr(start)} au {fr(end)}, tout compris. Moins cher par jour dès trois jours, et encore dès une semaine.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
          {/* the display */}
          <div className="min-w-0">
            <div ref={stage} className="relative aspect-[16/10] overflow-hidden rounded-[22px]">
              <Photo src={`rental/${car.id}.jpg`} alt={car.alt} pos={car.pos} zoom={false} />
              <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-sm font-semibold" style={{ background: FOB[car.cat], color: INK }}>
                {car.cat}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-[clamp(2.6rem,5vw,4.4rem)] font-black uppercase leading-[0.88]" style={{ fontFamily: SIGN }}>
                  {car.name}
                </p>
                <p className="mt-2 text-white/70">
                  ou similaire, {car.seats} places, {car.bags} valises, boîte {car.gear.toLowerCase()}, {car.fuel.toLowerCase()}, climatisation
                </p>
              </div>
              <div className="text-right">
                <p className="text-[clamp(2.4rem,4vw,3.4rem)] font-black leading-none tabular-nums" style={{ fontFamily: SIGN }}>
                  {mad(rate(car, days) * days)} MAD
                </p>
                <p className="text-sm text-white/60">
                  {mad(rate(car, days))} MAD par jour, caution {mad(car.deposit)} MAD
                </p>
              </div>
            </div>
            <button type="button" onClick={() => go('reserver')} className="mt-6 w-full rounded-xl py-4 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto sm:px-10" style={{ background: RED }}>
              Réserver la {car.name}
            </button>
          </div>

          {/* the board */}
          <div className="min-w-0 rounded-[22px] p-5 md:p-7" style={{ background: BOARD, backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1.4px, transparent 1.6px)', backgroundSize: '22px 22px' }}>
            <div role="radiogroup" aria-label="Catégorie" className="flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={cat === c}
                  onClick={() => setCat(c)}
                  className="flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors"
                  style={{ borderColor: cat === c ? POST : LINE_D, background: cat === c ? POST : 'transparent', color: cat === c ? INK : POST }}
                >
                  {c !== 'Toutes' && <span className="h-2.5 w-2.5 rounded-full" style={{ background: FOB[c] }} aria-hidden />}
                  {c}
                </button>
              ))}
            </div>
            <div role="radiogroup" aria-label="Voiture" className="mt-8 grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4">
              {CARS.map((c, i) => (
                <KeyTag key={c.id} car={c} n={i + 1} on={c.id === carId} off={cat !== 'Toutes' && c.cat !== cat} days={days} onPick={() => pick(c.id)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Itineraries */}
      <section id="routes" className="scroll-mt-0 px-5 py-20 md:px-10 md:py-28" style={{ background: HAZE, color: INK }}>
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className="text-[clamp(3rem,7vw,6.4rem)] font-black uppercase leading-[0.86]" style={{ fontFamily: SIGN }}>
            Quatre routes à faire
          </h2>
          <p className="max-w-sm opacity-70">Celles que nos clients font le plus, avec la voiture qu’on leur conseille.</p>
        </div>
        <ol className="mt-14 grid gap-x-6 gap-y-14 md:grid-cols-2">
          {ROUTES.map((r) => (
            <li key={r.to} data-route className="relative">
              <div data-route-img className="group relative aspect-[4/3] overflow-hidden rounded-[22px]">
                <Photo src={r.src} alt={r.alt} />
              </div>
              <div data-borne className="absolute -top-6 right-5 md:right-7">
                <Borne ar={r.ar} to={r.to} km={r.km} />
              </div>
              <h3 className="mt-6 text-[clamp(2rem,3.4vw,2.8rem)] font-black uppercase leading-[0.9]" style={{ fontFamily: SIGN }}>
                {r.t}
              </h3>
              <p className="mt-3 max-w-md leading-relaxed opacity-75">{r.d}</p>
              <p className="mt-3 text-sm">
                <span className="opacity-60">{r.time}, en </span>
                <span className="font-semibold">{r.car}</span>
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Conditions */}
      <section id="conditions" className="scroll-mt-0 px-5 pb-20 md:px-10 md:pb-28" style={{ background: HAZE, color: INK }}>
        <h2 className="max-w-4xl text-[clamp(3rem,7vw,6.4rem)] font-black uppercase leading-[0.86]" style={{ fontFamily: SIGN }}>
          Les conditions, sans astérisque
        </h2>
        <dl className="mt-12 grid gap-px overflow-hidden rounded-[22px] sm:grid-cols-2 lg:grid-cols-4" style={{ background: LINE }}>
          {[
            ['21 ans', 'Âge minimum, avec deux ans de permis. Le permis étranger suffit pour un séjour.'],
            ['0 MAD', 'De frais de livraison à Ménara, à Mohammed V et dans Marrakech.'],
            ['60 min', 'D’attente offerte si votre vol a du retard : nous suivons le numéro de vol.'],
            ['Plein/plein', 'La voiture part le plein fait, vous la rendez comme elle est partie.'],
          ].map(([k, v]) => (
            <div key={k} className="bg-white p-6 md:p-8">
              <dt className="text-[clamp(2.6rem,4vw,3.6rem)] font-black uppercase leading-none" style={{ fontFamily: SIGN, color: RED }}>
                {k}
              </dt>
              <dd className="mt-3 leading-relaxed opacity-75">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Booking */}
      <section id="reserver" className="scroll-mt-0 px-5 py-20 md:px-10 md:py-28" style={{ background: NIGHT }}>
        <h2 className="text-[clamp(3rem,7vw,6.4rem)] font-black uppercase leading-[0.86]" style={{ fontFamily: SIGN }}>
          Réservez en deux minutes
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div className="min-w-0 rounded-[22px] p-6 md:p-8" style={{ background: BOARD }}>
            <div className="flex items-center gap-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                <Photo src={`rental/${car.id}.jpg`} alt="" pos={car.pos} zoom={false} />
              </div>
              <div className="min-w-0">
                <p className="text-[2.2rem] font-black uppercase leading-none" style={{ fontFamily: SIGN }}>
                  {car.name}
                </p>
                <p className="mt-1 text-sm text-white/65">
                  {car.cat}, boîte {car.gear.toLowerCase()}, {car.seats} places
                </p>
              </div>
            </div>
            <dl className="mt-6 space-y-3 border-t pt-5 text-sm" style={{ borderColor: LINE_D }}>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Départ</dt>
                <dd className="text-right">
                  {fr(start)}, {from}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Retour</dt>
                <dd className="text-right">
                  {fr(end)}, {backPlace}
                </dd>
              </div>
            </dl>
            <fieldset className="mt-6 border-t pt-5" style={{ borderColor: LINE_D }}>
              <legend className="sr-only">Options</legend>
              <ul className="space-y-2">
                {OPTIONS.map((o) => (
                  <li key={o.id}>
                    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-lg px-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={opts.includes(o.id)}
                          onChange={(e) => setOpts((s) => (e.target.checked ? [...s, o.id] : s.filter((x) => x !== o.id)))}
                          className="h-4 w-4 accent-[#ff9a62]"
                        />
                        {o.t}
                      </span>
                      <span className="text-sm tabular-nums text-white/60">{o.p} MAD/j</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
            <div className="mt-6 space-y-1.5 border-t pt-5 text-sm tabular-nums" style={{ borderColor: LINE_D }}>
              <p className="flex justify-between">
                <span className="text-white/60">
                  {days} j × {mad(rate(car, days))} MAD
                </span>
                <span>{mad(rate(car, days) * days)} MAD</span>
              </p>
              {optTotal > 0 && (
                <p className="flex justify-between">
                  <span className="text-white/60">Options</span>
                  <span>{mad(optTotal)} MAD</span>
                </p>
              )}
              {oneWay > 0 && (
                <p className="flex justify-between">
                  <span className="text-white/60">Retour dans une autre ville</span>
                  <span>{mad(oneWay)} MAD</span>
                </p>
              )}
              <p className="flex items-baseline justify-between pt-3">
                <span>Total</span>
                <span className="text-[3rem] font-black leading-none" style={{ fontFamily: SIGN, color: DUSK }} aria-live="polite">
                  {mad(total)} MAD
                </span>
              </p>
              <p className="pt-1 text-xs text-white/55">Caution rendue au retour : {mad(car.deposit)} MAD.</p>
            </div>
          </div>

          <div className="min-w-0 rounded-[22px] bg-white p-6 text-[#17142e] md:p-10">
            {done ? (
              <DemoDone
                tone={{ on: RED, onText: '#fff' }}
                title="Votre voiture est réservée."
                lines={[`${car.name}, du ${fr(start)} au ${fr(end)}`, `${from}${flight ? `, vol ${flight.toUpperCase()}` : ''}`, `Total ${mad(total)} MAD, ${pay === 'livraison' ? 'payé à la livraison' : 'acompte de 20 % en ligne'}`, `Au nom de ${name}`]}
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
                <p className="text-lg leading-relaxed opacity-75">Confirmation sur WhatsApp, puis le nom de l’agent qui vous attendra à la sortie du terminal, une pancarte à votre nom.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Conducteur principal">
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={control} style={{ borderColor: LINE }} />
                  </Field>
                  <Field label="WhatsApp ou téléphone">
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" inputMode="tel" className={control} style={{ borderColor: LINE }} />
                  </Field>
                </div>
                <Field label="Numéro de vol, si vous arrivez en avion">
                  <input value={flight} onChange={(e) => setFlight(e.target.value)} placeholder="AT 801" className={control} style={{ borderColor: LINE }} />
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
                      <span className="block font-semibold">{t}</span>
                      <span className="mt-1 block text-sm opacity-65">{d}</span>
                    </button>
                  ))}
                </div>
                {err && (
                  <p role="alert" className="text-sm font-semibold" style={{ color: RED }}>
                    {err}
                  </p>
                )}
                <button type="submit" className="w-full rounded-xl py-4 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: RED }}>
                  Réserver pour {mad(total)} MAD
                </button>
                <p className="text-center text-sm opacity-55">Annulation gratuite jusqu’à 48 heures avant le départ.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-20 md:px-10 md:py-24" style={{ background: HAZE, color: INK }}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <h2 className="text-[clamp(2.8rem,5vw,4.6rem)] font-black uppercase leading-[0.86]" style={{ fontFamily: SIGN }}>
            Ce qu’on nous demande
          </h2>
          <div className="divide-y border-y" style={{ borderColor: LINE }}>
            {[
              ['Faut-il une carte de crédit ?', 'Non. La caution peut être versée en espèces ou par virement, et vous est rendue au retour de la voiture.'],
              ['Mon permis étranger est-il accepté ?', 'Oui, pour un séjour touristique. Le permis international n’est demandé que si le vôtre n’est pas en alphabet latin.'],
              ['Et si mon vol arrive en pleine nuit ?', 'Nous livrons 24 heures sur 24 à Ménara et à Mohammed V. Un agent suit votre vol et vous attend à la sortie.'],
              ['Puis-je rendre la voiture dans une autre ville ?', 'Oui, entre Marrakech et Casablanca, pour un forfait de 600 MAD affiché avant de réserver.'],
            ].map(([q, a]) => (
              <details key={q} className="group py-5" style={{ borderColor: LINE }}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
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
      <footer className="px-5 pb-10 pt-16 md:px-10" style={{ background: NIGHT }}>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex items-end gap-5">
            <Borne ar="رحلة" to="Rihla" km={0} className="scale-90" />
            <p className="max-w-xs text-[2.2rem] font-black uppercase leading-[0.9]" style={{ fontFamily: SIGN }}>
              Les clés vous attendent à l’arrivée
            </p>
          </div>
          <div className="text-sm leading-relaxed">
            <p className="mb-2 text-white/55">Agences</p>
            <p>Guéliz, Marrakech</p>
            <p>Maârif, Casablanca</p>
            <p className="mt-2 text-white/60">Comptoirs aux aéroports Ménara et Mohammed V</p>
          </div>
          <div className="text-sm leading-relaxed">
            <p className="mb-2 text-white/55">Horaires</p>
            <p>Agences de 8 h 30 à 20 h, 7 jours sur 7</p>
            <p>Aéroports et assistance 24 heures sur 24</p>
          </div>
        </div>
        <div className="mt-14 border-t pt-6" style={{ borderColor: LINE_D }}>
          <DemoFooter name="Rihla" folders={['rental']} />
        </div>
      </footer>
    </div>
  )
}
