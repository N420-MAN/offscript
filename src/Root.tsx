import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App'
import DemoShell, { isDemoSlug } from './demos/DemoShell'
import { stage } from './state/stage'
import { route } from './lib/route'

const ProjectPage = lazy(() => import('./pages/ProjectPage'))

const demoOf = (hash: string): string | null => {
  const m = hash.match(/^#\/demo\/([a-z]+)/)
  return m && isDemoSlug(m[1]) ? m[1] : null
}
const projectOf = (hash: string): string | null => {
  const m = hash.match(/^#\/projet\/([a-z]+)/)
  return m && isDemoSlug(m[1]) ? m[1] : null
}
/** Anything drawn over the home page: a live demo or a project page. */
const overlayOf = (hash: string) => demoOf(hash) ?? projectOf(hash)

/**
 * Hash routing keeps the project deployable on any static host without server rewrites.
 * The home page stays mounted (hidden) while a demo or a project page is open, so coming back puts the visitor
 * exactly where they were: same scroll position, same window field, no remount, no replayed intro.
 */
export default function Root() {
  const [hash, setHash] = useState(window.location.hash)
  const saved = useRef<number | null>(null)
  const current = useRef(hash)
  const wasOverlay = useRef(!!overlayOf(hash))
  const slug = demoOf(hash)
  const project = projectOf(hash)
  const overlay = slug ?? project

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const on = () => {
      const next = window.location.hash
      if (overlayOf(next) && !overlayOf(current.current)) saved.current = window.scrollY
      current.current = next
      stage.paused = !!overlayOf(next)
      setHash(next)
    }
    stage.paused = !!overlayOf(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  // Leaving an overlay: bring the home page back at the saved scroll position (or the section asked for) before the
  // browser paints it.
  useLayoutEffect(() => {
    if (overlay) {
      wasOverlay.current = true
      return
    }
    if (!wasOverlay.current) return
    wasOverlay.current = false
    // (also covers the browser's Back button, which skips the close animation)
    window.dispatchEvent(new CustomEvent('offscript:return'))
    const stageEl = document.querySelector<HTMLElement>('[data-stage]')
    const fallback = stageEl ? stageEl.offsetHeight - window.innerHeight - 2 : 0
    const anchor = route.anchor ? document.getElementById(route.anchor) : null
    route.anchor = ''
    stage.gateBypass = performance.now() + (anchor ? 1200 : 600)
    stage.snap = true
    const target = () => (anchor ? anchor.getBoundingClientRect().top + window.scrollY - 24 : (saved.current ?? fallback))
    // scroll, let ScrollTrigger re-measure its pinned sections at that position, then settle on the exact spot
    window.scrollTo(0, Math.max(0, target()))
    ScrollTrigger.refresh()
    window.scrollTo(0, Math.max(0, target()))
    ScrollTrigger.update()
    saved.current = null
    // an element target is re-measured once the restored page has finished laying out (pins, lazy images)
    if (anchor) window.setTimeout(() => window.scrollTo(0, Math.max(0, target())), 350)
  }, [overlay])

  return (
    <>
      <div style={overlay ? { display: 'none' } : undefined} aria-hidden={overlay ? true : undefined}>
        <App hidden={!!overlay} />
      </div>
      {slug && <DemoShell key={slug} slug={slug as never} />}
      {project && (
        <Suspense fallback={<div className="min-h-screen bg-void" />}>
          <ProjectPage key={project} slug={project as never} />
        </Suspense>
      )}
    </>
  )
}
