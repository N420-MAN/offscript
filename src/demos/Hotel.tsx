import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource/cormorant-garamond/300.css'
import '@fontsource/cormorant-garamond/300-italic.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource-variable/inter'
import { DayPicker, DemoDone, DemoFooter, Photo, useDays } from './kit'

gsap.registerPlugin(ScrollTrigger)

const SERIF = '"Cormorant Garamond", Georgia, serif'
const SANS = '"Inter Variable", system-ui, sans-serif'
const LIME = '#f6efe4' // chaux
const TERRA = '#b4552d'
const INK = '#2a1d16'
const OLIVE = '#56603f'
const tone = { on: TERRA, onText: '#fff', line: 'rgba(42,29,22,0.18)' }

const ROOMS = [
  { id: 'jardin', n: 'Chambre Jardin', size: '24 m²', bed: 'Lit double', view: 'Ouvre sur le patio', price: 1450, src: 'hotel/room-2.jpg', alt: 'Une fenêtre en bois ouverte sur la verdure, lumière du matin', pos: '50% 50%' },
  { id: 'bassin', n: 'Suite Bassin', size: '38 m²', bed: 'Lit king size', view: 'Vue sur le bassin', price: 2300, src: 'hotel/room-1.jpg', alt: 'Une porte entrouverte sur la chambre : tête de lit rouge et suspensions allumées', pos: '30% 60%' },
  { id: 'terrasse', n: 'Suite Terrasse', size: '46 m²', bed: 'Lit king size + salon', view: 'Terrasse privée sous les palmiers', price: 2900, src: 'hotel/room-3.jpg', alt: 'Une terrasse le soir sous les palmiers : fauteuils en rotin et parasol', pos: '60% 55%' },
]
const EXPERIENCES = [
  { t: 'Hammam & gommage', d: 'Savon noir, kessa, argile. Une heure, en fin de journée.', p: '450 MAD', src: 'riad/hammam.jpg', alt: 'La salle chaude du hammam : voûte enduite, zellige noir et blanc, lumière douce' },
  { t: 'Dîner sur le toit', d: 'Quatre services sous les étoiles, réservation la veille.', p: '650 MAD', src: 'riad/rooftop-night.jpg', alt: 'Les toits de la médina la nuit, sous la pleine lune' },
  { t: 'Le thé de l’après-midi', d: 'Servi chaque jour à 17h dans le patio, offert.', p: 'Offert', src: 'riad/tea.jpg', alt: 'Un service à thé en argent et un bouquet de roses dans un salon marocain' },
]
const TAX = 30 // taxe de séjour par nuit et par adulte (MAD)

