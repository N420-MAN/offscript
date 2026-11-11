import gsap from 'gsap'

/**
 * Each demo opens (and closes) with its own transition, tied to what the site is about, so no two feel alike.
 * 'rip' (Fragment) is handled by the callers; everything else is built here out of slices of the demo's preview image.
 */
export type Reveal = 'bloom' | 'arches' | 'floors' | 'bars' | 'charge' | 'dots' | 'doors' | 'pulse' | 'dial'
export const STYLE_OF: Record<string, Reveal | 'rip'> = {
  medical: 'bloom', // soft ink bloom
  hotel: 'arches', // arches rising
  residence: 'floors', // floor slabs sliding apart
  restaurant: 'bars', // a menu's columns sliding away
  shop: 'rip', // paper tearing
  ev: 'charge', // a charge sweeping across
  ai: 'dots', // pixels dissolving into nodes
  rental: 'doors', // garage doors sliding open
  festival: 'pulse', // beat-synced pulses
  school: 'dial', // a clock hand sweeping: the school day
}

type Origin = { x: number; y: number }

/** Builds the pieces that exactly cover the screen with the demo's preview, and returns the function that plays the reveal. */
export function prepare(style: Reveal, cover: HTMLElement, src: string, origin: Origin): (done: () => void) => void {
  const W = window.innerWidth
  const H = window.innerHeight
  const sc = Math.max(W / 1280, H / 800)
  const iw = 1280 * sc
  const ih = 800 * sc
  const imgX = (W - iw) / 2
  const imgY = (H - ih) / 2
  const piece = (l: number, t: number, w: number, h: number, extra = '') => {
    const d = document.createElement('div')
    d.style.cssText = `position:absolute;left:${l}px;top:${t}px;width:${w + 1}px;height:${h + 1}px;background:#0b1020 url(${src}) ${imgX - l}px ${imgY - t}px/${iw}px ${ih}px no-repeat;will-change:transform;${extra}`
    return d
  }
  const rad = Math.hypot(W, H)
  const els: HTMLElement[] = []
  const add = (...n: HTMLElement[]) => {
    n.forEach((e) => cover.appendChild(e))
    els.push(...n)
  }
  cover.replaceChildren()

  if (style === 'bloom') {
    const p = piece(0, 0, W, H)
    add(p)
    const o = { r: -160 }
    const apply = () => {
      const m = `radial-gradient(circle at ${origin.x}px ${origin.y}px, transparent ${o.r}px, #000 ${o.r + 170}px)`
      p.style.maskImage = m
      p.style.setProperty('-webkit-mask-image', m)
    }
    apply()
    return (done) => void gsap.to(o, { r: rad, duration: 1.6, ease: 'power2.inOut', onUpdate: apply, onComplete: done })
  }

  if (style === 'arches') {
    const n = 5
    const w = W / n
    const cols = Array.from({ length: n }, (_, i) => piece(i * w, 0, w, H, 'clip-path:inset(0px round 0px 0px 0px 0px)'))
    add(...cols)
    const order = [2, 1, 3, 0, 4]
    return (done) => {
      const tl = gsap.timeline({ onComplete: done })
      order.forEach((ci, k) => {
        tl.to(cols[ci], { clipPath: `inset(0px round ${w / 2}px ${w / 2}px 0px 0px)`, duration: 0.35, ease: 'power2.out' }, k * 0.1)
        tl.to(cols[ci], { y: -(H + w), duration: 1.05, ease: 'expo.inOut' }, k * 0.1 + 0.15)
      })
    }
  }

  if (style === 'floors') {
    const n = 7
    const h = H / n
    const rows = Array.from({ length: n }, (_, i) => piece(0, i * h, W, h, 'box-shadow:0 0 40px rgba(0,0,0,.35)'))
    add(...rows)
    return (done) => {
      const tl = gsap.timeline({ onComplete: done })
      rows.forEach((r, i) => tl.to(r, { x: (i % 2 ? 1 : -1) * (W + 40), duration: 0.95, ease: 'power4.inOut' }, (n - 1 - i) * 0.08))
    }
  }

  if (style === 'bars') {
    const n = 22
    const w = W / n
    const bars = Array.from({ length: n }, (_, i) => piece(i * w, 0, w, H, 'transform-origin:50% 0%'))
    add(...bars)
    return (done) => {
      const tl = gsap.timeline({ onComplete: done })
      bars.forEach((b, i) => tl.to(b, { scaleY: 0, duration: 0.75 + Math.random() * 0.3, ease: 'power3.inOut' }, i * 0.03 + Math.random() * 0.14))
    }
  }

  if (style === 'charge') {
    const p = piece(0, 0, W, H)
    const glow = document.createElement('div')
    const core = document.createElement('div')
    glow.style.cssText = 'position:absolute;inset:0;background:rgba(40,220,255,.28)'
    core.style.cssText = 'position:absolute;inset:0;background:#8cf4ff'
    add(p, glow, core)
    const o = { x: 0 }
    const apply = () => {
      const t = o.x
      const b = t - 18
      p.style.clipPath = `polygon(${t}% 0,100% 0,100% 100%,${b}% 100%)`
      glow.style.clipPath = `polygon(${t}% 0,${t + 7}% 0,${b + 7}% 100%,${b}% 100%)`
      core.style.clipPath = `polygon(${t}% 0,${t + 0.8}% 0,${b + 0.8}% 100%,${b}% 100%)`
    }
    apply()
    return (done) => void gsap.to(o, { x: 120, duration: 1.25, ease: 'power3.inOut', onUpdate: apply, onComplete: done })
  }

  if (style === 'dots') {
    const cols = 18
    const cell = W / cols
    const rows = Math.ceil(H / cell)
    const maxD = Math.hypot(Math.max(origin.x, W - origin.x), Math.max(origin.y, H - origin.y))
    const cells: HTMLElement[] = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push(piece(c * cell, r * cell, cell, cell))
    add(...cells)
    return (done) => {
      const tl = gsap.timeline({ onComplete: done })
      cells.forEach((el, i) => {
        const cx = (i % cols) * cell + cell / 2
        const cy = Math.floor(i / cols) * cell + cell / 2
        const d = Math.hypot(cx - origin.x, cy - origin.y) / maxD
        tl.to(el, { borderRadius: '50%', duration: 0.2, ease: 'none' }, d * 0.75)
        tl.to(el, { scale: 0, duration: 0.45, ease: 'power2.in' }, d * 0.75 + 0.08)
      })
    }
  }

  if (style === 'doors') {
    const l = piece(0, 0, W / 2, H, 'box-shadow:0 0 70px rgba(0,0,0,.5)')
    const r = piece(W / 2, 0, W / 2, H, 'box-shadow:0 0 70px rgba(0,0,0,.5)')
    add(l, r)
    return (done) => {
      const tl = gsap.timeline({ onComplete: done })
      tl.to(l, { x: -(W / 2 + 80), duration: 1.25, ease: 'expo.inOut' }, 0)
      tl.to(r, { x: W / 2 + 80, duration: 1.25, ease: 'expo.inOut' }, 0)
    }
  }

  if (style === 'pulse') {
    const p = piece(0, 0, W, H)
    add(p)
    const o = { r: -60 }
    const apply = () => {
      const m = `radial-gradient(circle at ${origin.x}px ${origin.y}px, transparent ${o.r}px, #000 ${o.r + 24}px)`
      p.style.maskImage = m
      p.style.setProperty('-webkit-mask-image', m)
    }
    apply()
    return (done) => {
      const beat = 0.469 // 128 BPM
      const tl = gsap.timeline({ onComplete: done })
      const hit = (t: number, r: number, d: number) => tl.to(o, { r, duration: d, ease: 'power3.out', onUpdate: apply }, t)
      hit(0, 150, 0.2)
      hit(beat * 0.5, 90, 0.12)
      hit(beat, 340, 0.24)
      hit(beat * 1.5, 250, 0.12)
      hit(beat * 2, rad, 0.55)
      ;[0, beat, beat * 2].forEach((t) => {
        const ring = document.createElement('div')
        ring.style.cssText = `position:absolute;left:${origin.x}px;top:${origin.y}px;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:3px solid #ff3df0;opacity:0`
        cover.appendChild(ring)
        tl.fromTo(ring, { scale: 0.5, opacity: 0.95 }, { scale: 26, opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => ring.remove() }, t)
      })
    }
  }

  // dial: a clock hand sweeps clockwise and wipes the preview away
  const cx = origin.x
  const cy = origin.y
  const R = rad
  const p = piece(0, 0, W, H)
  const hand = document.createElement('div')
  hand.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:2px;height:${R}px;background:linear-gradient(#e8c98a,rgba(232,201,138,0));box-shadow:0 0 14px rgba(232,201,138,.7);transform-origin:0 0`
  add(p, hand)
  const o = { a: 0 }
  const apply = () => {
    const pts = [`${cx}px ${cy}px`]
    for (let a = o.a; a < 360; a += 12) pts.push(`${cx + R * Math.sin((a * Math.PI) / 180)}px ${cy - R * Math.cos((a * Math.PI) / 180)}px`)
    pts.push(`${cx}px ${cy - R}px`)
    p.style.clipPath = `polygon(${pts.join(',')})`
    hand.style.transform = `rotate(${180 + o.a}deg)`
    hand.style.opacity = o.a > 355 ? '0' : '1'
  }
  apply()
  return (done) => void gsap.to(o, { a: 360, duration: 1.5, ease: 'power2.inOut', onUpdate: apply, onComplete: done })
}
