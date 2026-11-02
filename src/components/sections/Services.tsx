import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { EXPERTISES } from '../../data/site'
import { prefersReducedMotion } from '../../hooks/useCapabilities'

gsap.registerPlugin(ScrollTrigger)

/** Four areas of expertise as one typographic stack: the open line grows, the others recede. Hover, focus or tap. */
export default function Services() {
  const root = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(0)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-s-in]', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: root.current, start: 'top 70%' } })
      gsap.from('[data-s-row]', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '[data-s-list]', start: 'top 80%' } })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="expertises"
      aria-labelledby="expertises-title"
      className="relative px-5 pb-32 pt-48 md:px-10 md:pt-64"
      style={{ background: 'linear-gradient(180deg, #0b1020 0%, #08090b 36vh)' }}
    >
      <p data-s-in className="label mb-6 text-signal">02 — Ce que nous faisons</p>
      <h2 data-s-in id="expertises-title" className="display max-w-[16ch] text-[clamp(2.8rem,9vw,8.5rem)]">
        We build beyond the <span className="serif-accent text-signal" style={{ fontSize: '1.05em' }}>ordinary.</span>
      </h2>
      <p data-s-in className="mt-8 max-w-xl text-base leading-relaxed text-bone/75 md:text-lg">
        De l’idée à la réalisation, nous combinons design, technologie et créativité pour donner vie à des projets digitaux ambitieux.
      </p>

      <div data-s-list className="mt-20 md:mt-28">
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
                  className="group flex w-full items-baseline gap-4 py-6 text-left md:gap-10 md:py-9"
                >
                  <span className="label w-8 shrink-0 text-ash md:w-14" style={{ color: on ? '#ff4b1f' : undefined }}>{e.n}</span>
                  <span
                    className="display text-[clamp(2.3rem,7.4vw,7rem)] transition-all duration-500 ease-out"
                    style={{ transform: on ? 'translateX(0.6rem)' : 'none', color: on ? '#f2f0ea' : 'rgba(242,240,234,0.38)' }}
                  >
                    {e.title}
                  </span>
                  <span aria-hidden className="ml-auto text-3xl text-signal transition-transform duration-500 md:text-5xl" style={{ transform: on ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
              </h3>
              <div id={`exp-${i}`} role="region" aria-label={e.title} className="grid transition-[grid-template-rows] duration-500 ease-out" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                <ul className="overflow-hidden">
                  <li className="flex flex-wrap gap-x-3 gap-y-3 pb-8 pl-12 md:pl-24">
                    {e.items.map((it) => (
                      <span key={it} className="rounded-full border border-bone/25 px-4 py-2 text-sm text-bone/85 md:text-base">{it}</span>
                    ))}
                  </li>
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
