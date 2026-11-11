/** Mutable scene state shared between the DOM timeline/scroll and the R3F render loop (no React re-renders). */
export const stage = {
  /** 0..1 progress through the scroll journey. */
  progress: 0,
  /** 0..1 reveal of the ribbon after the tear. */
  reveal: 0,
  /** 0..1 entrance build (object → disintegration → assembled homepage). 1 when not in use. */
  build: 1,
  /** False while the hero is off-screen or a demo is open: the canvas and windows stop working. */
  active: true,
  /** True while a demo page is open on top of the (still mounted) home page. */
  paused: false,
  /** Slug of the demo opened last, so the home page can pulse its window when the visitor comes back. */
  lastOpened: '' as string,
  /** True while the scroll gate holds the visitor on the demo windows. */
  held: false,
  /** Until this timestamp (ms), programmatic scrolls may pass the gate. */
  gateBypass: 0,
  /** Set to jump the rate-limited progress straight to the scroll position (returning from a demo). */
  snap: false,
  /** Minimum ms between rendered frames of the hero (0 = every frame); raised automatically on slow devices. */
  interval: 0,
  /** True once the 3D scene has compiled its shaders and drawn (or when there is no 3D at all): the intro waits for it. */
  sceneReady: false,
  /** Set by the canvas so non-animated frames (reduced motion) can be redrawn. */
  invalidate: () => {},
}

if (import.meta.env.DEV) (window as unknown as { __stage?: typeof stage }).__stage = stage
