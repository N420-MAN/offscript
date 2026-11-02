import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { prefersReducedMotion } from '../hooks/useCapabilities'
import { stage } from '../state/stage'

gsap.registerPlugin(ScrollToPlugin)

/** In-page links glide slowly instead of jumping, so the visitor sees the whole journey they are crossing. */
export function installSmoothAnchors(): () => void {
  let tween: gsap.core.Tween | null = null
  const stop = () => {
    tween?.kill()
    tween = null
    stage.gateBypass = 0
  }
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
    const href = a?.getAttribute('href')
    if (!a || !href || href === '#' || href.startsWith('#/')) return
    const target = document.getElementById(href.slice(1))
    if (!target) return
    e.preventDefault()
    window.setTimeout(() => {
      const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY)
      stage.gateBypass = Infinity
      if (prefersReducedMotion()) {
        window.scrollTo(0, y)
        stage.gateBypass = performance.now() + 300
        return
      }
      stop()
      const dist = Math.abs(y - window.scrollY)
      const duration = Math.min(8, Math.max(2, dist / 520))
      tween = gsap.to(window, { scrollTo: { y, autoKill: true }, duration, ease: 'power2.inOut', overwrite: true, onComplete: () => {
          history.replaceState(null, '', href)
          stage.gateBypass = performance.now() + 300
        },
      })
    }, 60)
  }
  document.addEventListener('click', onClick)
  window.addEventListener('wheel', stop, { passive: true })
  window.addEventListener('touchstart', stop, { passive: true })
  return () => {
    stop()
    document.removeEventListener('click', onClick)
    window.removeEventListener('wheel', stop)
    window.removeEventListener('touchstart', stop)
  }
}
