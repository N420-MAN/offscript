import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { BUDGETS, PROJECT_TYPES, SITE } from '../../data/site'
import { prefersReducedMotion } from '../../hooks/useCapabilities'

gsap.registerPlugin(ScrollTrigger)

type Values = { name: string; company: string; email: string; phone: string; type: string; budget: string; message: string; website: string }
type Errors = Partial<Record<keyof Values, string>>
const EMPTY: Values = { name: '', company: '', email: '', phone: '', type: '', budget: '', message: '', website: '' }
const ORDER: (keyof Values)[] = ['name', 'company', 'email', 'phone', 'type', 'budget', 'message']

export function validate(v: Values): Errors {
  const e: Errors = {}
  if (v.name.trim().length < 2) e.name = 'Indiquez votre nom.'
  if (v.company.trim().length < 2) e.company = 'Indiquez le nom de votre entreprise.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Indiquez une adresse e-mail valide.'
  if (v.phone.trim() && !/^\+?[\d\s().-]{8,20}$/.test(v.phone.trim())) e.phone = 'Ce numéro ne semble pas valide.'
  if (!v.type) e.type = 'Choisissez un type de projet.'
  if (v.message.trim().length < 20) e.message = 'Décrivez votre besoin en quelques phrases (20 caractères minimum).'
  else if (v.message.length > 3000) e.message = 'Votre message est trop long (3 000 caractères maximum).'
  return e
}

const input =
  'w-full border-0 border-b border-bone/25 bg-transparent px-0 py-3 text-base text-bone outline-none transition-colors placeholder:text-bone/30 focus:border-signal focus-visible:border-signal aria-[invalid=true]:border-[#ff6b5e]'

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label mb-1 block text-ash">
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal opacity-60">(facultatif)</span>}
      </label>
      {children}
      <p id={`${id}-err`} className="mt-1 min-h-[1.25rem] text-sm text-[#ff8a7e]">{error}</p>
    </div>
  )
}

