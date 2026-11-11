import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { stage } from '../../state/stage'

/** Jagged tear line, top to bottom, as [x%, y%] points. Deterministic so both halves match exactly. */
const JAG: [number, number][] = Array.from({ length: 15 }, (_, i) => {
  const y = (i / 14) * 100
  const x = 50 + 3.2 * Math.sin(i * 1.9) + 2.2 * Math.sin(i * 4.3 + 1) + (i % 2 ? 1.2 : -1.2)
  return [Math.round(x * 10) / 10, y]
})
const jagStr = JAG.map(([x, y]) => `${x}% ${y}%`).join(', ')
const LEFT_CLIP = `polygon(0% 0%, ${jagStr}, 0% 100%)`
const RIGHT_CLIP = `polygon(100% 0%, ${jagStr}, 100% 100%)`
const CRACK_POINTS = JAG.map(([x, y]) => `${x},${y}`).join(' ')

interface Line {
  text: string
  cls: string
}

const LINES: Line[] = [
  { text: 'INT. STUDIO — CASABLANCA — NUIT', cls: 'text-signal' },
  { text: 'Un site comme tous les autres. Le client hésite.', cls: 'text-bone/85' },
  { text: 'OFFSCRIPT', cls: 'pl-[18%] text-bone md:pl-[28%]' },
  { text: 'On ne suit pas le scénario.', cls: 'pl-[8%] text-bone/85 md:pl-[14%]' },
  { text: 'COUPEZ.', cls: 'pt-3 text-bone' },
]

function Page() {
  return (
    <div className="absolute inset-0 bg-[#17191d]">
      <div className="absolute inset-y-0 left-[6%] w-px bg-bone/10 md:left-[16%]" />
      <div className="mx-auto flex h-full max-w-2xl flex-col justify-center gap-4 px-8 font-mono text-[0.95rem] leading-relaxed md:px-0 md:text-xl">
        <p className="label mb-6 text-ash">OFFSCRIPT · Scénario · p. 1</p>
        {LINES.map((l, i) => (
          <p key={i} className={`relative ${l.cls}`}>
            <span className="invisible">{l.text}</span>
            <span className="absolute inset-0" data-key={i} data-text={l.text} />
          </p>
        ))}
      </div>
    </div>
  )
}


