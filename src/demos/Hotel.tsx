import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource/cormorant-garamond/300.css'
import '@fontsource/cormorant-garamond/300-italic.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource-variable/inter'
import { Slot } from './Slot'

gsap.registerPlugin(ScrollTrigger)

const SERIF = '"Cormorant Garamond", Georgia, serif'
const SANS = '"Inter Variable", system-ui, sans-serif'

type RGB = [number, number, number]
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const css = (c: RGB) => `rgb(${c.map(Math.round).join(',')})`

// Six lights of one day: sky top, sky bottom, sun colour, label.
const DAY = [
  { top: hex('#1b2440'), bot: hex('#f2a07b'), sun: hex('#ffd2a0'), time: '06:10', name: 'Aube', line: 'Le café arrive sur la terrasse, avant que la ville ne se réveille.' },
  { top: hex('#6fa8dc'), bot: hex('#ffe2b8'), sun: hex('#fff1c8'), time: '09:30', name: 'Matin', line: 'Les volets s’ouvrent sur le jardin. Rien n’est pressé.' },
  { top: hex('#2f7fd6'), bot: hex('#bfe3ff'), sun: hex('#ffffff'), time: '13:00', name: 'Midi', line: 'Le bassin, l’ombre des orangers, un déjeuner qui s’étire.' },
  { top: hex('#e8844a'), bot: hex('#ffd08a'), sun: hex('#fff0b0'), time: '18:20', name: 'Heure dorée', line: 'Le hammam, puis la lumière qui glisse sur les murs de chaux.' },
  { top: hex('#3a2a5c'), bot: hex('#e0607e'), sun: hex('#ffb3a0'), time: '20:05', name: 'Crépuscule', line: 'Les lanternes s’allument une à une dans la cour.' },
  { top: hex('#070a1a'), bot: hex('#1b2447'), sun: hex('#e9eeff'), time: '23:40', name: 'Nuit', line: 'Le silence, les étoiles, et un lit trop doux pour être quitté.' },
]

const ROOMS = [
  { n: 'Suite Atlas', d: 'Terrasse privée, vue sur les toits.', a: '#e8844a', b: '#3a2a5c' },
  { n: 'Chambre Jardin', d: 'Ouvre sur les orangers.', a: '#9bb89a', b: '#1f3a2e' },
  { n: 'Riad Lune', d: 'Patio, bassin, étoiles.', a: '#6f7bd6', b: '#0d1030' },
]

