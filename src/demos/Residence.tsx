import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/bodoni-moda/opsz.css'
import '@fontsource-variable/bodoni-moda/opsz-italic.css'
import '@fontsource-variable/hanken-grotesk'
import { Photo } from './kit'
import { BRASS, BRASS_LIGHT, GREEN, INK, PAPER, PHOTO, SANS, SERIF, STONE } from './residenceTheme'
import ResidenceSales from './ResidenceSales'

gsap.registerPlugin(ScrollTrigger)

/**
 * Verticale — a residential tower in Bourgogne, Casablanca, sold off-plan. The whole site stands upright: the name
 * runs down the page, the photographs are tall, the rules are vertical, and the building opens floor by floor.
 */

const FLOORS = [
  { lvl: '00', name: 'Hall & jardin', area: '1 200 m²', rooms: 'Accueil, conciergerie, jardin', note: 'Un jardin en cœur d’îlot, à l’abri de la rue.', photo: PHOTO.hall },
  { lvl: '01', name: 'Appartements', area: '82 – 86 m²', rooms: '2 chambres', note: 'Double exposition, loggia sur le jardin.', photo: PHOTO.living },
  { lvl: '02', name: 'Appartements', area: '88 – 104 m²', rooms: '2 ou 3 chambres', note: 'Balcon filant sur toute la façade sud.', photo: PHOTO.living },
  { lvl: '03', name: 'Appartements', area: '104 – 110 m²', rooms: '3 chambres', note: 'Hauteur sous plafond de 3,10 m.', photo: PHOTO.hall },
  { lvl: '04', name: 'Duplex', area: '148 m²', rooms: '4 chambres', note: 'Séjour double hauteur, terrasse sur deux niveaux.', photo: PHOTO.living },
  { lvl: '05', name: 'Penthouse', area: '210 m²', rooms: '4 chambres + rooftop', note: 'Piscine privée et vue jusqu’à l’océan.', photo: PHOTO.roof },
]

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

