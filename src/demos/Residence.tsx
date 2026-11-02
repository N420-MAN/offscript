import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/space-grotesk'
import '@fontsource/dm-mono/400.css'
import { Slot } from './Slot'

gsap.registerPlugin(ScrollTrigger)

const GROTESK = '"Space Grotesk Variable", system-ui, sans-serif'
const MONO = '"DM Mono", monospace'
const PAPER = '#f2f1ec'
const BLUE = '#2438ff'

const FLOORS = [
  { lvl: '00', name: 'Hall & jardin', area: '—', rooms: 'Accueil, conciergerie', note: 'Un jardin en cœur d’îlot.' },
  { lvl: '01', name: 'Appartements', area: '86 m²', rooms: '2 chambres', note: 'Double exposition.' },
  { lvl: '02', name: 'Appartements', area: '104 m²', rooms: '3 chambres', note: 'Balcon filant.' },
  { lvl: '03', name: 'Appartements', area: '104 m²', rooms: '3 chambres', note: 'Hauteur sous plafond 3,1 m.' },
  { lvl: '04', name: 'Duplex', area: '148 m²', rooms: '4 chambres', note: 'Terrasse sur deux niveaux.' },
  { lvl: '05', name: 'Rooftop', area: '210 m²', rooms: 'Penthouse', note: 'Piscine privée.' },
]

export default function Residence() {
  const root = useRef<HTMLDivElement>(null)
  const stack = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(5)

  useGSAP(
    () => {
      gsap.from('[data-letter]', { yPercent: -120, opacity: 0, duration: 1.1, stagger: 0.06, ease: 'bounce.out', delay: 0.2 })
      ScrollTrigger.create({
        trigger: '[data-explode]',
        start: 'top top',
        end: '+=420%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          const spread = Math.min(1, p * 2.2)
          const floors = stack.current?.querySelectorAll<HTMLElement>('[data-floor]')
          floors?.forEach((f, i) => {
            const z = i * (14 + spread * 78)
            f.style.transform = `translateZ(${z}px)`
          })
          setActive(5 - Math.min(5, Math.floor(Math.max(0, p - 0.25) / 0.75 * 6)))
          if (stack.current) stack.current.style.transform = `rotateX(${62 - p * 6}deg) rotateZ(${-42 + p * 18}deg) translateY(${p * -20}px)`
        },
      })
    },
    { scope: root },
  )

  const f = FLOORS[active]
  return (
    <div ref={root} style={{ background: PAPER, color: '#101114', fontFamily: GROTESK }}>
      <section className="relative flex h-screen min-h-[620px] flex-col justify-between overflow-hidden px-6 py-6 md:px-12 md:py-9" style={{ backgroundImage: 'linear-gradient(rgba(36,56,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(36,56,255,0.07) 1px, transparent 1px)', backgroundSize: '48px 48px' }}>
        <header className="flex items-center justify-between text-xs uppercase tracking-[0.16em]" style={{ fontFamily: MONO }}>
          <span>Verticale / Résidences</span>
          <span style={{ color: BLUE }}>Casablanca · 33.57° N</span>
        </header>
        <h1 className="flex flex-wrap text-[clamp(3.6rem,17vw,17rem)] font-bold leading-[0.82] tracking-[-0.05em]">
          {'VERTICALE'.split('').map((c, i) => (
            <span key={i} data-letter className="inline-block" style={{ color: i % 3 === 1 ? BLUE : '#101114' }}>
              {c}
            </span>
          ))}
        </h1>
        <div className="flex items-end justify-between text-sm">
          <p className="max-w-xs opacity-70">Six niveaux, six manières d’habiter la même tour. Faites défiler : l’immeuble s’ouvre.</p>
          <span className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO }}>↓ Explorer</span>
        </div>
      </section>

      <section data-explode className="relative flex h-screen items-center overflow-hidden px-6 md:px-12" style={{ backgroundImage: 'linear-gradient(rgba(36,56,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(36,56,255,0.08) 1px, transparent 1px)', backgroundSize: '48px 48px' }}>
        <div className="grid w-full items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <div className="flex h-[58vh] items-center justify-center" style={{ perspective: 1800 }}>
            <div ref={stack} className="relative h-[min(46vw,320px)] w-[min(46vw,320px)]" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(62deg) rotateZ(-42deg)' }}>
              {FLOORS.map((fl, i) => (
                <div
                  key={fl.lvl}
                  data-floor
                  className="absolute inset-0 transition-colors duration-300"
                  style={{
                    transform: `translateZ(${i * 14}px)`,
                    transformStyle: 'preserve-3d',
                    border: `2px solid ${i === active ? BLUE : '#101114'}`,
                    background: i === active ? `${BLUE}` : 'rgba(242,241,236,0.82)',
                    backgroundImage: i === active ? 'repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 6px, transparent 6px 26px)' : 'repeating-linear-gradient(90deg, rgba(16,17,20,0.18) 0 6px, transparent 6px 26px)',
                  }}
                >
                  <span className="absolute -left-12 top-1/2 text-xs" style={{ fontFamily: MONO, color: i === active ? BLUE : '#101114', transform: 'rotateZ(42deg) rotateX(-62deg)' }}>
                    N{fl.lvl}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO, color: BLUE }}>Niveau {f.lvl}</p>
            <h2 className="mt-3 text-[clamp(2.4rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.03em]">{f.name}</h2>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-black/20 pt-6 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] opacity-50" style={{ fontFamily: MONO }}>Surface</dt>
                <dd className="mt-1 text-4xl font-bold tracking-tight">{f.area}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] opacity-50" style={{ fontFamily: MONO }}>Programme</dt>
                <dd className="mt-1 text-xl">{f.rooms}</dd>
              </div>
            </dl>
            <div className="relative mt-8 aspect-[4/3] max-w-md overflow-hidden border border-black/15">
              <Slot src={`residence/floor-${[1, 1, 2, 2, 3, 4][active]}.jpg`} className="absolute inset-0 h-full w-full object-cover">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(36,56,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(36,56,255,0.1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <span className="absolute bottom-2 right-4 text-7xl font-bold" style={{ color: 'transparent', WebkitTextStroke: `1px ${BLUE}` }}>{f.lvl}</span>
              </Slot>
            </div>
            <p className="mt-6 max-w-sm opacity-70">{f.note}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden py-10" style={{ background: BLUE, color: PAPER }}>
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-12 whitespace-nowrap text-[clamp(2.4rem,6vw,5rem)] font-bold tracking-[-0.03em]">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-12">
              {['Lumière traversante', 'Jardin suspendu', 'Hauteur 3,1 m', 'Rooftop privé', 'Parking connecté'].map((t) => (
                <span key={t + k}>{t} ✦</span>
              ))}
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 py-28 text-center md:px-12">
        <h2 className="mx-auto max-w-5xl text-[clamp(2.6rem,8vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.04em]">
          Choisissez votre <span style={{ color: BLUE }}>étage.</span>
        </h2>
        <button className="mt-10 px-10 py-5 text-xs uppercase tracking-[0.2em] text-white transition-transform hover:scale-105" style={{ background: BLUE, fontFamily: MONO }}>
          Visiter l’appartement témoin
        </button>
        <p className="mt-24 text-xs opacity-40" style={{ fontFamily: MONO }}>© Verticale — démonstration</p>
      </section>
    </div>
  )
}
