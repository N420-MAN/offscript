import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App'
import DemoShell, { isDemoSlug } from './demos/DemoShell'
import { stage } from './state/stage'

const demoOf = (hash: string): string | null => {
  const m = hash.match(/^#\/demo\/([a-z]+)/)
  return m && isDemoSlug(m[1]) ? m[1] : null
}

/**
 * Hash routing keeps the project deployable on any static host without server rewrites.
 * The home page stays mounted (hidden) while a demo is open, so closing the demo puts the visitor back exactly
 * where they were: same scroll position, same window field, no remount, no replayed intro.
 */
export default function Root() {
  const [hash, setHash] = useState(window.location.hash)
  const saved = useRef<number | null>(null)
  const current = useRef(hash)
  const wasDemo = useRef(!!demoOf(hash))
  const slug = demoOf(hash)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const on = () => {
      const next = window.location.hash
      if (demoOf(next) && !demoOf(current.current)) saved.current = window.scrollY
      current.current = next
      stage.paused = !!demoOf(next)
      setHash(next)
    }
    stage.paused = !!demoOf(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  // Leaving a demo: bring the home page back at the saved scroll position before the browser paints it.
  useLayoutEffect(() => {
    if (slug) {
      wasDemo.current = true
      return
    }
    if (!wasDemo.current) return
    wasDemo.current = false
    // (also covers the browser's Back button, which skips the close animation)
    window.dispatchEvent(new CustomEvent('offscript:return'))
    const stageEl = document.querySelector<HTMLElement>('[data-stage]')
    const fallback = stageEl ? stageEl.offsetHeight - window.innerHeight - 2 : 0
    const y = saved.current ?? fallback
    stage.gateBypass = performance.now() + 600
    stage.snap = true
    window.scrollTo(0, y)
    ScrollTrigger.refresh()
    window.scrollTo(0, y)
    ScrollTrigger.update()
    saved.current = null
  }, [slug])

  return (
    <>
      <div style={slug ? { display: 'none' } : undefined} aria-hidden={slug ? true : undefined}>
        <App hidden={!!slug} />
      </div>
      {slug && <DemoShell key={slug} slug={slug as never} />}
    </>
  )
}
