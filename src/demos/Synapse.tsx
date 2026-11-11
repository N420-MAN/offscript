import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import '@fontsource-variable/inter'
import '@fontsource/dm-mono/400.css'
import SynapseProduct, { AppFrame } from './SynapseProduct'

gsap.registerPlugin(ScrollTrigger)

const SANS = '"Inter Variable", system-ui, sans-serif'
const MONO = '"DM Mono", monospace'
const BG = '#05070d'
const VIO = '#8b6cff'
const MINT = '#5cffc8'

/** A rotating 3D network: nodes on a loose shell, nearest neighbours linked, signals travelling the links, cursor as a probe. */
function Network() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    let W = 0
    let H = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      W = c.clientWidth
      H = c.clientHeight
      c.width = W * dpr
      c.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    const N = W < 720 ? 90 : 170
    const nodes = Array.from({ length: N }, () => {
      const u = Math.random() * 2 - 1
      const a = Math.random() * Math.PI * 2
      const r = 0.55 + Math.random() * 0.5
      const s = Math.sqrt(1 - u * u)
      return { x: Math.cos(a) * s * r, y: u * r, z: Math.sin(a) * s * r, hot: 0 }
    })
    const links: [number, number][] = []
    nodes.forEach((n, i) => {
      const d = nodes.map((m, j) => ({ j, d: (n.x - m.x) ** 2 + (n.y - m.y) ** 2 + (n.z - m.z) ** 2 })).filter((o) => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 3)
      d.forEach((o) => { if (!links.some(([a, b]) => (a === i && b === o.j) || (a === o.j && b === i))) links.push([i, o.j]) })
    })
    const signals = Array.from({ length: 26 }, () => ({ l: Math.floor(Math.random() * links.length), t: Math.random(), v: 0.004 + Math.random() * 0.008 }))
    const m = { x: -999, y: -999 }
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      m.x = e.clientX - r.left
      m.y = e.clientY - r.top
    }
    window.addEventListener('pointermove', move)
    let raf = 0
    let t = 0
    const proj = new Float32Array(N * 3)
    const draw = () => {
      t += 0.0035
      ctx.clearRect(0, 0, W, H)
      const cx = W * (W < 720 ? 0.5 : 0.62)
      const cy = H * 0.5
      const S = Math.min(W, H) * (W < 720 ? 0.6 : 0.78)
      const cs = Math.cos(t)
      const sn = Math.sin(t)
      const ct = Math.cos(0.35)
      const st = Math.sin(0.35)
      nodes.forEach((n, i) => {
        const x = n.x * cs - n.z * sn
        const z0 = n.x * sn + n.z * cs
        const y = n.y * ct - z0 * st
        const z = n.y * st + z0 * ct
        const k = 1.6 / (2.4 - z)
        proj[i * 3] = cx + x * S * k
        proj[i * 3 + 1] = cy + y * S * k
        proj[i * 3 + 2] = k
        const d = Math.hypot(proj[i * 3] - m.x, proj[i * 3 + 1] - m.y)
        n.hot += ((d < 130 ? 1 - d / 130 : 0) - n.hot) * 0.12
      })
      ctx.lineWidth = 0.7
      for (const [a, b] of links) {
        const h = Math.max(nodes[a].hot, nodes[b].hot)
        ctx.strokeStyle = h > 0.05 ? `rgba(92,255,200,${0.15 + h * 0.7})` : `rgba(139,108,255,${0.14 + (proj[a * 3 + 2] + proj[b * 3 + 2]) * 0.16})`
        ctx.beginPath()
        ctx.moveTo(proj[a * 3], proj[a * 3 + 1])
        ctx.lineTo(proj[b * 3], proj[b * 3 + 1])
        ctx.stroke()
      }
      for (const s of signals) {
        s.t += s.v
        if (s.t > 1) {
          s.t = 0
          s.l = Math.floor(Math.random() * links.length)
        }
        const [a, b] = links[s.l]
        const x = proj[a * 3] + (proj[b * 3] - proj[a * 3]) * s.t
        const y = proj[a * 3 + 1] + (proj[b * 3 + 1] - proj[a * 3 + 1]) * s.t
        ctx.fillStyle = MINT
        ctx.shadowColor = MINT
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(x, y, 1.8, 0, 7)
        ctx.fill()
        ctx.shadowBlur = 0
      }
      nodes.forEach((n, i) => {
        const k = proj[i * 3 + 2]
        ctx.fillStyle = n.hot > 0.05 ? MINT : `rgba(215,205,255,${0.5 + k * 0.4})`
        ctx.beginPath()
        ctx.arc(proj[i * 3], proj[i * 3 + 1], (1.2 + k * 1.2) * (1 + n.hot * 2), 0, 7)
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
    }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />
}

const LINES = [
  '> connexion au corpus… ok',
  '> indexation de 12 480 documents… ok',
  '> graphe de connaissances : 3 204 relations',
  '> requête : « risques contractuels T3 »',
  '> 7 clauses sensibles repérées en 0,42 s',
  '> synthèse prête. confiance 97,1 %',
]

function Terminal() {
  const ref = useRef<HTMLPreElement>(null)
  useEffect(() => {
    let line = 0
    let ch = 0
    let out = ''
    const id = window.setInterval(() => {
      if (line >= LINES.length) {
        line = 0
        out = ''
        ch = 0
        return
      }
      const cur = LINES[line]
      ch++
      if (ch > cur.length + 8) {
        out += cur + '\n'
        line++
        ch = 0
      }
      if (ref.current) ref.current.textContent = out + (line < LINES.length ? LINES[line].slice(0, ch) + '▍' : '')
    }, 38)
    return () => window.clearInterval(id)
  }, [])
  return <pre ref={ref} className="min-h-[11rem] whitespace-pre-wrap text-[0.8rem] leading-7" style={{ fontFamily: MONO, color: MINT }} />
}

function Bars() {
  return (
    <div className="flex h-28 items-end gap-1.5">
      {Array.from({ length: 22 }, (_, i) => (
        <i key={i} className="w-full rounded-sm" style={{ background: i % 5 === 0 ? MINT : VIO, height: `${20 + ((i * 37) % 70)}%`, animation: `bar ${1.4 + (i % 6) * 0.25}s ease-in-out ${i * 0.07}s infinite alternate`, opacity: 0.85 }} />
      ))}
    </div>
  )
}

export default function Synapse() {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      gsap.from('[data-rise]', { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'expo.out', delay: 0.2 })
      gsap.from('[data-card]', { y: 60, opacity: 0, stagger: 0.14, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '[data-cards]', start: 'top 80%' } })
    },
    { scope: root },
  )
  return (
    <div ref={root} style={{ background: BG, color: '#dfe6ff', fontFamily: SANS }}>
      <style>{`@keyframes bar{from{transform:scaleY(.35)}to{transform:scaleY(1)}} .bar-o{transform-origin:bottom}`}</style>
      <section className="relative h-screen min-h-[640px] overflow-hidden">
        <Network />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(5,7,13,.92) 0%, rgba(5,7,13,.55) 40%, transparent 70%)' }} />
        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6 text-xs md:px-12" style={{ fontFamily: MONO }}>
          <span className="flex items-center gap-2 text-sm font-semibold tracking-wide" style={{ fontFamily: SANS }}>
            <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: MINT, boxShadow: `0 0 12px ${MINT}` }} />synapse
          </span>
          <span className="hidden gap-8 opacity-60 md:flex"><span>Produit</span><span>Sécurité</span><span>Documentation</span></span>
          <a href="#demo" className="rounded-full border px-4 py-2 transition-colors hover:bg-white/5" style={{ borderColor: VIO, color: '#cfc4ff' }}>Demander une démo</a>
        </header>
        <div className="absolute bottom-[12%] left-0 max-w-3xl px-6 md:px-12">
          <p className="mb-5 text-xs uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: MINT }}>Plateforme d’intelligence documentaire</p>
          <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            <span className="block overflow-hidden"><span data-rise className="block">L’intelligence</span></span>
            <span className="block overflow-hidden"><span data-rise className="block" style={{ background: `linear-gradient(90deg, ${VIO}, ${MINT})`, WebkitBackgroundClip: 'text', color: 'transparent' }}>qui relie.</span></span>
          </h1>
        </div>
      </section>

      <AppFrame />

      <section data-cards className="grid gap-5 px-6 py-24 md:grid-cols-3 md:px-12">
        <div data-card className="rounded-2xl border border-white/10 p-7 md:col-span-2" style={{ background: 'linear-gradient(160deg,#0b0f1d,#070a14)' }}>
          <p className="mb-5 text-xs uppercase tracking-[0.24em] opacity-55" style={{ fontFamily: MONO }}>01 · Compréhension</p>
          <Terminal />
        </div>
        <div data-card className="rounded-2xl border border-white/10 p-7" style={{ background: 'linear-gradient(160deg,#0d0b1f,#070a14)' }}>
          <p className="mb-5 text-xs uppercase tracking-[0.24em] opacity-55" style={{ fontFamily: MONO }}>02 · Latence</p>
          <p className="mb-6 text-5xl font-semibold tracking-[-0.04em]">0,42<span className="ml-1 text-lg" style={{ color: MINT }}>s</span></p>
          <div className="[&_i]:origin-bottom"><Bars /></div>
        </div>
        <div data-card className="rounded-2xl border border-white/10 p-7" style={{ background: '#070a14' }}>
          <p className="mb-5 text-xs uppercase tracking-[0.24em] opacity-55" style={{ fontFamily: MONO }}>03 · Sécurité</p>
          <p className="text-3xl font-semibold leading-tight tracking-[-0.03em]">Vos données restent <span style={{ color: MINT }}>chez vous.</span></p>
          <p className="mt-4 text-sm opacity-55">Chiffrement de bout en bout, hébergement local, aucune donnée utilisée pour l’entraînement.</p>
        </div>
        <div data-card className="rounded-2xl border border-white/10 p-7 md:col-span-2" style={{ background: 'linear-gradient(160deg,#0b0f1d,#070a14)' }}>
          <p className="mb-5 text-xs uppercase tracking-[0.24em] opacity-55" style={{ fontFamily: MONO }}>04 · Connecteurs</p>
          <div className="flex flex-wrap gap-2.5">
            {['Drive', 'Mail', 'ERP', 'CRM', 'SharePoint', 'Base SQL', 'API', 'PDF', 'Slack'].map((t, i) => (
              <span key={t} className="rounded-full border px-4 py-2 text-xs" style={{ fontFamily: MONO, borderColor: i % 3 === 0 ? MINT : 'rgba(255,255,255,.14)', color: i % 3 === 0 ? MINT : '#aab4d6' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <SynapseProduct />
    </div>
  )
}
