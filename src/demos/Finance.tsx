import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/archivo'
import '@fontsource/dm-mono/400.css'

gsap.registerPlugin(ScrollTrigger)

const ARCHIVO = '"Archivo Variable", system-ui, sans-serif'
const MONO = '"DM Mono", monospace'
const LIME = '#d4ff3a'
const INK = '#0a0a0a'

/** Ridgeline terrain: stacked noise lines that follow the cursor and flatten into a single chart as you scroll. */
function Ridges({ flat }: { flat: React.MutableRefObject<number> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const mouse = { x: -999, y: -999, tx: -999, ty: -999 }
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      mouse.tx = e.clientX - r.left
      mouse.ty = e.clientY - r.top
    }
    window.addEventListener('pointermove', move)
    let W = 0
    let H = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      W = c.clientWidth
      H = c.clientHeight
      c.width = W * dpr
      c.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    const ROWS = 40
    const PTS = 120
    let raf = 0
    const t0 = performance.now()
    const draw = () => {
      const t = (performance.now() - t0) / 1000
      mouse.x += (mouse.tx - mouse.x) * 0.08
      mouse.y += (mouse.ty - mouse.y) * 0.08
      ctx.fillStyle = INK
      ctx.fillRect(0, 0, W, H)
      const left = W * 0.04
      const span = W * 0.92
      const top = H * 0.3
      const rowGap = (H * 0.52) / ROWS
      const amp = H * 0.22 * (1 - flat.current)
      const ys = new Float32Array(PTS + 1)
      for (let r = 0; r < ROWS; r++) {
        const y0 = top + r * rowGap
        for (let i = 0; i <= PTS; i++) {
          const u = i / PTS
          const x = left + u * span
          const bell = Math.pow(Math.sin(u * Math.PI), 1.6)
          const n = 0.55 * Math.sin(u * 7 + r * 0.33 + t * 0.6) * Math.sin(u * 3.1 - r * 0.21 + t * 0.4) + 0.45 * Math.sin(u * 17 + r * 0.9 - t) * Math.sin(u * 5 + r * 0.17)
          let h = amp * bell * (0.5 + 0.5 * n)
          const dx = x - mouse.x
          const dy = y0 - mouse.y
          h += H * 0.14 * Math.exp(-(dx * dx) / (2 * 70 * 70)) * Math.exp(-(dy * dy) / (2 * 110 * 110)) * (1 - flat.current)
          ys[i] = y0 - h
        }
        ctx.beginPath()
        for (let i = 0; i <= PTS; i++) {
          const x = left + (i / PTS) * span
          if (i === 0) ctx.moveTo(x, ys[i])
          else ctx.lineTo(x, ys[i])
        }
        // occlude rows behind this one, then stroke its crest
        ctx.lineTo(left + span, H)
        ctx.lineTo(left, H)
        ctx.closePath()
        ctx.fillStyle = INK
        ctx.fill()
        const k = r / ROWS
        ctx.strokeStyle = r > ROWS - 3 ? LIME : `rgba(242,240,234,${0.16 + k * 0.7})`
        ctx.lineWidth = r > ROWS - 3 ? 2 : 1.1
        ctx.beginPath()
        for (let i = 0; i <= PTS; i++) {
          const x = left + (i / PTS) * span
          if (i === 0) ctx.moveTo(x, ys[i])
          else ctx.lineTo(x, ys[i])
        }
        ctx.stroke()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('resize', resize)
    }
  }, [flat])
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />
}

const STATS = [
  { v: 4.2, s: ' Md', u: 'MAD sous gestion', d: 1 },
  { v: 18, s: ' ans', u: 'd’historique de décisions', d: 0 },
  { v: 0, s: '', u: 'frais cachés, jamais', d: 0 },
]
const PRINCIPLES = [
  ['01', 'Lire le relief', 'Un marché n’est jamais plat. Nous cartographions les pentes avant de choisir un chemin.'],
  ['02', 'Avancer sobrement', 'Peu de positions, des convictions documentées, aucune décision que nous ne saurions expliquer.'],
  ['03', 'Rendre des comptes', 'Un rapport clair, chaque mois, avec ce qui a marché et ce qui n’a pas marché.'],
]

