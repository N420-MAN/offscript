import { useEffect, useState } from 'react'
import { DemoDone, DemoFooter } from './kit'

/** Synapse's product half: the app itself answering a question with its sources, the plans, and a demo request. */

const SANS = '"Inter Variable", system-ui, sans-serif'
const MONO = '"DM Mono", monospace'
const VIO = '#8b6cff'
const MINT = '#5cffc8'
const PANEL = '#0a0e1a'
const LINE = 'rgba(255,255,255,0.09)'

const QUESTIONS = [
  {
    q: 'Quels contrats fournisseurs arrivent à échéance avant mars ?',
    a: 'Trois contrats arrivent à échéance avant le 31 mars : transport routier (14 février), maintenance des chariots (12 mars) et nettoyage du site de Mohammedia (28 mars). Le contrat transport se renouvelle tacitement si rien n’est envoyé 60 jours avant, soit avant le 16 décembre.',
    src: [
      ['Contrat_transport_2024.pdf', 'p. 7, art. 12'],
      ['Maintenance_chariots_avenant2.pdf', 'p. 2'],
      ['Nettoyage_Mohammedia.docx', 'art. 4'],
    ],
  },
  {
    q: 'Résume les réclamations clients du mois dernier.',
    a: '214 réclamations en octobre, en baisse de 11 %. Trois causes font 71 % du volume : retards de livraison (38 %), erreurs de facturation (19 %) et produits endommagés (14 %). Les retards se concentrent sur la région de Fès, après le changement de transporteur du 6 octobre.',
    src: [
      ['CRM_export_octobre.csv', '214 lignes'],
      ['Rapport_qualité_S43.pdf', 'p. 3'],
    ],
  },
]