export default function Residence() {
  const root = useRef<HTMLDivElement>(null)
  const stack = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(5)

  useGSAP(
    () => {
      // the name drops in letter by letter, down its column
      gsap.from('[data-letter]', { yPercent: -140, opacity: 0, duration: 1.1, stagger: 0.06, ease: 'bounce.out', delay: 0.2 })
      gsap.from('[data-hero-photo]', { clipPath: 'inset(100% 0 0 0)', duration: 1.6, ease: 'expo.inOut', delay: 0.15 })
      gsap.from('[data-hero-in]', { y: 30, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'power3.out', delay: 0.5 })
      // the building opens: the slabs spread apart while the section is pinned, and the one in focus lights up
      ScrollTrigger.create({
        trigger: '[data-explode]',
        start: 'top top',
        end: '+=260%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          const spread = Math.min(1, p * 2.2)
          stack.current?.querySelectorAll<HTMLElement>('[data-floor]').forEach((f, i) => {
            f.style.transform = `translateZ(${i * (14 + spread * 78)}px)`
          })
          setActive(5 - Math.min(5, Math.floor((Math.max(0, p - 0.25) / 0.75) * 6)))
          if (stack.current) stack.current.style.transform = `rotateX(${62 - p * 6}deg) rotateZ(${-42 + p * 18}deg) translateY(${p * -20}px)`
        },
      })
      gsap.utils.toArray<HTMLElement>('[data-rise]').forEach((el) =>
        gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }),
      )
    },
    { scope: root },
  )

  const f = FLOORS[active]
  return (
    <div ref={root} style={{ background: PAPER, color: INK, fontFamily: SANS }}>
      {/* Hero */}
      <section className="relative grid min-h-[100svh] grid-cols-[auto_1fr] overflow-hidden lg:grid-cols-[auto_1fr_0.9fr]">
        {/* the name, standing */}
        <div className="relative flex border-r px-2 sm:px-4 md:px-6" style={{ borderColor: 'rgba(28,27,24,0.15)' }}>
          <h1
            aria-label="Verticale"
            className="flex select-none flex-col items-center justify-center py-6 font-medium leading-[0.86]"
            style={{ fontFamily: SERIF, fontSize: 'clamp(2.6rem, 10.4svh, 7.4rem)', fontVariationSettings: '"opsz" 96' }}
          >
            {'VERTICALE'.split('').map((c, i) => (
              <span key={i} data-letter aria-hidden className="block" style={{ color: i === 0 ? BRASS : INK }}>
                {c}
              </span>
            ))}
          </h1>
        </div>

        <div className="flex min-w-0 flex-col px-5 py-6 md:px-12 md:py-9">
          <header className="flex items-center justify-between gap-6 whitespace-nowrap text-[0.72rem] uppercase tracking-[0.22em]">
            <span className="font-semibold">Résidence Verticale</span>
            <nav aria-label="Verticale" className="hidden items-center gap-6 2xl:flex">
              {[
                ['etages', 'Les étages'],
                ['lots', 'Appartements'],
                ['quartier', 'Le quartier'],
              ].map(([id, t]) => (
                <a key={id} href={`#${id}`} onClick={(e) => (e.preventDefault(), go(id))} className="opacity-70 transition-opacity hover:opacity-100">
                  {t}
                </a>
              ))}
            </nav>
            <a href="#contact" onClick={(e) => (e.preventDefault(), go('contact'))} className="border px-4 py-2.5 transition-colors hover:bg-[#1c1b18] hover:text-[#f5f1e9]" style={{ borderColor: INK }}>
              Brochure
            </a>
          </header>

          <div className="my-auto max-w-xl py-12">
            <p data-hero-in className="mb-6 text-[0.72rem] uppercase tracking-[0.24em]" style={{ color: BRASS }}>
              Bourgogne, Casablanca · Livraison fin 2027
            </p>
            <p data-hero-in className="text-[clamp(2.4rem,5.2vw,4.9rem)] leading-[1.02] tracking-[-0.02em]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 72' }}>
              Vingt-quatre appartements, <em style={{ color: BRASS }}>l’un au-dessus de l’autre.</em>
            </p>
            <p data-hero-in className="mt-6 max-w-md text-lg leading-relaxed opacity-75">
              Une tour de six niveaux à deux rues de la corniche : des deux-chambres aux penthouses, un jardin en cœur d’îlot et un rooftop partagé.
            </p>
            <div data-hero-in className="mt-9 flex flex-wrap gap-3">
              <a href="#lots" onClick={(e) => (e.preventDefault(), go('lots'))} className="px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#f5f1e9] transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: INK }}>
                Voir les appartements
              </a>
              <a href="#contact" onClick={(e) => (e.preventDefault(), go('contact'))} className="border px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5 active:scale-[0.98]" style={{ borderColor: INK }}>
                Visiter l’appartement témoin
              </a>
            </div>
          </div>

          <dl data-hero-in className="grid grid-cols-3 border-t pt-5" style={{ borderColor: 'rgba(28,27,24,0.15)' }}>
            {[
              ['Niveaux', '6'],
              ['Surfaces', '82 – 210 m²'],
              ['À partir de', '1,64 M MAD'],
            ].map(([k, v], i) => (
              <div key={k} className={i ? 'border-l pl-4 md:pl-6' : ''} style={{ borderColor: 'rgba(28,27,24,0.15)' }}>
                <dt className="text-[0.66rem] uppercase tracking-[0.2em] opacity-55">{k}</dt>
                <dd className="mt-1 whitespace-nowrap text-[clamp(0.95rem,2vw,1.6rem)]" style={{ fontFamily: SERIF }}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* the façade, standing */}
        <div className="relative hidden lg:block">
          <div data-hero-photo className="absolute inset-y-0 left-0 right-0">
            <Photo eager zoom={false} {...PHOTO.facade} pos="50% 20%" />
          </div>
          <div className="absolute inset-y-0 right-0 w-64" style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.28), transparent)' }} aria-hidden />
          <ol className="absolute right-6 top-1/2 flex -translate-y-1/2 flex-col gap-3 text-right text-[0.7rem] tracking-[0.2em] text-white" aria-hidden>
            {[...FLOORS].reverse().map((fl) => (
              <li key={fl.lvl} className="flex items-center justify-end gap-3 drop-shadow">
                N{fl.lvl}
                <span className="h-px w-6 bg-white/80" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* on a phone the façade follows the hero */}
      <div className="relative h-[70svh] lg:hidden">
        <Photo {...PHOTO.facade} pos="50% 20%" />
      </div>

      {/* The tower opens */}
      <section id="etages" data-explode className="relative flex h-screen items-center overflow-hidden px-5 text-[#f5f1e9] md:px-12" style={{ background: GREEN }}>
        {/* vertical rules, like the joints of the stone */}
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(90deg, rgba(245,241,233,0.06) 1px, transparent 1px)', backgroundSize: '12.5% 100%' }} aria-hidden />
        <div className="relative grid w-full items-center gap-6 md:grid-cols-[auto_1.15fr_1fr] md:gap-10">
          {/* the floor rail */}
          <ol className="hidden flex-col gap-2 md:flex" aria-hidden>
            {[...FLOORS].reverse().map((fl) => {
              const on = fl.lvl === f.lvl
              return (
                <li key={fl.lvl} className="flex items-center gap-3 text-[0.7rem] tracking-[0.2em] transition-opacity duration-300" style={{ opacity: on ? 1 : 0.4 }}>
                  <span className="block w-px transition-all duration-500" style={{ height: on ? 46 : 22, background: on ? BRASS_LIGHT : 'rgba(245,241,233,0.6)' }} />
                  N{fl.lvl}
                </li>
              )
            })}
          </ol>

          <div className="flex h-[42vh] items-center justify-center md:h-[62vh]" style={{ perspective: 1800 }}>
            <div ref={stack} className="relative h-[min(46vw,300px)] w-[min(46vw,300px)]" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(62deg) rotateZ(-42deg)' }}>
              {FLOORS.map((fl, i) => {
                const on = i === active
                return (
                  <div
                    key={fl.lvl}
                    data-floor
                    className="absolute inset-0 transition-[background-color,border-color] duration-300"
                    style={{
                      transform: `translateZ(${i * 14}px)`,
                      transformStyle: 'preserve-3d',
                      border: `1px solid ${on ? BRASS_LIGHT : 'rgba(245,241,233,0.55)'}`,
                      background: on ? BRASS : 'rgba(24,35,30,0.78)',
                      backgroundImage: on
                        ? 'linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)'
                        : 'linear-gradient(90deg, rgba(245,241,233,0.14) 1px, transparent 1px)',
                      backgroundSize: '25% 100%',
                      boxShadow: on ? `0 0 60px 4px rgba(210,173,116,0.35)` : undefined,
                    }}
                  >
                    <span className="absolute -left-12 top-1/2 text-xs tracking-[0.2em]" style={{ color: on ? BRASS_LIGHT : 'rgba(245,241,233,0.7)', transform: 'rotateZ(42deg) rotateX(-62deg)' }}>
                      N{fl.lvl}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[0.72rem] uppercase tracking-[0.24em]" style={{ color: BRASS_LIGHT }}>
              Niveau {f.lvl}
            </p>
            <h2 className="mt-3 text-[clamp(2.3rem,5vw,4.6rem)] leading-[0.98]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 72' }}>
              {f.name}
            </h2>
            <dl className="mt-6 grid grid-cols-2 gap-6 border-t pt-5 text-sm" style={{ borderColor: 'rgba(245,241,233,0.2)' }}>
              <div>
                <dt className="text-[0.66rem] uppercase tracking-[0.2em] opacity-55">Surface</dt>
                <dd className="mt-1 text-2xl md:text-3xl" style={{ fontFamily: SERIF }}>
                  {f.area}
                </dd>
              </div>
              <div>
                <dt className="text-[0.66rem] uppercase tracking-[0.2em] opacity-55">Programme</dt>
                <dd className="mt-1 text-lg">{f.rooms}</dd>
              </div>
            </dl>
            <div className="relative mt-6 hidden aspect-[4/3] max-w-sm overflow-hidden md:block">
              {FLOORS.map((fl, i) => (
                <div key={fl.lvl} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: i === active ? 1 : 0 }}>
                  <Photo src={fl.photo.src} alt={i === active ? fl.photo.alt : ''} zoom={false} />
                </div>
              ))}
            </div>
            <p className="mt-5 max-w-sm opacity-75">{f.note}</p>
          </div>
        </div>
      </section>

      {/* Four numbers, standing */}
      <section className="grid grid-cols-2 border-b md:grid-cols-4" style={{ background: STONE, borderColor: 'rgba(28,27,24,0.15)' }}>
        {[
          ['3,10 m', 'sous plafond, à tous les étages'],
          ['1 200 m²', 'de jardin en cœur d’îlot'],
          ['2 niveaux', 'de parking, une place par lot'],
          ['T4 2027', 'livraison, garantie d’achèvement'],
        ].map(([k, v], i) => (
          <div key={k} data-rise className={`flex min-h-[15rem] flex-col justify-end border-r px-5 py-8 md:min-h-[22rem] md:px-8 ${i % 2 ? '' : ''}`} style={{ borderColor: 'rgba(28,27,24,0.15)' }}>
            <p className="text-[clamp(2.2rem,4.4vw,4rem)] leading-none" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 72' }}>
              {k}
            </p>
            <p className="mt-3 max-w-[14rem] text-sm opacity-70">{v}</p>
          </div>
        ))}
      </section>

      <ResidenceSales />
    </div>
  )
}
