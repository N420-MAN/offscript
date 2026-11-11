import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * The Tizi n'Tichka at dusk, as a road you drive by scrolling: hairpins climbing through the Atlas, the white and red
 * kerb stones of Moroccan mountain bends, and kilometre posts (Arabic and French) counting down to Ouarzazate.
 * `progress` (0–1) is written by the page's scroll; the scene eases toward it and reports km and altitude back.
 */

const POSTS = [
  { at: 0.12, km: 170 },
  { at: 0.34, km: 120 },
  { at: 0.56, km: 70 },
  { at: 0.78, km: 25 },
]

const SKY_TOP = new THREE.Color('#1c1838')
const SKY_MID = new THREE.Color('#5b3f72')
const SKY_LOW = new THREE.Color('#ff9a62')
const FOG = new THREE.Color('#d9837a')

// --- a small value noise, enough for mountains
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
function noise(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function fbm(x: number, y: number) {
  let s = 0
  let a = 0.5
  let f = 1
  for (let i = 0; i < 5; i++) {
    s += a * noise(x * f, y * f)
    f *= 2.03
    a *= 0.5
  }
  return s
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** The road: switchbacks heading into the screen, climbing to the pass at ~60 % and dropping toward Ouarzazate. */
function makeCurve() {
  const pts: THREE.Vector3[] = []
  const n = 26
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const climb = f < 0.62 ? smooth(0, 0.62, f) * 46 : 46 - smooth(0.62, 1, f) * 24
    const x = Math.sin(i * 0.95) * (22 + 10 * Math.sin(i * 0.37)) + (i > 3 ? Math.sin(i * 0.31) * 20 : 0)
    pts.push(new THREE.Vector3(x, climb, -i * 34))
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
}

/** A flat ribbon following the curve, `w` wide, `off` to the side, `lift` above the road. */
function ribbon(curve: THREE.CatmullRomCurve3, segs: number, w: number, off = 0, lift = 0) {
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const up = new THREE.Vector3(0, 1, 0)
  const len = curve.getLength()
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const p = curve.getPointAt(t)
    const tan = curve.getTangentAt(t)
    const side = new THREE.Vector3().crossVectors(tan, up).normalize()
    const a = p.clone().addScaledVector(side, off - w / 2)
    const b = p.clone().addScaledVector(side, off + w / 2)
    pos.push(a.x, a.y + lift, a.z, b.x, b.y + lift, b.z)
    uv.push(0, t * len, 1, t * len)
    if (i < segs) {
      const k = i * 2
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** The face of a kilometre post: red cap, the town in Arabic and in capitals, the distance. */
function postTexture(km: number) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 340
  const x = c.getContext('2d')!
  const draw = () => {
    x.clearRect(0, 0, 256, 340)
    x.fillStyle = '#f6f4ef'
    x.beginPath()
    x.roundRect(0, 0, 256, 340, [128, 128, 6, 6])
    x.fill()
    x.save()
    x.clip()
    x.fillStyle = '#d8261c'
    x.fillRect(0, 0, 256, 92)
    x.restore()
    x.fillStyle = '#1c1838'
    x.textAlign = 'center'
    x.font = '700 40px "Noto Kufi Arabic Variable", sans-serif'
    x.fillText('ورزازات', 128, 150)
    x.font = '800 30px "Big Shoulders Display Variable", sans-serif'
    x.fillText('OUARZAZATE', 128, 192)
    x.font = '900 112px "Big Shoulders Display Variable", sans-serif'
    x.fillText(String(km), 128, 300)
  }
  draw()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  // redraw once the fonts have arrived
  void Promise.all([
    document.fonts.load('700 40px "Noto Kufi Arabic Variable"', 'ورزازات'),
    document.fonts.load('900 112px "Big Shoulders Display Variable"', '0123456789OUARZATE'),
  ]).then(() => {
    draw()
    tex.needsUpdate = true
  })
  return tex
}

export default function RentalDrive({
  progress,
  onHud,
  className = '',
}: {
  progress: React.MutableRefObject<number>
  onHud?: (km: number, alt: number) => void
  className?: string
}) {
  const host = useRef<HTMLDivElement>(null)
  const hud = useRef(onHud)
  hud.current = onHud

  useEffect(() => {
    const el = host.current!
    const small = window.matchMedia('(max-width: 767px)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: !small || devicePixelRatio < 2, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.75 : 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(FOG, 160, 980)
    const camera = new THREE.PerspectiveCamera(small ? 62 : 52, 1, 0.5, 2600)

    const curve = makeCurve()
    const samples = curve.getSpacedPoints(500)
    let peakI = 0
    samples.forEach((s, i) => s.y > samples[peakI].y && (peakI = i))
    const peakT = peakI / 500
    const peakY = samples[peakI].y
    const endY = samples[500].y

    // sky: indigo overhead to apricot at the horizon, with a low sun ahead
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(1800, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { top: { value: SKY_TOP }, mid: { value: SKY_MID }, low: { value: SKY_LOW } },
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
        fragmentShader:
          'uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vP; void main(){ float h = vP.y; vec3 c = mix(low, mid, smoothstep(-0.02, 0.18, h)); c = mix(c, top, smoothstep(0.16, 0.55, h)); gl_FragColor = vec4(c,1.); }',
      }),
    )
    scene.add(sky)
    const sun = new THREE.Mesh(new THREE.CircleGeometry(46, 48), new THREE.MeshBasicMaterial({ color: '#ffd9a8', fog: false }))
    sun.position.set(-160, 70, -1500)
    scene.add(sun)
    const halo = new THREE.Mesh(new THREE.CircleGeometry(150, 48), new THREE.MeshBasicMaterial({ color: '#ffb27d', transparent: true, opacity: 0.25, fog: false, depthWrite: false }))
    halo.position.set(-160, 70, -1510)
    scene.add(halo)

    scene.add(new THREE.HemisphereLight('#9d8be0', '#5a3540', 1.1))
    const sunLight = new THREE.DirectionalLight('#ffb98f', 2.2)
    sunLight.position.set(-160, 120, -400)
    scene.add(sunLight)

    // terrain: mountains rising from the road's edge, flat-shaded, coloured by height
    const box = new THREE.Box3().setFromPoints(samples)
    const W = 900
    const D = box.max.z - box.min.z + 900
    const seg = small ? 120 : 170
    const tg = new THREE.PlaneGeometry(W, D, seg, Math.round((seg * D) / W))
    tg.rotateX(-Math.PI / 2)
    tg.translate((box.min.x + box.max.x) / 2, 0, (box.min.z + box.max.z) / 2)
    const tp = tg.attributes.position as THREE.BufferAttribute
    const cols = new Float32Array(tp.count * 3)
    const cLow = new THREE.Color('#8f5148')
    const cMid = new THREE.Color('#5d3c55')
    const cHigh = new THREE.Color('#e3cfd0')
    const tmp = new THREE.Color()
    for (let i = 0; i < tp.count; i++) {
      const vx = tp.getX(i)
      const vz = tp.getZ(i)
      let best = Infinity
      let by = 0
      for (let s = 0; s < samples.length; s += 2) {
        const dx = samples[s].x - vx
        const dz = samples[s].z - vz
        const d2 = dx * dx + dz * dz
        if (d2 < best) {
          best = d2
          by = samples[s].y
        }
      }
      const d = Math.sqrt(best)
      const n = fbm(vx * 0.012, vz * 0.012)
      const ridge = Math.pow(Math.abs(fbm(vx * 0.004 + 9, vz * 0.004) * 2 - 1), 0.8)
      const rise = smooth(9, 110, d) * (d * 0.2 + n * 46 + ridge * 110) - smooth(9, 40, d) * 5
      const h = by - 0.7 + rise
      tp.setY(i, h)
      const rel = (h - by) / 140
      tmp.copy(cLow).lerp(cMid, smooth(0.05, 0.5, rel)).lerp(cHigh, smooth(0.62, 0.95, rel))
      cols.set([tmp.r, tmp.g, tmp.b], i * 3)
    }
    tg.setAttribute('color', new THREE.BufferAttribute(cols, 3))
    tg.computeVertexNormals()
    scene.add(new THREE.Mesh(tg, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })))

    // the road, its edge lines and its dashed centre line
    const segs = small ? 900 : 1400
    scene.add(new THREE.Mesh(ribbon(curve, segs, 8.4), new THREE.MeshLambertMaterial({ color: '#3a3342' })))
    const edgeMat = new THREE.MeshBasicMaterial({ color: '#efe6e2' })
    scene.add(new THREE.Mesh(ribbon(curve, segs, 0.18, 3.7, 0.03), edgeMat))
    scene.add(new THREE.Mesh(ribbon(curve, segs, 0.18, -3.7, 0.03), edgeMat))
    const dash = document.createElement('canvas')
    dash.width = 4
    dash.height = 64
    const dx = dash.getContext('2d')!
    dx.fillStyle = '#f3e3c6'
    dx.fillRect(0, 0, 4, 30)
    const dashTex = new THREE.CanvasTexture(dash)
    dashTex.wrapT = THREE.RepeatWrapping
    dashTex.repeat.set(1, 1 / 9)
    scene.add(new THREE.Mesh(ribbon(curve, segs, 0.2, 0, 0.03), new THREE.MeshBasicMaterial({ map: dashTex, transparent: true, alphaTest: 0.5 })))

    // kerb stones on the outside edge, painted red and white as on every Moroccan mountain bend
    const kerbCount = Math.floor(curve.getLength() / 3.2)
    const kerbs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.3, 0.9), new THREE.MeshLambertMaterial(), kerbCount * 2)
    const m4 = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    const red = new THREE.Color('#d8261c')
    const white = new THREE.Color('#f4efe9')
    let k = 0
    for (let i = 0; i < kerbCount; i++) {
      const t = i / kerbCount
      const p = curve.getPointAt(t)
      const tan = curve.getTangentAt(t)
      const side = new THREE.Vector3().crossVectors(tan, up).normalize()
      q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(tan.x, 0, tan.z).normalize())
      for (const s of [-1, 1]) {
        m4.compose(p.clone().addScaledVector(side, s * 4.5).setY(p.y + 0.12), q, new THREE.Vector3(1, 1, 1))
        kerbs.setMatrixAt(k, m4)
        kerbs.setColorAt(k, (i + (s > 0 ? 1 : 0)) % 2 ? red : white)
        k++
      }
    }
    scene.add(kerbs)

    // kilometre posts on the right of the road, facing the driver
    const postBody = new THREE.BoxGeometry(1.1, 1.5, 0.32)
    const postMat = new THREE.MeshLambertMaterial({ color: '#f1ece4' })
    POSTS.forEach((pst) => {
      const p = curve.getPointAt(pst.at)
      const tan = curve.getTangentAt(pst.at)
      const side = new THREE.Vector3().crossVectors(tan, up).normalize()
      const g = new THREE.Group()
      const body = new THREE.Mesh(postBody, postMat)
      body.position.y = 0.75
      const face = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.46), new THREE.MeshBasicMaterial({ map: postTexture(pst.km), transparent: true }))
      face.position.set(0, 0.76, 0.17)
      g.add(body, face)
      g.position.copy(p).addScaledVector(side, 8.2)
      g.position.y -= 0.2
      g.lookAt(p.clone().addScaledVector(tan, -30).addScaledVector(side, 8.2).setY(g.position.y))
      g.scale.setScalar(2.5)
      scene.add(g)
    })

    // the car: a white saloon (the agency's Logan) with its tail lights on in the dusk
    const car = new THREE.Group()
    const paint = new THREE.MeshLambertMaterial({ color: '#f4efe8', emissive: '#4a3a52' })
    const glass = new THREE.MeshLambertMaterial({ color: '#2a2440' })
    const tyre = new THREE.MeshLambertMaterial({ color: '#141220' })
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.62, 4.3), paint)
    body.position.y = 0.62
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.56, 2.1), glass)
    cabin.position.set(0, 1.18, 0.15)
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.7), paint)
    roof.position.set(0, 1.48, 0.15)
    car.add(body, cabin, roof)
    const wheel = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16)
    ;[
      [-0.92, 1.35],
      [0.92, 1.35],
      [-0.92, -1.35],
      [0.92, -1.35],
    ].forEach(([x, z]) => {
      const w = new THREE.Mesh(wheel, tyre)
      w.rotation.z = Math.PI / 2
      w.position.set(x, 0.36, z)
      car.add(w)
    })
    const tail = new THREE.MeshBasicMaterial({ color: '#ff2a1c' })
    const glow = new THREE.MeshBasicMaterial({ color: '#ff4a2c', transparent: true, opacity: 0.35, depthWrite: false })
    ;[-0.68, 0.68].forEach((x) => {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.05), tail)
      l.position.set(x, 0.78, -2.16)
      const h = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), glow)
      h.position.set(x, 0.78, -2.2)
      h.rotation.y = Math.PI
      car.add(l, h)
    })
    scene.add(car)
    const roadLen = curve.getLength()

    // driving
    const look = new THREE.Vector3()
    const eye = new THREE.Vector3()
    let shown = 0
    let roll = 0
    let visible = true
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(frame)
    })
    io.observe(el)

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const lane = 1.9
    function place(t: number) {
      const tt = Math.min(0.985, 0.004 + t * 0.975)
      const p = curve.getPointAt(tt)
      const tan = curve.getTangentAt(tt)
      const side = new THREE.Vector3().crossVectors(tan, up).normalize()
      // a chase view: above and a little behind the car, looking down the road ahead so the bends unfold
      eye.copy(p).addScaledVector(side, lane).addScaledVector(tan, -10)
      eye.y += 7.5
      const ahead = Math.min(1, tt + 0.03)
      const pa = curve.getPointAt(ahead)
      const sa = new THREE.Vector3().crossVectors(curve.getTangentAt(ahead), up).normalize()
      look.copy(pa).addScaledVector(sa, lane)
      look.y += 3
      // lean gently into the bends
      const turn = new THREE.Vector3().crossVectors(tan, curve.getTangentAt(ahead)).y
      roll += (-turn * 1.4 - roll) * 0.06
      camera.position.copy(eye)
      camera.lookAt(look)
      camera.rotateZ(roll)
      // the car runs a few metres ahead of the camera, in the right-hand lane, nose down the road
      const ct = Math.min(0.999, tt + 5 / roadLen)
      const cp = curve.getPointAt(ct)
      const cs = new THREE.Vector3().crossVectors(curve.getTangentAt(ct), up).normalize()
      car.position.copy(cp).addScaledVector(cs, lane)
      const cn = curve.getPointAt(Math.min(1, ct + 3 / roadLen)).addScaledVector(cs, lane)
      car.lookAt(cn.x, car.position.y + (cn.y - cp.y), cn.z)
      sun.lookAt(eye)
      halo.lookAt(eye)
      return { tt, y: p.y }
    }

    function frame() {
      raf = 0
      shown += (progress.current - shown) * 0.085
      const { tt, y } = place(shown)
      renderer.render(scene, camera)
      // 196 km from Marrakech to Ouarzazate; the pass sits at 2 260 m, Marrakech at ~470 m and Ouarzazate at ~1 150 m
      const alt = tt <= peakT ? 470 + (y / peakY) * 1790 : 1150 + ((y - endY) / (peakY - endY)) * 1110
      hud.current?.(Math.round(tt * 196), Math.round(alt / 10) * 10)
      if (visible) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        ;(Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
          ;(x as THREE.MeshBasicMaterial).map?.dispose()
          x.dispose()
        })
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [progress])

  return <div ref={host} className={className} aria-hidden />
}
