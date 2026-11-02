import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/space-grotesk'
import '@fontsource/dm-mono/400.css'
import { Slot } from './Slot'

gsap.registerPlugin(ScrollTrigger)

const SG = '"Space Grotesk Variable", system-ui, sans-serif'
const MONO = '"DM Mono", monospace'
const CY = '#3de0ff'
const BG = '#06080b'

/** Light streaks pouring out of the vanishing point; speed follows scroll. */
function Streaks({ speed }: { speed: React.MutableRefObject<number> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    let W = 0
    let H = 0
    const resize = () => {
      W = c.width = c.clientWidth
      H = c.height = c.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)
    const N = W < 720 ? 70 : 150
    const s = Array.from({ length: N }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), v: 0.25 + Math.random() * 0.9, w: Math.random() }))
    let raf = 0
    const draw = () => {
      ctx.fillStyle = 'rgba(6,8,11,0.28)'
      ctx.fillRect(0, 0, W, H)
      const cx = W / 2
      const cy = H * 0.46
      const R = Math.hypot(W, H) / 2
      for (const p of s) {
        const prev = p.r
        p.r += (0.004 + p.v * 0.012) * (1 + speed.current * 5) * (0.4 + p.r * 2.2)
        if (p.r > 1.05) {
          p.r = 0.02
          p.a = Math.random() * Math.PI * 2
        }
        const x0 = cx + Math.cos(p.a) * prev * R
        const y0 = cy + Math.sin(p.a) * prev * R * 0.8
        const x1 = cx + Math.cos(p.a) * p.r * R
        const y1 = cy + Math.sin(p.a) * p.r * R * 0.8
        ctx.strokeStyle = p.w > 0.82 ? `rgba(255,255,255,${0.15 + p.r * 0.7})` : `rgba(61,224,255,${0.1 + p.r * 0.75})`
        ctx.lineWidth = 0.4 + p.r * 2.4
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.stroke()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [speed])
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />
}

const SPECS = [
  ['2,9', 's', '0 – 100 km/h'],
  ['780', 'km', 'Autonomie WLTP'],
  ['12', 'min', 'Recharge 10 → 80 %'],
]

function Tilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: 'preserve-3d', transition: 'transform .25s ease-out' }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        ref.current!.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`
      }}
      onPointerLeave={() => (ref.current!.style.transform = 'perspective(900px)')}
    >
      {children}
    </div>
  )
}

export default function Volta() {
  const root = useRef<HTMLDivElement>(null)
  const speed = useRef(0)
  const nums = useRef<HTMLSpanElement[]>([])

  useGSAP(
    () => {
      gsap.to('[data-car]', { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', stagger: 0.15, delay: 0.5 })
      gsap.from('[data-rise]', { yPercent: 110, duration: 1.3, stagger: 0.12, ease: 'expo.out', delay: 0.2 })
      ScrollTrigger.create({
        trigger: '[data-hero]',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          speed.current = Math.min(1, Math.abs(self.getVelocity()) / 2500)
          gsap.set('[data-carwrap]', { scale: 0.95 + self.progress * 0.25, y: self.progress * 60 })
          gsap.set('[data-herotext]', { opacity: 1 - Math.min(1, self.progress * 2.4), y: -self.progress * 80 })
        },
      })
      ScrollTrigger.create({
        trigger: '[data-charge]',
        start: 'top top',
        end: '+=130%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          gsap.set('[data-ring]', { strokeDashoffset: 1 - (0.1 + p * 0.7) })
          if (nums.current[0]) nums.current[0].textContent = String(Math.round(10 + p * 70))
          if (nums.current[1]) nums.current[1].textContent = String(Math.round(p * 12))
        },
      })
      gsap.from('[data-spec]', { y: 50, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '[data-specs]', start: 'top 80%' } })
    },
    { scope: root },
  )

  // speed decays between scroll events
  useEffect(() => {
    const id = window.setInterval(() => (speed.current *= 0.9), 60)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div ref={root} style={{ background: BG, color: '#e8f4f8', fontFamily: SG }}>
      <section data-hero className="relative h-[240vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <Slot src="volta/hero.mp4" kind="video" className="absolute inset-0 h-full w-full object-cover opacity-60">
            <Streaks speed={speed} />
          </Slot>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 46%, transparent 20%, rgba(6,8,11,.8) 85%)' }} />
          <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6 text-xs uppercase tracking-[0.28em] md:px-12" style={{ fontFamily: MONO }}>
            <span className="text-base font-bold tracking-[0.4em]" style={{ fontFamily: SG }}>VOLTA</span>
            <span className="hidden opacity-60 md:block">Modèle V1 · 100 % électrique</span>
            <span style={{ color: CY }}>Réserver ↗</span>
          </header>
          <div data-carwrap className="absolute inset-x-0 top-[28%] mx-auto w-[min(92vw,1100px)]">
            <svg viewBox="0 0 1000 300" className="w-full" style={{ filter: `drop-shadow(0 0 14px ${CY}) drop-shadow(0 0 40px rgba(61,224,255,.5))` }}>
              <g fill="none" stroke={CY} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path data-car pathLength="1" strokeDasharray="1" strokeDashoffset="1" d="M58 224 C58 202 92 192 150 184 L300 162 C345 122 425 96 522 96 C622 96 692 122 742 162 L880 184 C932 192 952 206 952 224 L952 238 L58 238 Z" />
                <path data-car pathLength="1" strokeDasharray="1" strokeDashoffset="1" d="M330 160 C370 128 440 110 520 110 C600 110 660 130 700 160 Z M520 110 L520 160" />
                <circle data-car pathLength="1" strokeDasharray="1" strokeDashoffset="1" cx="240" cy="238" r="46" />
                <circle data-car pathLength="1" strokeDasharray="1" strokeDashoffset="1" cx="240" cy="238" r="24" />
                <circle data-car pathLength="1" strokeDasharray="1" strokeDashoffset="1" cx="770" cy="238" r="46" />
                <circle data-car pathLength="1" strokeDasharray="1" strokeDashoffset="1" cx="770" cy="238" r="24" />
                <path data-car pathLength="1" strokeDasharray="1" strokeDashoffset="1" d="M880 190 L940 196 M60 200 L110 196" />
              </g>
            </svg>
          </div>
          <div data-herotext className="absolute inset-x-0 bottom-[10%] px-6 md:px-12">
            <h1 className="text-[clamp(3rem,11vw,10rem)] font-light uppercase leading-[0.9] tracking-[-0.03em]">
              <span className="block overflow-hidden"><span data-rise className="block">Le silence</span></span>
              <span className="block overflow-hidden"><span data-rise className="block" style={{ color: CY }}>a une puissance.</span></span>
            </h1>
          </div>
        </div>
      </section>

      <section data-specs className="grid gap-px border-y border-white/10 bg-white/10 md:grid-cols-3">
        {SPECS.map(([v, u, l]) => (
          <div data-spec key={l} className="px-6 py-20 md:px-12" style={{ background: BG }}>
            <p className="text-[clamp(4rem,9vw,8rem)] font-light leading-none tracking-[-0.04em]">
              {v}
              <span className="ml-2 text-[0.3em] tracking-normal" style={{ color: CY }}>{u}</span>
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.24em] opacity-55" style={{ fontFamily: MONO }}>{l}</p>
          </div>
        ))}
      </section>

      <section data-charge className="relative grid h-screen place-items-center overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(61,224,255,.18), transparent 55%)' }} />
        <div className="relative">
          <svg viewBox="0 0 200 200" className="h-[min(78vw,62vh)] w-[min(78vw,62vh)] -rotate-90">
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
            <circle data-ring pathLength="1" strokeDasharray="1" strokeDashoffset="0.9" cx="100" cy="100" r="88" fill="none" stroke={CY} strokeWidth="3" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${CY})` }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-[clamp(4rem,12vw,9rem)] font-light leading-none tracking-[-0.04em]">
                <span ref={(el) => { if (el) nums.current[0] = el }}>10</span>
                <span className="text-[0.4em]" style={{ color: CY }}> %</span>
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.26em] opacity-60" style={{ fontFamily: MONO }}>
                <span ref={(el) => { if (el) nums.current[1] = el }}>0</span> min · Recharge ultra-rapide
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 px-6 py-28 md:grid-cols-3 md:px-12">
        {[1, 2, 3].map((n) => (
          <Tilt key={n} className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10">
            <Slot src={`volta/detail-${n}.jpg`} className="absolute inset-0 h-full w-full object-cover">
              <div className="absolute inset-0" style={{ background: `radial-gradient(circle at ${30 + n * 18}% ${70 - n * 12}%, rgba(61,224,255,.28), transparent 55%), linear-gradient(160deg,#0b1118,#05070a)` }}>
                <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(rgba(61,224,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(61,224,255,.6) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
              </div>
            </Slot>
            <p className="absolute bottom-5 left-5 text-xs uppercase tracking-[0.24em]" style={{ fontFamily: MONO }}>0{n} — {['Optique', 'Châssis', 'Cockpit'][n - 1]}</p>
          </Tilt>
        ))}
      </section>

      <section className="px-6 pb-32 pt-10 text-center md:px-12">
        <h2 className="mx-auto max-w-4xl text-[clamp(2.4rem,7vw,6rem)] font-light uppercase leading-[0.95] tracking-[-0.03em]">
          Essayez <span style={{ color: CY }}>demain.</span>
        </h2>
        <button className="mt-10 rounded-full px-10 py-4 text-xs uppercase tracking-[0.24em] transition-transform hover:scale-105" style={{ border: `1px solid ${CY}`, color: CY, boxShadow: `0 0 30px rgba(61,224,255,.25), inset 0 0 20px rgba(61,224,255,.1)`, fontFamily: MONO }}>
          Réserver un essai
        </button>
        <p className="mt-24 text-xs opacity-35" style={{ fontFamily: MONO }}>© Volta — démonstration</p>
      </section>
    </div>
  )
}