export default function Finance() {
  const root = useRef<HTMLDivElement>(null)
  const flat = useRef(0)
  const nums = useRef<HTMLSpanElement[]>([])

  useGSAP(
    () => {
      gsap.from('[data-rise]', { yPercent: 105, duration: 1.2, stagger: 0.1, ease: 'expo.out', delay: 0.2 })
      ScrollTrigger.create({
        trigger: '[data-hero]',
        start: 'top top',
        end: 'bottom 30%',
        scrub: true,
        onUpdate: (self) => {
          flat.current = self.progress
        },
      })
      STATS.forEach((s, i) => {
        const o = { v: 0 }
        ScrollTrigger.create({
          trigger: '[data-stats]',
          start: 'top 75%',
          once: true,
          onEnter: () =>
            gsap.to(o, {
              v: s.v,
              duration: 2,
              ease: 'power3.out',
              onUpdate: () => {
                if (nums.current[i]) nums.current[i].textContent = o.v.toFixed(s.d)
              },
            }),
        })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} style={{ background: INK, color: '#f2f0ea', fontFamily: ARCHIVO }}>
      <section data-hero className="relative h-[110vh] min-h-[700px]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <Ridges flat={flat} />
          <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6 text-xs uppercase tracking-[0.18em] md:px-12" style={{ fontFamily: MONO }}>
            <span className="text-base font-extrabold tracking-[-0.02em]" style={{ fontFamily: ARCHIVO }}>NORDAL<span style={{ color: LIME }}>.</span></span>
            <span className="hidden opacity-60 md:block">Gestion d’actifs · Casablanca</span>
            <span style={{ color: LIME }}>Espace investisseur ↗</span>
          </header>
          <div className="absolute inset-x-0 bottom-0 px-6 pb-10 md:px-12">
            <h1 className="text-[clamp(3.2rem,11vw,11rem)] font-black uppercase leading-[0.86] tracking-[-0.04em]">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-rise className="block">Le relief</span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-rise className="block" style={{ color: LIME }}>des marchés.</span>
              </span>
            </h1>
          </div>
        </div>
      </section>

      <section data-stats className="grid gap-px border-y border-white/15 bg-white/15 md:grid-cols-3">
        {STATS.map((s, i) => (
          <div key={s.u} className="px-6 py-16 md:px-12" style={{ background: INK }}>
            <p className="whitespace-nowrap text-[clamp(4rem,10vw,9rem)] font-black leading-none tracking-[-0.05em]" style={{ color: i === 0 ? LIME : '#f2f0ea' }}>
              <span ref={(el) => { if (el) nums.current[i] = el }}>0</span>
              <span className="text-[0.35em] tracking-normal">{s.s}</span>
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] opacity-60" style={{ fontFamily: MONO }}>{s.u}</p>
          </div>
        ))}
      </section>

      <section className="px-6 py-28 md:px-12">
        {PRINCIPLES.map(([n, t, d]) => (
          <div key={n} className="group grid items-baseline gap-4 border-t border-white/15 py-10 md:grid-cols-[8rem_1fr_1fr] md:gap-10">
            <span className="text-xs tracking-[0.2em]" style={{ fontFamily: MONO, color: LIME }}>{n}</span>
            <h3 className="text-[clamp(2rem,5vw,4.5rem)] font-extrabold leading-none tracking-[-0.03em] transition-transform duration-500 group-hover:translate-x-3">{t}</h3>
            <p className="max-w-md opacity-65">{d}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden border-y border-white/15 py-6" style={{ fontFamily: MONO }}>
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 whitespace-nowrap text-sm">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-10">
              {['NRD +1.24%', 'ATL −0.31%', 'MRN +0.88%', 'ZPH +2.10%', 'KSB −0.12%', 'OPL +0.64%'].map((t) => (
                <span key={t + k} style={{ color: t.includes('−') ? '#ff6b5e' : LIME }}>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 py-32 text-center md:px-12">
        <h2 className="mx-auto max-w-5xl text-[clamp(2.6rem,8vw,7.5rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
          Parlons de <span style={{ color: LIME }}>votre horizon.</span>
        </h2>
        <button className="mt-12 px-10 py-5 text-xs uppercase tracking-[0.2em] transition-transform hover:scale-105" style={{ background: LIME, color: INK, fontFamily: MONO }}>
          Demander un entretien
        </button>
        <p className="mt-24 text-xs opacity-40" style={{ fontFamily: MONO }}>© Nordal — démonstration. Les chiffres présentés sont fictifs.</p>
      </section>
    </div>
  )
}
