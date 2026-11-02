import { RING_R } from './shared'

export interface Spot {
  x: number
  y: number
  hw: number
  hh: number
}

/** Spread resting places in place so windows do not sit on each other, the copy (`textRect`) or the drop ring. */
export function relaxPoints(P: Spot[], W: number, H: number, HDR: number, textRect: DOMRect | null, ringC: { x: number; y: number }): void {
  for (let it = 0; it < 260; it++) {
    for (let i = 0; i < P.length; i++) {
      for (let j = i + 1; j < P.length; j++) {
        const a = P[i]
        const c = P[j]
        const dx = c.x - a.x
        const dy = c.y - a.y
        const ox = a.hw + c.hw + 14 - Math.abs(dx)
        const oy = a.hh + c.hh + 14 - Math.abs(dy)
        if (ox <= 0 || oy <= 0) continue
        if (ox < oy) {
          const sg = dx >= 0 ? 1 : -1
          a.x -= (sg * ox) / 2
          c.x += (sg * ox) / 2
        } else {
          const sg = dy >= 0 ? 1 : -1
          a.y -= (sg * oy) / 2
          c.y += (sg * oy) / 2
        }
      }
    }
    P.forEach((a) => {
      if (textRect) {
        const l = a.x + a.hw - textRect.x
        const r = textRect.x + textRect.width - (a.x - a.hw)
        const tp = a.y + a.hh - textRect.y
        const bt = textRect.y + textRect.height - (a.y - a.hh)
        if (l > 0 && r > 0 && tp > 0 && bt > 0) {
          // cheapest way out, with a preference for moving away to the right / below
          const opts: [number, () => void][] = [
            [l * 2.4, () => (a.x -= l)],
            [r, () => (a.x += r)],
            [tp * 1.4, () => (a.y -= tp)],
            [bt, () => (a.y += bt)],
          ]
          opts.sort((m, n) => m[0] - n[0])[0][1]()
        }
      }
      const rdx = a.x - ringC.x
      const rdy = a.y - ringC.y
      const rd = Math.hypot(rdx, rdy) || 1
      const need = RING_R + 14 + Math.min(a.hw, a.hh) * 0.9
      if (rd < need) {
        a.x += (rdx / rd) * (need - rd)
        a.y += (rdy / rd) * (need - rd)
      }
      a.x = Math.min(Math.max(a.x, a.hw + 10), W - a.hw - 10)
      a.y = Math.min(Math.max(a.y, HDR + a.hh + 8), H - a.hh - 10)
    })
  }
}
