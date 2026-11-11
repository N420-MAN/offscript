import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/inter'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import { DayPicker, DemoDone, DemoFooter, Photo, SlotGrid, useDays } from './kit'

const SANS = '"Inter Variable", system-ui, sans-serif'
const SERIF = '"Instrument Serif", Georgia, serif'
const INK = '#0f2b33'
const TEAL = '#0f766e'
const MINT = '#e3f1ee'
const SAND = '#f7f4ef'
const tone = { on: TEAL, onText: '#fff', line: 'rgba(15,43,51,0.16)' }

interface Doctor {
  id: string
  name: string
  spec: string
  initials: string
  langs: string
  days: number[] // weekdays they consult (1 = Monday)
  fee: number
  next: string
}
const SPECIALTIES = ['Médecine générale', 'Pédiatrie', 'Dermatologie', 'Gynécologie', 'Cardiologie', 'Dentaire'] as const
const DOCTORS: Doctor[] = [
  { id: 'a', name: 'Dr Salma Bennani', spec: 'Médecine générale', initials: 'SB', langs: 'Français, arabe, anglais', days: [1, 2, 3, 4, 5, 6], fee: 300, next: 'aujourd’hui' },
  { id: 'b', name: 'Dr Youssef Alaoui', spec: 'Médecine générale', initials: 'YA', langs: 'Français, arabe', days: [1, 3, 5], fee: 300, next: 'demain' },
  { id: 'c', name: 'Dr Nadia Tazi', spec: 'Pédiatrie', initials: 'NT', langs: 'Français, arabe, espagnol', days: [1, 2, 4, 6], fee: 400, next: 'aujourd’hui' },
  { id: 'd', name: 'Dr Karim El Idrissi', spec: 'Dermatologie', initials: 'KE', langs: 'Français, anglais', days: [2, 4], fee: 450, next: 'jeudi' },
  { id: 'e', name: 'Dr Leïla Chraibi', spec: 'Gynécologie', initials: 'LC', langs: 'Français, arabe', days: [1, 2, 3, 5], fee: 450, next: 'demain' },
  { id: 'f', name: 'Dr Omar Benjelloun', spec: 'Cardiologie', initials: 'OB', langs: 'Français, arabe, anglais', days: [3, 6], fee: 500, next: 'mercredi' },
  { id: 'g', name: 'Dr Imane Fassi', spec: 'Dentaire', initials: 'IF', langs: 'Français, arabe, anglais', days: [1, 2, 3, 4, 5], fee: 350, next: 'aujourd’hui' },
]
const AVATAR = ['#cfe8e3', '#f3dfd2', '#dfe3f3', '#f1e7c9', '#e3d9ef', '#d3e8d5', '#f0d5dc']
const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

