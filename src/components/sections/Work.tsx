import { DEMOS } from '../../demos/meta'
import { openDemoFrom } from '../../lib/openDemo'
import { preload } from '../ui/windows/shared'

/**
 * The work, laid flat. The floating windows are the spectacle; this is the index a visitor can read, compare and
 * return to (and the one that works best on a phone). Every card opens its demo with the demo's own reveal.
 */
export default function Work() {
  return (
    <section id="travaux" aria-labelledby="travaux-title" className="relative bg-void px-5 pb-28 pt-12 md:px-10 md:py-40">
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="label mb-6 text-signal">03 — Projets</p>
          <h2 id="travaux-title" className="display text-[clamp(2.8rem,8vw,7.5rem)]">
            Dix sites, <span className="serif-accent text-signal" style={{ fontSize: '1.05em' }}>dix univers.</span>
          </h2>
        </div>
        <p className="max-w-md text-base leading-relaxed text-bone/75 md:col-span-4 md:text-lg">
          Des démonstrations conçues par le studio, chacune avec sa typographie, sa palette et sa propre transition. Ouvrez-en une, revenez, comparez.
        </p>
      </div>

      <ul className="mt-16 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 md:mt-24 lg:grid-cols-12">
        {DEMOS.map((d, i) => (
          <li key={d.slug} className={i < 2 ? 'lg:col-span-6' : 'lg:col-span-3'}>
            <a
              href={`#/demo/${d.slug}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                e.preventDefault()
                const frame = e.currentTarget.querySelector<HTMLElement>('[data-frame]')
                openDemoFrom(d.slug, frame ?? e.currentTarget)
              }}
              onPointerEnter={() => void preload[d.slug]()}
              onFocus={() => void preload[d.slug]()}
              className="work-card group block"
            >
              <div data-frame className="relative overflow-hidden rounded-[14px] border border-bone/10 bg-graphite">
                <div className="flex h-7 items-center gap-1.5 border-b border-bone/10 px-3" aria-hidden>
                  <span className="h-2 w-2 rounded-full bg-bone/25" />
                  <span className="h-2 w-2 rounded-full bg-bone/25" />
                  <span className="h-2 w-2 rounded-full bg-bone/25" />
                  <span className="label ml-3 truncate text-[0.6rem] text-ash">{d.kind}</span>
                </div>
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={`/demos/${d.slug}.jpg`}
                    alt={`${d.name}, ${d.kind.toLowerCase()} : aperçu du site`}
                    loading="lazy"
                    decoding="async"
                    width={1200}
                    height={750}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <span
                  aria-hidden
                  className="absolute bottom-3 right-3 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-bone text-void opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                >
                  ↗
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h3 className={`display ${i < 2 ? 'text-[clamp(1.8rem,3vw,2.8rem)]' : 'text-[1.7rem]'}`}>
                  <span className="link-draw">{d.name}</span>
                </h3>
                <span className="label shrink-0 text-ash">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className="mt-1 text-sm text-bone/60">
                {d.kind} · <span className="serif-accent text-base text-bone/80">{d.tagline}</span>
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
