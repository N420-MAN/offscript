import { useState } from 'react'
import { DemoDone, DemoFooter } from './kit'

/** Atelier Null's closing section: how a project runs, and a short brief form instead of a bare "write to us". */

const INK = '#111111'
const GREY = '#9a9a95'
const LINE = 'rgba(17,17,17,.18)'
const TYPES = ['Villa', 'Appartement', 'Commerce', 'Bureaux', 'Rénovation'] as const
const BUDGETS = ['< 2 M MAD', '2 – 5 M MAD', '5 – 10 M MAD', '> 10 M MAD'] as const

export default function AtelierBrief() {
  const [type, setType] = useState<string>('Villa')
  const [budget, setBudget] = useState<string>('2 – 5 M MAD')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [name, setName] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  const chip = (on: boolean) => ({ borderColor: on ? INK : LINE, background: on ? INK : 'transparent', color: on ? '#f6f6f4' : INK })

  return (
    <>
      <section className="grid gap-12 border-t px-6 py-28 md:grid-cols-4 md:px-12" style={{ borderColor: LINE }}>
        {[
          ['01', 'Écouter', 'Le site, la lumière, la manière dont vous vivez. Une visite, puis une note écrite.'],
          ['02', 'Esquisser', 'Trois intentions, des maquettes, un budget tenu dès le premier dessin.'],
          ['03', 'Construire', 'Permis, appel d’offres, suivi de chantier chaque semaine.'],
          ['04', 'Livrer', 'Réception, réserves levées, et une visite un an après.'],
        ].map(([n, t, d]) => (
          <div key={n}>
            <p className="mb-4 text-[0.68rem] tracking-[0.3em]" style={{ color: GREY }}>
              {n}
            </p>
            <p className="text-2xl tracking-[-0.02em]">{t}</p>
            <p className="mt-3 max-w-xs leading-relaxed" style={{ color: '#55554f' }}>
              {d}
            </p>
          </div>
        ))}
      </section>

      <section id="brief" className="grid gap-14 border-t px-6 py-28 md:grid-cols-[1fr_1.2fr] md:px-12" style={{ borderColor: LINE }}>
        <div>
          <h2 className="text-[clamp(2.4rem,6vw,5.6rem)] leading-[0.95] tracking-[-0.04em]">Parlez-nous de votre projet.</h2>
          <p className="mt-6 max-w-sm leading-relaxed" style={{ color: '#55554f' }}>
            Nous répondons à chaque demande sous une semaine, avec une première lecture du programme et des honoraires.
          </p>
          <p className="mt-10 text-[0.68rem] uppercase tracking-[0.3em]" style={{ color: GREY }}>
            Atelier · Racine, Casablanca
          </p>
        </div>
        <div className="min-w-0">
          {done ? (
            <DemoDone
              tone={{ on: INK, onText: '#f6f6f4' }}
              title="Merci, votre brief est arrivé."
              lines={[`${type} · ${city}${area ? ` · ${area} m²` : ''}`, `Budget ${budget}`, `Au nom de ${name}`]}
              onReset={() => setDone(false)}
            />
          ) : (
            <form
              noValidate
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault()
                if (city.trim().length < 2) return setErr('Indiquez la ville du projet.')
                if (name.trim().length < 2) return setErr('Indiquez votre nom.')
                setErr('')
                setDone(true)
              }}
            >
              <fieldset>
                <legend className="mb-3 text-[0.68rem] uppercase tracking-[0.3em]" style={{ color: GREY }}>
                  Type de projet
                </legend>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className="min-h-11 border px-4 text-sm transition-[transform,background-color,color] hover:-translate-y-0.5 active:scale-95" style={chip(type === t)}>
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-[0.68rem] uppercase tracking-[0.3em]" style={{ color: GREY }}>
                  Budget travaux
                </legend>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button key={b} type="button" aria-pressed={budget === b} onClick={() => setBudget(b)} className="min-h-11 border px-4 text-sm transition-[transform,background-color,color] hover:-translate-y-0.5 active:scale-95" style={chip(budget === b)}>
                      {b}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  ['Ville', city, setCity, 'text', 'address-level2'],
                  ['Surface (m²)', area, setArea, 'number', 'off'],
                  ['Nom', name, setName, 'text', 'name'],
                ].map(([label, v, set, type2, ac]) => (
                  <label key={label as string} className="block">
                    <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.3em]" style={{ color: GREY }}>
                      {label as string}
                    </span>
                    <input
                      value={v as string}
                      onChange={(e) => (set as (s: string) => void)(e.target.value)}
                      type={type2 as string}
                      inputMode={type2 === 'number' ? 'numeric' : undefined}
                      autoComplete={ac as string}
                      className="min-h-11 w-full border-0 border-b bg-transparent text-lg outline-none focus:border-[#111111]"
                      style={{ borderColor: LINE }}
                    />
                  </label>
                ))}
              </div>
              {err && (
                <p role="alert" className="text-sm text-[#a3341a]">
                  {err}
                </p>
              )}
              <button type="submit" className="group inline-flex items-center gap-4 text-[clamp(1.8rem,4vw,3rem)] tracking-[-0.03em]">
                Envoyer le brief
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-3">→</span>
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t px-6 py-10 md:px-12" style={{ borderColor: LINE, color: GREY }}>
        <DemoFooter name="Atelier Null" folders={['atelier']} />
      </footer>
    </>
  )
}
