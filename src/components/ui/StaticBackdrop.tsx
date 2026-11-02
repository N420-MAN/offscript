/** Instant, non-WebGL composition shown before (or instead of) the 3D scene. */
export default function StaticBackdrop() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 68% 50%, rgba(255,75,31,0.10), transparent 70%), #08090b',
        }}
      />
    </div>
  )
}
