import { useState } from 'react'
import { EXPERTISES } from '../../data/site'

/**
 * A vermilion band of the studio's trades, the one loud colour block on the page. It slides slowly, stops on hover,
 * can be paused, and stands still under reduced motion.
 */
export default function Band() {
  const [paused, setPaused] = useState(false)
  const words = EXPERTISES.flatMap((e) => [e.title, ...e.items.slice(0, 2)])
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {words.map((w, i) => (
        <li key={i} className="flex items-center">
          <span className={`display whitespace-nowrap px-6 text-[clamp(2.6rem,6vw,5.6rem)] md:px-10 ${i % 3 === 0 ? 'text-void' : 'text-transparent'}`} style={i % 3 === 0 ? undefined : { WebkitTextStroke: '1.5px #08090b' }}>
            {w}
          </span>
          <span aria-hidden className="display text-[clamp(2.6rem,6vw,5.6rem)] text-bone">/</span>
        </li>
      ))}
    </ul>
  )
  return (
    <section aria-label="Nos métiers" className="band group relative overflow-hidden bg-signal py-8 md:py-12" data-paused={paused || undefined}>
      <div className="band-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className="label absolute bottom-2 right-3 grid min-h-11 min-w-11 place-items-center rounded-full px-3 text-void/70 transition-colors hover:text-void md:bottom-3 md:right-5"
      >
        {paused ? 'Lecture' : 'Pause'}
      </button>
    </section>
  )
}
