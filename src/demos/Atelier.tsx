import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/inter'
import { Slot } from './Slot'

const SANS = '"Inter Variable", system-ui, sans-serif'
const BG = '#f6f6f4'
const INK = '#111111'
const GREY = '#9a9a95'

/** Concentric squares, each turned a little further than the last: a slow moiré that reads as a building seen from above. */
function Form() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
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
    const m = { x: 0, y: 0, tx: 0, ty: 0 }
    const move = (e: PointerEvent) => {
      m.tx = e.clientX / window.innerWidth - 0.5
      m.ty = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('pointermove', move)
    let raf = 0
    const t0 = performance.now()
    const draw = () => {
      const t = (performance.now() - t0) / 1000
      m.x += (m.tx - m.x) * 0.04
      m.y += (m.ty - m.y) * 0.04
      ctx.clearRect(0, 0, W, H)
      const S = Math.min(W, H) * 0.46
      const n = 46
      ctx.lineWidth = 1
      for (let i = 0; i < n; i++) {
        const k = i / n
        const s = S * (1 - k * 0.94)
        const a = k * (0.9 + m.x * 1.1) + t * 0.05 + m.y * 0.3
        const cx = W * 0.5 + m.x * 40 * k
        const cy = H * 0.5 + m.y * 40 * k
        ctx.strokeStyle = `rgba(17,17,17,${0.12 + k * 0.55})`
        ctx.beginPath()
        for (let j = 0; j < 4; j++) {
          const th = a + (j * Math.PI) / 2 + Math.PI / 4
          const x = cx + Math.cos(th) * s * 1.414
          const y = cy + Math.sin(th) * s * 1.414
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
    }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />
}

const PROJECTS = [
  ['01', 'Maison Mur', 'Casablanca', '2024'],
  ['02', 'Pavillon d’ombre', 'Essaouira', '2023'],
  ['03', 'Escalier sans fin', 'Rabat', '2022'],
  ['04', 'Cour Zéro', 'Marrakech', '2021'],
]

/** Generative stand-ins until a real photograph is dropped in. */
function Placeholder({ n }: { n: number }) {
  const shapes = [
    <rect key="a" x="30" y="20" width="60" height="120" fill={INK} />,
    <path key="b" d="M20 140 L100 140 L100 40 L20 100 Z" fill={INK} />,
    <g key="c" fill={INK}>{Array.from({ length: 9 }, (_, i) => <rect key={i} x={20 + i * 8} y={140 - i * 14} width="8" height={i * 14 + 6} />)}</g>,
    <g key="d" fill="none" stroke={INK} strokeWidth="1.4"><rect x="25" y="25" width="70" height="110" /><rect x="40" y="45" width="40" height="70" /><rect x="53" y="65" width="14" height="30" fill={INK} /></g>,
  ]
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ background: n % 2 ? '#e9e9e5' : '#dcdcd7' }}>
      <svg viewBox="0 0 120 160" className="h-2/3">{shapes[n - 1]}</svg>
    </div>
  )
}

export default function Atelier() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  useGSAP(
    () => {
      gsap.from('[data-fade]', { opacity: 0, y: 24, duration: 1.6, stagger: 0.2, ease: 'power2.out', delay: 0.3 })
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => gsap.from(el, { opacity: 0, y: 40, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%' } }))
    },
    { scope: root },
  )
  return (
    <div ref={root} style={{ background: BG, color: INK, fontFamily: SANS, fontWeight: 300 }}>
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        <Form />
        <header className="absolute inset-x-0 top-0 flex justify-between px-6 py-7 text-[0.68rem] uppercase tracking-[0.3em] md:px-12">
          <span data-fade className="font-medium">Atelier Null</span>
          <span data-fade className="hidden md:block" style={{ color: GREY }}>Architecture · Casablanca</span>
          <span data-fade>Contact</span>
        </header>
        <p data-fade className="absolute bottom-10 left-6 max-w-xs text-sm leading-relaxed md:left-12" style={{ color: GREY }}>
          Construire le silence.<br />Quatre projets, une seule idée : ne garder que l’essentiel.
        </p>
        <p data-fade className="absolute bottom-10 right-6 text-[0.68rem] uppercase tracking-[0.3em] md:right-12" style={{ color: GREY }}>Défiler ↓</p>
      </section>

      <section className="grid gap-10 px-6 py-32 md:grid-cols-[1fr_1fr] md:px-12">
        <ul>
          {PROJECTS.map(([n, name, city, year], i) => (
            <li
              key={n}
              data-reveal
              onPointerEnter={() => setActive(i)}
              className="group flex cursor-default items-baseline justify-between border-t py-7 transition-colors"
              style={{ borderColor: 'rgba(17,17,17,.18)', color: active === i ? INK : '#8d8d88' }}
            >
              <span className="text-[0.68rem] tracking-[0.3em]">{n}</span>
              <span className="text-[clamp(1.8rem,4vw,3.4rem)] tracking-[-0.03em] transition-transform duration-500 group-hover:translate-x-3">{name}</span>
              <span className="hidden text-xs md:block" style={{ color: GREY }}>{city} · {year}</span>
            </li>
          ))}
          <li className="border-t" style={{ borderColor: 'rgba(17,17,17,.18)' }} />
        </ul>
        <div data-reveal className="relative aspect-[4/5] w-full overflow-hidden md:sticky md:top-24 md:h-[70vh] md:w-auto md:aspect-auto">
          {PROJECTS.map((_, i) => (
            <div key={i} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: active === i ? 1 : 0 }}>
              <Slot src={`atelier/project-${i + 1}.jpg`} className="absolute inset-0 h-full w-full object-cover grayscale"><Placeholder n={i + 1} /></Slot>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-12 border-t px-6 py-28 md:grid-cols-3 md:px-12" style={{ borderColor: 'rgba(17,17,17,.18)' }}>
        {[['Surface', 'Le plan commence par ce qu’on retire.'], ['Lumière', 'Une seule ouverture, pensée pour une seule heure.'], ['Matière', 'Béton, chaux, pierre. Rien d’autre.']].map(([t, d]) => (
          <div key={t} data-reveal>
            <p className="mb-4 text-[0.68rem] uppercase tracking-[0.3em]" style={{ color: GREY }}>{t}</p>
            <p className="max-w-xs text-xl leading-snug">{d}</p>
          </div>
        ))}
      </section>

      <section className="px-6 pb-28 pt-10 md:px-12">
        <a data-reveal href="#" onClick={(e) => e.preventDefault()} className="group inline-block text-[clamp(2.4rem,8vw,7rem)] tracking-[-0.04em]">
          Écrire à l’atelier
          <span className="ml-4 inline-block transition-transform duration-500 group-hover:translate-x-4">→</span>
          <span className="block h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100" style={{ background: INK }} />
        </a>
        <p className="mt-24 text-xs" style={{ color: GREY }}>© Atelier Null — démonstration</p>
      </section>
    </div>
  )
}
