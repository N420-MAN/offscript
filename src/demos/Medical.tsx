import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/inter'
import { Slot } from './Slot'

gsap.registerPlugin(ScrollTrigger)

const SERIF = '"Fraunces Variable", Georgia, serif'
const SANS = '"Inter Variable", system-ui, sans-serif'
const INK = '#1d1a17'
const CREAM = '#f4efe8'

const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float ar=uRes.x/uRes.y;
  vec2 p=(uv-.5)*vec2(ar,1.)*2.2; float t=uTime*.07;
  vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+t*1.3),fbm(p+3.*q+vec2(8.3,2.8)-t));
  float f=fbm(p+3.*r);
  vec3 cream=vec3(.957,.937,.91), blush=vec3(.91,.77,.72), sage=vec3(.61,.69,.6), teal=vec3(.12,.29,.27);
  vec3 col=mix(cream,blush,smoothstep(.2,.8,f));
  col=mix(col,sage,smoothstep(.4,1.,length(q))*.65);
  col=mix(col,teal,smoothstep(.8,1.15,length(r))*.3);
  float d=distance(uv*vec2(ar,1.),uMouse*vec2(ar,1.));
  col=mix(col,vec3(1.,.93,.88),exp(-d*d*10.)*.55);
  gl_FragColor=vec4(col,1.);
}`

function Aurora() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const gl = c.getContext('webgl')
    if (!gl) return
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uMouse = gl.getUniformLocation(prog, 'uMouse')
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const move = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth
      mouse.ty = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', move)
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5) * 0.6
      c.width = c.clientWidth * dpr
      c.height = c.clientHeight * dpr
      gl.viewport(0, 0, c.width, c.height)
    }
    resize()
    window.addEventListener('resize', resize)
    let raf = 0
    const t0 = performance.now()
    const loop = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.06
      mouse.y += (mouse.ty - mouse.y) * 0.06
      gl.uniform2f(uRes, c.width, c.height)
      gl.uniform1f(uTime, (performance.now() - t0) / 1000)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />
}

const TREATMENTS = [
  { n: '01', t: 'Dermatologie médicale', d: 'Un diagnostic précis, un suivi qui dure.', c: '#e8c4b8' },
  { n: '02', t: 'Laser & lumière pulsée', d: 'Taches, vaisseaux, grain de peau.', c: '#c9d6c3' },
  { n: '03', t: 'Médecine régénérative', d: 'Réveiller ce que la peau sait déjà faire.', c: '#f2d9b8' },
  { n: '04', t: 'Injectables', d: 'Un geste léger, un résultat qui reste naturel.', c: '#d9c3d8' },
  { n: '05', t: 'Peelings & soins', d: 'Éclat, uniformité, confort.', c: '#bcd3d0' },
]

const STEPS = [
  { t: 'Écouter', d: 'Un premier rendez-vous pour comprendre votre peau et vos envies, sans rien vendre.' },
  { t: 'Choisir', d: 'Un plan sobre, expliqué étape par étape, avec ce qui est utile et rien de plus.' },
  { t: 'Suivre', d: 'Des contrôles réguliers, parce qu’une belle peau se construit dans le temps.' },
]

export default function Medical() {
  const root = useRef<HTMLDivElement>(null)
  const orb = useRef<HTMLDivElement>(null)
  const pulse = useRef<SVGPathElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [step, setStep] = useState(0)

  useGSAP(
    () => {
      gsap.from('[data-rise]', { yPercent: 110, duration: 1.4, stagger: 0.12, ease: 'expo.out', delay: 0.2 })
      gsap.from('[data-fade]', { opacity: 0, y: 14, duration: 1.2, stagger: 0.1, ease: 'power3.out', delay: 0.9 })
      const p = pulse.current
      if (p) {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(p, { strokeDashoffset: -len, duration: 3.2, repeat: -1, ease: 'none' })
      }
      ScrollTrigger.create({
        trigger: '[data-parcours]',
        start: 'top top',
        end: '+=240%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          setStep(Math.min(2, Math.floor(self.progress * 3)))
          gsap.set(orb.current, { rotate: self.progress * 360, scale: 0.8 + Math.sin(self.progress * Math.PI) * 0.35 })
        },
      })
      gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el, i) => {
        gsap.to(el, { yPercent: (i % 2 ? -1 : 1) * 40, ease: 'none', scrollTrigger: { trigger: el, scrub: true, start: 'top bottom', end: 'bottom top' } })
      })
    },
    { scope: root },
  )

  // Floating swatch that follows the cursor over the treatments list.
  const swatch = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.set(swatch.current, { xPercent: -50, yPercent: -50, scale: 0.3, opacity: 0 })
    const x = gsap.quickTo(swatch.current, 'x', { duration: 0.5, ease: 'power3' })
    const y = gsap.quickTo(swatch.current, 'y', { duration: 0.5, ease: 'power3' })
    const move = (e: PointerEvent) => {
      x(e.clientX)
      y(e.clientY)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  // Scale and opacity belong to GSAP too, so React never overwrites the transform it is animating.
  useEffect(() => {
    gsap.to(swatch.current, { scale: hover === null ? 0.3 : 1, opacity: hover === null ? 0 : 1, duration: 0.45, ease: 'power3.out', overwrite: 'auto' })
  }, [hover])

  return (
    <div ref={root} style={{ background: CREAM, color: INK, fontFamily: SANS }}>
      <section className="relative flex h-screen min-h-[640px] flex-col justify-between overflow-hidden px-6 py-6 md:px-12 md:py-9">
        <Aurora />
        <header className="relative z-10 flex items-center justify-between text-sm" data-fade>
          <span className="text-2xl" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 72, "wght" 400' }}>
            Aurèle
          </span>
          <nav className="hidden gap-8 md:flex">
            {['Soins', 'Parcours', 'Cabinet', 'Contact'].map((l) => (
              <a key={l} href="#soins" className="opacity-70 transition-opacity hover:opacity-100">
                {l}
              </a>
            ))}
          </nav>
          <a href="#contact" className="rounded-full border border-current px-5 py-2 text-xs uppercase tracking-[0.14em]">
            Rendez-vous
          </a>
        </header>
        <div className="relative z-10">
          <h1 className="text-[clamp(3.4rem,12.5vw,12rem)] leading-[0.9] tracking-[-0.03em]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 144, "wght" 300' }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-rise className="block">La peau,</span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <span data-rise className="block italic" style={{ fontVariationSettings: '"opsz" 144, "wght" 200, "SOFT" 100' }}>
                en confiance.
              </span>
            </span>
          </h1>
          <div className="mt-6 flex items-end justify-between gap-6" data-fade>
            <p className="max-w-sm text-base opacity-75 md:text-lg">Dermatologie et médecine esthétique. Des soins précis, un regard honnête.</p>
            <svg viewBox="0 0 400 60" className="hidden w-[min(34vw,420px)] md:block" fill="none" stroke={INK} strokeWidth="1.5">
              <path ref={pulse} d="M0 30 H110 l12 -22 l16 46 l14 -40 l10 16 H400" />
            </svg>
          </div>
        </div>
      </section>

      <section id="soins" className="px-6 py-28 md:px-12">
        <p className="mb-10 text-xs uppercase tracking-[0.2em] opacity-60">Les soins</p>
        <ul>
          {TREATMENTS.map((r, i) => (
            <li
              key={r.n}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              className="group flex cursor-pointer items-baseline gap-6 border-t border-black/15 py-6 transition-[padding] duration-500 hover:pl-6 md:gap-12 md:py-8"
            >
              <span className="w-8 text-xs opacity-50">{r.n}</span>
              <span className="flex-1 text-[clamp(1.7rem,5vw,4.2rem)] leading-none" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 96, "wght" 300' }}>
                {r.t}
              </span>
              <span className="hidden max-w-[16rem] text-sm opacity-0 transition-opacity duration-500 group-hover:opacity-70 md:block">{r.d}</span>
            </li>
          ))}
          <li className="border-t border-black/15" />
        </ul>
      </section>
      <div
        ref={swatch}
        className="pointer-events-none fixed left-0 top-0 z-50 h-52 w-52 overflow-hidden rounded-full"
        style={{ background: hover === null ? '#fff' : `radial-gradient(circle at 35% 30%, #fff, ${TREATMENTS[hover].c})` }}
      >
        {hover !== null && <Slot src={`medical/treat-${hover + 1}.jpg`} className="absolute inset-0 h-full w-full object-cover" />}
      </div>

      <section data-parcours className="relative flex h-screen items-center overflow-hidden px-6 md:px-12" style={{ background: '#1f4a46', color: CREAM }}>
        <div className="grid w-full items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.2em] opacity-60">Le parcours — {step + 1}/3</p>
            <h2 className="text-[clamp(3rem,9vw,8rem)] leading-[0.95]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 144, "wght" 250' }}>
              {STEPS[step].t}
            </h2>
            <p className="mt-6 max-w-md text-lg opacity-80">{STEPS[step].d}</p>
          </div>
          <div className="flex justify-center">
            <div
              ref={orb}
              className="aspect-square w-[min(70vw,34rem)] rounded-full"
              style={{ background: 'conic-gradient(from 0deg, #e8c4b8, #9bb09a, #f4efe8, #d9c3d8, #e8c4b8)', filter: 'blur(1px)', boxShadow: '0 0 120px rgba(232,196,184,0.35), inset 0 0 80px rgba(255,255,255,0.4)' }}
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-32 md:px-12">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {['#e8c4b8', '#c9d6c3', '#d9c3d8', '#f2d9b8', '#bcd3d0', '#e8c4b8'].map((c, i) => (
            <div key={i} data-drift className="aspect-[3/4] rounded-[999px] md:rounded-t-[999px]" style={{ background: `radial-gradient(circle at 40% 30%, #fff, ${c} 70%)`, marginTop: i % 3 === 1 ? '4rem' : 0 }} />
          ))}
        </div>
      </section>

      <section id="contact" className="px-6 pb-16 pt-24 text-center md:px-12" style={{ background: '#e8c4b8' }}>
        <p className="mb-6 text-xs uppercase tracking-[0.2em] opacity-60">Cabinet de dermatologie</p>
        <h2 className="mx-auto max-w-5xl text-[clamp(2.6rem,8vw,7.5rem)] leading-[0.95]" style={{ fontFamily: SERIF, fontVariationSettings: '"opsz" 144, "wght" 250' }}>
          Prenons le temps de <em style={{ fontVariationSettings: '"opsz" 144, "wght" 200, "SOFT" 100' }}>vous regarder.</em>
        </h2>
        <button className="mt-12 rounded-full px-10 py-5 text-sm uppercase tracking-[0.16em] transition-transform hover:scale-105" style={{ background: INK, color: CREAM }}>
          Prendre rendez-vous
        </button>
        <p className="mt-24 text-xs opacity-50">© Aurèle — démonstration</p>
      </section>
    </div>
  )
}
