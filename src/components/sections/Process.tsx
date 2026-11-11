import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { PROCESS } from '../../data/site'
import { prefersReducedMotion } from '../../hooks/useCapabilities'

gsap.registerPlugin(ScrollTrigger)

/**
 * The vermilion guide line from the hero returns as the spine of the process: it draws itself down the four steps.
 * On wide screens the heading holds its place on the left while the steps pass on the right, and a large counter
 * under it names the step being read.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const list = root.current!.querySelector<HTMLElement>('[data-list]')!
      const fill = root.current!.querySelector<HTMLElement>('[data-fill]')!
      const dots = gsap.utils.toArray<HTMLElement>('[data-dot]')
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]')
      const count = root.current!.querySelector<HTMLElement>('[data-count]')
      const light = (p: number) => {
        let lit = 0
        dots.forEach((d, i) => {
          const on = (d.offsetTop + 8) / list.offsetHeight <= p
          if (on) lit = i
          d.style.background = on ? '#ff4b1f' : '#08090b'
          d.style.boxShadow = on ? '0 0 0 6px rgba(255,75,31,0.18)' : 'none'
        })
        steps.forEach((s, i) => (s.style.opacity = i === lit ? '1' : '0.42'))
        if (count) count.textContent = PROCESS[lit].n
      }
      if (prefersReducedMotion()) {
        fill.style.transform = 'scaleY(1)'
        dots.forEach((d) => (d.style.background = '#ff4b1f'))
        return
      }
      light(0)
      ScrollTrigger.create({
        trigger: list,
        start: 'top 60%',
        end: 'bottom 60%',
        scrub: true,
        onUpdate: (s) => {
          fill.style.transform = `scaleY(${s.progress})`
          light(s.progress)
        },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="process" aria-labelledby="process-title" className="bg-void px-5 py-28 md:px-10 md:py-40">
      <div className="lg:grid lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="label mb-6 text-signal">05 — Notre méthode</p>
            <h2 id="process-title" className="display max-w-[14ch] text-[clamp(2.6rem,6.6vw,6.5rem)]">
              Quatre temps, <span className="serif-accent text-signal" style={{ fontSize: '1.05em' }}>un cap.</span>
            </h2>
            <p aria-hidden className="mt-10 hidden items-baseline gap-3 lg:flex">
              <span data-count className="display text-[9rem] text-transparent" style={{ WebkitTextStroke: '1.5px #ff4b1f', lineHeight: 0.8 }}>01</span>
              <span className="label text-ash">/ 04</span>
            </p>
          </div>
        </div>
        <ol data-list className="relative mt-16 lg:col-span-7 lg:mt-4">
          <span aria-hidden className="absolute bottom-0 left-[1.1rem] top-0 w-px bg-bone/15" />
          <span data-fill aria-hidden className="absolute bottom-0 left-[1.05rem] top-0 w-[2px] origin-top bg-signal" style={{ transform: 'scaleY(0)' }} />
          {PROCESS.map((s) => (
            <li key={s.n} data-step className="relative pb-20 pl-12 transition-opacity duration-500 last:pb-0 md:pb-28 md:pl-20">
              <span data-dot aria-hidden className="absolute left-[0.7rem] top-6 h-[0.95rem] w-[0.95rem] rounded-full border-2 border-signal bg-void transition-[background,box-shadow] duration-500 md:top-8" />
              <span className="label text-ash">{s.n}</span>
              <h3 className="display mt-2 text-[clamp(2.4rem,6vw,5.6rem)]">{s.title}</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-bone/75 md:text-lg">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
