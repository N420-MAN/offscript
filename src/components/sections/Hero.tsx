import { useEffect, useState } from 'react'
import { NAV as LINKS } from '../../data/site'

const NAV = [...LINKS, ['Contact', '#contact']] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const [current, setCurrent] = useState('')

  useEffect(() => {
    const on = () => {
      setSolid(window.scrollY > window.innerHeight * 2.5)
      // the section the visitor is in: the one whose top is nearest above the middle of the screen
      let cur = ''
      let best = -Infinity
      for (const [, href] of NAV) {
        if (href === '#top') continue
        const el = document.querySelector(href)
        const top = el ? el.getBoundingClientRect().top : Infinity
        if (top <= window.innerHeight * 0.5 && top > best) {
          best = top
          cur = href
        }
      }
      setCurrent(cur)
    }
    on()
    // measured at most once per frame: scroll events can fire several times a frame, each forcing a layout read
    let queued = 0
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(() => ((queued = 0), on()))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(queued)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', key)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', key)
    }
  }, [open])

  return (
    <>
      <header
        data-hero-header
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-5 py-5 transition-[background,backdrop-filter] duration-500 md:px-10 md:py-8 ${solid ? 'bg-void/90' : ''}`}
      >
        <a href="#/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0 }) }} className="pointer-events-auto font-display text-2xl font-extrabold tracking-[-0.04em] md:text-[2rem]" aria-label="OFFSCRIPT — accueil">
          OFF<span className="text-signal">/</span>SCRIPT
        </a>
        <nav aria-label="Navigation principale" className="pointer-events-auto hidden gap-9 md:flex lg:gap-10">
          {LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              aria-current={current === href ? 'location' : undefined}
              className={`label relative text-[0.95rem] transition-colors hover:text-bone ${current === href ? 'text-bone' : 'text-bone/80'}`}
            >
              {label}
              <span aria-hidden="true" className={`absolute -bottom-1.5 left-0 h-px bg-signal transition-all duration-300 ${current === href ? 'w-full' : 'w-0'}`} />
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          aria-current={current === '#contact' ? 'location' : undefined}
          className="btn group label pointer-events-auto hidden items-center gap-2 rounded-full border border-signal px-5 py-2.5 text-[0.85rem] text-bone transition-colors hover:bg-signal hover:text-void md:inline-flex"
        >
          Contact <span aria-hidden className="text-signal transition-colors group-hover:text-void">↗</span>
        </a>
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu" className="label pointer-events-auto rounded-full border border-bone/30 px-5 py-2.5 text-[0.85rem] md:hidden">
          Menu
        </button>
      </header>
      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[60] flex flex-col bg-void px-5 py-5 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-extrabold tracking-[-0.04em]">OFF<span className="text-signal">/</span>SCRIPT</span>
            <button type="button" autoFocus onClick={() => setOpen(false)} className="label rounded-full border border-bone/30 px-4 py-2">Fermer</button>
          </div>
          <nav aria-label="Navigation mobile" className="mt-16 flex flex-1 flex-col gap-3">
            {NAV.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setOpen(false)} className={`display text-[clamp(3rem,15vw,5rem)] transition-colors active:text-signal ${href === '#contact' ? 'text-signal' : ''}`}>{label}</a>
            ))}
          </nav>
          <p className="label pb-4 text-ash">Studio de web design &amp; développement · Casablanca</p>
        </div>
      )}
    </>
  )
}

/**
 * The hero copy is rendered twice at identical layout: a back layer under the 3D canvas
 * (lines 1–2) and a front layer over it (line 3 + copy + CTAs). The ribbon therefore
 * passes between the words, in front of some and behind others.
 */
export function HeroLayer({ layer, variant = 'script' }: { layer: 'back' | 'front'; variant?: 'script' | 'ideas' }) {
  const front = layer === 'front'
  const hide = (show: boolean) => (show ? '' : 'invisible')

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-end px-5 pb-8 pt-24 md:px-10 md:pb-10 md:pt-28 ${front ? 'z-20' : 'z-0'}`}
      aria-hidden={!front}
    >
      <section data-hero-fade className={variant === 'ideas' ? 'max-w-[64rem]' : 'max-w-[46rem]'}>
        {variant === 'ideas' ? (
          <h1 className="display text-[clamp(2.4rem,6.6vw,6.2rem)]" {...(front ? { 'aria-label': 'Nous transformons vos idées en expériences digitales.' } : {})}>
            <span className={`block overflow-hidden pb-[0.04em] ${hide(!front)}`}>
              <span data-hero-line className="block">Nous transformons</span>
            </span>
            <span className={`block overflow-hidden pb-[0.04em] ${hide(!front)}`}>
              <span data-hero-line className="block">vos idées en</span>
            </span>
            <span className={`block overflow-hidden pb-[0.04em] text-signal ${hide(front)}`}>
              <span data-hero-line className="block">expériences digitales.</span>
            </span>
          </h1>
        ) : (
          <h1
          className="display text-[clamp(2.4rem,min(11.5vw,calc((100svh-21rem)/2.9)),10.5rem)]"
          {...(front ? { 'aria-label': 'We don’t follow the script.' } : {})}
        >
          <span className={`block overflow-hidden pb-[0.04em] ${hide(!front)}`}>
            <span data-hero-line className="block">We don’t</span>
          </span>
          <span className={`block overflow-hidden pb-[0.04em] ${hide(!front)}`}>
            <span data-hero-line className="block">follow the</span>
          </span>
          <span className={`block overflow-hidden pb-[0.04em] text-signal ${hide(front)}`}>
            <span data-hero-line className="block">script.</span>
          </span>
          </h1>
        )}
        <p {...(front ? { 'data-hero-sub': '' } : {})} className={`mt-6 max-w-lg text-base leading-relaxed text-bone/85 md:text-lg [@media(max-height:520px)]:hidden ${hide(front)}`}>
          Nous concevons et développons des sites web distinctifs pour les entreprises qui veulent aller{' '}
          <span className="serif-accent text-xl md:text-2xl">au-delà de l’ordinaire.</span>
        </p>
        <p {...(front ? { 'data-hero-sub': '' } : {})} className={`label mt-4 max-w-lg text-[0.8rem] leading-relaxed text-bone/60 [@media(max-height:620px)]:hidden ${hide(front)}`}>
          Design stratégique. Développement sur mesure. Expériences digitales pensées pour durer.
        </p>
        <div {...(front ? { 'data-hero-sub': '' } : {})} className={`mt-8 flex flex-wrap items-center gap-3 ${hide(front)}`}>
          <a
            href="#contact"
            className="btn label pointer-events-auto rounded-full bg-bone px-6 py-3.5 text-void hover:bg-signal"
          >
            Parlons de votre projet <span aria-hidden>↗</span>
          </a>
          <a
            href="#travaux"
            className="btn label pointer-events-auto rounded-full border border-bone/30 px-6 py-3.5 hover:border-signal hover:text-signal"
          >
            Explorer nos projets <span aria-hidden>↓</span>
          </a>
        </div>
      </section>
    </div>
  )
}
