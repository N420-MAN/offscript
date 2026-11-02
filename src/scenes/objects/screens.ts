/**
 * Ten abstract website designs, each with its own design language (light editorial, dark luxury, dashboard,
 * immersive, e-commerce, code, architecture, SaaS, medical, real estate). No text, no brands — only structure.
 * `hot` repaints the same screen in vermilion for the moment the script breaks.
 */
export const SCREEN_VARIANTS = 10
const W = 640
const H = 400

function rng(seed: number) {
  let s = seed * 7919 + 13
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function drawScreen(variant: number, seed: number, hot = false, sc = 1): HTMLCanvasElement {
  const r = rng(seed)
  const c = document.createElement('canvas')
  c.width = W * sc
  c.height = H * sc
  const g = c.getContext('2d')!
  g.scale(sc, sc)
  const rect = (x: number, y: number, w: number, h: number, fill: string | CanvasGradient, rad = 4) => {
    g.fillStyle = fill
    g.beginPath()
    g.roundRect(x, y, w, h, rad)
    g.fill()
  }
  const lin = (x0: number, y0: number, x1: number, y1: number, ...stops: string[]) => {
    const gr = g.createLinearGradient(x0, y0, x1, y1)
    stops.forEach((s, i) => gr.addColorStop(i / (stops.length - 1), s))
    return gr
  }
  const blob = (x: number, y: number, rad: number, col: string) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, rad)
    gr.addColorStop(0, col)
    gr.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = gr
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
  const circle = (x: number, y: number, rad: number, fill: string | CanvasGradient) => {
    g.fillStyle = fill
    g.beginPath()
    g.arc(x, y, rad, 0, Math.PI * 2)
    g.fill()
  }

  const light = [0, 4, 6, 8, 9].includes(variant)
  const bg = ['#efece4', '#0f0d0c', '#0e1424', '#10141b', '#f6f4ef', '#11151c', '#f1f1ef', '#12102a', '#eef6f6', '#f3efe7'][variant]
  rect(0, 0, W, H, bg, 14)
  // window chrome
  rect(0, 0, W, 36, light ? '#dcd8cf' : 'rgba(255,255,255,0.07)', 14)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => circle(22 + i * 18, 18, 5, col))
  rect(W / 2 - 110, 10, 220, 16, light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)', 8)
  const T = 36

  const ink = light ? '#17181b' : '#f2f0ea'
  const mute = light ? 'rgba(23,24,27,0.35)' : 'rgba(242,240,234,0.35)'

  if (variant === 0) {
    // light editorial: giant headline bars, photo, index
    rect(32, T + 24, 90, 8, ink, 4)
    rect(440, T + 24, 40, 8, mute, 4)
    rect(500, T + 24, 40, 8, mute, 4)
    rect(32, T + 70, 420, 54, ink, 4)
    rect(32, T + 134, 330, 54, ink, 4)
    rect(32, T + 198, 230, 54, '#ff6a3d', 4)
    rect(480, T + 70, 130, 182, lin(480, T + 70, 610, T + 252, '#c9b79c', '#7a6a58'), 6)
    rect(32, T + 280, 300, 7, mute, 3)
    rect(32, T + 298, 240, 7, mute, 3)
    rect(32, T + 326, 120, 28, ink, 14)
  } else if (variant === 1) {
    // dark luxury hospitality: arched image, thin lines, sand accent
    blob(W * 0.5, H * 0.55, 320, 'rgba(201,164,108,0.22)')
    g.fillStyle = lin(0, T, 0, H, '#3a2c20', '#150f0b')
    g.beginPath()
    g.moveTo(W / 2 - 110, H - 30)
    g.lineTo(W / 2 - 110, T + 130)
    g.arc(W / 2, T + 130, 110, Math.PI, 0)
    g.lineTo(W / 2 + 110, H - 30)
    g.fill()
    g.strokeStyle = 'rgba(214,178,122,0.8)'
    g.lineWidth = 1.5
    g.strokeRect(W / 2 - 124, T + 14, 248, H - T - 40)
    rect(W / 2 - 70, H - 78, 140, 10, '#d6b27a', 5)
    rect(W / 2 - 40, H - 54, 80, 6, 'rgba(214,178,122,0.5)', 3)
    rect(32, T + 24, 60, 6, '#d6b27a', 3)
    rect(W - 92, T + 24, 60, 6, '#d6b27a', 3)
  } else if (variant === 2) {
    // dashboard: sidebar, KPI cards, bars
    rect(0, T, 88, H - T, 'rgba(255,255,255,0.05)', 0)
    for (let i = 0; i < 6; i++) rect(18, T + 24 + i * 32, 52, 9, i === 1 ? '#5b8cff' : 'rgba(255,255,255,0.2)', 4)
    for (let i = 0; i < 3; i++) {
      rect(108 + i * 174, T + 20, 158, 70, 'rgba(255,255,255,0.07)', 8)
      rect(122 + i * 174, T + 34, 56, 7, 'rgba(255,255,255,0.35)', 3)
      rect(122 + i * 174, T + 52, 92, 20, ['#5b8cff', '#4fd1a5', '#f6c453'][i], 4)
    }
    for (let i = 0; i < 18; i++) {
      const h = 30 + r() * 150
      rect(112 + i * 29, H - 22 - h, 19, h, i > 12 ? '#5b8cff' : 'rgba(255,255,255,0.22)', 3)
    }
  } else if (variant === 3) {
    // immersive: glowing sun over layered ridges
    g.fillStyle = lin(0, T, 0, H, '#1c2540', '#2a1a2e')
    g.fillRect(0, T, W, H - T)
    blob(W * 0.66, H * 0.46, 200, 'rgba(255,170,90,0.95)')
    circle(W * 0.66, H * 0.46, 34, '#ffe2b0')
    for (let i = 0; i < 4; i++) {
      g.fillStyle = `rgba(${16 - i * 3},${14 - i * 2},${28 - i * 4},${0.4 + i * 0.18})`
      g.beginPath()
      g.moveTo(0, H)
      for (let x = 0; x <= W; x += 40) g.lineTo(x, H - 40 - i * 34 - Math.sin(x * 0.013 + i * 2 + seed) * (18 + i * 6))
      g.lineTo(W, H)
      g.fill()
    }
    rect(36, H - 94, 250, 26, '#f2f0ea', 4)
    rect(36, H - 54, 150, 8, 'rgba(242,240,234,0.5)', 4)
  } else if (variant === 4) {
    // e-commerce: product grid
    rect(32, T + 20, 100, 9, ink, 4)
    rect(W - 130, T + 18, 98, 14, ink, 7)
    const cols = ['#ff7a59', '#4f7cff', '#f4c542', '#2fbf9b', '#9b6bff', '#ff5e8a']
    for (let i = 0; i < 6; i++) {
      const x = 32 + (i % 3) * 196
      const y = T + 52 + Math.floor(i / 3) * 150
      rect(x, y, 180, 100, '#e9e5da', 8)
      circle(x + 90, y + 50, 30, lin(x, y, x + 180, y + 100, cols[i], '#ffffff'))
      rect(x, y + 108, 90, 8, ink, 4)
      rect(x, y + 124, 40, 7, '#ff6a3d', 3)
    }
  } else if (variant === 5) {
    // code editor
    rect(0, T, 150, H - T, 'rgba(255,255,255,0.05)', 0)
    for (let i = 0; i < 9; i++) rect(18, T + 22 + i * 28, 50 + r() * 60, 8, i === 2 ? '#5b8cff' : 'rgba(255,255,255,0.18)', 3)
    const cols = ['#9fb8ff', '#ffb36b', '#7fe0b4', '#e6e8ee', '#c79bff']
    for (let line = 0; line < 14; line++) {
      let x = 172 + (r() < 0.4 ? 28 : 0)
      const n = 2 + Math.floor(r() * 3)
      for (let k = 0; k < n; k++) {
        const w = 24 + r() * 90
        rect(x, T + 22 + line * 25, w, 8, cols[Math.floor(r() * cols.length)], 3)
        x += w + 10
      }
    }
  } else if (variant === 6) {
    // architecture: strict grid, one big black volume, numerals
    g.strokeStyle = 'rgba(0,0,0,0.18)'
    g.lineWidth = 1
    for (let x = 32; x < W; x += 76) {
      g.beginPath()
      g.moveTo(x, T)
      g.lineTo(x, H)
      g.stroke()
    }
    rect(108, T + 40, 300, 230, '#15161a', 0)
    rect(184, T + 100, 150, 170, 'rgba(255,255,255,0.12)', 0)
    rect(260, T + 20, 3, 252, '#ff5a2c', 0)
    rect(432, T + 40, 170, 8, ink, 0)
    rect(432, T + 60, 120, 8, mute, 0)
    for (let i = 0; i < 3; i++) rect(432, T + 130 + i * 36, 160, 1.5, ink, 0)
    rect(32, H - 46, 70, 10, ink, 0)
  } else if (variant === 7) {
    // gradient-mesh SaaS
    blob(120, 130, 240, 'rgba(120,90,255,0.85)')
    blob(520, 120, 240, 'rgba(255,90,170,0.7)')
    blob(330, 330, 260, 'rgba(60,180,255,0.7)')
    rect(W / 2 - 150, T + 88, 300, 26, 'rgba(255,255,255,0.95)', 6)
    rect(W / 2 - 100, T + 124, 200, 26, 'rgba(255,255,255,0.8)', 6)
    rect(W / 2 - 120, T + 172, 110, 30, '#ffffff', 15)
    rect(W / 2 + 10, T + 172, 110, 30, 'rgba(255,255,255,0.25)', 15)
    for (let i = 0; i < 3; i++) rect(70 + i * 190, H - 100, 160, 64, 'rgba(255,255,255,0.14)', 12)
  } else if (variant === 8) {
    // medical: calm teal, pulse line, appointment cards
    rect(0, T, W, 70, lin(0, 0, W, 0, '#0fa3a3', '#4fd1c5'), 0)
    rect(32, T + 22, 160, 12, '#ffffff', 6)
    rect(32, T + 42, 100, 8, 'rgba(255,255,255,0.6)', 4)
    g.strokeStyle = '#0fa3a3'
    g.lineWidth = 3
    g.beginPath()
    for (let x = 32; x < W - 32; x += 4) {
      const t = (x - 32) / 40
      const y = H - 150 - (Math.abs(t % 6 - 3) < 0.35 ? -50 * Math.sin((t % 6) * 6) : 0) + Math.sin(x * 0.05) * 3
      if (x === 32) g.moveTo(x, y)
      else g.lineTo(x, y)
    }
    g.stroke()
    for (let i = 0; i < 3; i++) {
      rect(32 + i * 196, H - 116, 180, 80, '#ffffff', 12)
      circle(62 + i * 196, H - 76, 16, ['#bfeeea', '#cfe3ff', '#ffe0cc'][i])
      rect(90 + i * 196, H - 90, 80, 8, '#17181b', 4)
      rect(90 + i * 196, H - 72, 54, 7, 'rgba(23,24,27,0.35)', 3)
    }
  } else {
    // real estate: big listing photo, price tags, map pins
    rect(32, T + 20, 380, 226, lin(32, T + 20, 412, T + 246, '#e8c9a0', '#9bb4c9'), 10)
    g.fillStyle = 'rgba(40,50,60,0.7)'
    g.beginPath()
    g.moveTo(130, T + 246)
    g.lineTo(130, T + 150)
    g.lineTo(222, T + 100)
    g.lineTo(314, T + 150)
    g.lineTo(314, T + 246)
    g.fill()
    rect(52, T + 40, 90, 24, '#ffffff', 12)
    rect(436, T + 20, 172, 108, '#dfe8df', 10)
    ;[[470, T + 60], [540, T + 90], [580, T + 48]].forEach(([x, y]) => circle(x, y, 7, '#ff5a2c'))
    rect(436, T + 140, 172, 106, '#ffffff', 10)
    rect(450, T + 156, 110, 10, '#17181b', 4)
    rect(450, T + 176, 70, 8, '#ff6a3d', 4)
    rect(450, T + 196, 130, 7, 'rgba(23,24,27,0.3)', 3)
    for (let i = 0; i < 3; i++) rect(32 + i * 130, T + 262, 118, 70, '#ffffff', 10)
  }

  // glass sheen and a lit top edge
  const sheen = lin(0, 0, W * 0.8, H, 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0)')
  rect(0, 0, W, H, sheen, 14)
  g.strokeStyle = 'rgba(255,255,255,0.4)'
  g.lineWidth = 1.5
  g.beginPath()
  g.moveTo(14, 1)
  g.lineTo(W - 14, 1)
  g.stroke()
  g.strokeStyle = light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)'
  g.lineWidth = 2
  g.beginPath()
  g.roundRect(1, 1, W - 2, H - 2, 14)
  g.stroke()

  if (hot) {
    // Repaint in vermilion, keeping the light and dark structure.
    g.globalCompositeOperation = 'color'
    g.fillStyle = '#ff4b1f'
    g.globalAlpha = 0.9
    g.fillRect(0, 0, W, H)
    g.globalAlpha = 1
    g.globalCompositeOperation = 'source-over'
  }
  return c
}
