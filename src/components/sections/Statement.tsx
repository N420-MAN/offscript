/** Section A: appears as the ribbon has shattered into the staircase. Opacity is driven by scroll (see useStageScroll). */
export default function Statement() {
  return (
    <section
      data-statement
      className="pointer-events-none absolute inset-0 z-20 flex items-start px-5 pt-24 opacity-0 md:items-center md:px-10 md:pt-0"
      aria-labelledby="statement-title"
    >
      <div className="max-w-[44rem]">
        <p className="label mb-5 text-signal">01 — Le constat</p>
        <h2 id="statement-title" className="display text-[clamp(2.4rem,7.2vw,6.4rem)]">
          Le digital ne devrait jamais être{' '}
          <span className="serif-accent text-signal" style={{ fontSize: '1.05em' }}>
            ordinaire.
          </span>
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed text-bone/80 md:text-lg">
          Un site web est souvent le premier contact entre une entreprise et son futur client. Nous pensons qu’il mérite
          bien plus qu’une simple présence en ligne.
        </p>
      </div>
    </section>
  )
}
