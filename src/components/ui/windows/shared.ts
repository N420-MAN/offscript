import type { DemoSlug } from '../../../demos/meta'

/** Warm the demo's code chunk while the window is still growing, so the tear reveals a live page. */
export const preload: Record<DemoSlug, () => Promise<unknown>> = {
  medical: () => import('../../../demos/Medical'),
  hotel: () => import('../../../demos/Hotel'),
  residence: () => import('../../../demos/Residence'),
  restaurant: () => import('../../../demos/Restaurant'),
  shop: () => import('../../../demos/Shop'),
  ev: () => import('../../../demos/Volta'),
  ai: () => import('../../../demos/Synapse'),
  atelier: () => import('../../../demos/Atelier'),
  festival: () => import('../../../demos/Festival'),
  school: () => import('../../../demos/School'),
}

export interface Body {
  x: number // centre
  y: number
  vx: number
  vy: number
  w: number
  h: number
  s: number // depth scale: big = near, small = far
  sc: number // current scale (s × fly-in growth)
  en: number // 0..1 fly-in progress
  delay: number
  base: number // slowly drifting rest angle
  drift: number // deg/s of self-rotation
  wx: number // 3D tumble speeds / amplitudes
  wy: number
  Ax: number
  Ay: number
  ph: number
  ox: number // where the window is "born" in the break, as a fraction of the frame
  oy: number
  sa: number // extra spin / tumble it sheds while it settles into a demo window
  sx: number
  sy: number
  dim: HTMLElement | null
  lastBlur: string
  lastShadow: string
  hx: number // pointer position inside the window, -1..1, for the hover tilt
  hy: number
  calm: number // 0..1, squares the window up while it is held or hovered
  angle: number
  spin: number
  home: number
  rx: number
  ry: number
  fade: number
  ax: number // home position, as a fraction of the frame, eased toward until the visitor first touches the window
  ay: number
  free: boolean
  px: number
  py: number
  drag: boolean
  el: HTMLElement
}

export const BAR = 26
export const RING_R = 62
// Loose, uneven homes that keep the copy's area clear (desktop) or the lower half free (mobile).
export const HOMES_D: [number, number][] = [[0.52, 0.2], [0.72, 0.16], [0.9, 0.28], [0.62, 0.46], [0.82, 0.5], [0.5, 0.76], [0.68, 0.82], [0.9, 0.78], [0.34, 0.88], [0.38, 0.16]]
export const HOMES_M: [number, number][] = [[0.3, 0.56], [0.72, 0.52], [0.2, 0.7], [0.64, 0.68], [0.86, 0.82], [0.4, 0.84], [0.14, 0.92], [0.7, 0.94], [0.5, 0.6], [0.9, 0.62]]
export const rnd = (a: number, b: number) => a + Math.random() * (b - a)

