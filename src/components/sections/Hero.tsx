import { useEffect, useState } from 'react'

const NAV = [
  ['Studio', '#studio'],
  ['Expertises', '#expertises'],
  ['Projets', '#projets'],
  ['Contact', '#contact'],
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const on = () => setSolid(window.scrollY > window.innerHeight * 2.5)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
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
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-5 py-5 transition-[background,backdrop-filter] duration-500 md:px-10 md:py-8 ${solid ? 'bg-void/70 backdrop-blur-md' : ''}`}
      >
        <a href="#/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0 }) }} className="pointer-events-auto font-display text-2xl font-extrabold tracking-[-0.04em] md:text-[2rem]" aria-label="OFFSCRIPT — accueil">
          OFF<span className="text-signal">/</span>SCRIPT
        </a>
        <nav aria-label="Navigation principale" className="pointer-events-auto hidden gap-10 md:flex">
          {NAV.map(([label, href]) => (
            <a key={label} href={href} className="label text-[0.95rem] text-bone/80 transition-colors hover:text-bone">{label}</a>
          ))}
        </nav>
        <p className="label hidden text-right text-[0.85rem] leading-snug text-bone/70 md:block">
          Casablanca, Maroc
          <br />
          Digital studio
        </p>
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
              <a key={label} href={href} onClick={() => setOpen(false)} className="display text-[clamp(3rem,15vw,5rem)] transition-colors active:text-signal">{label}</a>
            ))}
          </nav>
          <p className="label pb-4 text-ash">Casablanca, Maroc · Digital studio</p>
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
      className={`pointer-events-none absolute inset-0 flex items-end px-5 pb-8 md:px-10 md:pb-10 ${front ? 'z-20' : 'z-0'}`}
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
          className="display text-[clamp(3.2rem,11.5vw,10.5rem)]"
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
        <p {...(front ? { 'data-hero-sub': '' } : {})} className={`mt-6 max-w-md text-base leading-relaxed text-bone/80 md:text-lg ${hide(front)}`}>
          Nous créons des expériences digitales{' '}
          <span className="serif-accent text-xl md:text-2xl">qui ne ressemblent à aucune autre.</span>
        </p>
        <div {...(front ? { 'data-hero-sub': '' } : {})} className={`mt-8 flex flex-wrap items-center gap-3 ${hide(front)}`}>
          <a
            href="#expertises"
            className="label pointer-events-auto rounded-full bg-bone px-6 py-3.5 text-void transition-colors hover:bg-signal"
          >
            Découvrir notre univers
          </a>
          <a
            href="#contact"
            className="label pointer-events-auto rounded-full border border-bone/30 px-6 py-3.5 transition-colors hover:border-signal hover:text-signal"
          >
            Parlons de votre projet
          </a>
        </div>
      </section>
    </div>
  )
}
