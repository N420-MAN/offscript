import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/inter'
import { DayPicker, DemoDone, DemoFooter, Photo, SlotGrid, useDays } from './kit'

gsap.registerPlugin(ScrollTrigger)

const SERIF = '"Fraunces Variable", Georgia, serif'
const SANS = '"Inter Variable", system-ui, sans-serif'
const NIGHT = '#14110e'
const CREAM = '#f4ece0'
const SAFFRON = '#e2a23b'
const CLAY = '#b5532f'
const tone = { on: SAFFRON, onText: NIGHT, line: 'rgba(244,236,224,0.22)' }

const MENU: Record<string, { n: string; d: string; p: number; tag?: string }[]> = {
  Entrées: [
    { n: 'Briouates au fromage frais', d: 'Menthe, citron confit, miel de thym', p: 70 },
    { n: 'Zaalouk fumé', d: 'Aubergine au feu de bois, cumin, huile d’argan', p: 55, tag: 'végétarien' },
    { n: 'Pastilla de la mer', d: 'Crevettes, vermicelle, coriandre, feuille de brick', p: 120 },
    { n: 'Harira du soir', d: 'Lentilles, pois chiches, dattes à part', p: 45 },
  ],
  Plats: [
    { n: 'Tajine d’agneau aux pruneaux', d: 'Amandes grillées, sésame, sept heures de cuisson', p: 185, tag: 'signature' },
    { n: 'Couscous aux sept légumes', d: 'Le vendredi : légumes du marché, bouillon à part', p: 145 },
    { n: 'Couscous tfaya', d: 'Agneau, oignons confits aux raisins, amandes grillées', p: 165 },
    { n: 'Poulet fermier au citron confit', d: 'Olives violettes, frites maison', p: 160 },
    { n: 'Poisson du jour en chermoula', d: 'Pommes de terre, poivrons rôtis', p: 195 },
  ],
  Douceurs: [
    { n: 'Seffa au beurre noisette', d: 'Vermicelle, cannelle, amandes', p: 65 },
    { n: 'Msemen tiède', d: 'Miel d’oranger, amlou maison', p: 50 },
    { n: 'Orange à la cannelle', d: 'Eau de fleur d’oranger, menthe', p: 40, tag: 'végétalien' },
  ],
  Thés: [
    { n: 'Thé à la menthe', d: 'Servi à table, à la théière', p: 30 },
    { n: 'Thé aux herbes de l’Atlas', d: 'Louisa, absinthe, verveine', p: 35 },
    { n: 'Café aux épices', d: 'Cardamome, cannelle, gingembre', p: 30 },
  ],
}
const MENU_PHOTO: Record<string, { src: string; alt: string }> = {
  Entrées: { src: 'restaurant/table.jpg', alt: 'Bissara, lentilles, tajine de légumes et pastilla sur une table en bois' },
  Plats: { src: 'restaurant/tajine-2.jpg', alt: 'Tajine de viande aux pruneaux, carottes, olives et amandes effilées' },
  Douceurs: { src: 'restaurant/fire.jpg', alt: 'Des msemen dorés sur une plaque, au-dessus du feu' },
  Thés: { src: 'restaurant/tea.jpg', alt: 'Une théière en verre et des verres de thé à la menthe' },
}
const SIGNATURES = [
  { src: 'restaurant/tajine.jpg', alt: 'Tajine d’agneau aux pruneaux, amandes et sésame', n: 'Tajine aux pruneaux', p: 185 },
  { src: 'restaurant/couscous-legumes.jpg', alt: 'Couscous aux sept légumes en dôme, dans un plat en terre', n: 'Couscous aux sept légumes', p: 145 },
  { src: 'restaurant/couscous-tfaya.jpg', alt: 'Couscous tfaya : oignons confits aux raisins et amandes grillées sur la semoule', n: 'Couscous tfaya', p: 165 },
]
const SLOTS_LUNCH = ['12:00', '12:30', '13:00', '13:30', '14:00']
const SLOTS_DINNER = ['19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30']

