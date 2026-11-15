import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { DEMOS, type DemoSlug } from '../demos/meta'
import { PROJECTS } from '../data/projects'
import { ConceptLabel } from '../components/sections/Work'
import { goHome } from '../lib/route'
import { prefersReducedMotion } from '../hooks/useCapabilities'

gsap.registerPlugin(ScrollTrigger)

/** Screenshots of the live concept, taken at desktop (1440×900) and phone (390×844) sizes. */
const shot = (slug: string, name: string) => `/projects/${slug}/${name}.webp`

function Browser({ src, alt, eager }: { src: string; alt: string; eager?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-[14px] border border-bone/10 bg-graphite shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8)]">
      <div className="flex h-8 items-center gap-1.5 border-b border-bone/10 px-4" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-bone/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-bone/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-bone/20" />
      </div>
      <img src={src} alt={alt} width={1440} height={900} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" className="block aspect-[16/10] w-full object-cover object-top" />
    </figure>
  )
}

function Phone({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="mx-auto w-full max-w-[19rem] rounded-[2.4rem] border border-bone/15 bg-graphite p-2.5 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8)]">
      <img src={src} alt={alt} width={390} height={844} loading="lazy" decoding="async" className="block aspect-[390/844] w-full rounded-[1.9rem] object-cover object-top" />
    </figure>
  )
}

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section data-reveal className="grid gap-8 border-t border-bone/15 py-16 md:grid-cols-12 md:gap-10 md:py-24">
      <div className="md:col-span-4">
        <p className="label mb-4 text-signal">{n}</p>
        <h2 className="display text-[clamp(2.2rem,4.6vw,4.2rem)]">{title}</h2>
      </div>
      <div className="md:col-span-8">{children}</div>
    </section>
  )
}

