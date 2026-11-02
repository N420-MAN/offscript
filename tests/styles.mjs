import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const slugs = ['medical','hotel','residence','finance','ev','ai','atelier','festival','watch']
for (const s of slugs) {
  const p = await b.newPage({ viewport: { width: 960, height: 560 } })
  await p.goto(`http://127.0.0.1:5173/?intro=0#/demo/${s}`); await p.waitForTimeout(4500)
  await p.evaluate(async()=>{ const m=await import('/node_modules/.vite/deps/gsap.js'); (m.gsap||m.default).globalTimeline.timeScale(0.12) })
  await p.locator('a:has-text("OFF/SCRIPT"):visible').first().click()
  await p.waitForTimeout(5800); await p.screenshot({path:`shots/st-${s}-a.png`})
  await p.waitForTimeout(1500); await p.screenshot({path:`shots/st-${s}-b.png`})
  await p.close()
}
await b.close()
