import gsap from 'gsap'
import type { DemoSlug } from '../demos/meta'
import { preload } from '../components/ui/windows/shared'
import { curtainLayer, mounted, prepare, STYLE_OF } from './transitions'
import { prefersReducedMotion } from '../hooks/useCapabilities'

let busy = false

/**
 * Grows a picture of the demo from `rect` to fill the screen while it turns into the demo's curtain (its colours and
 * name). The curtain is what the reveal then opens, so the live page is never compared with a stale screenshot.
 */
export function growToCurtain(slug: DemoSlug, cover: HTMLElement, rect: { left: number; top: number; width: number; height: number }, rotation = 0, radius = 14) {
  const win = document.createElement('div')
  win.style.cssText = `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;overflow:hidden;border-radius:${radius}px;background:#0b1020;transform:rotate(${rotation}deg);box-shadow:0 30px 80px rgba(0,0,0,.6)`
  const im = document.createElement('img')
  im.src = `/demos/${slug}.jpg`
  im.alt = ''
  im.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'
  const curtain = curtainLayer(slug)
  curtain.style.cssText += ';left:50%;top:50%;transform:translate(-50%,-50%);opacity:0'
  win.append(im, curtain)
  cover.appendChild(win)
  const tl = gsap.timeline()
  tl.to(win, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, rotation: 0, borderRadius: 0, duration: 0.65, ease: 'expo.inOut' }, 0)
  tl.to(im, { scale: 1.06, filter: 'blur(6px)', duration: 0.4, ease: 'power2.in' }, 0.2)
  tl.to(curtain, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0.38)
  return tl
}

/**
 * Opens a demo from a flat card on the page (the work index): the card grows to fill the screen and becomes the
 * demo's curtain, the demo mounts underneath, then the curtain opens in the demo's own reveal.
 */
export function openDemoFrom(slug: DemoSlug, from: HTMLElement) {
  if (busy) return
  const loading = preload[slug]()
  if (prefersReducedMotion()) {
    window.location.hash = `#/demo/${slug}`
    return
  }
  busy = true
  const r = from.getBoundingClientRect()
  const cover = document.createElement('div')
  cover.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none'
  document.body.appendChild(cover)

  growToCurtain(slug, cover, r).eventCallback('onComplete', () => {
    const style = STYLE_OF[slug]
    // the paper tear belongs to the floating windows; from a flat card, Fragment opens on sliding doors
    const go = prepare(style === 'rip' ? 'doors' : style, cover, slug, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
    window.location.hash = `#/demo/${slug}`
    void mounted(() => loading).then(() =>
      go(() => {
        cover.remove()
        busy = false
      }),
    )
  })
}