function Booking() {
  const days = useDays(10, [1]) // closed on Mondays
  const first = days.find((d) => !d.closed)!.key
  const [day, setDay] = useState(first)
  const [service, setService] = useState<'Déjeuner' | 'Dîner'>('Dîner')
  const [slot, setSlot] = useState('')
  const [guests, setGuests] = useState(2)
  const [name, setName] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const d = days.find((x) => x.key === day)!
  if (done)
    return (
      <DemoDone
        tone={tone}
        title={`Table pour ${guests}, c’est noté.`}
        lines={[`${d.weekday} ${d.label} · ${service.toLowerCase()} · ${slot}`, `Au nom de ${name}`, 'Confirmation par SMS une heure avant.']}
        onReset={() => {
          setDone(false)
          setSlot('')
          setName('')
        }}
      />
    )
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (!slot) return setErr('Choisissez un horaire.')
        if (name.trim().length < 2) return setErr('Indiquez votre nom.')
        setErr('')
        setDone(true)
      }}
      className="space-y-7"
    >
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] opacity-60">1 · Le jour</p>
        <DayPicker days={days} value={day} onChange={(k) => (setDay(k), setSlot(''))} tone={tone} />
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.18em] opacity-60">2 · L’heure</p>
          <div role="radiogroup" aria-label="Service" className="flex rounded-full border p-1 text-sm" style={{ borderColor: tone.line }}>
            {(['Déjeuner', 'Dîner'] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={service === s}
                onClick={() => (setService(s), setSlot(''))}
                className="min-h-9 rounded-full px-4 transition-colors"
                style={{ background: service === s ? CREAM : 'transparent', color: service === s ? NIGHT : undefined }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <SlotGrid slots={service === 'Déjeuner' ? SLOTS_LUNCH : SLOTS_DINNER} dayKey={day + service} value={slot} onChange={setSlot} tone={tone} />
      </div>
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] opacity-60">3 · Couverts</p>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Un couvert de moins" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-11 w-11 place-items-center rounded-full border text-xl transition-transform active:scale-90" style={{ borderColor: tone.line }}>
              −
            </button>
            <span className="w-10 text-center text-2xl tabular-nums" aria-live="polite">
              {guests}
            </span>
            <button type="button" aria-label="Un couvert de plus" onClick={() => setGuests((g) => Math.min(12, g + 1))} className="grid h-11 w-11 place-items-center rounded-full border text-xl transition-transform active:scale-90" style={{ borderColor: tone.line }}>
              +
            </button>
          </div>
        </div>
        <label className="block">
          <span className="mb-3 block text-xs uppercase tracking-[0.18em] opacity-60">4 · Votre nom</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="w-full border-0 border-b bg-transparent py-2.5 text-lg outline-none focus:border-current" style={{ borderColor: tone.line }} placeholder="Nom et prénom" />
        </label>
      </div>
      {err && (
        <p role="alert" className="text-sm" style={{ color: '#ffb59a' }}>
          {err}
        </p>
      )}
      <button type="submit" className="w-full rounded-full py-4 text-sm font-semibold uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: SAFFRON, color: NIGHT }}>
        Réserver {slot ? `· ${slot}` : ''}
      </button>
    </form>
  )
}

