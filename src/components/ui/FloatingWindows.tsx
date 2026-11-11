import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { DEMOS } from '../../demos/meta'
import { stage } from '../../state/stage'
import { TEAR, tearBottom, tearTop } from '../../lib/tear'
import { curtainLayer, mounted, prepare, STYLE_OF } from '../../lib/transitions'
import { growToCurtain } from '../../lib/openDemo'
import { smoothstep } from '../../lib/math'
import { prefersReducedMotion } from '../../hooks/useCapabilities'
import { BAR, HOMES_D, HOMES_M, RING_R, preload, rnd, type Body } from './windows/shared'
import { relaxPoints } from './windows/relax'
import { WindowCard } from './windows/WindowCard'

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

    const measureText = (): DOMRect | null => {
      const tb = document.querySelector('[data-statement] > div')
      if (!tb) return null
      const rr = rootEl.getBoundingClientRect()
      // the real extent of the words (the container itself is wider than the text)
      let l = Infinity
      let t = Infinity
      let r = -Infinity
      let bt = -Infinity
      const walker = document.createTreeWalker(tb, NodeFilter.SHOW_TEXT)
      const range = document.createRange()
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent?.trim()) continue
        range.selectNodeContents(n)
        for (const q of Array.from(range.getClientRects())) {
          if (q.width < 2) continue
          l = Math.min(l, q.left)
          t = Math.min(t, q.top)
          r = Math.max(r, q.right)
          bt = Math.max(bt, q.bottom)
        }
      }
      if (!isFinite(l)) return null
      // the copy slides up as it fades in: measure it where it will rest
      const off = Number(gsap.getProperty(tb.parentElement as Element, 'y')) || 0
      return new DOMRect(l - rr.left - 16, t - off - rr.top - 14, r - l + 32, bt - t + 28)
    }

    /** Spread the resting places so windows do not sit on each other, the copy, or the drop ring. */
    const relaxHomes = () => {
      if (W < 10) return
      textRect = measureText() ?? textRect
      const P = bodies.map((b) => ({ x: b.ax * W, y: b.ay * H, hw: b.w * b.s * 0.5, hh: b.h * b.s * 0.5 }))
      relaxPoints(P, W, H, HDR, textRect, ringC)
      bodies.forEach((b, i) => {
        b.ax = P[i].x / W
        b.ay = P[i].y / H
      })
    }

    const layout = () => {
      const rr = rootEl.getBoundingClientRect()
      if (rr.width < 10) return // home page hidden under a demo: keep the last real layout
      W = rr.width
      H = rr.height
      HDR = W < 760 ? 64 : 72
      cv.width = W
      cv.height = H
      // size the windows so they fill about half of the free area: big, but with room to breathe
      const tb = measureText()
      const free = W * H - (tb ? tb.width * tb.height : 0)
      const target = (free * 0.42) / Math.max(1, bodies.length)
      const fit = (-26 + Math.sqrt(676 + 2.5 * target)) / 1.25
      const base = W < 760 ? Math.max(132, Math.min(190, W * 0.4)) : Math.max(230, Math.min(360, fit))
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
      const s = rnd(0.82, 1.1)
      bodies.push({ x: 0, y: 0, vx: 0, vy: 0, w: 220, h: 160, s, sc: 0, en: 0, delay: 0, base: 0, drift: Math.random() < 0.6 ? rnd(2.5, 6.5) * (Math.random() < 0.5 ? -1 : 1) : 0, wx: rnd(0.05, 0.1), wy: rnd(0.04, 0.09), Ax: rnd(3, 6), Ay: rnd(5, 10), ph: rnd(0, 6.28), ox: 0.5, oy: 0.5, sa: 0, sx: 0, sy: 0, dim: el.querySelector<HTMLElement>('[data-dim]'), lastBlur: 'none', lastShadow: '', hx: 0, hy: 0, calm: 0, angle: 0, spin: 0, home: rnd(-7, 7), rx: 0, ry: 0, fade: 0, ax: 0.5, ay: 0.5, free: false, px: 0, py: 0, drag: false, el })
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
          b.sa = rnd(-140, 140)
          b.sx = rnd(-45, 45)
          b.sy = rnd(-45, 45)
        }
      })
      relaxHomes()
      bodies.forEach((b) => {
        b.x = b.ax * W
        b.y = b.ay * H
        if (reduced) {
          b.ox = b.ax
          b.oy = b.ay
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
      const loading = preload[d.slug]()
      if (reduced) {
        window.location.hash = `#/demo/${d.slug}`
        return
      }
      const cover = document.createElement('div')
      cover.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none'
      document.body.appendChild(cover)

      // 1. the window swings square, fills the screen and becomes the demo's curtain
      const rect = { left: b.x - (b.w * b.sc) / 2, top: b.y - (b.h * b.sc) / 2, width: b.w * b.sc, height: b.h * b.sc }
      growToCurtain(d.slug, cover, rect, b.angle, 10).eventCallback('onComplete', () => {
        const style = STYLE_OF[d.slug]
        if (style === 'rip') return tear()
        // every other demo has its own reveal, played on the curtain once the live page is mounted beneath it
        const go = prepare(style, cover, d.slug, { x: b.x, y: b.y })
        window.location.hash = `#/demo/${d.slug}`
        void mounted(() => loading).then(() => go(() => cover.remove()))
      })

      // 2. it rips along a jagged line; the live site is already mounted underneath
      function tear() {
        const ptsTop = tearTop()
        const ptsBot = tearBottom()
        const half = (clip: string) => {
          const h = document.createElement('div')
          h.style.cssText = `position:absolute;inset:0;clip-path:polygon(${clip});will-change:transform`
          h.appendChild(curtainLayer(d.slug))
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
        // wait until the page is mounted beneath the overlay
        void mounted(() => loading).then(go)
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
        const cap = 900
        if (sp > cap) {
          b.vx *= cap / sp
          b.vy *= cap / sp
        }
        // A pause before release means "put it down"; a flick spins the window.
        if (performance.now() - lastT > 90) b.vx = b.vy = 0
        else b.spin = Math.max(-200, Math.min(200, b.vx * 0.04 + (Math.random() - 0.5) * 40))
      }
      // the browser took the gesture over (a vertical swipe scrolling the page on a phone): not a tap, not a drag
      const cancel = () => {
        tap = false
        b.drag = false
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
      el.addEventListener('pointercancel', cancel)
      el.addEventListener('keydown', key)
      el.addEventListener('pointerenter', enter)
      el.addEventListener('pointerleave', leave)
      cleanups.push(() => {
        el.removeEventListener('pointerdown', down)
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerup', up)
        el.removeEventListener('pointercancel', cancel)
        el.removeEventListener('keydown', key)
        el.removeEventListener('pointerenter', enter)
        el.removeEventListener('pointerleave', leave)
      })
    })

    // ---- simulation + render
    let raf = 0
    let last = performance.now()
    let smoothDt = 1 / 60
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const now = performance.now()
      // frame times are smoothed so an uneven frame never turns into a velocity jump (the cause of visible shivering)
      smoothDt += (Math.min((now - last) / 1000, 0.04) - smoothDt) * 0.2
      const dt = smoothDt
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
        readyAt = 0
        layout()
        place()
      }
      const t = now / 1000

      if (frame++ % (p < 0.98 ? 6 : 60) === 0) {
        textRect = measureText() ?? textRect
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
      // the hint has done its job once the visitor has touched a window (on phones it also steps aside after a few seconds)
      if (hint.current) hint.current.style.opacity = String(ready * (interacted || (W < 760 && age > 7) ? 0 : 1))
      if (cue.current) cue.current.style.opacity = stage.held && ready > 0.99 ? '1' : '0'
      if (ring.current) ring.current.style.opacity = String(ready)

      if (!reduced) {
        if (!interacted && readyAt && age > 3.5 && now > nextAttract) {
          attractIdx = Math.floor(Math.random() * bodies.length)
          attractUntil = now + 1900
          nextAttract = now + 4200
        }
        const sd = Math.pow(0.02, dt)
        const glide = Math.pow(0.2, dt)
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
          if (!b.free) {
            // float around its place on slow, overlapping swells; a critically damped spring keeps it smooth, never jittery
            const wx = Math.sin(t * 0.11 + b.ph) * 9 + Math.sin(t * 0.06 + b.ph * 2.3) * 5
            const wy = Math.cos(t * 0.09 + b.ph * 1.4) * 7 + Math.sin(t * 0.05 + b.ph) * 4
            const k = 2.2
            const c = 2 * Math.sqrt(k)
            b.vx += ((b.ax * W + wx - b.x) * k - b.vx * c) * dt
            b.vy += ((b.ay * H + wy - b.y) * k - b.vy * c) * dt
          } else {
            // thrown: it glides and slows like something moving through water, then this becomes its new place
            b.vx *= glide
            b.vy *= glide
            if (Math.hypot(b.vx, b.vy) < 14) {
              b.free = false
              b.ax = b.x / W
              b.ay = b.y / H
            }
          }
          const sp = Math.hypot(b.vx, b.vy)
          const cap = b.free ? 1100 : 220
          if (sp > cap) {
            b.vx *= cap / sp
            b.vy *= cap / sp
          }
          // keep clear of the copy: windows ease out of its way instead of resting behind it
          if (textRect) {
            const { hw: ew, hh: eh } = ext(b)
            const ox2 = Math.min(b.x + ew - textRect.x, textRect.x + textRect.width - (b.x - ew))
            const oy2 = Math.min(b.y + eh - textRect.y, textRect.y + textRect.height - (b.y - eh))
            if (ox2 > 14 && oy2 > 0 && b.x < textRect.x + textRect.width) b.vx += Math.min(1, (ox2 - 14) / 200) * 360 * dt
          }
          b.x += b.vx * dt
          b.y += b.vy * dt
          // self-rotation: a slowly drifting rest angle followed by a damped spring; squares up when held or hovered
          b.base += b.drift * dt * (1 - b.calm)
          const rest = Math.round(b.base / 360) * 360 + b.home * 0.3
          const target = (b.home + Math.sin(b.ph + t * (0.04 + Math.abs(b.drift) * 0.006)) * 5 + Math.sin(t * 0.15 + i * 2.1) * 1.5) * (1 - b.calm) + rest * b.calm
          b.spin += (target - b.angle) * 6 * dt
          b.spin *= sd
          b.angle += b.spin * dt
          const { hw, hh } = ext(b)
          if (b.x < hw + 6) {
            b.x = hw + 6
            b.vx = Math.abs(b.vx) * 0.5
          } else if (b.x > W - hw - 6) {
            b.x = W - hw - 6
            b.vx = -Math.abs(b.vx) * 0.5
          }
          if (b.y < HDR + hh) {
            b.y = HDR + hh
            b.vy = Math.abs(b.vy) * 0.5
          } else if (b.y > H - hh - 6) {
            b.y = H - hh - 6
            b.vy = -Math.abs(b.vy) * 0.5
          }
        })
        // windows never stack: overlapping pairs ease apart along the shortest way out
        const sep = Math.min(1, dt * 5)
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            const A = bodies[i]
            const B = bodies[j]
            if (A.en < 1 || B.en < 1) continue
            const ea = ext(A)
            const eb = ext(B)
            const dx = B.x - A.x
            const dy = B.y - A.y
            const ox = (ea.hw + eb.hw) * 0.92 - Math.abs(dx)
            const oy = (ea.hh + eb.hh) * 0.92 - Math.abs(dy)
            if (ox <= 0 || oy <= 0) continue
            const wa = A.drag ? 0 : B.drag ? 1 : 0.5
            const wb = B.drag ? 0 : A.drag ? 1 : 0.5
            if (ox < oy) {
              const sg = dx >= 0 ? 1 : -1
              A.x -= sg * ox * sep * wa
              B.x += sg * ox * sep * wb
              const rel = (B.vx - A.vx) * sg
              if (rel < 0) {
                A.vx += sg * rel * 0.5 * wa
                B.vx -= sg * rel * 0.5 * wb
              }
            } else {
              const sg = dy >= 0 ? 1 : -1
              A.y -= sg * oy * sep * wa
              B.y += sg * oy * sep * wb
              const rel = (B.vy - A.vy) * sg
              if (rel < 0) {
                A.vy += sg * rel * 0.5 * wa
                B.vy -= sg * rel * 0.5 * wb
              }
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
        const k = Math.min(1, dt * 1.8)
        // each window tumbles on its own: yaw and pitch swing slowly and out of step, so it rarely faces forward
        const amp = 1 - b.calm
        const ee = b.en * b.en * (3 - 2 * b.en)
        const yaw = (Math.sin(t * b.wy + b.ph) * b.Ay + Math.max(-8, Math.min(8, b.vx * 0.008))) * amp + (1 - ee) * b.sy
        const pit = (Math.sin(t * b.wx + b.ph * 1.7) * b.Ax + Math.max(-8, Math.min(8, -b.vy * 0.008))) * amp + (1 - ee) * b.sx
        const hoverYaw = hovered === i ? b.hx * 6 * b.calm : 0
        const hoverPit = hovered === i ? -b.hy * 4 * b.calm : 0
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
        const op = (lit ? 1 : 0.82 + 0.18 * near) * (1 - 0.4 * b.fade)
        const lift = b.drag ? 1.08 : hovered === i ? 1.07 : 1
        b.el.style.transform = `translate3d(${b.x - b.w / 2}px,${b.y - b.h / 2}px,0) rotate(${b.angle}deg) rotateX(${b.rx}deg) rotateY(${b.ry}deg) scale(${b.sc * lift})`
        b.el.style.visibility = b.sc > 0.002 ? 'inherit' : 'hidden'
        b.el.style.opacity = String(op)
        const dimEl = b.dim
        if (dimEl) dimEl.style.opacity = (1 - bright).toFixed(3)
        const blurPx = 'none'
        if (blurPx !== b.lastBlur) {
          b.el.style.filter = blurPx
          b.lastBlur = blurPx
        }
        b.el.dataset.lit = lit ? 'true' : 'false'
        const att = (!interacted || forceAttract) && attractIdx === i && now < attractUntil
        const edge = lit ? '0 0 0 2px #ff4b1f, ' : att ? `0 0 0 2px rgba(255,75,31,${(0.45 + 0.4 * Math.round(Math.sin(now / 260) * 4) / 4).toFixed(2)}), ` : ''
        const qe = Math.round(b.en * 8) / 8
        const shadow = edge + (qe < 1 ? `0 0 ${Math.round(50 * (1 - qe))}px rgba(255,75,31,${(0.6 * (1 - qe)).toFixed(2)}), 0 14px 34px -12px rgba(0,0,0,.6)` : b.drag ? '0 34px 70px -10px rgba(0,0,0,.7)' : '0 14px 34px -12px rgba(0,0,0,.6)')
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

    // Decode the ten previews while the hero is still idle: decoding them at the moment the windows first appear, in the
    // middle of the break, was the stall that made the first pass through the transition stutter.
    let warmId = 0
    const warm = () => {
      if (!stage.sceneReady) {
        warmId = window.setTimeout(warm, 300)
        return
      }
      const go = () =>
        bodies.forEach((b) => {
          const im = b.el.querySelector('img')
          if (im) void im.decode().catch(() => {})
        })
      if ('requestIdleCallback' in window) (window as Window).requestIdleCallback(go, { timeout: 1500 })
      else go()
    }
    warmId = window.setTimeout(warm, 600)

    const onReturn = () => {
      diving = false
      const i = DEMOS.findIndex((d) => d.slug === stage.lastOpened)
      if (i < 0) return
      forceAttract = true
      attractIdx = i
      attractUntil = performance.now() + 2400
    }
    window.addEventListener('offscript:return', onReturn)
    let lastW = window.innerWidth
    let lastH = window.innerHeight
    const onResize = () => {
      // the phone's address bar changes only the height: that must not re-flow the windows
      const touch = 'ontouchstart' in window
      if (touch && window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 180) return
      lastW = window.innerWidth
      lastH = window.innerHeight
      layout()
      relaxHomes()
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(warmId)
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
        className="pointer-events-none absolute bottom-11 left-4 max-w-[12rem] transition-opacity duration-500 rounded-xl border border-bone/20 bg-void/85 p-3 md:bottom-auto md:left-auto md:right-10 md:top-[5.4rem] md:max-w-[19rem] md:p-4"
      >
        <p className="label text-[0.7rem] text-signal">{DEMOS.length} démos à explorer</p>
        <p className="mt-1.5 text-[0.8rem] leading-snug text-bone/85 md:hidden">Touchez une fenêtre pour l’ouvrir, ou lancez-la dans le cercle.</p>
        <p className="mt-1.5 hidden text-sm leading-snug text-bone/85 md:block">
          Cliquez sur une fenêtre pour entrer dans le site. Ou attrapez-la, lancez-la, et déposez-la dans le cercle.
        </p>
      </div>
      <p
        ref={cue}
        aria-hidden="true"
        className="label pointer-events-none absolute inset-x-0 bottom-3 text-center md:bottom-5 text-[0.72rem] text-bone/80 transition-opacity duration-500"
        style={{ opacity: 0, zIndex: 3000 }}
      >
        <span className="inline-block animate-bounce">↓</span> Continuez à défiler
      </p>
      {DEMOS.map((d, i) => (
        <WindowCard
          key={d.slug}
          demo={d}
          setRef={(el) => {
            els.current[i] = el
          }}
        />
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
