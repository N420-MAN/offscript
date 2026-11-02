import { useEffect, useRef, useState } from 'react'
import '@fontsource-variable/syne'
import '@fontsource-variable/inter'

const SYNE = '"Syne Variable", system-ui, sans-serif'
const SANS = '"Inter Variable", system-ui, sans-serif'

interface Item {
  name: string
  price: string
  bg: string
  fg: string
  shape: React.CSSProperties
}

const ITEMS: Item[] = [
  { name: 'Orbe', price: '420 MAD', bg: '#ff5ea8', fg: '#fff', shape: { borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%, #fff, #ffd1e6 25%, #ff5ea8 70%)' } },
  { name: 'Arche', price: '690 MAD', bg: '#ffe14d', fg: '#111', shape: { borderRadius: '999px 999px 0 0', background: 'linear-gradient(160deg,#ff8a3d,#ff3d6e)' } },
  { name: 'Anneau', price: '380 MAD', bg: '#4d7bff', fg: '#fff', shape: { borderRadius: '50%', border: '38px solid #ffe14d', background: 'transparent' } },
  { name: 'Pilule', price: '260 MAD', bg: '#34d399', fg: '#111', shape: { borderRadius: '999px', background: 'linear-gradient(90deg,#111 50%,#fff 50%)', transform: 'rotate(-35deg) scaleY(0.62)' } },
  { name: 'Étoile', price: '540 MAD', bg: '#ff8a3d', fg: '#111', shape: { clipPath: 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', background: 'linear-gradient(140deg,#fff3a8,#ff5ea8)' } },
  { name: 'Dôme', price: '710 MAD', bg: '#c4b5fd', fg: '#111', shape: { borderRadius: '50% 50% 8% 8%', background: 'linear-gradient(180deg,#4d7bff,#111)' } },
  { name: 'Goutte', price: '310 MAD', bg: '#111', fg: '#fff', shape: { borderRadius: '0 50% 50% 50%', transform: 'rotate(45deg) scale(0.8)', background: 'linear-gradient(140deg,#34d399,#4d7bff)' } },
  { name: 'Tour', price: '830 MAD', bg: '#ff5ea8', fg: '#111', shape: { borderRadius: '14px', background: 'repeating-linear-gradient(180deg,#111 0 22px,#ffe14d 22px 44px)', transform: 'scaleX(0.55)' } },
]
const N = ITEMS.length
const STEP = 360 / N

export default function Shop() {
  const ring = useRef<HTMLDivElement>(null)
  const state = useRef({ angle: 0, vel: 0, dragging: false, lastX: 0 })
  const [active, setActive] = useState(0)
  const [cart, setCart] = useState(0)
  const [bump, setBump] = useState(0)
  const R = typeof window !== 'undefined' && window.innerWidth < 720 ? 300 : 560

  useEffect(() => {
    let raf = 0
    let last = -1
    const loop = () => {
      const s = state.current
      if (!s.dragging) {
        s.angle += s.vel
        s.vel *= 0.94
        if (Math.abs(s.vel) < 0.04) {
          // glide to the nearest card
          const target = Math.round(s.angle / STEP) * STEP
          s.angle += (target - s.angle) * 0.08
        }
      }
      if (ring.current) ring.current.style.transform = `translateZ(${-R}px) rotateY(${s.angle}deg)`
      const idx = (((Math.round(-s.angle / STEP) % N) + N) % N)
      if (idx !== last) {
        last = idx
        setActive(idx)
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [R])

  const down = (e: React.PointerEvent) => {
    state.current.dragging = true
    state.current.lastX = e.clientX
    state.current.vel = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const move = (e: React.PointerEvent) => {
    const s = state.current
    if (!s.dragging) return
    const dx = e.clientX - s.lastX
    s.lastX = e.clientX
    s.angle += dx * 0.32
    s.vel = dx * 0.32
  }
  const up = () => {
    state.current.dragging = false
  }

  const it = ITEMS[active]
  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-700" style={{ background: it.bg, color: it.fg, fontFamily: SANS }}>
      <div className="overflow-hidden border-b-[3px] border-black bg-black py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
        <div className="flex w-max animate-[marquee_22s_linear_infinite] gap-10 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, k) => (
            <span key={k}>Nouveautés ✦ Édition limitée ✦ Livraison offerte dès 500 MAD ✦ Faites tourner l’anneau ✦</span>
          ))}
        </div>
      </div>

      <header className="flex items-center justify-between px-5 py-5 md:px-10">
        <span className="text-3xl font-extrabold tracking-[-0.04em]" style={{ fontFamily: SYNE }}>fragment*</span>
        <button
          key={bump}
          className="rounded-full border-[3px] border-black bg-white px-5 py-2 text-sm font-bold text-black"
          style={{ animation: bump ? 'pop 0.4s ease' : undefined }}
        >
          Sac ({cart})
        </button>
      </header>

      <section className="relative">
        <h1 className="pointer-events-none absolute inset-x-0 top-4 z-0 text-center text-[clamp(5rem,24vw,24rem)] font-extrabold leading-[0.8] tracking-[-0.06em] opacity-90" style={{ fontFamily: SYNE, WebkitTextStroke: '3px #111', color: 'transparent' }}>
          {it.name.toUpperCase()}
        </h1>
        <div
          className="relative z-10 mx-auto h-[min(72vh,620px)] cursor-grab touch-pan-y select-none active:cursor-grabbing"
          style={{ perspective: 1500 }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <div ref={ring} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transformStyle: 'preserve-3d' }}>
            {ITEMS.map((x, i) => (
              <div
                key={x.name}
                className="absolute -left-[110px] -top-[150px] flex h-[300px] w-[220px] items-center justify-center rounded-3xl border-[4px] border-black"
                style={{ transform: `rotateY(${i * STEP}deg) translateZ(${R}px)`, background: i === active ? '#fff' : '#fff', boxShadow: '8px 8px 0 #111', backfaceVisibility: 'hidden' }}
              >
                <div className="h-[150px] w-[150px]" style={x.shape} />
                <span className="absolute left-4 top-3 text-xs font-bold text-black">N°{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 120 120" className="absolute right-[6%] top-[8%] z-20 h-28 w-28 md:h-40 md:w-40" style={{ animation: 'spin-slow 14s linear infinite' }}>
          <defs>
            <path id="circ" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
          </defs>
          <circle cx="60" cy="60" r="58" fill="#111" />
          <text fill="#ffe14d" fontSize="11" fontWeight="800" letterSpacing="3" style={{ fontFamily: SYNE }}>
            <textPath href="#circ">ÉDITION LIMITÉE ✦ ÉDITION LIMITÉE ✦</textPath>
          </text>
        </svg>
      </section>

      <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 pb-24 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em]">{String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')} — glissez pour tourner</p>
        <h2 className="text-[clamp(2.6rem,8vw,6rem)] font-extrabold leading-none tracking-[-0.04em]" style={{ fontFamily: SYNE }}>
          {it.name} — {it.price}
        </h2>
        <button
          onClick={() => {
            setCart((c) => c + 1)
            setBump((b) => b + 1)
          }}
          className="rounded-full border-[4px] border-black bg-black px-10 py-5 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_#fff]"
        >
          Ajouter au sac +
        </button>
      </section>

      <section className="grid border-t-[4px] border-black md:grid-cols-4">
        {['Maison', 'Bureau', 'Cadeaux', 'Archives'].map((c, i) => (
          <a key={c} href="#" onClick={(e) => e.preventDefault()} className="group flex aspect-square flex-col justify-between border-b-[4px] border-black p-6 text-black transition-colors duration-300 md:border-r-[4px]" style={{ background: ['#fff', '#ffe14d', '#ff5ea8', '#4d7bff'][i] }}>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">0{i + 1}</span>
            <span className="text-5xl font-extrabold tracking-[-0.04em] transition-transform duration-300 group-hover:translate-x-2" style={{ fontFamily: SYNE }}>{c}→</span>
          </a>
        ))}
      </section>

      <footer className="overflow-hidden bg-black px-5 pb-6 pt-16 text-white">
        <p className="text-[clamp(3rem,17.5vw,20rem)] font-extrabold leading-[0.8] tracking-[-0.06em]" style={{ fontFamily: SYNE, WebkitTextStroke: '2px #fff', color: 'transparent' }}>fragment*</p>
        <p className="mt-6 text-xs opacity-50">© Fragment — démonstration</p>
      </footer>
      <style>{`@keyframes pop{0%{transform:scale(1)}40%{transform:scale(1.25) rotate(-4deg)}100%{transform:scale(1)}}`}</style>
    </div>
  )
}