export default function Restaurant() {
  const root = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<keyof typeof MENU>('Plats')

  useGSAP(
    () => {
      gsap.from('[data-hero-img]', { scale: 1.12, duration: 2.2, ease: 'expo.out' })
      gsap.from('[data-rise]', { yPercent: 115, duration: 1.4, stagger: 0.1, ease: 'expo.out', delay: 0.25 })
      gsap.from('[data-fade]', { opacity: 0, y: 16, duration: 1, stagger: 0.08, ease: 'power3.out', delay: 0.7 })
      // the tea moment: the photo opens from a slit to full frame while its section crosses the screen
      gsap.fromTo('[data-tea]', { clipPath: 'inset(38% 30% 38% 30% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '[data-tea-wrap]', start: 'top 80%', end: 'center center', scrub: true } })
    },
    { scope: root },
  )

  return (
    <div ref={root} style={{ background: NIGHT, color: CREAM, fontFamily: SANS }}>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <div data-hero-img className="absolute inset-0">
          <Photo eager zoom={false} src="restaurant/tajine.jpg" alt="Tajine d’agneau aux pruneaux et aux amandes, sur une table en zellige" pos="50% 60%" />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(20,17,14,0.78) 0%, rgba(20,17,14,0.35) 45%, rgba(20,17,14,0) 70%), linear-gradient(180deg, rgba(20,17,14,0.6) 0%, rgba(20,17,14,0.1) 30%, rgba(20,17,14,0.8) 100%)',
          }}
        />
        <header data-fade className="relative z-10 flex items-center justify-between px-5 py-5 md:px-12 md:py-7">
          <span className="text-2xl md:text-3xl" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 72', fontStyle: 'italic' }}>
            Maison Safran
          </span>
          <nav className="hidden gap-9 text-sm md:flex">
            {[['La carte', '#carte'], ['Le lieu', '#lieu'], ['Infos', '#infos']].map(([l, h]) => (
              <a key={h} href={h} className="opacity-80 transition-opacity hover:opacity-100">
                {l}
              </a>
            ))}
          </nav>
          <a href="#reserver" className="rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: SAFFRON, color: NIGHT }}>
            Réserver
          </a>
        </header>
        <div className="relative z-10 mt-auto px-5 pb-10 md:px-12 md:pb-14">
          <p data-fade className="mb-5 text-xs uppercase tracking-[0.22em]" style={{ color: SAFFRON }}>
            Cuisine marocaine de saison · Gauthier, Casablanca
          </p>
          <h1 className="max-w-[14ch] text-[clamp(3.2rem,9vw,9rem)] leading-[0.92] tracking-[-0.02em]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 144', fontWeight: 400 }}>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-rise className="block">La table de</span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <span data-rise className="block italic" style={{ color: SAFFRON }}>
                nos grands-mères,
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-rise className="block">revisitée.</span>
            </span>
          </h1>
          <div data-fade className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href="#reserver" className="rounded-full px-7 py-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: CREAM, color: NIGHT }}>
              Réserver une table
            </a>
            <a href="#carte" className="text-sm underline-offset-4 hover:underline">
              Voir la carte →
            </a>
            <p className="text-sm opacity-75">Du mardi au dimanche · 12h–15h et 19h30–23h30</p>
          </div>
        </div>
      </section>

      {/* Signatures */}
      <section className="px-5 py-24 md:px-12 md:py-32">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-[16ch] text-[clamp(2.2rem,5vw,4.4rem)] leading-[1]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 144' }}>
            Trois plats qui font <em style={{ color: SAFFRON }}>revenir.</em>
          </h2>
          <p className="max-w-sm opacity-70">Une carte courte qui change avec le marché. Le pain sort du four toutes les heures, le thé se sert à la théière.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {SIGNATURES.map((s, i) => (
            <a key={s.n} href="#carte" onClick={() => setTab('Plats')} className={`group block ${i === 1 ? 'md:mt-16' : ''}`}>
              <div className="aspect-[4/5] overflow-hidden rounded-[22px]">
                <Photo src={s.src} alt={s.alt} />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 72' }}>
                  {s.n}
                </h3>
                <span className="tabular-nums opacity-75">{s.p} MAD</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section id="carte" className="scroll-mt-4 px-5 py-24 md:px-12 md:py-32" style={{ background: CREAM, color: NIGHT }}>
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.22em]" style={{ color: CLAY }}>
              La carte
            </p>
            <h2 className="text-[clamp(2.4rem,5.4vw,4.8rem)] leading-[1]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 144' }}>
              Ce soir, au <em>menu.</em>
            </h2>
            <div role="tablist" aria-label="Rubriques de la carte" className="mt-10 flex flex-wrap gap-2">
              {Object.keys(MENU).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className="min-h-11 rounded-full border px-5 text-sm font-medium transition-[background-color,color,transform] hover:-translate-y-0.5 active:scale-95"
                  style={{ background: tab === k ? NIGHT : 'transparent', color: tab === k ? CREAM : NIGHT, borderColor: 'rgba(20,17,14,0.25)' }}
                >
                  {k}
                </button>
              ))}
            </div>
            <ul role="tabpanel" aria-label={tab} className="mt-8">
              {MENU[tab].map((m) => (
                <li key={m.n} className="flex items-baseline gap-4 border-b py-5" style={{ borderColor: 'rgba(20,17,14,0.14)' }}>
                  <div className="flex-1">
                    <p className="text-xl md:text-2xl" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 60' }}>
                      {m.n}
                      {m.tag && (
                        <span className="ml-3 rounded-full px-2.5 py-1 align-middle text-[0.68rem] font-semibold uppercase tracking-wider" style={{ background: m.tag === 'signature' ? SAFFRON : 'rgba(20,17,14,0.08)' }}>
                          {m.tag}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm opacity-65">{m.d}</p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">{m.p} MAD</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm opacity-60">Prix nets, service compris. Allergènes sur demande.</p>
          </div>
          <div className="relative hidden lg:block">
            <div className="sticky top-8 aspect-[4/5] overflow-hidden rounded-[26px]">
              {Object.entries(MENU_PHOTO).map(([k, ph]) => (
                <div key={k} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: tab === k ? 1 : 0 }}>
                  <Photo src={ph.src} alt={ph.alt} zoom={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The place */}
      <section id="lieu" className="px-5 py-24 md:px-12 md:py-32">
        <div className="grid gap-5 md:grid-cols-12">
          <div className="group overflow-hidden rounded-[22px] md:col-span-7 md:row-span-2">
            <div className="h-full min-h-[22rem]">
              <Photo src="restaurant/room.jpg" alt="La salle du soir : banquettes bleues, suspensions en papier et lumière douce" />
            </div>
          </div>
          <div className="flex flex-col justify-center md:col-span-5 md:py-6 md:pl-6">
            <p className="mb-4 text-xs uppercase tracking-[0.22em]" style={{ color: SAFFRON }}>
              Le lieu
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.6rem)] leading-[1.02]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 144' }}>
              Soixante couverts, une terrasse, <em>un four à bois.</em>
            </h2>
            <p className="mt-6 max-w-md opacity-75">
              Une salle pour les dîners qui durent, un salon privé de douze places pour les anniversaires et les repas d’affaires, une terrasse ouverte dès les beaux jours.
            </p>
            <a href="#reserver" className="mt-8 self-start rounded-full border px-6 py-3 text-sm transition-[transform,background-color,color] hover:-translate-y-0.5 hover:bg-[#f4ece0] hover:text-[#14110e] active:scale-95" style={{ borderColor: 'rgba(244,236,224,0.4)' }}>
              Privatiser le salon
            </a>
          </div>
          <div className="group aspect-[4/3] overflow-hidden rounded-[22px] md:col-span-5 md:aspect-auto md:min-h-[16rem]">
            <Photo src="restaurant/terrace.jpg" alt="La terrasse couverte, coussins et tapis au sol" />
          </div>
        </div>
      </section>

      {/* Moment: tea */}
      <section data-tea-wrap className="relative h-screen min-h-[600px] overflow-hidden">
        <div data-tea className="absolute inset-0">
          <Photo src="restaurant/tea.jpg" alt="Thé à la menthe versé dans des verres" zoom={false} />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
          <p className="max-w-4xl text-[clamp(2.4rem,7vw,6.6rem)] leading-[1]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 144', fontStyle: 'italic' }}>
            Le thé se verse de haut. <span style={{ color: SAFFRON }}>La conversation aussi.</span>
          </p>
        </div>
      </section>

      {/* Booking + info */}
      <section id="reserver" className="scroll-mt-4 px-5 py-24 md:px-12 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div id="infos">
            <p className="mb-4 text-xs uppercase tracking-[0.22em]" style={{ color: SAFFRON }}>
              Réserver
            </p>
            <h2 className="text-[clamp(2.4rem,5vw,4.6rem)] leading-[1]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 144' }}>
              Votre table, <em>en trente secondes.</em>
            </h2>
            <dl className="mt-10 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] opacity-55">Adresse</dt>
                <dd className="mt-2">Quartier Gauthier, Casablanca</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] opacity-55">Horaires</dt>
                <dd className="mt-2">Mar.–dim. · 12h–15h · 19h30–23h30</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] opacity-55">Groupes</dt>
                <dd className="mt-2">Au-delà de 12 personnes, privatisation du salon</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] opacity-55">Accès</dt>
                <dd className="mt-2">Voiturier le soir · Tramway T1 à 5 min</dd>
              </div>
            </dl>
            <div className="group mt-10 hidden aspect-[16/10] overflow-hidden rounded-[22px] lg:block">
              <Photo src="restaurant/kitchen.jpg" alt="Un cuisinier en tablier devant les feux de la cuisine" pos="50% 35%" />
            </div>
          </div>
          <div className="min-w-0 rounded-[28px] border p-6 md:p-10" style={{ borderColor: tone.line, background: 'rgba(244,236,224,0.03)' }}>
            <Booking />
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 md:px-12" style={{ borderColor: tone.line }}>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <span className="text-3xl italic" style={{ fontFamily: SERIF }}>
            Maison Safran
          </span>
          <span className="text-sm opacity-70">Gauthier, Casablanca · Mar.–dim.</span>
        </div>
        <DemoFooter name="Maison Safran" folders={['restaurant']} />
      </footer>
    </div>
  )
}
