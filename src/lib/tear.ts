/** The jagged line every rip in the site follows, as [x%, y%] points, left to right. */
export const TEAR: [number, number][] = [[0, 52], [13, 47], [26, 54], [40, 47.5], [54, 55], [67, 47], [81, 53.5], [100, 48]]

export const tearTop = (): string => ['0 0', '100% 0', ...[...TEAR].reverse().map(([x, y]) => `${x}% ${y}%`)].join(',')
export const tearBottom = (): string => [...TEAR.map(([x, y]) => `${x}% ${y}%`), '100% 100%', '0 100%'].join(',')

/** y (in %) of the tear at a given x (in %). */
export function tearY(x: number): number {
  for (let i = 1; i < TEAR.length; i++) {
    if (x <= TEAR[i][0]) {
      const [x0, y0] = TEAR[i - 1]
      const [x1, y1] = TEAR[i]
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
    }
  }
  return TEAR[TEAR.length - 1][1]
}
