import { useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { isSmallScreen, prefersReducedMotion } from '../../hooks/useCapabilities'
import { stage } from '../../state/stage'
import Derail from '../objects/Derail'

/**
 * Drives the render loop itself so the frame rate can be capped. Phones render at a steady 30 fps (a steady 30 reads
 * as smoother than an unsteady 45), and the quality governor in the scene can lower the cap further on weak devices.
 */
function Pacer({ active }: { active: boolean }) {
  const advance = useThree((s) => s.advance)
  const on = useRef(active)
  useEffect(() => {
    on.current = active
  }, [active])
  useEffect(() => {
    let raf = 0
    let last = 0
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (!on.current || document.hidden) return
      if (t - last < stage.interval - 2) return
      last = t
      advance(t / 1000)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [advance])
  return null
}

export default function HeroCanvas({ onReady, active = true }: { onReady: () => void; active?: boolean }) {
  const small = isSmallScreen()
  const reduced = prefersReducedMotion()

  return (
    <Canvas
      // sharp first: phones render at their real density (capped at 2); the governor only lowers it if frames run slow, never below 1
      dpr={small ? [1.5, 2] : [1, 1.75]}
      camera={{ position: [0, 0, small ? 11 : 8.5], fov: 38 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      frameloop={reduced ? 'demand' : 'never'}
      // the phone's address bar resizes the viewport while scrolling: never re-create the drawing buffer for that
      resize={{ scroll: false, debounce: { scroll: 50, resize: 250 } }}
      // Track the cursor across the whole page: the canvas itself sits under the copy and ignores pointer events.
      eventSource={document.body}
      eventPrefix="client"
      onCreated={({ invalidate }) => {
        stage.invalidate = invalidate
        onReady()
      }}
    >
      {!reduced && <Pacer active={active} />}
      <Derail small={small} reduced={reduced} />
    </Canvas>
  )
}
