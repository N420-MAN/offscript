import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { PROCESS } from '../../data/site'
import { prefersReducedMotion } from '../../hooks/useCapabilities'

gsap.registerPlugin(ScrollTrigger)

/** The vermilion guide line from the hero returns as the spine of the process: it draws itself down the four steps. */
export default function Process() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const list = root.current!.querySelector<HTMLElement>('[data-list]')!
      const fill = root.current!.querySelector<HTMLElement>('[data-fill]')!
      const dots = gsap.utils.toArray<HTMLElement>('[data-dot]')
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]')
      const light = (p: number) =>
        dots.forEach((d) => {
          const on = (d.offsetTop + 8) / list.offsetHeight <= p
          d.style.background = on ? '#ff4b1f' : '#08090b'
          d.style.boxShadow = on ? '0 0 0 6px rgba(255,75,31,0.18)' : 'none'
        })
      if (prefersReducedMotion()) {
        fill.style.transform = 'scaleY(1)'
        light(1)
        return
      }
      ScrollTrigger.create({
        trigger: list,
        start: 'top 65%',
        end: 'bottom 65%',
        scrub: true,
        onUpdate: (s) => {
          fill.style.transform = `scaleY(${s.progress})`
          light(s.progress)
        },
      })
      steps.forEach((el) => gsap.from(el, { opacity: 0, x: 40, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }))
    },
    { scope: root },
  )

  return (
    <section ref={root} id="process" aria-labelledby="process-title" className="bg-void px-5 py-32 md:px-10 md:py-48">
      <p className="label mb-6 text-signal">04 — Notre méthode</p>
      <h2 id="process-title" className="display max-w-[14ch] text-[clamp(2.6rem,8vw,7.5rem)]">
        Quatre temps, <span className="serif-accent text-signal" style={{ fontSize: '1.05em' }}>un cap.</span>
      </h2>
      <ol data-list className="relative mt-20 md:mt-28">
        <span aria-hidden className="absolute bottom-0 left-[1.1rem] top-0 w-px bg-bone/15 md:left-[8.4rem]" />
        <span data-fill aria-hidden className="absolute bottom-0 left-[1.1rem] top-0 w-[2px] origin-top bg-signal md:left-[8.35rem]" style={{ transform: 'scaleY(0)' }} />
        {PROCESS.map((s) => (
          <li key={s.n} data-step className="relative pb-20 pl-12 last:pb-0 md:pb-28 md:pl-[12rem]">
            <span data-dot aria-hidden className="absolute left-[0.7rem] top-5 h-[0.95rem] w-[0.95rem] rounded-full border-2 border-signal bg-void transition-[background,box-shadow] duration-500 md:left-[7.9rem] md:top-9" />
            <span aria-hidden className="display absolute -left-0 top-0 hidden text-[5.5rem] text-transparent md:block" style={{ WebkitTextStroke: '1px rgba(242,240,234,0.35)', lineHeight: 1 }}>{s.n}</span>
            <span className="label text-ash md:hidden">{s.n}</span>
            <h3 className="display mt-2 text-[clamp(2.4rem,7vw,6.5rem)] md:mt-0">{s.title}</h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-bone/75 md:text-lg">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
