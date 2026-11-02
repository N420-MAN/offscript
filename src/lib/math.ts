export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

