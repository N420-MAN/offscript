import gsap from 'gsap'
import type { DemoSlug } from '../demos/meta'
import { preload } from '../components/ui/windows/shared'
import { prepare, STYLE_OF } from './transitions'
import { prefersReducedMotion } from '../hooks/useCapabilities'

let busy = false

/**
 * Opens a demo from a flat card on the page (the work index): the card's picture grows square to fill the screen,
 * then plays the demo's own reveal, the same language the floating windows use.
 */
export function openDemoFrom(slug: DemoSlug, from: HTMLElement) {
  if (busy) return
  void preload[slug]()
  if (prefersReducedMotion()) {
    window.location.hash = `#/demo/${slug}`
    return
  }
  busy = true
  const src = `/demos/${slug}.jpg`
  const r = from.getBoundingClientRect()
  const cover = document.createElement('div')
  cover.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none'
  document.body.appendChild(cover)

  const win = document.createElement('div')
  win.style.cssText = `position:absolute;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;overflow:hidden;border-radius:14px;background:#0b1020;box-shadow:0 30px 80px rgba(0,0,0,.6)`
  const im = document.createElement('img')
  im.src = src
  im.alt = ''
  im.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'
  win.appendChild(im)
  cover.appendChild(win)

  const finish = () => {
    cover.remove()
    busy = false
  }
  gsap.to(win, {
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    borderRadius: 0,
    duration: 0.65,
    ease: 'expo.inOut',
    onComplete: () => {
      const style = STYLE_OF[slug]
      // the paper tear belongs to the floating windows; from a flat card, Fragment opens on sliding doors
      const go = prepare(style === 'rip' ? 'doors' : style, cover, src, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
      window.location.hash = `#/demo/${slug}`
      window.setTimeout(() => go(finish), 340)
    },
  })
}
