import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { prefersReducedMotion, useLowPower } from '../../hooks/useCapabilities'
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
      // once the journey reaches the floating windows the scene is a slow backdrop: 30 fps is plenty and frees the GPU for them
      const gap = stage.progress > 0.8 ? Math.max(stage.interval, 33) : stage.interval
      if (t - last < gap - 2) return
      last = t
      advance(t / 1000)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [advance])
  return null
}

/** `?debug` shows live frame rate, render resolution and cap, so a slow device can be diagnosed from one screenshot. */
function Hud() {
  const gl = useThree((s) => s.gl)
  const frames = useRef(0)
  useFrame(() => {
    frames.current++
  })
  useEffect(() => {
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;font:12px/1.4 monospace;color:#9f9;background:rgba(0,0,0,.75);padding:6px 8px;border-radius:6px;pointer-events:none;white-space:pre'
    document.body.appendChild(el)
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const fps = (frames.current * 1000) / (now - last)
      frames.current = 0
      last = now
      const c = gl.domElement
      el.textContent = `3D fps ${fps.toFixed(0)}  cap ${stage.interval || 'none'}ms\nrender dpr ${gl.getPixelRatio().toFixed(2)} (screen ${window.devicePixelRatio})\ncanvas ${c.width}x${c.height}  p=${stage.progress.toFixed(2)}`
    }, 500)
    return () => {
      window.clearInterval(id)
      el.remove()
    }
  }, [gl])
  return null
}

export default function HeroCanvas({ onReady, active = true }: { onReady: () => void; active?: boolean }) {
  const small = useLowPower()
  const reduced = prefersReducedMotion()

  return (
    <Canvas
      key={small ? 'low' : 'full'} // crossing the phone breakpoint rebuilds the scene with the right settings
      // Desktop renders at the screen's density up to 1.5 (bloom and aberration soften anything finer), phones up to 2;
      // the governor in Derail lowers it within a second or two if frames run slow (floors: 1 desktop, 1.25 phones).
      dpr={small ? [1.25, 2] : [1, 1.5]}
      camera={{ position: [0, 0, small ? 11 : 8.5], fov: 38 }}
      // desktop draws through the post-processing composer, which does its own anti-aliasing: the canvas's would be wasted
      gl={{ antialias: small, powerPreference: 'high-performance', alpha: true }}
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
      {typeof location !== 'undefined' && /[?&]debug/.test(location.search) && <Hud />}
      <Derail small={small} reduced={reduced} />
    </Canvas>
  )
}