function ContactForm() {
  const [v, setV] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const [failNote, setFailNote] = useState('')
  const form = useRef<HTMLFormElement>(null)

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setV((s) => ({ ...s, [k]: e.target.value }))
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }))
  }
  const aria = (k: keyof Values) => ({ id: `f-${k}`, name: k, 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': `f-${k}-err` }) as const

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (v.website) return // honeypot: real visitors never see this field
    const errs = validate(v)
    setErrors(errs)
    const first = ORDER.find((k) => errs[k])
    if (first) {
      form.current?.querySelector<HTMLElement>(`#f-${first}`)?.focus()
      return
    }
    setStatus('sending')
    setFailNote('')
    const ctl = new AbortController()
    const timer = window.setTimeout(() => ctl.abort(), 12000)
    try {
      const res = await fetch(SITE.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, website: undefined }),
        signal: ctl.signal,
      })
      const isJson = (res.headers.get('content-type') ?? '').includes('application/json')
      const data = isJson ? ((await res.json()) as { ok?: boolean; error?: string }) : null
      // Success is only ever shown when the server explicitly confirms it sent the message.
      if (res.ok && data?.ok === true) {
        setStatus('sent')
        setV(EMPTY)
        return
      }
      setFailNote(data?.error ?? (res.status === 404 || !isJson ? 'L’envoi des messages n’est pas encore activé sur ce site.' : 'Le serveur n’a pas pu envoyer votre message.'))
    } catch {
      setFailNote('Connexion impossible. Vérifiez votre réseau et réessayez.')
    } finally {
      window.clearTimeout(timer)
    }
    setStatus('failed')
  }

  if (status === 'sent') {
    return (
      <div role="status" className="border border-signal/60 p-8 md:p-12">
        <p className="label text-signal">Message envoyé</p>
        <p className="display mt-4 text-[clamp(2rem,5vw,3.6rem)]">Merci.</p>
        <p className="mt-4 max-w-md text-bone/80">Nous avons bien reçu votre demande et reviendrons vers vous.</p>
      </div>
    )
  }

  return (
    <form ref={form} onSubmit={submit} noValidate aria-label="Demande de projet" className="grid gap-x-10 gap-y-2 md:grid-cols-2">
      <Field id="f-name" label="Nom" error={errors.name}><input {...aria('name')} value={v.name} onChange={set('name')} autoComplete="name" className={input} /></Field>
      <Field id="f-company" label="Entreprise" error={errors.company}><input {...aria('company')} value={v.company} onChange={set('company')} autoComplete="organization" className={input} /></Field>
      <Field id="f-email" label="E-mail" error={errors.email}><input {...aria('email')} type="email" inputMode="email" value={v.email} onChange={set('email')} autoComplete="email" className={input} /></Field>
      <Field id="f-phone" label="Téléphone" optional error={errors.phone}><input {...aria('phone')} type="tel" inputMode="tel" value={v.phone} onChange={set('phone')} autoComplete="tel" className={input} /></Field>
      <Field id="f-type" label="Type de projet" error={errors.type}>
        <select {...aria('type')} value={v.type} onChange={set('type')} className={`${input} cursor-pointer`}>
          <option value="" className="bg-void">Sélectionnez…</option>
          {PROJECT_TYPES.map((t) => <option key={t} value={t} className="bg-void">{t}</option>)}
        </select>
      </Field>
      <Field id="f-budget" label="Budget indicatif" optional error={errors.budget}>
        <select {...aria('budget')} value={v.budget} onChange={set('budget')} className={`${input} cursor-pointer`}>
          <option value="" className="bg-void">Sélectionnez…</option>
          {BUDGETS.map((t) => <option key={t} value={t} className="bg-void">{t}</option>)}
        </select>
      </Field>
      <div className="md:col-span-2">
        <Field id="f-message" label="Votre besoin" error={errors.message}>
          <textarea {...aria('message')} rows={5} value={v.message} onChange={set('message')} className={`${input} resize-y`} placeholder="Parlez-nous de votre activité, de vos objectifs, de vos délais…" />
        </Field>
      </div>
      {/* honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Ne pas remplir<input tabIndex={-1} autoComplete="off" name="website" value={v.website} onChange={set('website')} /></label>
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="label mt-2 rounded-full bg-bone px-8 py-4 text-void transition-colors hover:bg-signal focus-visible:bg-signal disabled:opacity-60"
        >
          {status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma demande'}
        </button>
        <div aria-live="polite" className="mt-5 min-h-[2rem]">
          {status === 'failed' && (
            <p role="alert" className="max-w-xl text-sm leading-relaxed text-[#ff8a7e]">
              Votre message n’a pas été envoyé. {failNote}
              {SITE.email ? (
                <> Écrivez-nous à <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</>
              ) : null}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}

function Social({ label, href }: { label: string; href: string }) {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-signal hover:underline">{label}</a>
  ) : (
    <span className="text-ash">{label} <span className="normal-case tracking-normal opacity-70">— à confirmer</span></span>
  )
}

export default function Contact() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set('[data-strike]', { scaleX: 1 })
        return
      }
      const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-cta]', start: 'top 70%' } })
      tl.from('[data-c-line]', { yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'expo.out' })
        .to('[data-strike]', { scaleX: 1, duration: 0.7, ease: 'power4.inOut' }, '-=0.1')
        .from('[data-c-sub]', { y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }, '-=0.3')
      gsap.from('[data-form-in]', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '[data-form-in]', start: 'top 85%' } })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-void px-5 pt-32 md:px-10 md:pt-48">
      <div data-cta>
        <p className="label mb-6 text-signal">05 — Contact</p>
        <h2 id="contact-title" className="display text-[clamp(3rem,12vw,11.5rem)]" aria-label="Ready to break the script ?">
          <span className="block overflow-hidden pb-[0.04em]"><span data-c-line className="block">Ready to</span></span>
          <span className="block overflow-hidden pb-[0.04em]"><span data-c-line className="block">break the</span></span>
          <span className="block overflow-hidden pb-[0.04em]">
            <span data-c-line className="block text-signal">
              <span className="relative inline-block">script?
              <span data-strike aria-hidden className="absolute left-0 top-[52%] h-[0.07em] w-full origin-left bg-bone" style={{ transform: 'scaleX(0)' }} />
              </span>
            </span>
          </span>
        </h2>
        <p data-c-sub className="mt-10 max-w-xl text-lg leading-relaxed text-bone/80">
          Votre prochain projet mérite une expérience digitale à la hauteur de vos ambitions.
        </p>
        <a data-c-sub href="#formulaire" className="label mt-8 inline-block rounded-full bg-signal px-8 py-4 text-void transition-colors hover:bg-bone">
          Parlons de votre projet
        </a>
      </div>

      <div id="formulaire" data-form-in className="mt-28 grid gap-14 scroll-mt-10 border-t border-bone/15 pt-14 md:mt-40 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] md:gap-20 md:pt-20">
        <div>
          <h3 className="display text-[clamp(2rem,4.6vw,4rem)]">Parlons de<br />votre projet.</h3>
          <p className="mt-6 max-w-sm leading-relaxed text-bone/70">Quelques lignes suffisent pour commencer : votre activité, ce que vous voulez construire, et pour quand.</p>
          <ul className="label mt-10 space-y-3">
            <li>
              {SITE.email ? <a href={`mailto:${SITE.email}`} className="underline-offset-4 hover:text-signal hover:underline">{SITE.email}</a> : <span className="text-ash">E-mail <span className="normal-case tracking-normal opacity-70">— à confirmer</span></span>}
            </li>
            <li><Social label="Instagram" href={SITE.instagram} /></li>
            <li><Social label="LinkedIn" href={SITE.linkedin} /></li>
            <li className="text-bone/80">{SITE.city}</li>
          </ul>
        </div>
        <ContactForm />
      </div>

      <footer className="mt-32 pb-8 md:mt-48">
        <p aria-hidden className="display select-none whitespace-nowrap text-[clamp(3.4rem,17.5vw,20rem)] text-transparent" style={{ WebkitTextStroke: '1.5px rgba(242,240,234,0.5)' }}>
          OFF<span style={{ WebkitTextStroke: '1.5px #ff4b1f' }}>/</span>SCRIPT
        </p>
        <div className="label mt-8 flex flex-wrap justify-between gap-4 text-ash">
          <span>© {new Date().getFullYear()} OFFSCRIPT. Tous droits réservés.</span>
          <span>{SITE.city}</span>
        </div>
      </footer>
    </section>
  )
}