function Booking({ room, setRoom }: { room: string; setRoom: (r: string) => void }) {
  const days = useDays(21)
  const [arrive, setArrive] = useState(days[3].key)
  const [nights, setNights] = useState(3)
  const [adults, setAdults] = useState(2)
  const [name, setName] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const r = ROOMS.find((x) => x.id === room)!
  const a = days.find((d) => d.key === arrive)!
  const out = new Date(a.date)
  out.setDate(out.getDate() + nights)
  const outLabel = out.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const total = r.price * nights + TAX * adults * nights
  const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ')
  if (done)
    return (
      <DemoDone
        tone={tone}
        title="Votre séjour est réservé."
        lines={[`${r.n} · ${nights} nuit${nights > 1 ? 's' : ''} · ${adults} adulte${adults > 1 ? 's' : ''}`, `Arrivée ${a.weekday} ${a.label} · départ ${outLabel}`, `Total ${fmt(total)} MAD · petit-déjeuner inclus`]}
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
        setErr('')
        setDone(true)
      }}
    >
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] opacity-60">Arrivée</p>
        <DayPicker days={days} value={arrive} onChange={setArrive} tone={tone} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          ['Nuits', nights, setNights, 1, 14],
          ['Adultes', adults, setAdults, 1, 4],
        ].map(([label, v, set, min, max]) => (
          <div key={label as string}>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] opacity-60">{label as string}</p>
            <div className="flex items-center gap-3">
              <button type="button" aria-label={`${label} : moins`} onClick={() => (set as (f: (n: number) => number) => void)((n) => Math.max(min as number, n - 1))} className="grid h-11 w-11 place-items-center rounded-full border text-xl transition-transform active:scale-90" style={{ borderColor: tone.line }}>
                −
              </button>
              <span className="w-8 text-center text-2xl tabular-nums" aria-live="polite">
                {v as number}
              </span>
              <button type="button" aria-label={`${label} : plus`} onClick={() => (set as (f: (n: number) => number) => void)((n) => Math.min(max as number, n + 1))} className="grid h-11 w-11 place-items-center rounded-full border text-xl transition-transform active:scale-90" style={{ borderColor: tone.line }}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] opacity-60">Chambre</p>
        <div className="grid gap-2">
          {ROOMS.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={x.id === room}
              onClick={() => setRoom(x.id)}
              className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-[transform,border-color] hover:-translate-y-0.5"
              style={{ borderColor: x.id === room ? TERRA : tone.line, boxShadow: x.id === room ? `0 0 0 1px ${TERRA}` : undefined }}
            >
              <span>
                <span className="block text-xl" style={{ fontFamily: SERIF, fontWeight: 500 }}>
                  {x.n}
                </span>
                <span className="text-sm opacity-60">
                  {x.size} · {x.view}
                </span>
              </span>
              <span className="shrink-0 text-sm tabular-nums">{fmt(x.price)} MAD</span>
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.2em] opacity-60">Nom</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="min-h-11 w-full border-0 border-b bg-transparent text-lg outline-none" style={{ borderColor: tone.line }} />
      </label>
      <div className="flex items-end justify-between gap-4 border-t pt-5" style={{ borderColor: tone.line }}>
        <div>
          <p className="text-sm opacity-60">
            {nights} nuit{nights > 1 ? 's' : ''} · taxe de séjour incluse
          </p>
          <p className="text-4xl tabular-nums" style={{ fontFamily: SERIF, fontWeight: 500 }} aria-live="polite">
            {fmt(total)} MAD
          </p>
        </div>
        <p className="text-right text-sm opacity-60">Petit-déjeuner offert · Annulation gratuite 7 jours avant</p>
      </div>
      {err && (
        <p role="alert" className="text-sm text-[#a3341a]">
          {err}
        </p>
      )}
      <button type="submit" className="w-full rounded-full py-4 text-sm uppercase tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: TERRA }}>
        Réserver ce séjour
      </button>
    </form>
  )
}

