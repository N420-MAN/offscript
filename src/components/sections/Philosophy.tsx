import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../hooks/useCapabilities'
import { clamp01, smoothstep } from '../../lib/math'

gsap.registerPlugin(ScrollTrigger)

const LINE_1 = 'Pas une agence de plus.'.split(' ')
const LINE_2 = 'Une autre façon de faire du'.split(' ')
const PRINCIPLES = [
  ['Clair', 'Ce que vous proposez se comprend dès le premier écran.'],
  ['Singulier', 'Une direction pensée pour votre marque, jamais un modèle.'],
  ['Vivant', 'Le mouvement sert le récit, sans jamais ralentir la page.'],
] as const

/** The studio's statement lights up word by word as you scroll; the last word is the one that stays. */
export default function Philosophy() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      // the scrubbed light-up needs the tall, pinned desktop layout; on phones the text is simply shown in full
      if (prefersReducedMotion() || !window.matchMedia('(min-width: 768px)').matches) return
      const words = gsap.utils.toArray<HTMLElement>('[data-w]')
      const stay = root.current!.querySelector<HTMLElement>('[data-stay]')!
      const copy = root.current!.querySelector<HTMLElement>('[data-copy]')!
      const bar = root.current!.querySelector<HTMLElement>('[data-bar]')!
      words.forEach((w) => (w.style.opacity = '0.14'))
      copy.style.opacity = '0'
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          words.forEach((w, i) => {
            w.style.opacity = String(0.14 + 0.86 * clamp01((p * 1.5 * (words.length + 1) - i) / 1.3))
          })
          const s = smoothstep(0.58, 0.8, p)
          stay.style.transform = `scale(${1 + s * 0.12})`
          bar.style.transform = `scaleX(${s})`
          copy.style.opacity = String(smoothstep(0.78, 0.94, p))
          copy.style.transform = `translateY(${(1 - smoothstep(0.78, 0.94, p)) * 30}px)`
        },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="studio" aria-labelledby="studio-title" className="relative bg-bone text-void md:h-[260vh]">
      <div className="px-5 py-32 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center md:px-10 md:py-0">
        <p className="label mb-8 text-[#c2300d]">04 — Studio</p>
        <h2 id="studio-title" className="display text-[clamp(2.4rem,6.4vw,6.4rem)]" aria-label="Pas une agence de plus. Une autre façon de faire du web.">
          <span aria-hidden className="block">
            {LINE_1.map((w, i) => <span key={i} data-w className="mr-[0.22em] inline-block">{w}</span>)}
          </span>
          <span aria-hidden className="block">
            {LINE_2.map((w, i) => <span key={i} data-w className="mr-[0.22em] inline-block">{w}</span>)}
            <span data-w className="relative inline-block origin-left">
              <span data-stay className="serif-accent inline-block origin-left text-[#c2300d]" style={{ fontSize: '1.08em' }}>web.</span>
              <span data-bar className="absolute -bottom-1 left-0 h-[0.07em] w-full origin-left bg-[#c2300d]" style={{ transform: 'scaleX(0)' }} />
            </span>
          </span>
        </h2>
        <div data-copy className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-8">
          <div className="max-w-xl space-y-4 text-base leading-relaxed text-void/80 md:col-span-5 md:text-[1.05rem]">
            <p>OFFSCRIPT est un studio indépendant de design et développement web basé à Casablanca.</p>
            <p>Nous croyons qu’un site web ne devrait pas simplement exister. Il devrait raconter quelque chose, inspirer confiance et donner envie d’aller plus loin.</p>
            <p>Notre approche associe direction artistique, réflexion stratégique et développement technique pour créer des expériences digitales avec une véritable personnalité.</p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-3 md:col-span-7 md:gap-8">
            {PRINCIPLES.map(([t, d], i) => (
              <li key={t} className="border-t-2 border-void pt-4">
                <span className="label text-void/70">{String(i + 1).padStart(2, '0')}</span>
                <p className="display mt-2 text-[1.9rem]">{t}</p>
                <p className="mt-2 text-sm leading-relaxed text-void/70">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
