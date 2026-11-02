import { useEffect, useState } from 'react'

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function isSmallScreen(): boolean {
  return window.matchMedia('(max-width: 767px)').matches
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Phones and tablets (touch-first devices) get the lighter 3D settings even when their screen is wide, like an iPad. */
export function isLowPower(): boolean {
  return isSmallScreen() || window.matchMedia('(pointer: coarse) and (hover: none)').matches
}

/** isLowPower() that follows the device: rotating a phone or resizing across the phone breakpoint re-evaluates it. */
export function useLowPower(): boolean {
  const [low, setLow] = useState(isLowPower)
  useEffect(() => {
    const qs = [window.matchMedia('(max-width: 767px)'), window.matchMedia('(pointer: coarse) and (hover: none)')]
    const on = () => setLow(isLowPower())
    qs.forEach((q) => q.addEventListener('change', on))
    return () => qs.forEach((q) => q.removeEventListener('change', on))
  }, [])
  return low
}