export default function Hotel() {
  const root = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState('bassin')

  useGSAP(
    () => {
      gsap.from('[data-hero-img]', { scale: 1.1, duration: 2.4, ease: 'expo.out' })
      gsap.from('[data-rise]', { yPercent: 115, duration: 1.5, stagger: 0.12, ease: 'expo.out', delay: 0.3 })
      gsap.from('[data-fade]', { opacity: 0, y: 14, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.8 })
      // the arch moment: a horseshoe arch opens onto the courtyard as the section crosses the screen
      gsap.fromTo('[data-arch]', { clipPath: 'inset(18% 32% 0% 32% round 999px 999px 0 0)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0 0)', ease: 'none', scrollTrigger: { trigger: '[data-arch-wrap]', start: 'top 75%', end: 'center 45%', scrub: true } })
    },
    { scope: root },
  )

  const pick = (id: string) => {
    setRoom(id)
    document.getElementById('reserver')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={root} style={{ background: LIME, color: INK, fontFamily: SANS }}>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden text-white">
        <div data-hero-img className="absolute inset-0">
          <Photo eager zoom={false} src="riad/pool.jpg" alt="Le patio du riad : bassin de zellige vert, palmiers et fauteuils autour de l’eau" pos="50% 60%" />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(42,29,22,0.55) 0%, rgba(42,29,22,0.05) 35%, rgba(42,29,22,0.7) 100%)' }} />
        <header data-fade className="relative z-10 flex items-center justify-between px-5 py-5 md:px-12 md:py-7">
          <span className="text-3xl" style={{ fontFamily: SERIF, fontWeight: 500 }}>
            Riad Zéphyr
          </span>
          <nav className="hidden gap-9 text-sm md:flex">
            {[['Chambres', '#chambres'], ['Expériences', '#experiences'], ['Accès', '#acces']].map(([l, h]) => (
              <a key={h} href={h} className="opacity-85 transition-opacity hover:opacity-100">
                {l}
              </a>
            ))}
          </nav>
          <a href="#reserver" className="rounded-full border border-white/60 px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-[transform,background-color,color] hover:-translate-y-0.5 hover:bg-white hover:text-[#2a1d16] active:scale-95">
            Réserver
          </a>
        </header>
        <div className="relative z-10 mt-auto px-5 pb-8 md:px-12 md:pb-12">
          <p data-fade className="mb-4 text-xs uppercase tracking-[0.3em] opacity-90">
            Maison d’hôtes · Médina de Marrakech
          </p>
          <h1 className="max-w-[15ch] text-[clamp(3.2rem,8.4vw,8.4rem)] leading-[0.9]" style={{ fontFamily: SERIF, fontWeight: 300 }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-rise className="block">Sept chambres</span>
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <span data-rise className="block italic">autour d’un bassin.</span>
            </span>
          </h1>
          {/* booking bar */}
          <form
            data-fade
            onSubmit={(e) => {
              e.preventDefault()
              document.getElementById('reserver')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="mt-8 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl text-sm md:grid-cols-[1fr_1fr_1fr_auto]"
            style={{ background: 'rgba(255,255,255,0.25)' }}
          >
            {[
              ['Arrivée', 'Choisir une date'],
              ['Nuits', '3 nuits'],
              ['Voyageurs', '2 adultes'],
            ].map(([k, v]) => (
              <div key={k} className="bg-white/90 px-4 py-3 text-[#2a1d16] backdrop-blur">
                <span className="block text-[0.7rem] uppercase tracking-[0.18em] opacity-60">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            <button type="submit" className="col-span-2 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:brightness-110 md:col-span-1" style={{ background: TERRA }}>
              Disponibilités
            </button>
          </form>
        </div>
      </section>

      {/* Intro */}
      <section className="px-5 py-24 md:px-12 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.3em]" style={{ color: TERRA }}>
              La maison
            </p>
            <h2 className="text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.98]" style={{ fontFamily: SERIF, fontWeight: 300 }}>
              Une maison du XIXᵉ, <em>restaurée pièce par pièce</em> par des artisans de la médina.
            </h2>
            <p className="mt-7 max-w-lg text-lg leading-relaxed opacity-75">
              Plafonds en cèdre peint, tadelakt, zellige taillé à la main. Derrière une porte discrète, à huit minutes à pied de la place Jemaa el-Fna, le bruit de la ville s’arrête.
            </p>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t pt-6" style={{ borderColor: tone.line }}>
              {[
                ['7', 'chambres'],
                ['8 min', 'de la place'],
                ['25 min', 'de l’aéroport'],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="sr-only">{k}</dt>
                  <dd className="text-4xl" style={{ fontFamily: SERIF, fontWeight: 500 }}>
                    {v}
                  </dd>
                  <dd className="text-sm opacity-60">{k}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid h-[30rem] grid-cols-2 gap-4 md:h-[34rem]">
            <div className="group overflow-hidden rounded-t-full">
              <Photo src="riad/up.jpg" alt="Le patio vu d’en bas : galeries sculptées sur trois étages et plantes suspendues" />
            </div>
            <div className="grid min-h-0 grid-rows-2 gap-4 pt-16">
              <div className="group min-h-0 overflow-hidden rounded-[20px]">
                <Photo src="riad/ceiling.jpg" alt="Un plafond en bois de cèdre peint et sculpté" />
              </div>
              <div className="group min-h-0 overflow-hidden rounded-[20px]">
                <Photo src="hotel/courtyard.jpg" alt="Une galerie blanche ouverte sur le jardin d’orangers" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section id="chambres" className="scroll-mt-4 px-5 pb-24 md:px-12 md:pb-32">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.98]" style={{ fontFamily: SERIF, fontWeight: 300 }}>
            Les chambres
          </h2>
          <p className="max-w-sm opacity-70">Petit-déjeuner servi sur le toit, climatisation, Wi-Fi, linge en coton égyptien.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {ROOMS.map((r) => (
            <article key={r.id} className="group">
              <div className="aspect-[3/4] overflow-hidden" style={{ borderRadius: '999px 999px 16px 16px' }}>
                <Photo src={r.src} alt={r.alt} pos={r.pos} />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="text-3xl" style={{ fontFamily: SERIF, fontWeight: 500 }}>
                  {r.n}
                </h3>
                <p className="shrink-0 text-sm">
                  dès <span className="text-lg font-semibold tabular-nums">{r.price.toLocaleString('fr-FR').replace(/ | /g, ' ')}</span> MAD
                </p>
              </div>
              <p className="mt-1 text-sm opacity-65">
                {r.size} · {r.bed} · {r.view}
              </p>
              <button type="button" onClick={() => pick(r.id)} className="mt-4 text-sm font-medium underline-offset-4 transition-colors hover:underline" style={{ color: TERRA }}>
                Réserver cette chambre →
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Moment */}
      <section data-arch-wrap className="relative h-[110vh] min-h-[640px] overflow-hidden" style={{ background: LIME }}>
        <div data-arch className="absolute inset-0">
          <Photo src="riad/pool-2.jpg" alt="Le bassin du patio, l’ombre des palmes sur le zellige" zoom={false} />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative z-10 flex h-full items-end px-5 pb-16 md:px-12">
          <p className="max-w-3xl text-[clamp(2.4rem,6vw,5.8rem)] leading-[0.98] text-white" style={{ fontFamily: SERIF, fontWeight: 300, fontStyle: 'italic' }}>
            Ici, le temps se mesure à l’ombre qui tourne sur le zellige.
          </p>
        </div>
      </section>

      {/* Experiences */}
      <section id="experiences" className="scroll-mt-4 px-5 py-24 md:px-12 md:py-32" style={{ background: OLIVE, color: LIME }}>
        <h2 className="mb-12 text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.98]" style={{ fontFamily: SERIF, fontWeight: 300 }}>
          Pendant votre séjour
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {EXPERIENCES.map((x) => (
            <article key={x.t} className="group">
              <div className="aspect-[4/3] overflow-hidden rounded-[18px]">
                <Photo src={x.src} alt={x.alt} />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl" style={{ fontFamily: SERIF, fontWeight: 500 }}>
                  {x.t}
                </h3>
                <span className="shrink-0 text-sm opacity-80">{x.p}</span>
              </div>
              <p className="mt-1 text-sm opacity-75">{x.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Booking */}
      <section id="reserver" className="scroll-mt-4 px-5 py-24 md:px-12 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div id="acces">
            <h2 className="text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.98]" style={{ fontFamily: SERIF, fontWeight: 300 }}>
              Réservez <em>en direct</em>, au meilleur prix.
            </h2>
            <p className="mt-6 max-w-md opacity-75">Sans commission de plateforme : le thé de bienvenue et le transfert depuis l’aéroport sont offerts dès trois nuits.</p>
            <dl className="mt-10 space-y-6">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] opacity-55">Adresse</dt>
                <dd className="mt-1 text-lg">Médina, quartier Mouassine, Marrakech</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] opacity-55">Arrivée · départ</dt>
                <dd className="mt-1 text-lg">À partir de 14h · jusqu’à 12h</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] opacity-55">Accès</dt>
                <dd className="mt-1 text-lg">Un porteur vous attend au parking de la médina</dd>
              </div>
            </dl>
          </div>
          <div className="min-w-0 rounded-[28px] bg-white p-6 md:p-10">
            <Booking room={room} setRoom={setRoom} />
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 md:px-12" style={{ background: INK, color: LIME }}>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <span className="text-3xl" style={{ fontFamily: SERIF, fontWeight: 500 }}>
            Riad Zéphyr
          </span>
          <span className="text-sm opacity-70">Médina de Marrakech · Maison d’hôtes</span>
        </div>
        <DemoFooter name="Riad Zéphyr" folders={['riad']} />
      </footer>
    </div>
  )
}
