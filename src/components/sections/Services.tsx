import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { EXPERTISES } from '../../data/site'
import { prefersReducedMotion } from '../../hooks/useCapabilities'

gsap.registerPlugin(ScrollTrigger)

/** One demo that shows each area of expertise at work; its preview follows the pointer over the list. */
const PREVIEW = ['restaurant', 'rental', 'ai', 'residence'] as const

/**
 * Four areas of expertise as one typographic stack: the open line grows, the others recede. Hover, focus or tap.
 * On a mouse, a small preview of a matching demo trails the pointer across the list.
 */
export default function Services() {
  const root = useRef<HTMLElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const peek = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(0)

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-s-in]', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: root.current, start: 'top 70%' } })
      gsap.from('[data-s-row]', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '[data-s-list]', start: 'top 80%' } })
    },
    { scope: root },
  )

  // the preview trails the pointer with a little lag and leans into its direction of travel
  const xTo = useRef<gsap.QuickToFunc | null>(null)
  const yTo = useRef<gsap.QuickToFunc | null>(null)
  const rTo = useRef<gsap.QuickToFunc | null>(null)
  const lastX = useRef(0)
  const canPeek = () =>
    !prefersReducedMotion() && typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches

  const onMove = contextSafe((e: React.PointerEvent) => {
    const el = peek.current
    const box = list.current
    if (!el || !box || e.pointerType !== 'mouse' || !canPeek()) return
    const r = box.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    if (!xTo.current) {
      gsap.set(el, { x, y, xPercent: -50, yPercent: -50 })
      xTo.current = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' })
      yTo.current = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' })
      rTo.current = gsap.quickTo(el, 'rotation', { duration: 0.8, ease: 'power3.out' })
    }
    xTo.current(x)
    yTo.current!(y)
    rTo.current!(gsap.utils.clamp(-8, 8, (e.clientX - lastX.current) * 0.6))
    lastX.current = e.clientX
  })
  const show = contextSafe((on: boolean) => {
    const el = peek.current
    if (!el || !canPeek()) return
    gsap.to(el, { autoAlpha: on ? 1 : 0, scale: on ? 1 : 0.85, duration: on ? 0.4 : 0.25, ease: 'power3.out', overwrite: 'auto' })
  })

  return (
    <section
      ref={root}
      id="expertises"
      aria-labelledby="expertises-title"
      className="relative px-5 pb-32 pt-36 md:px-10 md:pt-48"
      style={{ background: 'linear-gradient(180deg, #0b1020 0%, #08090b 36vh)' }}
    >
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p data-s-in className="label mb-6 text-signal">02 — Ce que nous faisons</p>
          <h2 data-s-in id="expertises-title" className="display max-w-[16ch] text-[clamp(2.8rem,8.4vw,8rem)]">
            We build beyond the <span className="serif-accent text-signal" style={{ fontSize: '1.05em' }}>ordinary.</span>
          </h2>
        </div>
        <p data-s-in className="max-w-md text-base leading-relaxed text-bone/75 md:col-span-4 md:text-lg">
          De l’idée à la réalisation, nous combinons design, technologie et créativité pour donner vie à des projets digitaux ambitieux.
        </p>
      </div>

      <div
        ref={list}
        data-s-list
        className="relative mt-16 md:mt-24"
        onPointerMove={onMove}
        onPointerEnter={(e) => e.pointerType === 'mouse' && show(true)}
        onPointerLeave={() => show(false)}
      >
        <div
          ref={peek}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 hidden w-[19rem] overflow-hidden rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.55)] lg:block"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          {PREVIEW.map((slug, i) => (
            <img
              key={slug}
              src={`/demos/${slug}.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              width={1200}
              height={750}
              className="block aspect-[16/10] w-full object-cover transition-opacity duration-300"
              style={i === 0 ? { opacity: open === i ? 1 : 0 } : { position: 'absolute', inset: 0, height: '100%', opacity: open === i ? 1 : 0 }}
            />
          ))}
        </div>
        {EXPERTISES.map((e, i) => {
          const on = open === i
          return (
            <div key={e.n} data-s-row className="border-t border-bone/15 last:border-b" onPointerEnter={(ev) => ev.pointerType === 'mouse' && setOpen(i)}>
              <h3>
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`exp-${i}`}
                  onClick={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                  className="group flex w-full items-baseline gap-4 py-6 text-left md:gap-10 md:py-8"
                >
                  <span className="label w-8 shrink-0 text-ash transition-colors duration-500 md:w-14" style={{ color: on ? '#ff4b1f' : undefined }}>{e.n}</span>
                  <span
                    className={`display text-[clamp(2.3rem,7vw,6.6rem)] transition-all duration-500 ease-out ${on ? 'text-bone' : 'text-bone/40 group-hover:text-bone/70'}`}
                    style={{ transform: on ? 'translateX(0.6rem)' : 'none' }}
                  >
                    {e.title}
                  </span>
                  <span aria-hidden className="ml-auto text-3xl text-signal transition-transform duration-500 md:text-5xl" style={{ transform: on ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
              </h3>
              <div id={`exp-${i}`} role="region" aria-label={e.title} className="grid transition-[grid-template-rows] duration-500 ease-out" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                <ul className="flex flex-wrap gap-3 overflow-hidden pl-12 md:pl-24" style={{ paddingBottom: on ? '2rem' : 0, transition: 'padding 0.5s ease-out' }}>
                  {e.items.map((it) => (
                    <li key={it} className="rounded-full border border-bone/25 px-4 py-2 text-sm text-bone/85 md:text-base">{it}</li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
