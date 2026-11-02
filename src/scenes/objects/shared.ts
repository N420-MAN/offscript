export interface SceneProps {
  small: boolean
  reduced: boolean
}

/** Desktop: sculpture sits right of centre so it overlaps the end of the headline lines (depth weave). Mobile: above the copy. */
export function placement(small: boolean): { position: [number, number, number]; scale: number } {
  return small ? { position: [0, 2.7, 0], scale: 0.5 } : { position: [1.9, 0.1, 0], scale: 1 }
}
