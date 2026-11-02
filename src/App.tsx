import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { HeroLayer, SiteHeader } from './components/sections/Hero'
import FloatingWindows from './components/ui/FloatingWindows'
import Statement from './components/sections/Statement'
import Services from './components/sections/Services'
import Philosophy from './components/sections/Philosophy'
import Process from './components/sections/Process'
import Contact from './components/sections/Contact'
import TearIntro from './components/sections/TearIntro'
import StaticBackdrop from './components/ui/StaticBackdrop'
import { hasWebGL, prefersReducedMotion } from './hooks/useCapabilities'
import { useStageScroll } from './hooks/useStageScroll'
import { useScrollGate } from './hooks/useScrollGate'
import { stage } from './state/stage'
import { installSmoothAnchors } from './lib/smoothScroll'

const HeroCanvas = lazy(() => import('./scenes/hero/HeroCanvas'))

function shouldPlayIntro(): boolean {
  if (window.location.hash.startsWith('#/demo/')) return false
  try {
  } catch {
    /* ignore */
  }
  if (prefersReducedMotion()) return false
  const param = new URLSearchParams(window.location.search).get('intro')
  if (param === '0') return false
  if (param === '1') return true
  try {
    return sessionStorage.getItem('offscript-intro') !== '1'
  } catch {
    return true
  }
}

export default function App({ hidden = false }: { hidden?: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [intro, setIntro] = useState(shouldPlayIntro)
  const [ready, setReady] = useState(false)
  const webgl = hasWebGL()
  useEffect(() => {
    if (!intro) stage.reveal = 1
  }, [intro])

  useStageScroll(stageRef)
  useScrollGate(stageRef)
  useEffect(() => installSmoothAnchors(), [])

  // The hero only works while it is on screen and no demo is open on top of it.
  const [inView, setInView] = useState(true)
  const [shown, setShown] = useState(false)
  // Mount the heavy 3D scene a moment after first paint, while the intro types, instead of competing with it.
  useEffect(() => {
    if (hidden || shown) return
    const id = window.setTimeout(() => setShown(true), intro ? 900 : 150)
    return () => window.clearTimeout(id)
  }, [hidden, shown, intro])
  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const active = inView && !hidden
  useEffect(() => {
    stage.active = active
  }, [active])

  return (
    <main data-intro={intro} className="bg-void">
      {/* The stage is 3.2 screens tall; its sticky child holds the whole journey. */}
      <div ref={stageRef} data-stage className="relative" style={{ height: '320vh' }}>
        {/* Anchor for the "Projets" link: the frame where the work floats. */}
        <div id="projets" aria-hidden="true" className="absolute left-0 w-px" style={{ top: 'calc(320vh - 100dvh)' }} />
        <div className="sticky top-0 h-[100dvh] overflow-hidden" style={{ height: '100svh' }}>
          <StaticBackdrop />
          {webgl && shown && (
            <div
              className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-1000"
              style={{ opacity: ready ? 1 : 0 }}
              aria-hidden="true"
            >
              <Suspense fallback={null}>
                <HeroCanvas active={active} onReady={() => setReady(true)} />
              </Suspense>
            </div>
          )}
          <div
              data-hero-fade
              className="pointer-events-none absolute inset-0 z-0"
              style={{ background: 'linear-gradient(90deg, rgba(11,16,32,0.8) 0%, rgba(11,16,32,0.5) 30%, rgba(11,16,32,0) 60%), linear-gradient(0deg, rgba(11,16,32,0.55) 0%, rgba(11,16,32,0) 38%)' }}
          />
          <HeroLayer layer="back" variant="script" />
          <HeroLayer layer="front" variant="script" />
          <Statement />
          <SiteHeader />
          <FloatingWindows />
        </div>
      </div>
      <Services />
      <Philosophy />
      <Process />
      <Contact />
      {intro && <TearIntro onDone={() => setIntro(false)} />}
    </main>
  )
}