function Edge() {
  // Glow without CSS filters (filters on full-screen layers are what made the rip stutter): a wide soft stroke under a thin hot core.
  return (
    <svg data-edge className="absolute inset-0 h-full w-full opacity-0" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <polyline points={CRACK_POINTS} fill="none" stroke="rgba(255,75,31,0.28)" strokeWidth="16" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <polyline points={CRACK_POINTS} fill="none" stroke="rgba(255,120,70,0.55)" strokeWidth="6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <polyline points={CRACK_POINTS} fill="none" stroke="#ffb08e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

interface Props {
  onDone: () => void
}

/** Opening sequence: a screenplay page types itself, then rips open to reveal the scene. Skippable at any moment. */
export default function TearIntro({ onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      stage.reveal = 0
      // Keep intro timings true to wall-clock even when frames are slow (low-end phones).
      gsap.ticker.lagSmoothing(0)
      document.documentElement.style.overflow = 'hidden'

      const q = <T extends Element>(sel: string) => el.querySelector<T>(sel)
      const halves = {
        left: q<HTMLElement>('[data-half="left"]'),
        right: q<HTMLElement>('[data-half="right"]'),
      }
      const edges = Array.from(el.querySelectorAll('[data-edge]'))
      const crack = q<SVGPolylineElement>('[data-crack]')
      const hint = q<HTMLElement>('[data-hint]')
      // The crack is drawn in real pixels: dash animation on a stretched, non-scaling stroke renders as broken pieces.
      let crackLen = 1
      if (crack?.ownerSVGElement) {
        const vw = window.innerWidth
        const vh = window.innerHeight
        crack.ownerSVGElement.setAttribute('viewBox', `0 0 ${vw} ${vh}`)
        crack.setAttribute('points', JAG.map(([x, y]) => `${(x * vw) / 100},${(y * vh) / 100}`).join(' '))
        crackLen = crack.getTotalLength()
        gsap.set(crack, { strokeDasharray: crackLen, strokeDashoffset: crackLen })
      }
      // The hero copy lives outside this overlay, so it must be selected from the document (the scope only covers the overlay).
      const heroLines = Array.from(document.querySelectorAll('[data-hero-line]'))
      const heroSubs = Array.from(document.querySelectorAll('[data-hero-sub]'))
      const heroHeader = Array.from(document.querySelectorAll('[data-hero-header]'))

      const tl = gsap.timeline({
        // Dev-only: ?hold starts the timeline paused so frames can be scrubbed deterministically.
        paused: import.meta.env.DEV && new URLSearchParams(window.location.search).has('hold'),
        onComplete: () => {
          document.documentElement.style.overflow = ''
          try {
            sessionStorage.setItem('offscript-intro', '1')
          } catch {
            /* storage unavailable: intro simply replays next visit */
          }
          onDone()
        },
      })

      // The 3D scene builds and compiles its shaders while this page is on screen, which blocks the main thread for a
      // moment. Typing through that freeze made the text hang and then jump. So the page waits with its caret blinking
      // (a compositor animation, unaffected by the freeze) until the scene is ready, then types; the tear waits again if needed.
      const waitIds: number[] = []
      const waitForScene = (limit: number) => () => {
        if (stage.sceneReady) return
        tl.pause()
        const t0 = performance.now()
        const id = window.setInterval(() => {
          if (!stage.sceneReady && performance.now() - t0 < limit) return
          window.clearInterval(id)
          tl.play()
        }, 40)
        waitIds.push(id)
      }
      const first = el.querySelector<HTMLElement>('[data-key="0"]')
      first?.classList.add('caret')
      tl.call(waitForScene(3000), [], 0.05)

      // 1. Typing
      LINES.forEach((line, i) => {
        const counter = { n: 0 }
        const targets = el.querySelectorAll<HTMLElement>(`[data-key="${i}"]`)
        tl.to(
          counter,
          {
            n: line.text.length,
            duration: Math.max(0.12, line.text.length * 0.0085),
            ease: 'none',
            onStart: () => targets.forEach((t) => t.classList.add('caret')),
            onUpdate: () => targets.forEach((t) => (t.textContent = line.text.slice(0, Math.round(counter.n)))),
            onComplete: () => targets.forEach((t) => t.classList.remove('caret')),
          },
          i === 0 ? 0.15 : '>+0.05',
        )
      })

      // 2. Crack, then split. The tear waits here (4 s at most) until the 3D scene has compiled and drawn: opening onto a
      // scene that is still loading is what made the cut stutter or open onto nothing.
      tl.addLabel('crack', '>+0.05')
      tl.call(waitForScene(2500), [], 'crack')
      tl.set(crack, { opacity: 1 }, 'crack')
      tl.fromTo(crack, { strokeDashoffset: crackLen }, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.in', immediateRender: false }, 'crack')
      tl.addLabel('split', '>')
      tl.to(hint, { autoAlpha: 0, duration: 0.2 }, 'split')
      tl.to(crack, { opacity: 0, duration: 0.25 }, 'split')

      // Scorched edges: the torn paper edges flare as they part, then cool, instead of a floating glow.
      tl.fromTo(edges, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power2.out', immediateRender: false }, 'split')
      tl.to(edges, { opacity: 0, duration: 0.9, ease: 'power2.in' }, 'split+=0.45')

      // The page is pulled apart: slow to start, then it accelerates away.
      tl.to(halves.left, { xPercent: -70, rotation: -6, transformOrigin: '0% 100%', duration: 1.2, ease: 'power3.in' }, 'split')
      tl.to(halves.right, { xPercent: 70, rotation: 7, transformOrigin: '100% 100%', duration: 1.2, ease: 'power3.in' }, 'split')
      tl.set(el, { autoAlpha: 0 }, 'split+=1.25')
      tl.call(() => { document.documentElement.style.overflow = '' }, [], 'split+=1.25')

      // 3. The sculpture glides in from depth and decelerates (no scale-pop); the ease lives in the tween.
      tl.to(stage, { reveal: 1, duration: 2.8, ease: 'expo.out', onUpdate: () => stage.invalidate() }, 'split+=0.1')

      // Headline wipes up out of its masks, then the supporting copy, then the header, so the eye is led in order.
      tl.fromTo(heroLines, { yPercent: 108 }, { yPercent: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out' }, 'split+=0.5')
      tl.fromTo(heroSubs, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out' }, 'split+=0.9')
      tl.fromTo(heroHeader, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 'split+=1.1')

      if (import.meta.env.DEV) (window as unknown as { __tl?: gsap.core.Timeline }).__tl = tl

      // Skip: any input fast-forwards instead of cutting, so it still feels intentional.
      const skip = () => {
        // Before the tear: jump straight to it. After: just run the remainder faster.
        if (tl.time() < tl.labels.split) tl.seek('split')
        waitIds.forEach((id) => window.clearInterval(id))
        tl.timeScale(2).play()
      }
      const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
      events.forEach((e) => window.addEventListener(e, skip, { once: true, passive: true }))

      return () => {
        gsap.ticker.lagSmoothing(500, 33)
        waitIds.forEach((id) => window.clearInterval(id))
        events.forEach((e) => window.removeEventListener(e, skip))
        document.documentElement.style.overflow = ''
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      <div data-half="left" className="absolute inset-0" style={{ willChange: 'transform' }}>
        <div className="absolute inset-0" style={{ clipPath: LEFT_CLIP }}>
          <Page />
        </div>
        <Edge />
      </div>
      <div data-half="right" className="absolute inset-0" style={{ willChange: 'transform' }}>
        <div className="absolute inset-0" style={{ clipPath: RIGHT_CLIP }}>
          <Page />
        </div>
        <Edge />
      </div>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline data-crack points={CRACK_POINTS} fill="none" stroke="#ff4b1f" strokeWidth="3" opacity="0" />
      </svg>
      <p data-hint className="label absolute inset-x-0 bottom-6 text-center text-ash">
        Touchez ou faites défiler pour passer
      </p>
    </div>
  )
}
