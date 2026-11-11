import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/inter'
import { DayPicker, DemoDone, DemoFooter, Photo, SlotGrid, useDays } from './kit'

gsap.registerPlugin(ScrollTrigger)

const HEAD = '"Archivo Variable", system-ui, sans-serif'
const SANS = '"Inter Variable", system-ui, sans-serif'
const GREEN = '#12372a'
const PAPER = '#fbf8f1'
const SUN = '#f3c13a'
const CORAL = '#e8664a'
const SKY = '#cfe3f0'
const tone = { on: GREEN, onText: PAPER, line: 'rgba(18,55,42,0.2)' }
const wide = { fontFamily: HEAD, fontVariationSettings: '"wdth" 112', fontWeight: 800 } as const

const CYCLES = [
  {
    k: 'Maternelle',
    age: '3 – 5 ans',
    hours: '8h30 – 15h30',
    size: '20 élèves par classe',
    color: SUN,
    photo: { src: 'school/classroom.jpg', alt: 'Une salle de maternelle lumineuse, tables basses et grandes fenêtres' },
    points: ['Éveil en français, arabe et anglais', 'Motricité et jeux en plein air chaque jour', 'Une maîtresse et une assistante par classe'],
  },
  {
    k: 'Primaire',
    age: '6 – 10 ans',
    hours: '8h15 – 16h00',
    size: '24 élèves par classe',
    color: SKY,
    photo: { src: 'school/library.jpg', alt: 'La bibliothèque, des rayonnages de livres du sol au plafond' },
    points: ['Programme français homologué, arabe renforcé', 'Lecture quotidienne à la bibliothèque', 'Initiation au codage dès le CE2'],
  },
  {
    k: 'Collège',
    age: '11 – 14 ans',
    hours: '8h00 – 16h30',
    size: '26 élèves par classe',
    color: '#d7ead8',
    photo: { src: 'school/lab.jpg', alt: 'Une salle de sciences : squelette, crânes et instruments sur les paillasses' },
    points: ['Sciences en laboratoire, une séance par semaine', 'Anglais par niveaux, préparation Cambridge', 'Club robotique et théâtre'],
  },
  {
    k: 'Lycée',
    age: '15 – 17 ans',
    hours: '8h00 – 17h00',
    size: '26 élèves par classe',
    color: '#f6d7cd',
    photo: { src: 'school/debate.jpg', alt: 'Des lycéens réunis autour de tables pour un débat, un écran au fond' },
    points: ['Baccalauréat français, spécialités au choix', 'Orientation dès la seconde, un conseiller dédié', 'Échanges et concours internationaux'],
  },
]

const DAY_PLAN = [
  ['8:15', 'Accueil', 'Les portes ouvrent, les parents déposent dans la cour.'],
  ['8:30', 'Langues', 'Français et arabe le matin, quand l’attention est vive.'],
  ['10:15', 'Récréation', 'Vingt minutes dehors, sous les arbres.'],
  ['10:35', 'Mathématiques', 'Par petits groupes, avec manipulation.'],
  ['12:00', 'Déjeuner', 'Cantine cuisinée sur place, menus affichés le lundi.'],
  ['13:30', 'Sciences & projets', 'Laboratoire, robotique ou arts plastiques.'],
  ['15:30', 'Sport', 'Basket, natation ou athlétisme selon les jours.'],
  ['16:15', 'Études & clubs', 'Devoirs accompagnés, théâtre, échecs, chorale.'],
]

// Annual tuition per cycle (MAD) – demo figures
const FEES: Record<string, number> = { Maternelle: 38000, Primaire: 44000, Collège: 52000, Lycée: 58000 }
const REGISTRATION = 6000
const BUS = 9000
const CANTEEN = 7500