function Booking({ preset, onPreset }: { preset: string; onPreset: (id: string) => void }) {
  const [spec, setSpec] = useState<string>(DOCTORS.find((d) => d.id === preset)?.spec ?? 'Médecine générale')
  const docs = DOCTORS.filter((d) => d.spec === spec)
  const doc = DOCTORS.find((d) => d.id === preset && d.spec === spec) ?? docs[0]
  const closed = [0, 1, 2, 3, 4, 5, 6].filter((w) => !doc.days.includes(w))
  const days = useDays(14, closed)
  const [day, setDay] = useState('')
  const firstOpen = days.find((d) => !d.closed)?.key ?? ''
  const activeDay = days.some((d) => d.key === day && !d.closed) ? day : firstOpen
  const [slot, setSlot] = useState('')
  const [who, setWho] = useState('')
  const [phone, setPhone] = useState('')
  const [first, setFirst] = useState(true)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const d = days.find((x) => x.key === activeDay)
  if (done && d)
    return (
      <DemoDone
        tone={tone}
        title="Rendez-vous confirmé."
        lines={[`${doc.name} · ${doc.spec}`, `${d.weekday} ${d.label} à ${slot}`, `Patient : ${who}${first ? ' (première consultation)' : ''}`, 'Un rappel vous sera envoyé la veille par SMS.']}
        onReset={() => (setDone(false), setSlot(''))}
      />
    )
  return (
    <form
      noValidate
      className="space-y-7"
      onSubmit={(e) => {
        e.preventDefault()
        if (!slot) return setErr('Choisissez un créneau.')
        if (who.trim().length < 2) return setErr('Indiquez le nom du patient.')
        if (!/^[+\d][\d\s.-]{7,}$/.test(phone.trim())) return setErr('Indiquez un numéro de téléphone valide.')
        setErr('')
        setDone(true)
      }}
    >
      <div>
        <p className="mb-3 text-sm font-semibold">1. Spécialité</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={spec === s}
              onClick={() => (setSpec(s), setSlot(''), onPreset(DOCTORS.find((x) => x.spec === s)!.id))}
              className="min-h-10 rounded-full border px-4 text-sm transition-[transform,background-color,color] hover:-translate-y-0.5 active:scale-95"
              style={{ background: spec === s ? INK : '#fff', color: spec === s ? '#fff' : INK, borderColor: spec === s ? INK : tone.line }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">2. Praticien</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {docs.map((x) => {
            const on = x.id === doc.id
            return (
              <button
                key={x.id}
                type="button"
                aria-pressed={on}
                onClick={() => (onPreset(x.id), setSlot(''))}
                className="flex items-center gap-3 rounded-2xl border p-3 text-left transition-[transform,border-color] hover:-translate-y-0.5"
                style={{ borderColor: on ? TEAL : tone.line, boxShadow: on ? `0 0 0 1px ${TEAL}` : undefined, background: '#fff' }}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold" style={{ background: AVATAR[DOCTORS.indexOf(x)] }}>
                  {x.initials}
                </span>
                <span>
                  <span className="block font-semibold">{x.name}</span>
                  <span className="text-sm opacity-65">
                    {x.fee} MAD · dispo. {x.next}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">3. Date et heure</p>
        <DayPicker days={days} value={activeDay} onChange={(k) => (setDay(k), setSlot(''))} tone={tone} />
        <div className="mt-3">
          <SlotGrid slots={SLOTS} dayKey={activeDay + doc.id} value={slot} onChange={setSlot} tone={tone} rate={0.4} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">4. Nom du patient</span>
          <input value={who} onChange={(e) => setWho(e.target.value)} autoComplete="name" className="min-h-11 w-full rounded-xl border bg-white px-3 outline-none focus:border-[#0f766e]" style={{ borderColor: tone.line }} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Téléphone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" className="min-h-11 w-full rounded-xl border bg-white px-3 outline-none focus:border-[#0f766e]" style={{ borderColor: tone.line }} />
        </label>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={first} onChange={(e) => setFirst(e.target.checked)} className="h-5 w-5 accent-[#0f766e]" /> Première consultation au centre
      </label>
      {err && (
        <p role="alert" className="text-sm text-[#b42318]">
          {err}
        </p>
      )}
      <button type="submit" className="w-full rounded-xl py-4 font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: TEAL }}>
        Confirmer le rendez-vous {slot && `· ${slot}`}
      </button>
      <p className="text-center text-xs opacity-60">Consultation réglée sur place · Carte bancaire, espèces · Mutuelles acceptées</p>
    </form>
  )
}

export default function Medical() {
  const root = useRef<HTMLDivElement>(null)
  const [doctor, setDoctor] = useState('a')

  useGSAP(
    () => {
      gsap.from('[data-rise]', { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'expo.out', delay: 0.15 })
      gsap.from('[data-fade]', { opacity: 0, y: 14, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.5 })
      gsap.from('[data-card]', { opacity: 0, y: 30, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.7 })
      // the heartbeat line in the hero card draws itself, again and again
      const p = root.current?.querySelector<SVGPathElement>('[data-ecg]')
      if (p) {
        const len = p.getTotalLength()
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: -len, duration: 3, repeat: -1, ease: 'none' })
      }
    },
    { scope: root },
  )

  const book = (id: string) => {
    setDoctor(id)
    document.getElementById('rdv')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={root} style={{ background: SAND, color: INK, fontFamily: SANS }}>
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 py-2 text-center text-xs font-medium text-white" style={{ background: INK }}>
        <span>Urgences et soins non programmés · 7j/7 · 8h–22h</span>
        <span className="hidden opacity-70 sm:inline">Laboratoire d’analyses sur place, résultats en ligne</span>
      </div>

      {/* Hero */}
      <section className="px-5 pb-16 pt-5 md:px-12 md:pb-24">
        <header data-fade className="flex items-center justify-between">
          <span className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: TEAL }} aria-hidden>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" />
              </svg>
            </span>
            Centre médical Aurèle
          </span>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            {[['Spécialités', '#specialites'], ['Médecins', '#medecins'], ['Le centre', '#centre'], ['Infos pratiques', '#infos']].map(([l, h]) => (
              <a key={h} href={h} className="opacity-70 transition-opacity hover:opacity-100">
                {l}
              </a>
            ))}
          </nav>
          <a href="#rdv" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: TEAL }}>
            Prendre rendez-vous
          </a>
        </header>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <p data-fade className="mb-5 text-sm font-semibold" style={{ color: TEAL }}>
              Maârif, Casablanca · 14 spécialités sous un même toit
            </p>
            <h1 className="text-[clamp(2.8rem,6.6vw,6.4rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-rise className="block">Votre médecin,</span>
              </span>
              <span className="block overflow-hidden pb-[0.1em]">
                <span data-rise className="block" style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', color: TEAL, letterSpacing: '-0.01em' }}>
                  aujourd’hui même.
                </span>
              </span>
            </h1>
            <p data-fade className="mt-6 max-w-lg text-lg leading-relaxed opacity-75">
              Réservez en ligne en moins d’une minute, avec le praticien de votre choix. Consultations du lundi au samedi, résultats d’analyses sur votre espace patient.
            </p>
            {/* quick search */}
            <form
              data-fade
              onSubmit={(e) => {
                e.preventDefault()
                document.getElementById('rdv')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-[0_20px_60px_-30px_rgba(15,43,51,0.45)] sm:flex-row"
            >
              <label className="sr-only" htmlFor="m-spec">
                Spécialité
              </label>
              <select
                id="m-spec"
                className="min-h-12 flex-1 rounded-xl bg-transparent px-3 text-base outline-none"
                onChange={(e) => setDoctor(DOCTORS.find((d) => d.spec === e.target.value)!.id)}
                value={DOCTORS.find((d) => d.id === doctor)!.spec}
              >
                {SPECIALTIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button type="submit" className="min-h-12 rounded-xl px-6 font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: TEAL }}>
                Voir les créneaux
              </button>
            </form>
            <ul data-fade className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm opacity-75">
              <li>✓ Sans avance de frais avec la CNSS et les mutuelles partenaires</li>
              <li>✓ Parking patients</li>
            </ul>
          </div>

          <div className="relative">
            <div data-card className="group aspect-[4/3.4] overflow-hidden rounded-[28px]">
              <Photo eager src="clinic/consult.jpg" alt="Une médecin à son bureau de consultation, lumineux et rangé" pos="50% 40%" />
            </div>
            <div data-card className="absolute -bottom-6 left-4 w-[17rem] rounded-2xl bg-white p-4 shadow-[0_24px_60px_-25px_rgba(15,43,51,0.5)] md:-left-8">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-55">Prochain créneau</p>
              <p className="mt-1 text-lg font-semibold">Aujourd’hui, 15:30</p>
              <p className="text-sm opacity-65">Médecine générale · Dr Bennani</p>
              <svg viewBox="0 0 240 40" className="mt-3 w-full" fill="none" stroke={TEAL} strokeWidth="2" aria-hidden>
                <path data-ecg d="M0 22 H70 l8 -14 l10 28 l9 -24 l7 10 H240" />
              </svg>
            </div>
            <div data-card className="absolute -top-4 right-4 rounded-2xl bg-white px-4 py-3 shadow-[0_24px_60px_-25px_rgba(15,43,51,0.5)]">
              <p className="text-2xl font-semibold">4,8 / 5</p>
              <p className="text-xs opacity-60">avis patients vérifiés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="specialites" className="scroll-mt-4 px-5 py-20 md:px-12 md:py-24" style={{ background: '#fff' }}>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl text-[clamp(2.2rem,4.4vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            Tous les soins du quotidien, <span style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', color: TEAL }}>au même endroit.</span>
          </h2>
          <p className="max-w-sm opacity-70">Un dossier médical partagé entre vos médecins, pour ne plus répéter votre histoire à chaque rendez-vous.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Médecine générale', 'Consultations, certificats, suivi des maladies chroniques.', '◎'],
            ['Pédiatrie', 'Du nourrisson à l’adolescent, vaccinations et croissance.', '◐'],
            ['Dermatologie', 'Peau, cheveux, ongles. Dépistage des grains de beauté.', '◇'],
            ['Gynécologie', 'Suivi de grossesse, échographies, contraception.', '○'],
            ['Cardiologie', 'ECG, échographie cardiaque, épreuve d’effort.', '♡'],
            ['Dentaire', 'Soins, détartrage, implants et orthodontie.', '◠'],
          ].map(([t, d, g]) => (
            <a
              key={t}
              href="#rdv"
              onClick={(e) => {
                e.preventDefault()
                book(DOCTORS.find((x) => x.spec === t)!.id)
              }}
              className="group flex items-start gap-4 rounded-2xl border p-6 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(15,43,51,0.6)]"
              style={{ borderColor: tone.line }}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl" style={{ background: MINT, color: TEAL }} aria-hidden>
                {g}
              </span>
              <span>
                <span className="block text-lg font-semibold">{t}</span>
                <span className="mt-1 block text-sm leading-relaxed opacity-65">{d}</span>
                <span className="mt-3 inline-block text-sm font-semibold" style={{ color: TEAL }}>
                  Prendre rendez-vous →
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Doctors */}
      <section id="medecins" className="scroll-mt-4 px-5 py-20 md:px-12 md:py-24">
        <h2 className="mb-10 text-[clamp(2.2rem,4.4vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.03em]">Nos médecins</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOCTORS.slice(0, 7).map((d, i) => (
            <article key={d.id} className="flex flex-col rounded-2xl bg-white p-5 transition-transform hover:-translate-y-0.5">
              <span className="grid h-16 w-16 place-items-center rounded-full text-lg font-semibold" style={{ background: AVATAR[i] }}>
                {d.initials}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{d.name}</h3>
              <p className="text-sm" style={{ color: TEAL }}>
                {d.spec}
              </p>
              <p className="mt-3 text-sm opacity-65">{d.langs}</p>
              <p className="mt-1 text-sm opacity-65">Consultation {d.fee} MAD</p>
              <button type="button" onClick={() => book(d.id)} className="mt-5 min-h-11 rounded-xl border text-sm font-semibold transition-[transform,background-color,color] hover:-translate-y-0.5 hover:bg-[#0f766e] hover:text-white active:scale-95" style={{ borderColor: TEAL, color: undefined }}>
                Disponible {d.next}
              </button>
            </article>
          ))}
          <div className="flex flex-col justify-end rounded-2xl p-5 text-white" style={{ background: TEAL }}>
            <p className="text-3xl" style={{ fontFamily: SERIF, fontStyle: 'italic' }}>
              + 18 praticiens
            </p>
            <p className="mt-2 text-sm opacity-85">ORL, ophtalmologie, kinésithérapie, nutrition, psychologie…</p>
          </div>
        </div>
      </section>

      {/* The centre */}
      <section id="centre" className="scroll-mt-4 px-5 pb-20 md:px-12 md:pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          <figure className="group relative h-72 overflow-hidden rounded-[24px] md:col-span-2 md:h-[26rem]">
            <Photo src="clinic/dentist.jpg" alt="Une dentiste examine un jeune patient, lampe et instruments à portée de main" pos="50% 35%" />
          </figure>
          <div className="flex flex-col justify-between rounded-[24px] p-7" style={{ background: INK, color: '#fff' }}>
            <p className="text-3xl leading-tight" style={{ fontFamily: SERIF }}>
              Un plateau technique <em>complet</em>, pour ne pas courir d’un cabinet à l’autre.
            </p>
            <ul className="mt-6 space-y-2 text-sm opacity-85">
              <li>· Radiologie et échographie</li>
              <li>· Laboratoire d’analyses</li>
              <li>· Salle de petite chirurgie</li>
              <li>· Pharmacie au rez-de-chaussée</li>
            </ul>
          </div>
          <figure className="group h-64 overflow-hidden rounded-[24px]">
            <Photo src="clinic/stetho.jpg" alt="Stéthoscope et lunettes posés sur un tracé d’électrocardiogramme" />
          </figure>
          <figure className="group h-64 overflow-hidden rounded-[24px]">
            <Photo src="clinic/stetho-2.jpg" alt="Un stéthoscope posé sur un fond clair" />
          </figure>
          <figure className="group h-64 overflow-hidden rounded-[24px]">
            <Photo src="clinic/dental.jpg" alt="Une dentiste soigne une patiente au fauteuil, plateau d’instruments à côté" />
          </figure>
        </div>
      </section>

      {/* Booking */}
      <section id="rdv" className="scroll-mt-4 px-5 py-20 md:px-12 md:py-24" style={{ background: MINT }}>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div id="infos">
            <h2 className="text-[clamp(2.2rem,4.4vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              Prendre <span className="whitespace-nowrap" style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', color: TEAL }}>rendez-vous</span>
            </h2>
            <p className="mt-4 max-w-sm opacity-75">Choisissez la spécialité, le praticien et l’horaire. La confirmation arrive par SMS.</p>
            <dl className="mt-10 space-y-6">
              <div>
                <dt className="text-sm opacity-60">Adresse</dt>
                <dd className="mt-1 font-semibold">Quartier Maârif, Casablanca</dd>
              </div>
              <div>
                <dt className="text-sm opacity-60">Consultations</dt>
                <dd className="mt-1 font-semibold">Lun.–ven. 8h30–19h · Sam. 9h–13h</dd>
              </div>
              <div>
                <dt className="text-sm opacity-60">Soins non programmés</dt>
                <dd className="mt-1 font-semibold">7j/7, 8h–22h, sans rendez-vous</dd>
              </div>
              <div>
                <dt className="text-sm opacity-60">Langues</dt>
                <dd className="mt-1 font-semibold">Arabe, français, anglais, espagnol</dd>
              </div>
            </dl>
          </div>
          <div className="min-w-0 rounded-[24px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,43,51,0.45)] md:p-9">
            <Booking key={doctor} preset={doctor} onPreset={setDoctor} />
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 md:px-12" style={{ background: INK, color: '#fff' }}>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <span className="text-lg font-semibold">Centre médical Aurèle</span>
          <span className="text-sm opacity-70">Maârif, Casablanca · En cas d’urgence vitale, appelez le 15</span>
        </div>
        <DemoFooter name="Centre médical Aurèle" folders={['clinic']} />
      </footer>
    </div>
  )
}