export default function Hotel() {
  const root = useRef<HTMLDivElement>(null)
  const sky = useRef<HTMLDivElement>(null)
  const sun = useRef<HTMLDivElement>(null)
  const stars = useRef<HTMLDivElement>(null)
  const [seg, setSeg] = useState(0)
  const [pageBg, setPageBg] = useState('#070a1a')

  useGSAP(
    () => {
      gsap.from('[data-rise]', { yPercent: 110, duration: 1.6, stagger: 0.14, ease: 'expo.out', delay: 0.2 })
      ScrollTrigger.create({
        trigger: '[data-day]',
        start: 'top top',
        end: '+=520%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress * (DAY.length - 1)
          const i = Math.min(DAY.length - 2, Math.floor(p))
          const t = p - i
          const A = DAY[i]
          const B = DAY[i + 1]
          if (sky.current) sky.current.style.background = `linear-gradient(180deg, ${css(mix(A.top, B.top, t))}, ${css(mix(A.bot, B.bot, t))})`
          if (sun.current) {
            const k = self.progress
            const x = 8 + k * 84
            const y = 80 - Math.sin(k * Math.PI) * 58
            sun.current.style.left = `${x}%`
            sun.current.style.top = `${y}%`
            const col = css(mix(A.sun, B.sun, t))
            const night = Math.max(0, (k - 0.82) / 0.18)
            sun.current.style.background = `radial-gradient(circle, ${col} 0%, ${col} 38%, transparent 70%)`
            sun.current.style.boxShadow = night > 0 ? `inset -14px -6px 0 0 rgba(7,10,26,${night * 0.9})` : 'none'
          }
          if (stars.current) stars.current.style.opacity = String(Math.max(0, (self.progress - 0.72) / 0.28))
          setSeg(Math.round(p))
          setPageBg(css(mix(A.top, B.top, t)))
        },
      })
      gsap.utils.toArray<HTMLElement>('[data-room]').forEach((el, i) => {
        gsap.from(el, { y: 120, opacity: 0, duration: 1.2, ease: 'power3.out', delay: i * 0.08, scrollTrigger: { trigger: el, start: 'top 88%' } })
      })
    },
    { scope: root },
  )

  const cur = DAY[seg]
  return (
    <div ref={root} style={{ background: '#070a1a', color: '#f4ede4', fontFamily: SANS }}>
      <section className="relative flex h-screen min-h-[620px] flex-col items-center justify-center overflow-hidden px-6 text-center" style={{ background: 'linear-gradient(180deg,#1b2440,#f2a07b 120%)' }}>
        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6 text-xs uppercase tracking-[0.2em] md:px-12">
          <span style={{ fontFamily: SERIF, fontSize: '1.5rem', letterSpacing: '0.04em', textTransform: 'none' }}>Maison Zéphyr</span>
          <span className="hidden opacity-70 md:block">Hôtel · Spa · Marrakech-Casablanca</span>
          <span className="opacity-90">Réserver</span>
        </header>
        <h1 className="text-[clamp(3.6rem,13vw,13rem)] leading-[0.88]" style={{ fontFamily: SERIF, fontWeight: 300 }}>
          <span className="block overflow-hidden pb-[0.1em]">
            <span data-rise className="block">Une journée,</span>
          </span>
          <span className="block overflow-hidden pb-[0.12em]">
            <span data-rise className="block italic">six lumières.</span>
          </span>
        </h1>
        <p className="mt-8 text-xs uppercase tracking-[0.3em] opacity-70">Faites défiler pour vivre la journée</p>
        <div className="absolute bottom-0 left-1/2 h-24 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-white/60" />
      </section>

      <section data-day className="relative h-screen overflow-hidden">
        <div ref={sky} className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#1b2440,#f2a07b)' }} />
        <div ref={stars} className="absolute inset-0 opacity-0" style={{ backgroundImage: 'radial-gradient(1.5px 1.5px at 20% 25%,#fff,transparent),radial-gradient(1px 1px at 70% 15%,#fff,transparent),radial-gradient(1.5px 1.5px at 85% 40%,#fff,transparent),radial-gradient(1px 1px at 40% 10%,#fff,transparent),radial-gradient(1px 1px at 55% 35%,#fff,transparent),radial-gradient(1.5px 1.5px at 10% 45%,#fff,transparent)', backgroundSize: '100% 100%' }} />
        <div ref={sun} className="absolute h-[22vmin] w-[22vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: '8%', top: '80%' }} />
        {/* Skyline of the hotel: arches in silhouette */}
        <div className="absolute inset-x-0 bottom-0 flex h-[34vh] items-end justify-center gap-[2vw] px-[6vw]">
          {[60, 86, 100, 86, 60].map((h, i) => (
            <div key={i} className="flex-1" style={{ height: `${h}%`, background: '#070a1a', borderRadius: '999px 999px 0 0', opacity: 0.92 }}>
              <div className="mx-auto mt-[18%] h-[28%] w-[26%] rounded-t-full" style={{ background: 'rgba(255,214,150,0.55)' }} />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between px-6 py-8 md:px-12">
          <div>
            <p className="text-6xl md:text-8xl" style={{ fontFamily: SERIF, fontWeight: 300 }}>{cur.time}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] opacity-80">{cur.name}</p>
          </div>
          <p className="max-w-xs text-right text-base opacity-90 md:text-lg" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '1.4rem' }}>{cur.line}</p>
        </div>
        <div className="absolute bottom-6 left-6 flex gap-2 md:left-12">
          {DAY.map((_, i) => (
            <span key={i} className="h-px w-8 transition-all duration-500" style={{ background: '#fff', opacity: i === seg ? 1 : 0.3, width: i === seg ? 56 : 32 }} />
          ))}
        </div>
      </section>

      <section className="px-6 py-28 md:px-12" style={{ background: `linear-gradient(180deg, ${pageBg}, #070a1a 30%)` }}>
        <p className="mb-12 text-xs uppercase tracking-[0.3em] opacity-60">Les chambres</p>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {ROOMS.map((r, i) => (
            <article key={r.n} data-room className="group">
              <div
                className="relative aspect-[3/4] overflow-hidden transition-transform duration-700 group-hover:-translate-y-3"
                style={{ borderRadius: '999px 999px 12px 12px', background: `linear-gradient(180deg, ${r.a}, ${r.b})` }}
              >
                <Slot src={`hotel/room-${i + 1}.jpg`} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: ["28% 60%", "50% 55%", "62% 55%"][i] }}>
                  <div className="absolute inset-x-[20%] bottom-0 top-[40%] rounded-t-full" style={{ background: 'rgba(7,10,26,0.55)' }} />
                  <div className="absolute left-1/2 top-[20%] h-16 w-16 -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(circle,#fff6d8,transparent 70%)' }} />
                </Slot>
              </div>
              <h3 className="mt-6 text-4xl" style={{ fontFamily: SERIF, fontWeight: 300 }}>{r.n}</h3>
              <p className="mt-1 text-sm opacity-60">{r.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 px-6 pb-10 md:grid-cols-2 md:gap-8 md:px-12">
        {[['pool', 'Le bassin, à la lumière dorée', '#e8844a', '#5a2d5c'], ['courtyard', 'La cour des orangers', '#9bb89a', '#1f3a2e']].map(([k, label, a, b]) => (
          <figure key={k} className="relative aspect-[4/5] overflow-hidden" style={{ borderRadius: '14px', background: `linear-gradient(160deg, ${a}, ${b})` }}>
            <Slot src={`hotel/${k}.jpg`} className="absolute inset-0 h-full w-full object-cover" />
            <figcaption className="absolute bottom-4 left-5 text-sm italic text-white/80" style={{ fontFamily: SERIF }}>{label}</figcaption>
          </figure>
        ))}
      </section>

      <section className="px-6 pb-14 pt-24 text-center md:px-12">
        <h2 className="mx-auto max-w-4xl text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.95]" style={{ fontFamily: SERIF, fontWeight: 300 }}>
          Restez <em>un peu</em> plus longtemps.
        </h2>
        <button className="mt-10 rounded-full border border-white/50 px-10 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:bg-white hover:text-black">Réserver une nuit</button>
        <p className="mt-24 text-xs opacity-40">© Maison Zéphyr — démonstration</p>
      </section>
    </div>
  )
}
