import { useEffect, type RefObject } from 'react'
import { stage } from '../state/stage'

/**
 * The windows are the destination of the opening journey, so a fast scroll must not carry the visitor straight past
 * them. Scrolling down stops at the end of the stage; a new, deliberate gesture (a fresh flick, a touch, a key press)
 * continues onward. Anchor links and returns from demos bypass the gate.
 */
export function useScrollGate(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let gateY = 0
    let held = false
    let armed = window.scrollY < 1
    let arrivedAt = 0
    let lastWheel = 0
    let lastY = window.scrollY
    const measure = () => {
      const el = ref.current
      gateY = el ? el.offsetHeight - window.innerHeight : 0
    }
    measure()
    const setHeld = (v: boolean) => {
      held = v
      stage.held = v
    }
    const bypass = () => stage.gateBypass === Infinity || performance.now() < stage.gateBypass

    const onScroll = () => {
      const y = window.scrollY
      if (stage.paused || bypass()) {
        lastY = y
        armed = y < gateY - 40
        if (held) setHeld(false)
        return
      }
      if (y < gateY - 40) {
        armed = true
        if (held) setHeld(false)
      }
      if (armed && !held && y > gateY + 1 && lastY <= gateY + 120) {
        window.scrollTo(0, gateY)
        arrivedAt = performance.now()
        setHeld(true)
        armed = false
      } else if (held && y > gateY + 1) {
        window.scrollTo(0, gateY)
      }
      lastY = window.scrollY
    }
    const onWheel = (e: WheelEvent) => {
      if (!held || stage.paused) return
      if (e.deltaY <= 0) {
        setHeld(false)
        return
      }
      // Event timestamps tell when the flick really happened, even if the main thread is busy; fall back to handling time.
      const handled = performance.now()
      const stampOk = Math.abs(e.timeStamp - handled) < 2000
      const now = stampOk ? e.timeStamp : handled
      const gap = now - lastWheel
      lastWheel = now
      if (now - arrivedAt < 420 || gap < 260) {
        e.preventDefault() // still the same flick, or its inertia
        return
      }
      setHeld(false) // a deliberate new gesture: let it through
    }
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0
      if (held && performance.now() - arrivedAt > 420) setHeld(false)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!held) return
      const y = e.touches[0]?.clientY ?? touchY
      if (y > touchY + 6) setHeld(false) // swiping back up the page is never blocked
      else if (e.cancelable) e.preventDefault()
    }
    const onKey = (e: KeyboardEvent) => {
      if (!held) return
      if (!['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key)) return
      if (performance.now() - arrivedAt < 380) e.preventDefault()
      else setHeld(false)
    }
    const onResize = () => measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      stage.held = false
    }
  }, [ref])
}
