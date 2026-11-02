import { type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { smoothstep } from '../lib/math'
import { stage } from '../state/stage'

gsap.registerPlugin(ScrollTrigger)
// The phone's address bar resizes the viewport while scrolling; that must not trigger a full recalculation.
ScrollTrigger.config({ ignoreMobileResize: true })

/** Maps scroll through the pinned stage to the shared progress value and the DOM layers that depend on it. */
export function useStageScroll(ref: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const hero = gsap.utils.toArray<HTMLElement>('[data-hero-fade]')
      const statement = gsap.utils.toArray<HTMLElement>('[data-statement]')
      const seam = gsap.utils.toArray<HTMLElement>('[data-seam]')

      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: 'bottom bottom',
        // time-based smoothing turns stepped wheel / finger scrolling into one continuous motion
        scrub: window.matchMedia('(pointer: coarse)').matches ? 0.4 : 0.6,
        onUpdate: (self) => {
          const p = self.progress
          stage.progress = p

          const heroOut = smoothstep(0.03, 0.18, p)
          gsap.set(hero, { opacity: 1 - heroOut, yPercent: -8 * heroOut, visibility: heroOut > 0.98 ? 'hidden' : 'visible' })

          const stIn = smoothstep(0.5, 0.68, p)
          gsap.set(statement, { autoAlpha: stIn, y: (1 - stIn) * 40 })

          gsap.set(seam, { opacity: smoothstep(0.9, 1, p) })

          stage.invalidate()
        },
      })
    },
    { scope: ref },
  )
}
