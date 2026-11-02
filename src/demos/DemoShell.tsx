import { lazy, Suspense, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DEMOS, type DemoSlug } from './meta'
import { TEAR, tearBottom, tearTop, tearY } from '../lib/tear'
import { prepare, STYLE_OF } from '../lib/transitions'

const pages: Record<DemoSlug, React.LazyExoticComponent<() => React.JSX.Element>> = {
  medical: lazy(() => import('./Medical')),
  hotel: lazy(() => import('./Hotel')),
  residence: lazy(() => import('./Residence')),
  finance: lazy(() => import('./Finance')),
  shop: lazy(() => import('./Shop')),
  ev: lazy(() => import('./Volta')),
  ai: lazy(() => import('./Synapse')),
  atelier: lazy(() => import('./Atelier')),
  festival: lazy(() => import('./Festival')),
  watch: lazy(() => import('./Watch')),
}

export function isDemoSlug(s: string): s is DemoSlug {
  return s in pages
}

let closing = false

/**
 * Closing a demo rips it open. A crack races across the live page, the screen flares, and the page tears along the
 * same jagged line the window tore along when it opened; the halves swing away with a spray of shards, revealing the
 * home page exactly where the visitor left it, with the window they came from pulsing.
 */
function leave(e: React.MouseEvent, slug: DemoSlug, shell: HTMLElement | null) {
  e.preventDefault()
  if (closing) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.location.hash = '#/'
    window.dispatchEvent(new CustomEvent('offscript:return'))
    return
  }
  closing = true
  const src = `/demos/${slug}.jpg`
  const cover = document.createElement('div')
  cover.style.cssText = 'position:fixed;inset:0;z-index:9999;overflow:hidden;perspective:1400px'
  document.body.appendChild(cover)

  const style = STYLE_OF[slug]
  if (style !== 'rip') {
    // the demo's own reveal, played in the same language it opened with
    const go = prepare(style, cover, src, { x: window.innerWidth / 2, y: window.innerHeight / 2 })
    gsap.fromTo(cover, { opacity: 0 }, {
      opacity: 1,
      duration: 0.3,
      ease: 'power1.out',
      onComplete: () => {
        window.location.hash = '#/'
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent('offscript:return'))
          go(() => {
            cover.remove()
            closing = false
          })
        }, 240)
      },
    })
    return
  }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const pts = TEAR.map(([x, y]) => `${(x * vw) / 100},${(y * vh) / 100}`).join(' ')
  const crack = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  crack.setAttribute('viewBox', `0 0 ${vw} ${vh}`)
  crack.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible'
  crack.innerHTML = `<polyline points="${pts}" fill="none" stroke="rgba(255,75,31,.35)" stroke-width="18" stroke-linejoin="round" data-c/><polyline points="${pts}" fill="none" stroke="#ffd2bd" stroke-width="3" data-c/>`
  cover.appendChild(crack)
  const flash = document.createElement('div')
  flash.style.cssText = 'position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#fff3ea,#ff6a3a 60%,#ff4b1f);opacity:0'
  cover.appendChild(flash)

  const half = (clip: string) => {
    const h = document.createElement('div')
    h.style.cssText = `position:absolute;inset:0;clip-path:polygon(${clip});will-change:transform;background:#0b1020`
    const im = document.createElement('img')
    im.src = src
    im.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'
    h.appendChild(im)
    return h
  }

  const lines = Array.from(crack.querySelectorAll<SVGPolylineElement>('[data-c]'))
  lines.forEach((l) => {
    const len = l.getTotalLength()
    l.style.strokeDasharray = String(len)
    l.style.strokeDashoffset = String(len)
  })
  const tl = gsap.timeline()
  // 1. the crack runs across the page, which judders
  tl.to(lines, { strokeDashoffset: 0, duration: 0.42, ease: 'power2.in' }, 0)
  if (shell) tl.fromTo(shell, { x: 0 }, { x: 5, duration: 0.045, repeat: 8, yoyo: true, ease: 'none' }, 0.06)
  // 2. flare, and swap the live page for its torn halves while nothing else is visible
  tl.to(flash, { opacity: 1, duration: 0.09, ease: 'power1.in' }, 0.42)
  tl.call(
    () => {
      const top = half(tearTop())
      const bot = half(tearBottom())
      const glow = crack.cloneNode(true) as SVGElement
      glow.querySelectorAll<SVGElement>('[data-c]').forEach((n) => (n.style.strokeDashoffset = '0'))
      cover.replaceChildren(glow, top, bot, flash)
      cover.style.pointerEvents = 'auto'
      window.location.hash = '#/'
      const shards: HTMLElement[] = []
      for (let i = 0; i < 22; i++) {
        const x = 4 + (i / 21) * 92
        const sh = document.createElement('div')
        const sz = 14 + Math.random() * 46
        const a = Math.random() < 0.55
        sh.style.cssText = `position:absolute;left:${x}%;top:${tearY(x)}%;width:${sz}px;height:${sz * (0.5 + Math.random())}px;background:${a ? '#ff4b1f' : '#f2f0ea'};clip-path:polygon(${Math.random() * 30}% 0,100% ${Math.random() * 40}%,${70 + Math.random() * 30}% 100%,0 ${60 + Math.random() * 40}%);opacity:0.95;will-change:transform`
        cover.insertBefore(sh, flash)
        shards.push(sh)
      }
      // let React mount the home page underneath, then open
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('offscript:return'))
        const open = gsap.timeline({
          onComplete: () => {
            cover.remove()
            closing = false
          },
        })
        open.to(flash, { opacity: 0, duration: 0.18, ease: 'power2.out' }, 0)
        open.to(top, { yPercent: -88, rotationX: 16, rotation: -2.2, transformOrigin: '50% 100%', duration: 1.25, ease: 'expo.inOut' }, 0.04)
        open.to(bot, { yPercent: 88, rotationX: -16, rotation: 2, transformOrigin: '50% 0%', duration: 1.25, ease: 'expo.inOut' }, 0.08)
        open.to(glow, { opacity: 0, duration: 0.7, ease: 'power2.in' }, 0.2)
        shards.forEach((sh) => {
          open.to(sh, { x: (Math.random() - 0.5) * 520, y: (Math.random() - 0.5) * 460, rotation: (Math.random() - 0.5) * 540, scale: 0.1, opacity: 0, duration: 0.9 + Math.random() * 0.5, ease: 'power3.out' }, 0.1)
        })
      }, 220)
    },
    [],
    0.5,
  )
}

/** Wraps a demo site with the one persistent control that returns the visitor to the studio. */
export default function DemoShell({ slug }: { slug: DemoSlug }) {
  const Page = pages[slug]
  const meta = DEMOS.find((d) => d.slug === slug)!
  const shell = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // The home page is still mounted underneath: remember its triggers so only this demo's are removed on exit.
    const homeTriggers = new Set(ScrollTrigger.getAll())
    window.scrollTo(0, 0)
    document.title = `${meta.name} — ${meta.kind}`
    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (!homeTriggers.has(t)) t.kill()
      })
      document.title = 'OFFSCRIPT'
    }
  }, [meta])

  return (
    <div ref={shell}>
      <a
        href="#/"
        onClick={(e) => leave(e, slug, shell.current)}
        className="fixed bottom-4 left-4 z-[100] flex items-center gap-2 rounded-full bg-black/80 px-4 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-white backdrop-blur transition-transform hover:scale-105"
        style={{ fontFamily: '"DM Mono", monospace' }}
      >
        <span aria-hidden>←</span> OFF/SCRIPT
      </a>
      <Suspense fallback={<div className="grid h-screen place-items-center bg-black text-white/50">…</div>}>
        <Page />
      </Suspense>
    </div>
  )
}