function AppFrame() {
  const [qi, setQi] = useState(0)
  const [shown, setShown] = useState(0)
  const cur = QUESTIONS[qi]
  // the answer streams in, word by word, like the real product
  useEffect(() => {
    setShown(0)
    const words = cur.a.split(' ').length
    let n = 0
    const id = window.setInterval(() => {
      n += 2
      setShown(Math.min(n, words))
      if (n >= words) window.clearInterval(id)
    }, 45)
    return () => window.clearInterval(id)
  }, [cur])
  const words = cur.a.split(' ')
  const doneStreaming = shown >= words.length
  return (
    <section className="px-6 pb-8 pt-4 md:px-12">
      <div className="overflow-hidden rounded-2xl border shadow-[0_40px_120px_-40px_rgba(139,108,255,0.45)]" style={{ borderColor: LINE, background: PANEL, fontFamily: SANS }}>
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: LINE }}>
          <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-3 text-xs opacity-50" style={{ fontFamily: MONO }}>
            synapse · espace Achats & Qualité
          </span>
        </div>
        <div className="grid md:grid-cols-[15rem_1fr]">
          <aside className="hidden border-r p-4 text-sm md:block" style={{ borderColor: LINE }}>
            <p className="mb-3 text-[0.68rem] uppercase tracking-[0.2em] opacity-45" style={{ fontFamily: MONO }}>
              Sources connectées
            </p>
            <ul className="space-y-2 opacity-80">
              {[
                ['Drive Achats', '3 412'],
                ['Contrats (PDF)', '1 208'],
                ['CRM', '48 920'],
                ['Boîte qualité', '6 031'],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between gap-2">
                  <span>{k}</span>
                  <span className="tabular-nums opacity-50">{v}</span>
                </li>
              ))}
            </ul>
            <p className="mb-3 mt-8 text-[0.68rem] uppercase tracking-[0.2em] opacity-45" style={{ fontFamily: MONO }}>
              Questions fréquentes
            </p>
            <ul className="space-y-1">
              {QUESTIONS.map((x, i) => (
                <li key={i}>
                  <button type="button" onClick={() => setQi(i)} className="w-full rounded-lg px-2 py-2 text-left text-[0.8rem] leading-snug transition-colors hover:bg-white/5" style={{ background: qi === i ? 'rgba(139,108,255,0.15)' : undefined }}>
                    {x.q}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <div className="flex min-h-[26rem] flex-col p-5 md:p-8">
            <div className="ml-auto max-w-lg rounded-2xl rounded-br-sm px-4 py-3 text-sm" style={{ background: 'rgba(139,108,255,0.18)' }}>
              {cur.q}
            </div>
            <div className="mt-6 max-w-2xl">
              <p className="mb-2 flex items-center gap-2 text-xs opacity-55" style={{ fontFamily: MONO }}>
                <i className="h-2 w-2 rounded-full" style={{ background: MINT, boxShadow: `0 0 10px ${MINT}` }} /> synapse · {doneStreaming ? 'réponse vérifiée sur vos documents' : 'lecture des sources…'}
              </p>
              <p className="leading-relaxed text-[#dfe6ff]">
                {words.slice(0, shown).join(' ')}
                {!doneStreaming && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse" style={{ background: MINT }} />}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 transition-opacity duration-500" style={{ opacity: doneStreaming ? 1 : 0 }}>
                {cur.src.map(([f, where], i) => (
                  <span key={f} className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs" style={{ borderColor: LINE, fontFamily: MONO }}>
                    <span className="grid h-4 w-4 place-items-center rounded text-[0.6rem] text-black" style={{ background: MINT }}>
                      {i + 1}
                    </span>
                    {f} <span className="opacity-50">{where}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-auto flex items-center gap-3 rounded-xl border px-4 py-3 pt-3 text-sm" style={{ borderColor: LINE }}>
              <span className="flex-1 opacity-40">Posez une question à vos documents…</span>
              <button type="button" onClick={() => setQi((qi + 1) % QUESTIONS.length)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-black transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: MINT }}>
                Question suivante
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const PLANS = [
  { n: 'Équipe', p: '2 900', u: 'MAD / mois', d: 'Jusqu’à 10 utilisateurs, 20 000 documents.', f: ['Connecteurs Drive, Mail, PDF', 'Réponses sourcées', 'Support par e-mail'] },
  { n: 'Entreprise', p: '9 500', u: 'MAD / mois', d: 'Utilisateurs illimités, 250 000 documents.', f: ['Tous les connecteurs, ERP et CRM', 'Droits par service', 'Hébergement au Maroc', 'Accompagnement dédié'], hot: true },
  { n: 'Sur mesure', p: 'Sur devis', u: '', d: 'Pour les groupes et les données sensibles.', f: ['Installation sur vos serveurs', 'Modèles adaptés à votre métier', 'Audit de sécurité'] },
]

function Pricing() {
  return (
    <section className="px-6 py-24 md:px-12">
      <h2 className="mb-12 text-center text-[clamp(2.2rem,5vw,4.2rem)] font-semibold tracking-[-0.04em]">Des offres simples, en dirhams.</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <article key={p.n} className="flex flex-col rounded-2xl border p-7 transition-transform hover:-translate-y-0.5" style={{ borderColor: p.hot ? VIO : LINE, background: p.hot ? 'linear-gradient(170deg,rgba(139,108,255,0.16),#070a14 60%)' : '#070a14' }}>
            <p className="text-sm opacity-70" style={{ fontFamily: MONO }}>
              {p.n}
              {p.hot && (
                <span className="ml-2 rounded-full px-2 py-0.5 text-[0.65rem] text-black" style={{ background: MINT }}>
                  le plus choisi
                </span>
              )}
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
              {p.p} <span className="text-sm font-normal opacity-60">{p.u}</span>
            </p>
            <p className="mt-2 text-sm opacity-60">{p.d}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {p.f.map((f) => (
                <li key={f} className="flex gap-2">
                  <span style={{ color: MINT }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a href="#demo" className="mt-8 rounded-full py-3 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5 active:scale-95" style={p.hot ? { background: MINT, color: '#05070d' } : { border: `1px solid ${LINE}` }}>
              {p.n === 'Sur mesure' ? 'Parler à un expert' : 'Essayer 14 jours'}
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

function DemoRequest() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [size, setSize] = useState('50 – 250')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  return (
    <section id="demo" className="px-6 pb-16 pt-8 md:px-12">
      <div className="grid gap-10 rounded-3xl border p-6 md:grid-cols-2 md:p-12" style={{ borderColor: LINE, background: 'linear-gradient(160deg,#0b0f1d,#070a14)' }}>
        <div>
          <h2 className="text-[clamp(2.2rem,5vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
            Voyez Synapse sur <span style={{ background: `linear-gradient(90deg, ${VIO}, ${MINT})`, WebkitBackgroundClip: 'text', color: 'transparent' }}>vos propres documents.</span>
          </h2>
          <p className="mt-5 max-w-md opacity-65">Une démonstration de 30 minutes, branchée sur un échantillon de vos fichiers, sous accord de confidentialité.</p>
        </div>
        <div className="min-w-0">
          {done ? (
            <DemoDone tone={{ on: MINT, onText: '#05070d' }} title="Demande reçue." lines={[`${company} · ${size} salariés`, 'Un expert vous propose un créneau dans la journée.']} onReset={() => setDone(false)} />
          ) : (
            <form
              noValidate
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault()
                if (name.trim().length < 2) return setErr('Indiquez votre nom.')
                if (company.trim().length < 2) return setErr('Indiquez votre entreprise.')
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErr('Indiquez une adresse e-mail professionnelle valide.')
                setErr('')
                setDone(true)
              }}
            >
              {[
                ['Nom', name, setName, 'text', 'name'],
                ['Entreprise', company, setCompany, 'text', 'organization'],
                ['E-mail professionnel', email, setEmail, 'email', 'email'],
              ].map(([label, v, set, type, ac]) => (
                <label key={label as string} className="block">
                  <span className="mb-2 block text-xs opacity-60" style={{ fontFamily: MONO }}>
                    {label as string}
                  </span>
                  <input value={v as string} onChange={(e) => (set as (s: string) => void)(e.target.value)} type={type as string} autoComplete={ac as string} className="min-h-11 w-full rounded-xl border bg-white/[0.03] px-3 outline-none focus:border-[#5cffc8]" style={{ borderColor: LINE }} />
                </label>
              ))}
              <label className="block">
                <span className="mb-2 block text-xs opacity-60" style={{ fontFamily: MONO }}>
                  Taille de l’entreprise
                </span>
                <select value={size} onChange={(e) => setSize(e.target.value)} className="min-h-11 w-full rounded-xl border bg-[#0a0e1a] px-3" style={{ borderColor: LINE }}>
                  {['1 – 50', '50 – 250', '250 – 1 000', '1 000 +'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              {err && (
                <p role="alert" className="text-sm text-[#ff9b8a]">
                  {err}
                </p>
              )}
              <button type="submit" className="w-full rounded-full py-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: MINT }}>
                Réserver ma démonstration
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="mt-12" style={{ fontFamily: MONO }}>
        <DemoFooter name="Synapse" folders={[]} />
      </div>
    </section>
  )
}

export { AppFrame }
export default function SynapseProduct() {
  return (
    <>
      <Pricing />
      <DemoRequest />
    </>
  )
}
