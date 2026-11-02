import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { DEMOS, type DemoSlug } from '../../demos/meta'
import { stage } from '../../state/stage'
import { TEAR, tearBottom, tearTop } from '../../lib/tear'
import { prepare, STYLE_OF } from '../../lib/transitions'
import { smoothstep } from '../../lib/math'
import { prefersReducedMotion } from '../../hooks/useCapabilities'

/** Warm the demo's code chunk while the window is still growing, so the tear reveals a live page. */
const preload: Record<DemoSlug, () => Promise<unknown>> = {
  medical: () => import('../../demos/Medical'),
  hotel: () => import('../../demos/Hotel'),
  residence: () => import('../../demos/Residence'),
  finance: () => import('../../demos/Finance'),
  shop: () => import('../../demos/Shop'),
  ev: () => import('../../demos/Volta'),
  ai: () => import('../../demos/Synapse'),
  atelier: () => import('../../demos/Atelier'),
  festival: () => import('../../demos/Festival'),
  watch: () => import('../../demos/Watch'),
}

interface Body {
  x: number // centre
  y: number
  vx: number
  vy: number
  w: number
  h: number
  s: number // depth scale: big = near, small = far
  sc: number // current scale (s × fly-in growth)
  en: number // 0..1 fly-in progress
  delay: number
  base: number // slowly drifting rest angle
  drift: number // deg/s of self-rotation
  wx: number // 3D tumble speeds / amplitudes
  wy: number
  Ax: number
  Ay: number
  ph: number
  ox: number // where the window is "born" in the break, as a fraction of the frame
  oy: number
  sa: number // extra spin / tumble it sheds while it settles into a demo window
  sx: number
  sy: number
  dim: HTMLElement | null
  lastBlur: string
  lastShadow: string
  hx: number // pointer position inside the window, -1..1, for the hover tilt
  hy: number
  calm: number // 0..1, squares the window up while it is held or hovered
  angle: number
  spin: number
  home: number
  rx: number
  ry: number
  fade: number
  ax: number // home position, as a fraction of the frame, eased toward until the visitor first touches the window
  ay: number
  free: boolean
  px: number
  py: number
  drag: boolean
  el: HTMLElement
}

const BAR = 26
const RING_R = 62
// Loose, uneven homes that keep the copy's area clear (desktop) or the lower half free (mobile).
const HOMES_D: [number, number][] = [[0.5, 0.2], [0.72, 0.17], [0.92, 0.32], [0.6, 0.5], [0.82, 0.54], [0.48, 0.84], [0.68, 0.84], [0.92, 0.82], [0.26, 0.88], [0.24, 0.14]]
const HOMES_M: [number, number][] = [[0.3, 0.56], [0.72, 0.52], [0.2, 0.7], [0.64, 0.68], [0.86, 0.82], [0.4, 0.84], [0.14, 0.92], [0.7, 0.94], [0.5, 0.6], [0.9, 0.62]]
const rnd = (a: number, b: number) => a + Math.random() * (b - a)

/**
 * The demo sites as windows adrift over the whole final frame, at random angles and depths.
 * Grab one, throw it, let it spin; drop it in the ring (or tap it) and the screen tears open onto the live site.
 * Windows pass behind the copy and blur while they cross it, so the text is never covered.
 */
