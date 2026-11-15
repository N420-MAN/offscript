import { DEMOS, preview, previewSet } from '../../demos/meta'
import { PROJECTS } from '../../data/projects'
import { preload } from '../ui/windows/shared'

/** The quiet label every concept project carries: visible, honest, never louder than the work. */
export function ConceptLabel({ className = '' }: { className?: string }) {
  return <span className={`label inline-flex items-center gap-1.5 text-[0.62rem] tracking-[0.16em] text-bone/55 ${className}`}><span aria-hidden className="h-1 w-1 rounded-full bg-signal" />Projet conceptuel</span>
}

/**
 * The work, laid flat. The floating windows are the spectacle; this is the index a visitor can read, compare and
 * return to (and the one that works best on a phone). Every card leads to the project's page.
 */
export default function Work() {
  return (
    <section id="travaux" aria-labelledby="travaux-title" className="relative scroll-mt-0 bg-void px-5 pb-28 pt-12 md:px-10 md:py-40">
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="label mb-6 text-signal">03 — Projets</p>
          <h2 id="travaux-title" className="display text-[clamp(2.8rem,8vw,7.5rem)]">
            Des projets. <span className="serif-accent text-signal" style={{ fontSize: '1.05em' }}>Des univers.</span>
          </h2>
        </div>
        <div className="md:col-span-4">
          <p className="max-w-md text-base leading-relaxed text-bone/75 md:text-lg">
            Chaque projet commence par une vision. Voici quelques explorations de ce que le digital peut devenir.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ash">
            Ces projets sont des concepts conçus et développés par le studio, pas des commandes de clients.
          </p>
        </div>
      </div>

      <ul className="mt-16 grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 md:mt-24 lg:grid-cols-12">
        {DEMOS.map((d, i) => {
          const p = PROJECTS.find((x) => x.slug === d.slug)!
          const wide = i < 2
          return (
            <li key={d.slug} id={`projet-${d.slug}`} className={`scroll-mt-8 ${wide ? 'lg:col-span-6' : 'lg:col-span-3'}`}>
              <a
                href={`#/projet/${d.slug}`}
                onPointerEnter={() => void preload[d.slug]()}
                onFocus={() => void preload[d.slug]()}
                className="work-card group block"
              >
                <div className="relative overflow-hidden rounded-[14px] border border-bone/10 bg-graphite">
                  <div className="flex h-7 items-center gap-1.5 border-b border-bone/10 px-3" aria-hidden>
                    <span className="h-2 w-2 rounded-full bg-bone/25" />
                    <span className="h-2 w-2 rounded-full bg-bone/25" />
                    <span className="h-2 w-2 rounded-full bg-bone/25" />
                    <span className="label ml-3 truncate text-[0.6rem] text-ash">{d.kind}</span>
                  </div>
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={preview(d.slug)}
                      srcSet={previewSet(d.slug)}
                      sizes={wide ? '(min-width: 1024px) 48vw, (min-width: 640px) 48vw, 92vw' : '(min-width: 1024px) 23vw, (min-width: 640px) 48vw, 92vw'}
                      alt={`${d.name}, site conceptuel pour ${d.kind.toLowerCase()} : aperçu de la page d’accueil`}
                      loading="lazy"
                      decoding="async"
                      width={1200}
                      height={750}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <span className="label text-[0.7rem] text-signal">{p.category}</span>
                  <ConceptLabel />
                </div>
                <h3 className={`display mt-2 ${wide ? 'text-[clamp(2rem,3.2vw,3rem)]' : 'text-[clamp(1.6rem,2vw,1.9rem)]'}`}>
                  <span className="link-draw">{d.name}</span>
                </h3>
                <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-bone/70">{p.summary}</p>
                <span className="label mt-4 inline-flex items-center gap-2 text-[0.75rem] text-bone/85 transition-colors group-hover:text-signal">
                  Explorer le projet <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
