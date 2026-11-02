import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { clamp01, smoothstep } from '../../lib/math'
import { stage } from '../../state/stage'
import { drawScreen, SCREEN_VARIANTS } from './screens'
import type { SceneProps } from './shared'

const BG = '#0b1020'
const COOL_LIGHT = new THREE.Color('#b9ccff')
const HOT_LIGHT = new THREE.Color('#ff7a4a')
const TRAVEL = 74

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const GLYPHS = '01{}[]<>/\;:=+-*#$%&|!?()_~^abcdefghijklmnopqrstuvwxyzXYZ'.padEnd(64, '0')

function glyphAtlas(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'
  g.font = '700 46px "DM Mono", ui-monospace, monospace'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  for (let i = 0; i < 64; i++) g.fillText(GLYPHS[i], (i % 8) * 64 + 32, Math.floor(i / 8) * 64 + 34)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const VERT = /* glsl */ `
uniform float uChaos, uTime, uDim, uPx, uSize, uAsp;
uniform vec2 uMouse;
attribute vec3 aOrd;
attribute vec4 aSeed;
varying float vA;
varying float vHot;
varying float vGlyph;
varying float vLit;
vec3 flow(vec3 p, float t){
  return vec3(sin(p.y*0.6+t*0.9)+sin(p.z*0.31-t*0.6), sin(p.z*0.45+t*0.7)+cos(p.x*0.5-t*0.8), cos(p.x*0.55+t*0.6)+sin(p.y*0.4+t));
}
void main(){
  float local = clamp(uChaos*1.7 - aSeed.x*0.7, 0.0, 1.0);
  float a = local*local*(3.0-2.0*local);
  vec3 p = aOrd;
  vec2 radial = normalize(p.xy + vec2(1e-3, 1e-3));
  p += vec3(radial*(1.5 + aSeed.y*7.0), (aSeed.z-0.5)*9.0) * a;
  p += flow(p*0.7, uTime) * 1.5 * a;
  float ang = a*(aSeed.y-0.35)*3.0 + a*uTime*0.12;
  float cs = cos(ang), sn = sin(ang);
  p.xy = vec2(cs*p.x - sn*p.y, sn*p.x + cs*p.y);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = -mv.z;
  // The cursor is a light: script near it brightens, flickers through glyphs and settles into legible type. Gone once the script breaks.
  vec2 ndc = gl_Position.xy / gl_Position.w;
  float lit = (1.0 - smoothstep(0.0, 0.36, length((ndc - uMouse) * vec2(uAsp, 1.0)))) * (1.0 - smoothstep(0.0, 0.22, uChaos));
  vLit = lit;
  gl_PointSize = clamp(uSize * uPx * (10.0 / max(dist, 0.5)) * (1.0 + lit * 1.1), 2.2 * uPx, 46.0 * uPx);
  float keep = 1.0 - smoothstep(18.0, 75.0, dist) * 0.85;
  float thin = step(aSeed.y, keep);
  vA = thin * (1.0 - smoothstep(40.0, 95.0, dist)) * smoothstep(0.4, 3.0, dist) * uDim * mix(0.6, 1.05, aSeed.y) * (1.0 + lit * 2.4);
  vHot = a * step(0.4, aSeed.z);
  float flick = floor(fract(aSeed.w * 17.0 + floor(uTime * 9.0 + aSeed.x * 9.0) * 0.37) * 63.99);
  vGlyph = mix(floor(aSeed.w * 63.99), flick, step(0.02, lit) * (1.0 - smoothstep(0.55, 0.9, lit)));
}
`
const FRAG = /* glsl */ `
uniform sampler2D uAtlas;
varying float vA;
varying float vHot;
varying float vGlyph;
varying float vLit;
void main(){
  vec2 cell = vec2(mod(vGlyph, 8.0), floor(vGlyph / 8.0));
  vec2 uv = (cell + vec2(gl_PointCoord.x, gl_PointCoord.y)) / 8.0;
  float m = texture2D(uAtlas, uv).a;
  vec3 col = mix(vec3(0.74,0.82,0.98), vec3(1.0,0.3,0.12) * 1.7, vHot);
  col = mix(col, vec3(1.0,0.72,0.55) * 1.5, vLit);
  gl_FragColor = vec4(col, m * vA);
}
`

/** Walls of script text running down both sides of the corridor, as particles that can all break loose. */
function ScriptText({ small }: { small: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const atlas = useMemo(glyphAtlas, [])
  const lines = small ? 14 : 20
  const spacingZ = small ? 0.42 : 0.34

  const geometry = useMemo(() => {
    const r = rng(11)
    const ord: number[] = []
    const seed: number[] = []
    const len = Math.floor(112 / spacingZ)
    // Four planes of text lines running along the corridor: two walls, a floor and a ceiling.
    const planes: { wall: boolean; at: number; n: number }[] = [
      { wall: true, at: -7.2, n: lines },
      { wall: true, at: 7.2, n: lines },
      { wall: false, at: 4.9, n: lines + 8 },
      { wall: false, at: -4.9, n: lines + 8 },
    ]
    for (const pl of planes) {
      for (let l = 0; l < pl.n; l++) {
        const across = pl.wall ? (l - (pl.n - 1) / 2) * 0.46 : (l - (pl.n - 1) / 2) * 0.52
        let c = 0
        while (c < len) {
          const word = 3 + Math.floor(r() * 7)
          for (let k = 0; k < word && c < len; k++, c++) {
            const z = 12 - c * spacingZ
            if (pl.wall) ord.push(pl.at, across, z)
            else ord.push(across, pl.at, z)
            seed.push(r(), r(), r(), r())
          }
          c += 1 + Math.floor(r() * 2)
        }
      }
    }
    const n = ord.length / 3
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('aOrd', new THREE.BufferAttribute(new Float32Array(ord), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(seed), 4))
    return g
  }, [lines, spacingZ])

  const uniforms = useMemo(
    () => ({
      uChaos: { value: 0 },
      uTime: { value: 0 },
      uDim: { value: 1 },
      uPx: { value: 1 },
      uSize: { value: small ? 22 : 22 },
      uAsp: { value: 1 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uAtlas: { value: atlas },
    }),
    [atlas, small],
  )
  return (
    <points geometry={geometry} frustumCulled={false} userData={{ role: 'script' }}>
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

interface PanelSeed {
  pos: THREE.Vector3
  baseY: number
  h: [number, number, number]
  dir: THREE.Vector3
  gi: number
}

const tmpMat = new THREE.Matrix4()
const tmpQ = new THREE.Quaternion()
const tmpE = new THREE.Euler()
const tmpP = new THREE.Vector3()
const tmpS = new THREE.Vector3()
const tmpCol = new THREE.Color()

export default function Derail({ small, reduced }: SceneProps) {
  const world = useRef<THREE.Group>(null)
  const gov = useRef({ skip: 150, t: 0, n: 0 })
  const { gl, scene, camera } = useThree()
  // Compile every shader and upload every texture now, while the intro is still typing, so the first visible
  // frame of the scene (the moment the page tears open) does not stall.
  useEffect(() => {
    const g = world.current
    if (!g) return
    const was = g.visible
    g.visible = true
    try {
      gl.compile(scene, camera)
      g.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | THREE.MeshBasicMaterial[] | undefined
        const one = Array.isArray(m) ? m[0] : m
        if (one && one.map) gl.initTexture(one.map)
      })
    } catch {
      /* warming is best effort */
    }
    g.visible = was
  }, [gl, scene, camera])
  const scriptRef = useRef<THREE.Points>(null)
  const panelMeshes = useRef<(THREE.InstancedMesh | null)[]>([])
  const rails = useRef<THREE.InstancedMesh>(null)
  const glow = useRef<THREE.Mesh>(null)
  const chroma = useRef<{ offset: THREE.Vector2 } | null>(null)
  const bloom = useRef<{ intensity: number } | null>(null)
  const look = useRef({ x: 0, y: 0 })
  const mouse = useRef({ x: 9, y: 9, tx: 9, ty: 9 })
  const pulse = useRef({ t0: -1, dirty: false })
  const camZ = small ? 11 : 8.5

  // The same ten screens twice: natural colours while everything obeys the script, vermilion once it breaks.
  const textures = useMemo(() => {
    const make = (hot: boolean) =>
      Array.from({ length: SCREEN_VARIANTS }, (_, v) => {
        const t = new THREE.CanvasTexture(drawScreen(v, v + 3, hot))
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 4
        return t
      })
    return { cool: make(false), hot: make(true) }
  }, [])
  const hotState = useRef(false)
  const glowTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    gr.addColorStop(0, 'rgba(255,255,255,1)')
    gr.addColorStop(0.3, 'rgba(255,255,255,0.3)')
    gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(c)
  }, [])

  // Panels: three rows per side, aligned and angled inward — the "script". Designs are mixed at random so no column repeats.
  const nV = SCREEN_VARIANTS
  const total = small ? 40 : 84
  const panels = useMemo(() => {
    const r = rng(77)
    const byVariant: PanelSeed[][] = Array.from({ length: nV }, () => [])
    const rowsY = [-2.2, 0.3, 2.8]
    const nSlots = Math.ceil(total / 6)
    let last = -1
    for (let i = 0; i < total; i++) {
      const slot = Math.floor(i / 6)
      const side = i % 2 === 0 ? -1 : 1
      const row = rowsY[Math.floor(i / 2) % 3]
      let v = Math.floor(r() * nV)
      if (v === last) v = (v + 3) % nV
      last = v
      const z = 6 - slot * ((TRAVEL + 14) / nSlots) - (i % 3) * 1.2
      byVariant[v].push({
        pos: new THREE.Vector3(side * 4.6, row, z),
        baseY: -side * 0.38,
        h: [r(), r(), r()],
        dir: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
        gi: i,
      })
    }
    return byVariant
  }, [nV, total])

  const railCount = small ? 90 : 150
  const railSeeds = useMemo(() => {
    const r = rng(5)
    return Array.from({ length: railCount }, (_, i) => ({
      z: 14 - i * ((TRAVEL + 18) / railCount),
      h: [r(), r(), r()] as [number, number, number],
      dir: new THREE.Vector3(r() - 0.5, r() * 0.8 + 0.2, r() - 0.5).normalize(),
    }))
  }, [railCount])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.ty = -((e.clientY / window.innerHeight) * 2 - 1)
      if (mouse.current.x > 5) {
        mouse.current.x = mouse.current.tx
        mouse.current.y = mouse.current.ty
      }
    }
    // A click sends a pulse of light down the guide line.
    const down = (e: PointerEvent) => {
      if (reduced || stage.progress > 0.28) return
      if ((e.target as HTMLElement | null)?.closest('a,button,[role="button"]')) return
      pulse.current.t0 = performance.now() / 1000
      pulse.current.dirty = true
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
    }
  }, [reduced])

  useEffect(() => {
    const rm = rails.current
    if (!rm) return
    for (let i = 0; i < railCount; i++) rm.setColorAt(i, tmpCol.setScalar(1))
    if (rm.instanceColor) rm.instanceColor.needsUpdate = true
  }, [railCount])

  const railColor = useMemo(() => new THREE.Color('#ff4b1f').multiplyScalar(2.6), [])

  useFrame((state, rawDelta) => {
    const g = world.current
    if (!g) return
    const dt = Math.min(rawDelta, 0.05)
    // Quality governor: if frames stay slow, shed resolution (never below 1x) instead of dropping frames.
    const gv = gov.current
    if (!reduced && rawDelta < 0.5) {
      if (gv.skip > 0) gv.skip--
      else {
        gv.t += rawDelta
        if (++gv.n === 60) {
          if (gv.t / 60 > 0.023 && state.viewport.dpr > 1) state.setDpr(Math.max(1, state.viewport.dpr - 0.25))
          gv.t = gv.n = 0
        }
      }
    }
    const t = reduced ? 0 : state.clock.elapsedTime
    const p = stage.progress
    const reveal = reduced ? 1 : stage.reveal
    const c = smoothstep(0.26, 0.52, p)
    const burst = Math.sin(Math.PI * c) // peaks at the moment the rails snap
    const dim = 1 - 0.45 * smoothstep(0.5, 0.74, p)

    g.visible = reveal > 0.001
    if (!reduced) {
      look.current.x = THREE.MathUtils.damp(look.current.x, state.pointer.x, 3, dt)
      look.current.y = THREE.MathUtils.damp(look.current.y, state.pointer.y, 3, dt)
    }
    const shake = reduced ? 0 : burst * 0.05 * (Math.sin(t * 41) + Math.sin(t * 67))
    const travel = smoothstep(0, 1, p) * TRAVEL
    g.position.set(-look.current.x * 0.8 + shake, -look.current.y * 0.5 + shake * 0.6, travel - (1 - reveal) * 34)
    g.rotation.set(look.current.y * 0.04, -look.current.x * 0.07, c * 0.28 + p * 0.25 + shake * 0.5)

    // Script text
    const sm = (scriptRef.current?.material as THREE.ShaderMaterial | undefined)?.uniforms
    if (sm) {
      sm.uChaos.value = c
      sm.uTime.value = t
      sm.uDim.value = dim * clamp01(reveal * 1.5)
      sm.uPx.value = state.gl.getPixelRatio()
      sm.uAsp.value = state.size.width / state.size.height
      mouse.current.x = THREE.MathUtils.damp(mouse.current.x, mouse.current.tx, 9, dt)
      mouse.current.y = THREE.MathUtils.damp(mouse.current.y, mouse.current.ty, 9, dt)
      ;(sm.uMouse.value as THREE.Vector2).set(mouse.current.x, mouse.current.y)
    }

    // Screens
    const goHot = c > 0.42
    const swap = goHot !== hotState.current
    hotState.current = goHot
    // After the break the screens shrink away.
    const o = smoothstep(0.56, 0.8, p)
    panels.forEach((list, v) => {
      const m = panelMeshes.current[v]
      if (!m) return
      if (swap) {
        const mm = m.material as THREE.MeshBasicMaterial
        mm.map = (goHot ? textures.hot : textures.cool)[v]
        mm.needsUpdate = true
      }
      list.forEach((pl, i) => {
        const local = clamp01(c * 1.6 - pl.h[0] * 0.6)
        const a = local * local * (3 - 2 * local)
        tmpP.copy(pl.pos).addScaledVector(pl.dir, a * (3 + pl.h[1] * 8))
        tmpP.y += Math.sin(t * 0.5 + pl.h[2] * 6.28) * 0.5 * a
        tmpP.x += Math.cos(t * 0.4 + pl.h[1] * 6.28) * 0.6 * a
        tmpE.set(
          a * (pl.h[0] * 6.28 + t * 0.3 * (pl.h[1] - 0.5)),
          pl.baseY + a * (pl.h[1] * 6.28 + t * 0.25 * (pl.h[2] - 0.5)),
          a * (pl.h[2] - 0.5) * 3,
        )
        tmpQ.setFromEuler(tmpE)
        // After the break the screens fall away; the interactive windows take over the frame.
        const sizeMul = 1 - o
        const wz = tmpP.z + g.position.z
        const near = smoothstep(1.2, 5, camZ - wz)
        const s = 3.4 * near * sizeMul
        tmpS.set(s, s * 0.625, 1)
        tmpMat.compose(tmpP, tmpQ, tmpS)
        m.setMatrixAt(i, tmpMat)
      })
      m.instanceMatrix.needsUpdate = true
      ;(m.material as THREE.MeshBasicMaterial).color.setScalar(Math.min(1, 0.95 * (0.55 + 0.45 * dim) + 0.1 * burst) * (1 - 0.42 * smoothstep(0.74, 0.9, p)))
    })

    // The guide line: continuous until it snaps, then every segment flies off.
    const rm = rails.current
    if (rm) {
      const pe = pulse.current.t0 < 0 ? -1 : performance.now() / 1000 - pulse.current.t0
      const pulsing = pe >= 0 && pe < 3.8
      const zp = camZ - 1 - pe * 34
      railSeeds.forEach((rs, i) => {
        const local = clamp01(c * 1.8 - rs.h[0] * 0.8)
        const a = local * local * (3 - 2 * local)
        tmpP.set(0, -3.3, rs.z).addScaledVector(rs.dir, a * (2 + rs.h[1] * 9))
        tmpE.set(a * rs.h[0] * 9 + t * a, a * rs.h[1] * 9, a * rs.h[2] * 9)
        tmpQ.setFromEuler(tmpE)
        const wz = tmpP.z + g.position.z
        const near = smoothstep(0.5, 3, camZ - wz)
        tmpS.set((0.14 + a * 0.06) * (small ? 0.55 : 1), (0.1 + a * 0.04) * (small ? 0.55 : 1), ((TRAVEL + 18) / railCount) * 0.92 * near * (1 - smoothstep(0.56, 0.78, p)))
        tmpMat.compose(tmpP, tmpQ, tmpS)
        rm.setMatrixAt(i, tmpMat)
        if (pulsing || pulse.current.dirty) {
          const k = pulsing ? Math.exp(-(((wz - zp) / 3.8) ** 2)) : 0
          rm.setColorAt(i, tmpCol.setScalar(1 + k * 5))
        }
      })
      rm.instanceMatrix.needsUpdate = true
      if (rm.instanceColor && (pulsing || pulse.current.dirty)) {
        rm.instanceColor.needsUpdate = true
        if (!pulsing) pulse.current.dirty = false
      }
    }

    // Horizon glow brightens when the script breaks.
    if (glow.current) {
      const gm = glow.current.material as THREE.MeshBasicMaterial
      gm.color.lerpColors(COOL_LIGHT, HOT_LIGHT, c)
      gm.opacity = 0.75 * (1 - c) * clamp01(reveal) * clamp01(reveal) * (1 - 0.5 * smoothstep(0.5, 0.74, p))
    }

    // Post: aberration and bloom spike at the break.
    if (chroma.current) chroma.current.offset.set(0.0007 + burst * 0.009, 0.0004 + burst * 0.006)
    if (bloom.current) bloom.current.intensity = 0.55 + burst * 1.1 + c * 0.2
  })

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 14, 80]} />
      <mesh ref={glow} position={[0, -0.2, -104]} scale={[34, 22, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} />
      </mesh>
      <group ref={world} visible={false}>
        <ScriptTextHost small={small} scriptRef={scriptRef} />
        {panels.map((list, v) => (
          <instancedMesh
            key={v}
            ref={(el) => {
              panelMeshes.current[v] = el
            }}
            args={[undefined, undefined, list.length]}
            frustumCulled={false}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={textures.cool[v]} toneMapped={false} side={THREE.DoubleSide} />
          </instancedMesh>
        ))}
        <instancedMesh ref={rails} args={[undefined, undefined, railCount]} frustumCulled={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={railColor} toneMapped={false} fog={false} />
        </instancedMesh>
      </group>
      {!small && (
        <EffectComposer multisampling={0}>
          <Bloom ref={bloom as never} mipmapBlur luminanceThreshold={0.88} luminanceSmoothing={0.2} intensity={0.45} />
          <ChromaticAberration ref={chroma as never} offset={new THREE.Vector2(0.0007, 0.0004)} radialModulation={false} modulationOffset={0} />
          <Vignette eskil={false} offset={0.15} darkness={0.85} />
        </EffectComposer>
      )}
    </>
  )
}

/** Mounts the particle text and hands its Points object up so the frame loop can drive its uniforms. */
function ScriptTextHost({ small, scriptRef }: { small: boolean; scriptRef: React.MutableRefObject<THREE.Points | null> }) {
  return (
    <group
      ref={(grp) => {
        if (grp) scriptRef.current = (grp.children[0] as THREE.Points) ?? null
      }}
    >
      <ScriptText small={small} />
    </group>
  )
}