export default function ProjectPage({ slug }: { slug: DemoSlug }) {
  const meta = DEMOS.find((d) => d.slug === slug)!
  const p = PROJECTS.find((x) => x.slug === slug)!
  const at = DEMOS.findIndex((d) => d.slug === slug)
  const next = DEMOS[(at + 1) % DEMOS.length]
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    const title = document.title
    const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const before = desc?.content ?? ''
    document.title = `${meta.name} — Projet conceptuel ${p.category.toLowerCase()} | OFFSCRIPT`
    if (desc) desc.content = `${meta.name}, projet conceptuel du studio OFFSCRIPT : ${p.summary}`
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && goHome(`projet-${slug}`)
    window.addEventListener('keydown', onKey)
    return () => {
      document.title = title
      if (desc) desc.content = before
      window.removeEventListener('keydown', onKey)
    }
  }, [meta, p, slug])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-rise]', { yPercent: 108, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.1 })
      gsap.from('[data-in]', { y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.35 })
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) =>
        gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }),
      )
    },
    { scope: root, dependencies: [slug] },
  )

  const live = `#/demo/${slug}?from=projet`

  return (
    <div ref={root} className="min-h-screen bg-void text-bone">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-bone/10 bg-void/90 px-5 py-4 backdrop-blur md:px-10">
        <a href="#/" onClick={(e) => (e.preventDefault(), goHome(`projet-${slug}`))} className="label inline-flex min-h-11 items-center gap-2 text-bone/80 transition-colors hover:text-bone">
          <span aria-hidden>←</span> <span className="hidden sm:inline">Tous les projets</span><span className="sm:hidden">Projets</span>
        </a>
        <a href="#/" onClick={(e) => (e.preventDefault(), goHome('top'))} className="font-display text-xl font-extrabold tracking-[-0.04em] md:text-2xl" aria-label="OFFSCRIPT — accueil">
          OFF<span className="text-signal">/</span>SCRIPT
        </a>
        <a href="#/" onClick={(e) => (e.preventDefault(), goHome('formulaire'))} className="btn label inline-flex min-h-11 items-center gap-2 rounded-full border border-signal px-4 text-[0.8rem] hover:bg-signal hover:text-void md:px-5">
          Contact <span aria-hidden>↗</span>
        </a>
      </header>

      <main className="px-5 md:px-10">
        {/* A. Introduction */}
        <section className="pb-16 pt-14 md:pb-24 md:pt-24">
          <div data-in className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="label text-signal">{p.category}</span>
            <ConceptLabel className="text-bone/65" />
          </div>
          <h1 className="display mt-6 text-[clamp(3.6rem,13vw,13rem)] leading-[0.86]">
            <span className="block overflow-hidden pb-[0.05em]">
              <span data-rise className="block">{meta.name}</span>
            </span>
          </h1>
          <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-12">
            <p data-in className="max-w-2xl text-lg leading-relaxed text-bone/85 md:col-span-7 md:text-xl">{p.overview}</p>
            <dl data-in className="grid grid-cols-2 gap-6 md:col-span-4 md:col-start-9">
              <div>
                <dt className="label text-ash">Secteur</dt>
                <dd className="mt-1">{p.category}</dd>
              </div>
              <div>
                <dt className="label text-ash">Nature</dt>
                <dd className="mt-1">Projet conceptuel</dd>
              </div>
              <div className="col-span-2">
                <a href={live} className="btn label inline-flex min-h-11 items-center gap-2 rounded-full bg-bone px-6 py-3.5 text-void hover:bg-signal">
                  Voir le site en direct <span aria-hidden>↗</span>
                </a>
              </div>
            </dl>
          </div>
          <div data-in className="mt-14 md:mt-20">
            <Browser src={shot(slug, 'desktop-1')} alt={`${meta.name} : page d’accueil du site conceptuel, sur ordinateur`} eager />
          </div>
        </section>

        {/* B. Vision */}
        <Block n="01" title="La vision">
          <p className="max-w-2xl text-lg leading-relaxed text-bone/80">{p.vision}</p>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ash">
            Contexte hypothétique : {meta.name} est un concept créé par le studio pour explorer ce que le web peut apporter à ce secteur. Ce n’est pas un client réel.
          </p>
        </Block>

        {/* C. Creative direction */}
        <Block n="02" title="Direction créative">
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            <div>
              <h3 className="label mb-3 text-ash">Identité visuelle</h3>
              <p className="leading-relaxed text-bone/85">{p.direction.identity}</p>
            </div>
            <div>
              <h3 className="label mb-3 text-ash">Typographie</h3>
              <p className="leading-relaxed text-bone/85">{p.direction.type}</p>
            </div>
            <div className="sm:col-span-2">
              <h3 className="label mb-4 text-ash">Couleurs</h3>
              <ul className="flex flex-wrap gap-4">
                {p.direction.palette.map(([name, hex]) => (
                  <li key={hex} className="flex items-center gap-3">
                    <span className="h-14 w-14 rounded-full border border-bone/15" style={{ background: hex }} aria-hidden />
                    <span>
                      <span className="block text-bone/90">{name}</span>
                      <span className="label text-[0.7rem] text-ash">{hex}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="label mb-3 text-ash">Choix de design</h3>
              <p className="leading-relaxed text-bone/85">{p.direction.decisions}</p>
            </div>
            <div>
              <h3 className="label mb-3 text-ash">Expérience utilisateur</h3>
              <p className="leading-relaxed text-bone/85">{p.direction.ux}</p>
            </div>
          </div>
        </Block>

        {/* D. Development */}
        <Block n="03" title="Développement">
          <ul className="space-y-5">
            {p.development.map((d, i) => (
              <li key={i} className="flex gap-5 border-b border-bone/10 pb-5 last:border-0">
                <span className="label pt-1 text-signal">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-lg leading-relaxed text-bone/85">{d}</span>
              </li>
            ))}
          </ul>
          <p className="label mt-8 text-[0.7rem] text-ash">React · TypeScript · GSAP{slug === 'rental' ? ' · three.js' : ''} · responsive</p>
        </Block>

        {/* E. Showcase */}
        <section data-reveal className="border-t border-bone/15 py-16 md:py-24" aria-labelledby="apercu">
          <p className="label mb-4 text-signal">04</p>
          <h2 id="apercu" className="display text-[clamp(2.2rem,4.6vw,4.2rem)]">Aperçu</h2>
          <div className="mt-12 grid items-start gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <Browser src={shot(slug, 'desktop-2')} alt={`${meta.name} : une section intérieure du site, sur ordinateur`} />
            </div>
            <div className="grid grid-cols-2 gap-5 md:col-span-4 md:grid-cols-1 lg:grid-cols-2">
              <Phone src={shot(slug, 'mobile-1')} alt={`${meta.name} : page d’accueil sur téléphone`} />
              <Phone src={shot(slug, 'mobile-2')} alt={`${meta.name} : une section intérieure sur téléphone`} />
            </div>
          </div>
          <a href={live} className="btn label mt-12 inline-flex min-h-11 items-center gap-2 rounded-full border border-bone/30 px-6 py-3.5 hover:border-signal hover:text-signal">
            Explorer le site en direct <span aria-hidden>↗</span>
          </a>
        </section>

        {/* F. CTA */}
        <section data-reveal className="border-t border-bone/15 py-24 md:py-36">
          <h2 className="display max-w-[14ch] text-[clamp(2.8rem,8vw,7.5rem)]">
            Vous avez un projet <span className="serif-accent text-signal" style={{ fontSize: '1.05em' }}>similaire ?</span>
          </h2>
          <a href="#/" onClick={(e) => (e.preventDefault(), goHome('formulaire'))} className="btn label mt-10 inline-flex items-center gap-2 rounded-full bg-signal px-8 py-4 text-void hover:bg-bone">
            Créons le vôtre <span aria-hidden>↗</span>
          </a>
        </section>
      </main>

      <footer className="border-t border-bone/15 px-5 py-10 md:px-10">
        <a href={`#/projet/${next.slug}`} className="group flex flex-wrap items-baseline justify-between gap-4">
          <span className="label text-ash">Projet suivant</span>
          <span className="display text-[clamp(2.2rem,6vw,5rem)] transition-colors group-hover:text-signal">
            {next.name} <span aria-hidden>→</span>
          </span>
        </a>
        <p className="label mt-10 text-ash">© {new Date().getFullYear()} OFFSCRIPT · Casablanca, Maroc</p>
      </footer>
    </div>
  )
}