function Estimator() {
  const [kids, setKids] = useState<string[]>(['Primaire'])
  const [bus, setBus] = useState(false)
  const [canteen, setCanteen] = useState(true)
  const sorted = [...kids].sort((a, b) => FEES[b] - FEES[a])
  // second child -10 %, third and more -20 %, applied to the cheaper tuitions
  const tuition = sorted.reduce((s, c, i) => s + FEES[c] * (i === 0 ? 1 : i === 1 ? 0.9 : 0.8), 0)
  const extras = kids.length * ((bus ? BUS : 0) + (canteen ? CANTEEN : 0))
  const total = tuition + extras + kids.length * REGISTRATION
  const saved = sorted.reduce((s, c, i) => s + FEES[c] * (i === 0 ? 0 : i === 1 ? 0.1 : 0.2), 0)
  const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ')
  return (
    <div className="grid gap-8 rounded-[28px] p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10" style={{ background: GREEN, color: PAPER }}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Vos enfants</p>
        <ul className="mt-4 space-y-3">
          {kids.map((c, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm opacity-70">Enfant {i + 1}</span>
              <select
                aria-label={`Cycle de l’enfant ${i + 1}`}
                value={c}
                onChange={(e) => setKids((k) => k.map((x, j) => (j === i ? e.target.value : x)))}
                className="min-h-11 flex-1 rounded-xl border bg-transparent px-3 text-base"
                style={{ borderColor: 'rgba(251,248,241,0.3)' }}
              >
                {CYCLES.map((cy) => (
                  <option key={cy.k} value={cy.k} style={{ color: GREEN }}>
                    {cy.k}
                  </option>
                ))}
              </select>
              {kids.length > 1 && (
                <button type="button" aria-label={`Retirer l’enfant ${i + 1}`} onClick={() => setKids((k) => k.filter((_, j) => j !== i))} className="grid h-11 w-11 place-items-center rounded-full border transition-transform active:scale-90" style={{ borderColor: 'rgba(251,248,241,0.3)' }}>
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
        {kids.length < 4 && (
          <button type="button" onClick={() => setKids((k) => [...k, 'Maternelle'])} className="mt-4 min-h-11 rounded-full px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: SUN, color: GREEN }}>
            + Ajouter un enfant
          </button>
        )}
        <div className="mt-8 space-y-3">
          {[
            ['Transport scolaire', bus, setBus, `${fmt(BUS)} MAD / an`],
            ['Cantine', canteen, setCanteen, `${fmt(CANTEEN)} MAD / an`],
          ].map(([label, on, set, price]) => (
            <label key={label as string} className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3" style={{ borderColor: 'rgba(251,248,241,0.2)' }}>
              <span>
                {label as string} <span className="text-sm opacity-60">· {price as string}</span>
              </span>
              <input type="checkbox" checked={on as boolean} onChange={(e) => (set as (v: boolean) => void)(e.target.checked)} className="h-5 w-5 accent-[#f3c13a]" />
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-between rounded-2xl p-6" style={{ background: 'rgba(251,248,241,0.06)' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Estimation annuelle</p>
          <p className="mt-3 text-[clamp(2.6rem,5vw,3.8rem)] leading-none tabular-nums" style={wide} aria-live="polite">
            {fmt(total)} <span className="text-xl">MAD</span>
          </p>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="opacity-70">Scolarité</dt>
              <dd className="tabular-nums">{fmt(tuition)} MAD</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="opacity-70">Inscription ({kids.length})</dt>
              <dd className="tabular-nums">{fmt(kids.length * REGISTRATION)} MAD</dd>
            </div>
            {extras > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="opacity-70">Services</dt>
                <dd className="tabular-nums">{fmt(extras)} MAD</dd>
              </div>
            )}
            {saved > 0 && (
              <div className="flex justify-between gap-4" style={{ color: SUN }}>
                <dt>Réduction fratrie</dt>
                <dd className="tabular-nums">− {fmt(saved)} MAD</dd>
              </div>
            )}
          </dl>
        </div>
        <p className="mt-6 text-xs opacity-60">Paiement en 3 ou 10 fois sans frais. Montants indicatifs de démonstration.</p>
      </div>
    </div>
  )
}

function VisitBooking() {
  const days = useDays(12, [0, 6])
  const [day, setDay] = useState(days.find((d) => !d.closed)!.key)
  const [slot, setSlot] = useState('')
  const [parent, setParent] = useState('')
  const [level, setLevel] = useState('Primaire')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const d = days.find((x) => x.key === day)!
  if (done)
    return (
      <DemoDone
        tone={tone}
        title="Votre visite est réservée."
        lines={[`${d.weekday} ${d.label} à ${slot}`, `Visite ${level.toLowerCase()} · ${parent}`, 'Prévoyez 45 minutes, la directrice vous reçoit.']}
        onReset={() => (setDone(false), setSlot(''))}
      />
    )
  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (!slot) return setErr('Choisissez un créneau.')
        if (parent.trim().length < 2) return setErr('Indiquez votre nom.')
        setErr('')
        setDone(true)
      }}
    >
      <DayPicker days={days} value={day} onChange={(k) => (setDay(k), setSlot(''))} tone={tone} />
      <SlotGrid slots={['8:45', '9:30', '10:15', '11:00', '14:00', '15:00']} dayKey={day} value={slot} onChange={setSlot} tone={tone} rate={0.35} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] opacity-60">Nom du parent</span>
          <input value={parent} onChange={(e) => setParent(e.target.value)} autoComplete="name" className="min-h-11 w-full rounded-xl border bg-white px-3 text-base outline-none focus:border-[#12372a]" style={{ borderColor: tone.line }} />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] opacity-60">Cycle visé</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="min-h-11 w-full rounded-xl border bg-white px-3 text-base" style={{ borderColor: tone.line }}>
            {CYCLES.map((c) => (
              <option key={c.k}>{c.k}</option>
            ))}
          </select>
        </label>
      </div>
      {err && (
        <p role="alert" className="text-sm" style={{ color: '#b23a1f' }}>
          {err}
        </p>
      )}
      <button type="submit" className="w-full rounded-full py-4 text-sm font-bold uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: CORAL, color: '#fff' }}>
        Réserver la visite {slot && `· ${slot}`}
      </button>
    </form>
  )
}

export default function School() {
  const root = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState(1)
  const cy = CYCLES[cycle]

  useGSAP(
    () => {
      gsap.from('[data-rise]', { yPercent: 110, duration: 1.2, stagger: 0.08, ease: 'expo.out', delay: 0.15 })
      gsap.from('[data-pop]', { scale: 0.85, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'back.out(1.6)', delay: 0.35 })
      gsap.from('[data-fade]', { opacity: 0, y: 14, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.6 })
      // the school day: a line draws across as its section is read
      gsap.fromTo('[data-dayline]', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '[data-day]', start: 'top 70%', end: 'bottom 60%', scrub: true } })
    },
    { scope: root },
  )

  return (
    <div ref={root} style={{ background: PAPER, color: GREEN, fontFamily: SANS }}>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-5 md:px-12 md:pb-20 md:pt-7">
        <header data-fade className="flex items-center justify-between">
          <span className="flex items-center gap-2.5 text-xl" style={wide}>
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
              <path d="M16 3 L27 22 H5 Z" fill={GREEN} />
              <path d="M16 10 L24 25 H8 Z" fill={SUN} />
              <rect x="14.5" y="24" width="3" height="5" fill={GREEN} />
            </svg>
            Les Cèdres
          </span>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            {[['Cycles', '#cycles'], ['Journée', '#journee'], ['Campus', '#campus'], ['Admissions', '#admissions']].map(([l, h]) => (
              <a key={h} href={h} className="opacity-75 transition-opacity hover:opacity-100">
                {l}
              </a>
            ))}
          </nav>
          <a href="#visite" className="rounded-full px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: CORAL, color: '#fff' }}>
            Visiter l’école
          </a>
        </header>
        <div className="mt-12 grid items-center gap-12 lg:mt-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p data-fade className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold" style={{ background: SUN }}>
              <span className="h-2 w-2 rounded-full" style={{ background: GREEN }} /> Inscriptions 2027–2028 ouvertes
            </p>
            <h1 className="text-[clamp(3rem,7.4vw,7.2rem)] leading-[0.92] tracking-[-0.03em]" style={wide}>
              <span className="block overflow-hidden pb-[0.05em]">
                <span data-rise className="block">Apprendre</span>
              </span>
              <span className="block overflow-hidden pb-[0.05em]">
                <span data-rise className="block">à penser,</span>
              </span>
              <span className="block overflow-hidden pb-[0.05em]">
                <span data-rise className="block" style={{ color: CORAL }}>
                  en trois langues.
                </span>
              </span>
            </h1>
            <p data-fade className="mt-7 max-w-lg text-lg leading-relaxed opacity-80">
              Groupe scolaire bilingue de la maternelle au lycée, à Californie, Casablanca. Programme français homologué, arabe et anglais renforcés.
            </p>
            <div data-fade className="mt-9 flex flex-wrap gap-3">
              <a href="#visite" className="rounded-full px-7 py-4 font-bold transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: GREEN, color: PAPER }}>
                Réserver une visite
              </a>
              <a href="#admissions" className="rounded-full border-2 px-7 py-4 font-bold transition-[transform,background-color] hover:-translate-y-0.5 active:scale-95" style={{ borderColor: GREEN }}>
                Estimer les frais
              </a>
            </div>
          </div>
          <div className="relative h-[26rem] md:h-[34rem]">
            <div data-pop className="group absolute right-0 top-0 h-[78%] w-[82%] overflow-hidden rounded-[36px]">
              <Photo eager src="school/classroom.jpg" alt="Une salle de classe lumineuse avec de grandes fenêtres sur le jardin" />
            </div>
            <div data-pop className="group absolute bottom-0 left-0 h-[46%] w-[46%] overflow-hidden rounded-full border-[6px]" style={{ borderColor: PAPER }}>
              <Photo src="school/robotics.jpg" alt="Un robot d’élèves piloté à la manette lors d’un atelier" />
            </div>
            <div data-pop className="absolute bottom-[8%] right-[6%] rounded-2xl px-5 py-4 shadow-[0_20px_50px_-20px_rgba(18,55,42,0.5)]" style={{ background: PAPER }}>
              <p className="text-3xl" style={wide}>
                22
              </p>
              <p className="text-sm opacity-70">élèves par classe, en moyenne</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cycles */}
      <section id="cycles" className="scroll-mt-4 px-5 py-20 md:px-12 md:py-28" style={{ background: cy.color, transition: 'background-color 0.6s ease' }}>
        <h2 className="max-w-3xl text-[clamp(2.4rem,5.2vw,4.8rem)] leading-[0.95] tracking-[-0.02em]" style={wide}>
          Quatre cycles, un même fil.
        </h2>
        <div role="tablist" aria-label="Cycles" className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4">
          {CYCLES.map((c, i) => (
            <button
              key={c.k}
              role="tab"
              aria-selected={cycle === i}
              onClick={() => setCycle(i)}
              className="rounded-2xl border-2 px-5 py-4 text-left transition-[transform,background-color,color] hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ borderColor: GREEN, background: cycle === i ? GREEN : 'transparent', color: cycle === i ? PAPER : GREEN }}
            >
              <span className="block text-xl" style={wide}>
                {c.k}
              </span>
              <span className="text-sm opacity-75">{c.age}</span>
            </button>
          ))}
        </div>
        <div role="tabpanel" aria-label={cy.k} className="mt-8 grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-stretch">
          <div className="flex flex-col justify-between gap-8 rounded-[28px] p-7 md:p-9" style={{ background: PAPER }}>
            <ul className="space-y-4 text-lg">
              {cy.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CORAL }} />
                  {p}
                </li>
              ))}
            </ul>
            <dl className="grid grid-cols-2 gap-4 border-t pt-6 text-sm" style={{ borderColor: tone.line }}>
              <div>
                <dt className="opacity-60">Horaires</dt>
                <dd className="mt-1 text-lg font-semibold">{cy.hours}</dd>
              </div>
              <div>
                <dt className="opacity-60">Effectif</dt>
                <dd className="mt-1 text-lg font-semibold">{cy.size}</dd>
              </div>
            </dl>
          </div>
          <div className="relative min-h-[18rem] overflow-hidden rounded-[28px]">
            {CYCLES.map((c, i) => (
              <div key={c.k} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: cycle === i ? 1 : 0 }}>
                <Photo src={c.photo.src} alt={c.photo.alt} zoom={false} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A day */}
      <section id="journee" data-day className="scroll-mt-4 px-5 py-20 md:px-12 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-2xl text-[clamp(2.4rem,5.2vw,4.8rem)] leading-[0.95] tracking-[-0.02em]" style={wide}>
            Une journée au primaire.
          </h2>
          <p className="max-w-sm opacity-75">Des journées rythmées, avec le plus exigeant le matin et le plus vivant l’après-midi.</p>
        </div>
        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-[11px] hidden h-[3px] rounded-full md:block" style={{ background: tone.line }} />
          <div data-dayline className="absolute left-0 right-0 top-[11px] hidden h-[3px] origin-left rounded-full md:block" style={{ background: CORAL }} />
          <ol className="grid gap-8 md:grid-cols-4 md:gap-x-6 md:gap-y-12 lg:grid-cols-8">
            {DAY_PLAN.map(([t, title, d]) => (
              <li key={t} className="relative pl-8 md:pl-0 md:pt-10">
                <span className="absolute left-0 top-1 h-6 w-6 rounded-full border-[3px] md:top-0" style={{ borderColor: CORAL, background: PAPER }} />
                <p className="text-sm font-bold tabular-nums" style={{ color: CORAL }}>
                  {t}
                </p>
                <p className="mt-1 text-lg font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed opacity-70">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Campus */}
      <section id="campus" className="scroll-mt-4 px-5 pb-20 md:px-12 md:pb-28">
        <h2 className="mb-10 max-w-3xl text-[clamp(2.4rem,5.2vw,4.8rem)] leading-[0.95] tracking-[-0.02em]" style={wide}>
          Un campus pensé pour <span style={{ color: CORAL }}>bouger.</span>
        </h2>
        <div className="grid auto-rows-[14rem] gap-4 md:auto-rows-[16rem] md:grid-cols-4">
          {[
            ['school/campus-2.jpg', 'Le bâtiment principal de l’école devant sa grande pelouse', 'Deux hectares, dont un tiers d’espaces verts', 'md:col-span-2 md:row-span-2'],
            ['school/library.jpg', 'La bibliothèque', 'Bibliothèque de 12 000 livres', ''],
            ['school/robotics-2.jpg', 'Deux robots d’élèves sur la piste de compétition', 'Atelier robotique', ''],
            ['school/lab.jpg', 'Le laboratoire de sciences naturelles', 'Trois laboratoires de sciences', ''],
            ['school/classroom-2.jpg', 'Une salle d’étude : longues tables en bois, tableau noir et hautes fenêtres', 'Salles d’étude', ''],
          ].map(([src, alt, label, span]) => (
            <figure key={src} className={`group relative overflow-hidden rounded-[24px] ${span}`}>
              <Photo src={src} alt={alt} />
              <span className="absolute bottom-3 left-3 rounded-full px-3.5 py-1.5 text-sm font-semibold" style={{ background: PAPER }}>
                {label}
              </span>
            </figure>
          ))}
        </div>
      </section>

      {/* Admissions */}
      <section id="admissions" className="scroll-mt-4 px-5 py-20 md:px-12 md:py-28" style={{ background: '#f1ebdd' }}>
        <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <h2 className="max-w-2xl text-[clamp(2.4rem,5.2vw,4.8rem)] leading-[0.95] tracking-[-0.02em]" style={wide}>
            Admissions, sans surprise.
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2">
            {[
              ['Visite', 'Vous découvrez l’école avec la direction.'],
              ['Dossier', 'Bulletins et pièces, déposés en ligne.'],
              ['Rencontre', 'Un entretien avec l’enfant, sans examen à la maternelle.'],
              ['Réponse', 'Sous dix jours ouvrés, par e-mail.'],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-2xl p-5" style={{ background: PAPER }}>
                <span className="text-sm font-bold" style={{ color: CORAL }}>
                  0{i + 1}
                </span>
                <p className="mt-1 text-lg font-semibold">{t}</p>
                <p className="mt-1 text-sm opacity-70">{d}</p>
              </li>
            ))}
          </ol>
        </div>
        <Estimator />
      </section>

      {/* Visit */}
      <section id="visite" className="scroll-mt-4 px-5 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-[clamp(2.4rem,5.2vw,4.8rem)] leading-[0.95] tracking-[-0.02em]" style={wide}>
              Venez nous voir <span style={{ color: CORAL }}>un matin de classe.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg opacity-75">Les visites ont lieu pendant les cours, pour voir l’école telle qu’elle vit. Du lundi au vendredi.</p>
            <dl className="mt-10 space-y-5">
              <div>
                <dt className="text-sm opacity-60">Adresse</dt>
                <dd className="text-lg font-semibold">Quartier Californie, Casablanca</dd>
              </div>
              <div>
                <dt className="text-sm opacity-60">Secrétariat</dt>
                <dd className="text-lg font-semibold">Lun.–ven. · 8h00–17h30</dd>
              </div>
            </dl>
          </div>
          <div className="min-w-0 rounded-[28px] border-2 p-6 md:p-9" style={{ borderColor: tone.line, background: '#fff' }}>
            <VisitBooking />
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 md:px-12" style={{ background: GREEN, color: PAPER }}>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <span className="text-2xl" style={wide}>
            Les Cèdres
          </span>
          <span className="text-sm opacity-75">Groupe scolaire bilingue · Californie, Casablanca</span>
        </div>
        <DemoFooter name="Les Cèdres" folders={['school']} />
      </footer>
    </div>
  )
}
