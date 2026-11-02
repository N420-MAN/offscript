import { Canvas } from '@react-three/fiber'
import { isSmallScreen, prefersReducedMotion } from '../../hooks/useCapabilities'
import { stage } from '../../state/stage'
import Derail from '../objects/Derail'

export default function HeroCanvas({ onReady, active = true }: { onReady: () => void; active?: boolean }) {
  const small = isSmallScreen()
  const reduced = prefersReducedMotion()

  return (
    <Canvas
      dpr={small ? [1, 1.4] : [1, 1.75]}
      camera={{ position: [0, 0, small ? 11 : 8.5], fov: 38 }}
      gl={{ antialias: !small, powerPreference: 'high-performance', alpha: true }}
      frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
      // Track the cursor across the whole page: the canvas itself sits under the copy and ignores pointer events.
      eventSource={document.body}
      eventPrefix="client"
      onCreated={({ invalidate }) => {
        stage.invalidate = invalidate
        onReady()
      }}
    >
      <Derail small={small} reduced={reduced} />
    </Canvas>
  )
}
