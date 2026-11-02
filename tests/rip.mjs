import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 1100, height: 650 } })
await p.goto('http://127.0.0.1:5173/?intro=0#/demo/hotel'); await p.waitForTimeout(5000)
await p.evaluate(()=>window.scrollTo(0,700)); await p.waitForTimeout(800)
const ok = await p.evaluate(async()=>{ try{ const m=await import('/node_modules/.vite/deps/gsap.js'); (m.gsap||m.default).globalTimeline.timeScale(0.1); return true }catch(e){ return String(e) } })
console.log('slowmo', ok)
await p.locator('a:has-text("OFF/SCRIPT"):visible').first().click()
for (let i=0;i<9;i++){ await p.waitForTimeout(1100); await p.screenshot({path:`shots/rip${i}.png`}) }
await b.close()
