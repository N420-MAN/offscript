import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource/cormorant-garamond/300.css'
import '@fontsource/cormorant-garamond/300-italic.css'
import '@fontsource-variable/inter'
import { runShader } from './gl'
import { Slot } from './Slot'

gsap.registerPlugin(ScrollTrigger)

const SERIF = '"Cormorant Garamond", Georgia, serif'
const SANS = '"Inter Variable", system-ui, sans-serif'
const GOLD = '#c9b27c'

const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0) * 2.4;
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0) * 2.4;
  float d = length(p - m);
  p += (p - m) * 0.55 * exp(-d * 1.5);              // the cursor presses into the metal
  for (int i = 1; i < 5; i++) {
    float fi = float(i);
    p += vec2(sin(p.y*fi*1.3 + uTime*0.16 + fi), cos(p.x*fi*1.1 - uTime*0.13)) * 0.42 / fi;
  }
  float v = 0.5 + 0.5*sin(p.x*2.2 + p.y*1.6);
  float band = smoothstep(0.25, 0.75, v);
  float spec = pow(abs(sin(v*8.0 + p.y)), 14.0);
  vec3 base = mix(vec3(0.015), vec3(0.30, 0.30, 0.33), band);
  vec3 col = base + vec3(0.79, 0.70, 0.49) * spec * 0.9;
  col += vec3(0.8, 0.82, 0.9) * pow(band, 6.0) * 0.12;
  float vig = 1.0 - smoothstep(0.55, 1.35, length(uv - 0.5) * 1.8);
  gl_FragColor = vec4(col * (0.35 + 0.65*vig), 1.0);
}`

function Dial() {
  const hs = useRef<SVGLineElement>(null)
  const mn = useRef<SVGLineElement>(null)
  const sc = useRef<SVGLineElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const d = new Date()
      const s = d.getSeconds() + d.getMilliseconds() / 1000
      const m = d.getMinutes() + s / 60
      const h = (d.getHours() % 12) + m / 60
      hs.current?.setAttribute('transform', `rotate(${h * 30} 100 100)`)
      mn.current?.setAttribute('transform', `rotate(${m * 6} 100 100)`)
      sc.current?.setAttribute('transform', `rotate(${s * 6} 100 100)`)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <svg viewBox="0 0 200 200" className="w-full" style={{ filter: 'drop-shadow(0 30px 50px rgba(0,0,0,.7))' }}>
      <defs>
        <radialGradient id="face" cx="40%" cy="35%"><stop offset="0" stopColor="#2a2a2f" /><stop offset="1" stopColor="#0b0b0e" /></radialGradient>
        <linearGradient id="bez" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0ead8" /><stop offset=".45" stopColor="#6e6a60" /><stop offset="1" stopColor="#c9b27c" /></linearGradient>
      </defs>
      <circle cx="100" cy="100" r="97" fill="url(#bez)" />
      <circle cx="100" cy="100" r="90" fill="#050507" />
      <circle cx="100" cy="100" r="86" fill="url(#face)" />
      {Array.from({ length: 60 }, (_, i) => (
        <line key={i} x1="100" y1={i % 5 === 0 ? 17 : 15} x2="100" y2={i % 5 === 0 ? 27 : 20} stroke={i % 5 === 0 ? GOLD : '#7d7a72'} strokeWidth={i % 5 === 0 ? 1.8 : 0.6} transform={`rotate(${i * 6} 100 100)`} />
      ))}
      <text x="100" y="66" textAnchor="middle" fontSize="9" fill={GOLD} style={{ fontFamily: SERIF, letterSpacing: '0.35em' }}>ONYX</text>
      <text x="100" y="140" textAnchor="middle" fontSize="4.4" fill="#8f8c84" style={{ fontFamily: SANS, letterSpacing: '0.3em' }}>AUTOMATIQUE · 100 M</text>
      <line ref={hs} x1="100" y1="100" x2="100" y2="56" stroke="#eee8d8" strokeWidth="3.4" strokeLinecap="round" />
      <line ref={mn} x1="100" y1="100" x2="100" y2="34" stroke="#eee8d8" strokeWidth="2.4" strokeLinecap="round" />
      <line ref={sc} x1="100" y1="112" x2="100" y2="28" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
      <circle cx="100" cy="100" r="3.2" fill={GOLD} />
    </svg>
  )
}

const SPECS = [['Calibre', 'Automatique, 72 h de réserve'], ['Boîtier', 'Acier noirci, 41 mm'], ['Verre', 'Saphir, traitement anti-reflet'], ['Étanchéité', '100 m']]

export default function Watch() {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const dial = useRef<HTMLDivElement>(null)

  useEffect(() => runShader(canvas.current!, FRAG), [])
  useGSAP(
    () => {
      gsap.from('[data-rise]', { yPercent: 110, duration: 1.6, stagger: 0.15, ease: 'expo.out', delay: 0.3 })
      gsap.from('[data-spec]', { opacity: 0, y: 30, stagger: 0.1, duration: 1, scrollTrigger: { trigger: '[data-specs]', start: 'top 80%' } })
      ScrollTrigger.create({
        trigger: '[data-dial]',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => gsap.set('[data-dialwrap]', { rotation: -25 + self.progress * 50, scale: 0.8 + Math.sin(self.progress * Math.PI) * 0.25 }),
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="bg-[#07070a] text-[#e9e6df]" style={{ fontFamily: SANS }}>
      <section className="relative h-screen min-h-[620px] overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        <Slot src="onyx/macro.mp4" kind="video" className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-screen" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(7,7,10,.88) 0%, rgba(7,7,10,.45) 40%, transparent 70%)' }} />
        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-7 text-[0.7rem] uppercase tracking-[0.34em] md:px-12">
          <span style={{ fontFamily: SERIF, fontSize: '1.4rem', letterSpacing: '0.5em' }}>ONYX</span>
          <span className="hidden opacity-60 md:block">Haute horlogerie</span>
          <span style={{ color: GOLD }}>Collection</span>
        </header>
        <div className="absolute inset-x-0 bottom-[12%] px-6 text-center md:px-12">
          <h1 style={{ fontFamily: SERIF, fontWeight: 300 }} className="text-[clamp(3.4rem,11vw,10rem)] leading-[0.9] tracking-[-0.02em]">
            <span className="block overflow-hidden pb-2"><span data-rise className="block">Le temps,</span></span>
            <span className="block overflow-hidden pb-2"><span data-rise className="block italic" style={{ color: GOLD }}>ciselé.</span></span>
          </h1>
        </div>
      </section>

      <section data-dial className="relative grid min-h-[110vh] place-items-center overflow-hidden px-6 py-24">
        <div className="absolute inset-0 opacity-50" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(201,178,124,.12), transparent 55%)' }} />
        <div data-dialwrap ref={dial} className="relative w-[min(86vw,60vh)]" style={{ transformStyle: 'preserve-3d' }}>
          <Dial />
        </div>
        <p className="absolute bottom-10 text-center text-[0.7rem] uppercase tracking-[0.34em] opacity-50">L’heure est réelle.</p>
      </section>

      <section data-specs className="mx-auto max-w-5xl px-6 py-24">
        {SPECS.map(([k, v]) => (
          <div data-spec key={k} className="flex items-baseline justify-between gap-6 border-t border-white/15 py-6">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] opacity-55">{k}</span>
            <span className="text-right text-[clamp(1.3rem,3vw,2.2rem)]" style={{ fontFamily: SERIF, fontWeight: 300 }}>{v}</span>
          </div>
        ))}
      </section>

      <section className="grid gap-4 px-6 pb-28 md:grid-cols-4 md:px-12">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="relative aspect-[3/4] overflow-hidden rounded-sm border border-white/10">
            <Slot src={`onyx/watch-${n}.jpg`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1500ms] hover:scale-105">
              <div className="absolute inset-0" style={{ background: `conic-gradient(from ${n * 70}deg at 50% 60%, #0a0a0c, #3a3a40, #0a0a0c, #5b5340, #0a0a0c)` }} />
            </Slot>
          </div>
        ))}
      </section>

      <section className="px-6 pb-32 text-center">
        <h2 style={{ fontFamily: SERIF, fontWeight: 300 }} className="text-[clamp(2.6rem,8vw,7rem)] leading-none tracking-[-0.02em]">
          Une heure <span className="italic" style={{ color: GOLD }}>pour la vie.</span>
        </h2>
        <button className="mt-10 border px-10 py-4 text-[0.7rem] uppercase tracking-[0.34em] transition-colors hover:bg-[#c9b27c] hover:text-black" style={{ borderColor: GOLD, color: GOLD }}>Prendre rendez-vous en boutique</button>
        <p className="mt-24 text-xs opacity-35">© Onyx — démonstration</p>
      </section>
    </div>
  )
}
