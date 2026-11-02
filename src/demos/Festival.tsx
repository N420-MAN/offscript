import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/syne'
import '@fontsource/dm-mono/400.css'
import { runShader } from './gl'
import { Slot } from './Slot'

gsap.registerPlugin(ScrollTrigger)

const SYNE = '"Syne Variable", system-ui, sans-serif'
const MONO = '"DM Mono", monospace'
const VIO = '#8a3cff'
const MAG = '#ff2fb4'

const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uKick;
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x/uRes.y, 1.0);
  float beat = pow(0.5 + 0.5*sin(uTime*13.4), 6.0);      // 128 bpm
  float r = length(uv), a = atan(uv.y, uv.x);
  float rings  = sin(r*24.0 - uTime*4.5 - beat*3.0);
  float spokes = sin(a*12.0 + uTime*0.7 + r*7.0);
  float f = smoothstep(0.35, 1.0, rings*0.55 + spokes*0.45 + beat*0.6);
  float dm = length(uv - m);
  f += 0.9*exp(-dm*4.5) * (0.5 + 0.5*sin(dm*46.0 - uTime*9.0));
  f += uKick * exp(-r*2.5);
  vec3 c1 = vec3(0.54, 0.24, 1.0);
  vec3 c2 = vec3(1.0, 0.18, 0.71);
  vec3 col = mix(c1, c2, 0.5 + 0.5*sin(a*2.0 + uTime*0.6 + r*3.0)) * f;
  col += c2 * 0.05 / (r + 0.12);
  col *= 1.0 - smoothstep(0.5, 1.2, r);
  gl_FragColor = vec4(col, 1.0);
}`

const LINEUP = ['NOVA KAI', 'ÉCLIPSE', 'DJ MERIDIAN', 'SAHARA/SYNTH', 'LUX VOID', 'ATLAS ECHO', 'KORA DRIFT', 'NEON MEDINA']

export default function Festival() {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const kick = useRef(0)
  const disp = useRef<SVGFEDisplacementMapElement>(null)

  useEffect(() => {
    const stop = runShader(canvas.current!, FRAG, () => {
      kick.current *= 0.92
      return { uKick: kick.current }
    })
    let last = { x: 0, y: 0, t: performance.now() }
    const move = (e: PointerEvent) => {
      const now = performance.now()
      const sp = Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(1, now - last.t)
      last = { x: e.clientX, y: e.clientY, t: now }
      if (disp.current) disp.current.setAttribute('scale', String(Math.min(90, 8 + sp * 40)))
    }
    const down = () => (kick.current = 1)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    const relax = window.setInterval(() => {
      if (disp.current) disp.current.setAttribute('scale', String(Math.max(8, Number(disp.current.getAttribute('scale')) * 0.9)))
    }, 50)
    return () => {
      stop()
      window.clearInterval(relax)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
    }
  }, [])

  useGSAP(
    () => {
      gsap.from('[data-rise]', { yPercent: 110, duration: 1.2, ease: 'expo.out', delay: 0.2 })
      gsap.utils.toArray<HTMLElement>('[data-name]').forEach((el) => gsap.from(el, { x: -80, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }))
    },
    { scope: root },
  )

  return (
    <div ref={root} className="bg-[#050008] text-white" style={{ fontFamily: SYNE }}>
      <svg width="0" height="0" className="absolute">
        <filter id="liquid" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap ref={disp} in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <section className="relative h-screen min-h-[620px] overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        <Slot src="pulse/hero.mp4" kind="video" className="absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-70" />
        <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 text-xs uppercase tracking-[0.24em] md:px-12" style={{ fontFamily: MONO }}>
          <span className="text-base font-extrabold tracking-[0.2em]" style={{ fontFamily: SYNE }}>PULSE*</span>
          <span className="hidden opacity-70 md:block">3 nuits · 40 artistes · 2 scènes</span>
          <span style={{ color: MAG }}>Billets ↗</span>
        </header>
        <div className="absolute inset-x-0 bottom-[8%] z-10 px-4 md:px-10">
          <h1 className="overflow-hidden pb-2 text-[clamp(4rem,22vw,26rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.05em]" style={{ filter: 'url(#liquid)', mixBlendMode: 'difference' }}>
            <span data-rise className="block">Pulse</span>
          </h1>
        </div>
      </section>

      <div className="overflow-hidden border-y border-white/20 py-4" style={{ background: MAG, color: '#000' }}>
        <div className="flex w-max animate-[marquee_26s_linear_infinite] gap-10 whitespace-nowrap text-2xl font-extrabold uppercase">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-10">
              {['Trois nuits', '✦', 'Deux scènes', '✦', 'Quarante artistes', '✦', 'Jusqu’à l’aube', '✦'].map((t, i) => <span key={i}>{t}</span>)}
            </span>
          ))}
        </div>
      </div>

      <section className="px-4 py-24 md:px-10">
        <p className="mb-10 text-xs uppercase tracking-[0.3em] opacity-55" style={{ fontFamily: MONO }}>Line-up</p>
        {LINEUP.map((n, i) => (
          <div
            data-name
            key={n}
            className="group relative flex items-baseline justify-between overflow-hidden border-t border-white/15 py-3 transition-colors duration-300 hover:bg-white"
          >
            <span className="whitespace-nowrap text-[clamp(1.8rem,6.6vw,6.5rem)] font-extrabold uppercase leading-none tracking-[-0.04em] transition-all duration-300 group-hover:px-4 group-hover:text-black">{n}</span>
            <span className="hidden pr-4 text-xs opacity-60 transition-colors group-hover:text-black md:block" style={{ fontFamily: MONO }}>NUIT 0{(i % 3) + 1}</span>
          </div>
        ))}
      </section>

      <section className="grid gap-5 px-4 pb-24 md:grid-cols-3 md:px-10">
        {[['Pass 1 nuit', 'Une soirée, une scène.', VIO], ['Pass 3 nuits', 'Tout le festival.', MAG], ['Pass Aube', 'Accès backstage et afters.', '#ffffff']].map(([t, d, c]) => (
          <div key={t} className="group relative overflow-hidden rounded-3xl border border-white/15 p-8 transition-transform duration-300 hover:-rotate-1 hover:scale-[1.02]" style={{ background: `linear-gradient(160deg, ${c}22, transparent 60%)` }}>
            <p className="text-3xl font-extrabold uppercase tracking-[-0.02em]">{t}</p>
            <p className="mt-3 text-sm opacity-60">{d}</p>
            <button className="mt-10 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-transform group-hover:scale-105" style={{ background: c as string }}>Réserver</button>
          </div>
        ))}
      </section>

      <footer className="overflow-hidden px-4 pb-6 pt-16 md:px-10">
        <p className="text-[clamp(3rem,22vw,26rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.05em]" style={{ WebkitTextStroke: `2px ${MAG}`, color: 'transparent' }}>Pulse</p>
        <p className="mt-6 text-xs opacity-40" style={{ fontFamily: MONO }}>© Pulse — démonstration</p>
      </footer>
    </div>
  )
}
