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

      // The journey has a top speed: however fast the visitor scrolls, the scene travels at most MAX_SPEED (share of the whole
      // journey per second), easing in and out, so the transition is always seen at its intended pace.
      const MAX_SPEED = 0.34
      let target = 0
      let cur = 0
      let vel = 0
      let ready = false
      let last = performance.now()
      let applied = -1

      const apply = (p: number) => {
        stage.progress = p
        const heroOut = smoothstep(0.03, 0.18, p)
        gsap.set(hero, { opacity: 1 - heroOut, yPercent: -8 * heroOut, visibility: heroOut > 0.98 ? 'hidden' : 'visible' })
        const stIn = smoothstep(0.5, 0.68, p)
        gsap.set(statement, { autoAlpha: stIn, y: (1 - stIn) * 40 })
        gsap.set(seam, { opacity: smoothstep(0.9, 1, p) })
        stage.invalidate()
      }

      const step = () => {
        const now = performance.now()
        const dt = Math.min((now - last) / 1000, 0.25)
        last = now
        if (stage.snap) {
          stage.snap = false
          cur = target
          vel = 0
        }
        // held at the gate means the visitor is at the very end of the journey, whatever rounding the browser's viewport adds
        const d = (stage.held ? 1 : target) - cur
        if (Math.abs(d) < 0.0002 && Math.abs(vel) < 0.001) {
          if (d !== 0) cur = stage.held ? 1 : target
          vel = 0
        } else {
          const want = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, d * 5))
          vel += (want - vel) * Math.min(1, dt * 9)
          cur += vel * dt
          if ((d > 0 && cur > (stage.held ? 1 : target)) || (d < 0 && cur < target)) {
            cur = stage.held ? 1 : target
            vel = 0
          }
        }
        if (cur !== applied) {
          applied = cur
          apply(cur)
        }
      }
      gsap.ticker.add(step)

      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          target = self.progress
          if (!ready) {
            ready = true
            cur = target
            applied = -1
          }
        },
        onRefresh: (self) => {
          if (!ready) {
            ready = true
            target = cur = self.progress
          }
        },
      })
      return () => {
        gsap.ticker.remove(step)
        st.kill()
      }
    },
    { scope: ref },
  )
}
