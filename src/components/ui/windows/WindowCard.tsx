import { preview, type DEMOS } from '../../../demos/meta'
import { BAR } from './shared'

/** One floating demo window (presentation only: FloatingWindows owns its position, rotation and interaction). */
export function WindowCard({ demo: d, setRef }: { demo: (typeof DEMOS)[number]; setRef: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={setRef}
      role="button"
      tabIndex={0}
      aria-label={`Ouvrir ${d.name}, ${d.kind}`}
      className="group pointer-events-auto absolute left-0 top-0 cursor-pointer touch-none pointer-coarse:touch-pan-y select-none overflow-hidden rounded-[10px] border border-white/15 bg-[#0b1020] will-change-transform active:cursor-grabbing"
      style={{ width: 220, height: 160 }}
    >
      <div className="flex items-center gap-1.5 px-2.5" style={{ height: BAR, background: '#141a2e' }}>
        <i className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <i className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <i className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate font-mono text-[0.6rem] text-white/50">{d.kind}</span>
      </div>
      <img src={preview(d.slug)} alt="" draggable={false} className="pointer-events-none block w-full" style={{ height: `calc(100% - ${BAR}px)`, objectFit: 'cover' }} />
      <div data-dim className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-10">
        <span className="text-[0.85rem] font-semibold leading-tight text-white">
          {d.name}
          <span className="block font-mono text-[0.58rem] font-normal uppercase tracking-wider text-white/70">{d.kind}</span>
        </span>
        <span className="font-mono text-[0.6rem] uppercase tracking-wider text-signal">Démo ↗</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-data-[lit=true]:opacity-100" style={{ top: BAR }}>
        <span className="label rounded-full bg-signal px-4 py-2 text-[0.7rem] text-void shadow-lg">Ouvrir la démo ↗</span>
      </div>
    </div>
  )
}