export default function FloatingWindows() {
  const root = useRef<HTMLDivElement>(null)
  const trail = useRef<HTMLCanvasElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const cue = useRef<HTMLParagraphElement>(null)
  const els = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const rootEl = root.current
    const cv = trail.current
    if (!rootEl || !cv) return
    const ctx = cv.getContext('2d')!
    const reduced = prefersReducedMotion()
    const bodies: Body[] = []
    let W = 0
    let H = 0
    let HDR = 70
    let ringC = { x: 0, y: 0 }
    let started = false
    let lastTouch = performance.now()
    let hovered = -1
    let z = 20
    let diving = false
    let ptr = { x: -999, y: -999 }
    let textRect: DOMRect | null = null
    let frame = 0
    let interacted = false
    let attractIdx = -1
    let attractUntil = 0
    let nextAttract = 0
    let readyAt = 0
    let forceAttract = false
    let trailUntil = 0
    let trailDirty = false

    const ext = (b: Body) => {
      const r = (b.angle * Math.PI) / 180
      const c = Math.abs(Math.cos(r))
      const s = Math.abs(Math.sin(r))
      return { hw: ((c * b.w + s * b.h) / 2) * b.sc, hh: ((s * b.w + c * b.h) / 2) * b.sc }
    }
    const clampIn = (b: Body) => {
      const { hw, hh } = ext(b)
      b.x = Math.min(Math.max(b.x, hw + 6), W - hw - 6)
      b.y = Math.min(Math.max(b.y, HDR + hh), H - hh - 6)
    }

    const layout = () => {
      const rr = rootEl.getBoundingClientRect()
      if (rr.width < 10) return // home page hidden under a demo: keep the last real layout
      W = rr.width
      H = rr.height
      HDR = W < 760 ? 64 : 72
      cv.width = W
      cv.height = H
      const base = W < 760 ? Math.min(190, W * 0.46) : Math.min(400, Math.max(270, W * 0.235))
      bodies.forEach((b) => {
        b.w = base
        b.h = base * 0.625 + BAR
        b.el.style.width = `${b.w}px`
        b.el.style.height = `${b.h}px`
        clampIn(b)
      })
      ringC = { x: W - RING_R - 18, y: H - RING_R - 18 }
      if (ring.current) {
        ring.current.style.left = `${ringC.x - RING_R}px`
        ring.current.style.top = `${ringC.y - RING_R}px`
      }
    }

    DEMOS.forEach((_, i) => {
      const el = els.current[i]
      if (!el) return
      const s = rnd(0.74, 1.14)
      bodies.push({ x: 0, y: 0, vx: 0, vy: 0, w: 220, h: 160, s, sc: 0, en: 0, delay: 0, base: 0, drift: Math.random() < 0.6 ? rnd(5, 13) * (Math.random() < 0.5 ? -1 : 1) : 0, wx: rnd(0.16, 0.32), wy: rnd(0.13, 0.28), Ax: rnd(14, 32), Ay: rnd(32, 62), ph: rnd(0, 6.28), ox: 0.5, oy: 0.5, sa: 0, sx: 0, sy: 0, dim: el.querySelector<HTMLElement>('[data-dim]'), lastBlur: 'none', lastShadow: '', hx: 0, hy: 0, calm: 0, angle: 0, spin: 0, home: rnd(-30, 30), rx: 0, ry: 0, fade: 0, ax: 0.5, ay: 0.5, free: false, px: 0, py: 0, drag: false, el })
      el.style.zIndex = String(Math.round(s * 10))
    })
    layout()

    const place = () => {
      // Each window is born somewhere in the break (a scattered, tumbling piece of debris) and, as the visitor
      // scrolls, settles into its place as a demo window. The entry itself is driven by scroll progress.
      bodies.forEach((b, i) => {
        const h = (W < 760 ? HOMES_M : HOMES_D)[i % 10]
        b.ax = h[0]
        b.ay = h[1]
        b.free = false
        b.base = b.home
        b.x = b.ax * W
        b.y = b.ay * H
        b.vx = b.vy = 0
        b.angle = b.home
        b.spin = 0
        b.rx = b.ry = 0
        if (reduced) {
          b.ox = b.ax
          b.oy = b.ay
          b.sa = b.sx = b.sy = 0
        } else {
          b.ox = rnd(0.08, 0.92)
          b.oy = rnd(0.14, 0.88)
          b.sa = rnd(-260, 260)
          b.sx = rnd(-85, 85)
          b.sy = rnd(-85, 85)
        }
      })
    }
    place()

    const ripple = () => {
      const r = document.createElement('div')
      r.style.cssText = `position:absolute;left:${ringC.x - RING_R}px;top:${ringC.y - RING_R}px;width:${RING_R * 2}px;height:${RING_R * 2}px;border-radius:9999px;border:2px solid #ff4b1f;pointer-events:none`
      rootEl.appendChild(r)
      gsap.fromTo(r, { scale: 1, opacity: 0.9 }, { scale: 4.5, opacity: 0, duration: 0.7, ease: 'power3.out', onComplete: () => r.remove() })
    }

    const open = (i: number) => {
      if (diving) return
      diving = true
      const d = DEMOS[i]
      const b = bodies[i]
      stage.lastOpened = d.slug
      void preload[d.slug]()
      if (reduced) {
        window.location.hash = `#/demo/${d.slug}`
        return
      }
      const src = `/demos/${d.slug}.jpg`
      const cover = document.createElement('div')
      cover.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none'
      document.body.appendChild(cover)

      const win = document.createElement('div')
      win.style.cssText = `position:absolute;left:${b.x - (b.w * b.sc) / 2}px;top:${b.y - (b.h * b.sc) / 2}px;width:${b.w * b.sc}px;height:${b.h * b.sc}px;overflow:hidden;border-radius:10px;background:#000;transform:rotate(${b.angle}deg);box-shadow:0 30px 80px rgba(0,0,0,.6)`
      const im = document.createElement('img')
      im.src = src
      im.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'
      win.appendChild(im)
      cover.appendChild(win)

      // 1. the window swings square and fills the screen
      gsap.to(win, {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        rotation: 0,
        borderRadius: 0,
        duration: 0.6,
        ease: 'expo.inOut',
        onComplete: () => {
          const style = STYLE_OF[d.slug]
          if (style === 'rip') return tear()
          // every other demo has its own reveal, built from slices of the same preview the window was showing
          const go = prepare(style, cover, src, { x: b.x, y: b.y })
          window.location.hash = `#/demo/${d.slug}`
          window.setTimeout(() => go(() => cover.remove()), 340)
        },
      })

      // 2. it rips along a jagged line; the live site is already mounted underneath
      function tear() {
        const ptsTop = tearTop()
        const ptsBot = tearBottom()
        const half = (clip: string) => {
          const h = document.createElement('div')
          h.style.cssText = `position:absolute;inset:0;clip-path:polygon(${clip});will-change:transform`
          const i2 = document.createElement('img')
          i2.src = src
          i2.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'
          h.appendChild(i2)
          return h
        }
        const glow = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        glow.setAttribute('viewBox', '0 0 100 100')
        glow.setAttribute('preserveAspectRatio', 'none')
        glow.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 0 10px #ff4b1f) drop-shadow(0 0 28px #ff4b1f)'
        glow.innerHTML = `<polyline points="${TEAR.map(([x, y]) => `${x},${y}`).join(' ')}" fill="none" stroke="#ff4b1f" stroke-width="0.9" vector-effect="non-scaling-stroke" style="stroke-width:3px"/>`
        const top = half(ptsTop)
        const bot = half(ptsBot)
        cover.replaceChildren(glow, top, bot)

        window.location.hash = `#/demo/${d.slug}`
        const go = () => {
          const tl = gsap.timeline({ onComplete: () => cover.remove() })
          tl.to(top, { yPercent: -62, rotation: -1.4, duration: 1, ease: 'power4.inOut' }, 0)
          tl.to(bot, { yPercent: 62, rotation: 1.2, duration: 1, ease: 'power4.inOut' }, 0.04)
          tl.to(glow, { opacity: 0, duration: 0.7, ease: 'power2.in' }, 0.35)
        }
        // give React a beat to mount the page beneath the overlay
        window.setTimeout(go, 320)
      }
    }

    // ---- pointer handling
    const cleanups: (() => void)[] = []
    bodies.forEach((b, i) => {
      const el = b.el
      let startX = 0
      let startY = 0
      let t0 = 0
      let ox = 0
      let oy = 0
      let lastT = 0
      let moved = 0
      let tap = false
      const down = (e: PointerEvent) => {
        if (reduced || b.en < 0.35) return
        tap = true
        startX = e.clientX
        startY = e.clientY
        t0 = performance.now()
        void preload[DEMOS[i].slug]()
        interacted = true
        if (b.en < 1) return // still arriving: it can be opened with a tap, not thrown
        b.drag = true
        b.free = true
        b.vx = b.vy = 0
        b.spin = 0
        const rr = rootEl.getBoundingClientRect()
        ox = e.clientX - rr.left - b.x
        oy = e.clientY - rr.top - b.y
        startX = e.clientX
        startY = e.clientY
        moved = 0
        t0 = lastT = performance.now()
        el.style.zIndex = String(++z)
        el.setPointerCapture(e.pointerId)
        lastTouch = t0
        void preload[DEMOS[i].slug]()
        interacted = true
      }
      const move = (e: PointerEvent) => {
        if (!b.drag) {
          const r = el.getBoundingClientRect()
          b.hx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1))
          b.hy = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))
          return
        }
        const now = performance.now()
        const dt = Math.max((now - lastT) / 1000, 0.001)
        const rr = rootEl.getBoundingClientRect()
        const px = e.clientX - rr.left
        const py = e.clientY - rr.top
        const ox0 = b.x
        const oy0 = b.y
        b.x = px - ox
        b.y = py - oy
        clampIn(b)
        b.vx = b.vx * 0.55 + ((b.x - ox0) / dt) * 0.45
        b.vy = b.vy * 0.55 + ((b.y - oy0) / dt) * 0.45
        lastT = now
        ptr = { x: px, y: py }
        moved = Math.hypot(e.clientX - startX, e.clientY - startY)
        lastTouch = now
      }
      const up = (e: PointerEvent) => {
        if (!b.drag) {
          if (tap && Math.hypot(e.clientX - startX, e.clientY - startY) < 12) open(i)
          tap = false
          return
        }
        tap = false
        b.drag = false
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {
          /* already released */
        }
        const inRing = Math.hypot(ptr.x - ringC.x, ptr.y - ringC.y) < RING_R * 1.15 || Math.hypot(b.x - ringC.x, b.y - ringC.y) < RING_R * 1.15
        if (inRing || (moved < 12 && performance.now() - t0 < 900)) {
          if (inRing) ripple()
          open(i)
          return
        }
        const sp = Math.hypot(b.vx, b.vy)
        const cap = 1900
        if (sp > cap) {
          b.vx *= cap / sp
          b.vy *= cap / sp
        }
        // A pause before release means "put it down"; a flick spins the window.
        if (performance.now() - lastT > 90) b.vx = b.vy = 0
        else b.spin = Math.max(-360, Math.min(360, b.vx * 0.07 + (Math.random() - 0.5) * 100))
      }
      const key = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open(i)
        }
      }
      const enter = () => (hovered = i)
      const leave = () => {
        hovered = -1
        b.hx = b.hy = 0
      }
      el.addEventListener('pointerdown', down)
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointercancel', up)
      el.addEventListener('keydown', key)
      el.addEventListener('pointerenter', enter)
      el.addEventListener('pointerleave', leave)
      cleanups.push(() => {
        el.removeEventListener('pointerdown', down)
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerup', up)
        el.removeEventListener('pointercancel', up)
        el.removeEventListener('keydown', key)
        el.removeEventListener('pointerenter', enter)
        el.removeEventListener('pointerleave', leave)
      })
    })

    // ---- simulation + render
    let raf = 0
    let last = performance.now()
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.04)
      last = now
      if (!stage.active) return
      const p = stage.progress
      const show = p > 0.46
      rootEl.style.opacity = '1'
      rootEl.style.visibility = show ? 'visible' : 'hidden'
      if (!show) {
        started = false
        return
      }
      if (!started) {
        started = true
        lastTouch = now
        readyAt = 0
        layout()
        place()
      }
      const t = now / 1000

      if (frame++ % 6 === 0) {
        const tb = document.querySelector('[data-statement] > div')
        if (tb) {
          const rr = rootEl.getBoundingClientRect()
          const r = tb.getBoundingClientRect()
          textRect = new DOMRect(r.left - rr.left - 14, r.top - rr.top - 10, r.width + 28, r.height + 20)
        }
      }

      // scroll-driven entry: windows grow out of the break one after another, tumbling, and settle
      let minEn = 1
      bodies.forEach((b, i) => {
        b.en = Math.max(0, Math.min(1, (p - (0.46 + i * 0.012)) / 0.22))
        minEn = Math.min(minEn, b.en)
        const e = b.en * b.en * (3 - 2 * b.en)
        b.sc = b.s * (0.04 + 0.96 * e)
        b.calm += ((b.drag || hovered === i ? 1 : 0) - b.calm) * Math.min(1, dt * 5)
      })
      if (minEn >= 1 && !readyAt) readyAt = now
      if (minEn < 1) readyAt = 0
      const age = readyAt ? (now - readyAt) / 1000 : 0
      const ready = smoothstep(0.7, 1, minEn)
      if (hint.current) hint.current.style.opacity = String(ready)
      if (cue.current) cue.current.style.opacity = stage.held && ready > 0.99 ? '1' : '0'
      if (ring.current) ring.current.style.opacity = String(ready)

      if (!reduced) {
        if (!interacted && readyAt && age > 3.5 && now > nextAttract) {
          attractIdx = Math.floor(Math.random() * bodies.length)
          attractUntil = now + 1700
          nextAttract = now + 3600
          bodies[attractIdx].vy -= 70
        }
        if (readyAt && now - lastTouch > 9000 && age > 4) {
          const b = bodies[Math.floor(Math.random() * bodies.length)]
          b.free = true
          const a = Math.random() * Math.PI * 2
          b.vx += Math.cos(a) * 240
          b.vy += Math.sin(a) * 240
          b.spin += rnd(-120, 120)
          lastTouch = now - 5000
        }
        const fr = Math.pow(0.5, dt)
        const sd = Math.pow(0.35, dt)
        bodies.forEach((b, i) => {
          if (b.en < 1) {
            // still arriving: the scroll position places it, from its birth point to its home
            const e = b.en * b.en * (3 - 2 * b.en)
            b.x = (b.ox + (b.ax - b.ox) * e) * W
            b.y = (b.oy + (b.ay - b.oy) * e) * H
            b.vx = b.vy = b.spin = 0
            b.angle = b.home + (1 - e) * b.sa + p * 40 * (1 - e)
            b.base = b.home
            return
          }
          if (b.drag) {
            b.angle += (b.home * 0.3 + Math.max(-12, Math.min(12, b.vx * 0.01)) - b.angle) * Math.min(1, dt * 7)
            return
          }
          // a lazy drift, like something floating in still water
          b.vx += Math.sin(t * 0.43 + i * 1.9) * 20 * dt
          b.vy += Math.cos(t * 0.37 + i * 2.3) * 20 * dt
          if (!b.free) {
            const kk = 0.5 + (1 - b.en) * 2
            b.vx += (b.ax * W - b.x) * kk * dt
            b.vy += (b.ay * H - b.y) * kk * dt
          }
          // keep clear of the copy: windows drift out of its way instead of resting behind it
          if (textRect && !b.drag) {
            const { hw: ew, hh: eh } = ext(b)
            const ox2 = Math.min(b.x + ew - textRect.x, textRect.x + textRect.width - (b.x - ew))
            const oy2 = Math.min(b.y + eh - textRect.y, textRect.y + textRect.height - (b.y - eh))
            if (ox2 > 0 && oy2 > 0) {
              const k2 = Math.min(1, Math.min(ox2, oy2) / 160)
              if (ox2 <= oy2 * 1.6) b.vx += (b.x < textRect.x + textRect.width / 2 ? -1 : 1) * (b.x < W * 0.55 ? 1 : 0.4) * 700 * k2 * dt
              else b.vy += (b.y < textRect.y + textRect.height / 2 ? -1 : 1) * 700 * k2 * dt
              if (b.x - ew < textRect.x + textRect.width && b.x < textRect.x + textRect.width) b.vx += 520 * k2 * dt
            }
          }
          b.vx *= fr
          b.vy *= fr
          b.x += b.vx * dt
          b.y += b.vy * dt
          // self-rotation: a slowly drifting rest angle, followed by a soft spring; squares up when held or hovered
          b.base += b.drift * dt * (1 - b.calm)
          const rest = Math.round(b.base / 360) * 360 + b.home * 0.3
          const target = (b.base + Math.sin(t * 0.3 + i * 2.1) * 10) * (1 - b.calm) + rest * b.calm
          b.spin += (target - b.angle) * 4.5 * dt
          b.spin *= sd
          b.angle += b.spin * dt
          const { hw, hh } = ext(b)
          if (b.x < hw + 6) {
            b.x = hw + 6
            b.vx = Math.abs(b.vx) * 0.66
            b.spin += b.vy * 0.02
          } else if (b.x > W - hw - 6) {
            b.x = W - hw - 6
            b.vx = -Math.abs(b.vx) * 0.66
            b.spin -= b.vy * 0.02
          }
          if (b.y < HDR + hh) {
            b.y = HDR + hh
            b.vy = Math.abs(b.vy) * 0.66
            b.spin -= b.vx * 0.02
          } else if (b.y > H - hh - 6) {
            b.y = H - hh - 6
            b.vy = -Math.abs(b.vy) * 0.66
            b.spin += b.vx * 0.02
          }
        })
        // soft body-to-body collisions: they nudge each other and trade a little momentum and spin
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            const A = bodies[i]
            const B = bodies[j]
            if (A.en < 0.8 || B.en < 0.8) continue
            const dx = B.x - A.x
            const dy = B.y - A.y
            const dist = Math.hypot(dx, dy) || 1
            const min = 0.3 * (A.w * A.sc + B.w * B.sc)
            if (dist >= min) continue
            const nx = dx / dist
            const ny = dy / dist
            const push = min - dist
            const wa = A.drag ? 0 : B.drag ? 1 : 0.5
            const wb = B.drag ? 0 : A.drag ? 1 : 0.5
            A.x -= nx * push * wa
            A.y -= ny * push * wa
            B.x += nx * push * wb
            B.y += ny * push * wb
            const rel = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny
            if (rel < 0) {
              const imp = -rel * 0.6
              if (!A.drag) {
                A.vx -= nx * imp * wa * 2
                A.vy -= ny * imp * wa * 2
              }
              if (!B.drag) {
                B.vx += nx * imp * wb * 2
                B.vy += ny * imp * wb * 2
              }
              A.spin += (-ny * (B.vx - A.vx) + nx * (B.vy - A.vy)) * 0.05
              B.spin += (-ny * (B.vx - A.vx) + nx * (B.vy - A.vy)) * 0.05
            }
          }
        }
      }

      if (now < trailUntil) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'rgba(0,0,0,0.2)'
        ctx.fillRect(0, 0, W, H)
        ctx.globalCompositeOperation = 'source-over'
      } else if (trailDirty) {
        ctx.clearRect(0, 0, W, H)
        trailDirty = false
      }
      let dragOverRing = false
      bodies.forEach((b, i) => {
        const sp = Math.hypot(b.vx, b.vy)
        if (!reduced && readyAt > 0 && now - readyAt > 1800 && b.free && (sp > 520 || (b.drag && sp > 180)) && b.px) {
          ctx.strokeStyle = `rgba(255,75,31,${Math.min(0.55, sp / 2200 + 0.1)})`
          ctx.lineWidth = Math.min(6, 1.5 + sp / 500)
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(b.px, b.py)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
          trailUntil = now + 900
          trailDirty = true
        }
        b.px = b.x
        b.py = b.y
        const k = Math.min(1, dt * 2.6)
        // each window tumbles on its own: yaw and pitch swing slowly and out of step, so it rarely faces forward
        const amp = 1 - b.calm
        const ee = b.en * b.en * (3 - 2 * b.en)
        const yaw = (Math.sin(t * b.wy + b.ph) * b.Ay + Math.max(-14, Math.min(14, b.vx * 0.012))) * amp + (1 - ee) * b.sy
        const pit = (Math.sin(t * b.wx + b.ph * 1.7) * b.Ax + Math.max(-14, Math.min(14, -b.vy * 0.012))) * amp + (1 - ee) * b.sx
        const hoverYaw = hovered === i ? b.hx * 14 * b.calm : 0
        const hoverPit = hovered === i ? -b.hy * 10 * b.calm : 0
        b.ry += (yaw + hoverYaw - b.ry) * (b.calm > 0.2 || b.en < 1 ? Math.min(1, dt * 6) : k)
        b.rx += (pit + hoverPit - b.rx) * (b.calm > 0.2 || b.en < 1 ? Math.min(1, dt * 6) : k)

        // behind the copy: fade and blur while crossing it
        const { hw, hh } = ext(b)
        const over =
          !b.drag && hovered !== i && textRect && b.x + hw > textRect.x && b.x - hw < textRect.x + textRect.width && b.y + hh > textRect.y && b.y - hh < textRect.y + textRect.height ? 1 : 0
        b.fade += (over - b.fade) * k
        const near = (b.s - 0.74) / 0.4
        const lit = b.drag || hovered === i
        const face = Math.cos((b.ry * Math.PI) / 180) * Math.cos((b.rx * Math.PI) / 180)
        const bright = (lit ? 1 : 0.64 + 0.36 * near) * (0.68 + 0.32 * face)
        const op = (lit ? 1 : 0.82 + 0.18 * near) * (1 - 0.74 * b.fade)
        const lift = b.drag ? 1.08 : hovered === i ? 1.07 : 1
        b.el.style.transform = `translate3d(${b.x - b.w / 2}px,${b.y - b.h / 2}px,0) rotate(${b.angle}deg) rotateX(${b.rx}deg) rotateY(${b.ry}deg) scale(${b.sc * lift})`
        b.el.style.visibility = b.sc > 0.002 ? 'inherit' : 'hidden'
        b.el.style.opacity = String(op)
        const dimEl = b.dim
        if (dimEl) dimEl.style.opacity = (1 - bright).toFixed(3)
        const blurPx = b.fade > 0.02 ? `blur(${(b.fade * 3.4).toFixed(1)}px)` : 'none'
        if (blurPx !== b.lastBlur) {
          b.el.style.filter = blurPx
          b.lastBlur = blurPx
        }
        b.el.dataset.lit = lit ? 'true' : 'false'
        const att = (!interacted || forceAttract) && attractIdx === i && now < attractUntil
        const edge = lit ? '0 0 0 2px #ff4b1f, ' : att ? `0 0 0 2px rgba(255,75,31,${(0.45 + 0.4 * Math.sin(now / 130)).toFixed(2)}), ` : ''
        const shadow = edge + (b.en < 1 ? `0 0 ${Math.round(70 * (1 - b.en))}px rgba(255,75,31,${(0.7 * (1 - b.en)).toFixed(2)}), 0 14px 34px -12px rgba(0,0,0,.6)` : b.drag ? '0 34px 70px -10px rgba(0,0,0,.7)' : '0 14px 34px -12px rgba(0,0,0,.6)')
        if (shadow !== b.lastShadow) {
          b.el.style.boxShadow = shadow
          b.lastShadow = shadow
        }
        if (b.drag && (Math.hypot(ptr.x - ringC.x, ptr.y - ringC.y) < RING_R * 1.15 || Math.hypot(b.x - ringC.x, b.y - ringC.y) < RING_R * 1.15)) dragOverRing = true
      })
      const anyDrag = bodies.some((b) => b.drag)
      if (ring.current) {
        ring.current.style.transform = `scale(${dragOverRing ? 1.18 : anyDrag ? 1.06 + 0.03 * Math.sin(now / 160) : 1})`
        ring.current.style.borderColor = dragOverRing || anyDrag ? '#ff4b1f' : 'rgba(242,240,234,0.5)'
        ring.current.style.background = dragOverRing ? 'rgba(255,75,31,0.18)' : 'transparent'
      }
    }
    raf = requestAnimationFrame(tick)

    const onReturn = () => {
      diving = false
      const i = DEMOS.findIndex((d) => d.slug === stage.lastOpened)
      if (i < 0) return
      forceAttract = true
      attractIdx = i
      attractUntil = performance.now() + 2400
      bodies[i].vy -= 90
      lastTouch = performance.now()
    }
    window.addEventListener('offscript:return', onReturn)
    const onResize = () => layout()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('offscript:return', onReturn)
      cleanups.forEach((f) => f())
    }
  }, [])

  return (
    <div
      ref={root}
      role="group"
      aria-label="Réalisations : des sites en suspension. Attrapez-en un, lancez-le, ou ouvrez-le."
      className="pointer-events-none absolute inset-0 z-[25]"
      style={{ opacity: 0, visibility: 'hidden', perspective: 1400 }}
    >
      <canvas ref={trail} className="pointer-events-none absolute inset-0 h-full w-full" />
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none absolute flex items-center justify-center rounded-full border border-dashed transition-[transform,background-color,border-color] duration-300"
        style={{ width: RING_R * 2, height: RING_R * 2, borderColor: 'rgba(242,240,234,0.5)', zIndex: 2500 }}
      >
        <span className="label text-center text-[0.62rem] leading-tight opacity-70">
          Déposez ici
          <br />
          pour ouvrir
        </span>
      </div>
      <div
        ref={hint}
        style={{ zIndex: 3000 }}
        className="pointer-events-none absolute bottom-3 left-4 max-w-[13rem] rounded-xl border border-bone/20 bg-void/70 p-3 backdrop-blur-md md:bottom-auto md:left-auto md:right-10 md:top-[5.4rem] md:max-w-[19rem] md:p-4"
      >
        <p className="label text-[0.7rem] text-signal">{DEMOS.length} démos à explorer</p>
        <p className="mt-1.5 text-[0.8rem] leading-snug text-bone/85 md:text-sm">
          Cliquez sur une fenêtre pour entrer dans le site. Ou attrapez-la, lancez-la, et déposez-la dans le cercle.
        </p>
      </div>
      <p
        ref={cue}
        aria-hidden="true"
        className="label pointer-events-none absolute inset-x-0 bottom-5 text-center text-[0.72rem] text-bone/80 transition-opacity duration-500"
        style={{ opacity: 0, zIndex: 3000 }}
      >
        <span className="inline-block animate-bounce">↓</span> Continuez à défiler
      </p>
      {DEMOS.map((d, i) => (
        <div
          key={d.slug}
          ref={(el) => {
            els.current[i] = el
          }}
          role="button"
          tabIndex={0}
          aria-label={`Ouvrir ${d.name}, ${d.kind}`}
          className="group pointer-events-auto absolute left-0 top-0 cursor-pointer touch-none select-none overflow-hidden rounded-[10px] border border-white/15 bg-[#0b1020] will-change-transform active:cursor-grabbing"
          style={{ width: 220, height: 160 }}
        >
          <div className="flex items-center gap-1.5 px-2.5" style={{ height: BAR, background: '#141a2e' }}>
            <i className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <i className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <i className="h-2 w-2 rounded-full bg-[#28c840]" />
            <span className="ml-2 truncate font-mono text-[0.6rem] text-white/50">{d.name.toLowerCase().replace(/\s/g, '')}.ma</span>
          </div>
          <img src={`/demos/${d.slug}.jpg`} alt="" draggable={false} className="pointer-events-none block w-full" style={{ height: `calc(100% - ${BAR}px)`, objectFit: 'cover' }} />
          <div data-dim className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-10">
            <span className="text-[0.85rem] font-semibold leading-tight text-white">
              {d.name}
              <span className="block font-mono text-[0.58rem] font-normal uppercase tracking-wider text-white/70">{d.kind}</span>
            </span>
            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-signal">Démo ↗</span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-data-[lit=true]:opacity-100" style={{ top: BAR }}>
            <span className="label rounded-full bg-signal px-4 py-2 text-[0.7rem] text-void shadow-lg">Ouvrir la démo ↗</span>
          </div>
        </div>
      ))}
      <nav className="sr-only" aria-label="Projets">
        {DEMOS.map((d) => (
          <a key={d.slug} href={`#/demo/${d.slug}`}>
            {d.name} — {d.kind}
          </a>
        ))}
      </nav>
    </div>
  )
}
