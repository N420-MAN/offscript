export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export function easeOutBack(x: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  const t = clamp01(x)
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
