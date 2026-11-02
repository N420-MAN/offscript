const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`

/** Minimal full-screen fragment shader runner: uRes, uTime, uMouse (0..1, y up) plus any extra float uniforms. */
export function runShader(canvas: HTMLCanvasElement, frag: string, extra?: () => Record<string, number>): () => void {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
  if (!gl) return () => {}
  const mk = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()!
  const vs = mk(gl.VERTEX_SHADER, VERT)
  const fs = mk(gl.FRAGMENT_SHADER, frag)
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('shader', gl.getShaderInfoLog(vs), gl.getShaderInfoLog(fs), gl.getProgramInfoLog(prog))
    return () => {}
  }
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const u = (n: string) => gl.getUniformLocation(prog, n)
  const uRes = u('uRes')
  const uTime = u('uTime')
  const uMouse = u('uMouse')
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
  const move = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    mouse.tx = (e.clientX - r.left) / r.width
    mouse.ty = 1 - (e.clientY - r.top) / r.height
  }
  window.addEventListener('pointermove', move)
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, canvas.clientWidth < 720 ? 1 : 1.25)
    canvas.width = Math.max(2, Math.floor(canvas.clientWidth * dpr))
    canvas.height = Math.max(2, Math.floor(canvas.clientHeight * dpr))
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()
  window.addEventListener('resize', resize)
  const t0 = performance.now()
  let raf = 0
  const frame = () => {
    mouse.x += (mouse.tx - mouse.x) * 0.07
    mouse.y += (mouse.ty - mouse.y) * 0.07
    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform1f(uTime, (performance.now() - t0) / 1000)
    gl.uniform2f(uMouse, mouse.x, mouse.y)
    if (extra) for (const [k, v] of Object.entries(extra())) gl.uniform1f(u(k), v)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    raf = requestAnimationFrame(frame)
  }
  frame()
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('resize', resize)
  }
}
