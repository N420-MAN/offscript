import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 480, height: 320 } })
await p.goto('http://127.0.0.1:5173/?intro=0'); await p.waitForTimeout(3000)
await p.locator('a:has-text("Découvrir notre univers"):visible').first().click()
const t0=Date.now(); const out=[]
for (let i=0;i<12;i++){ await p.waitForTimeout(700); out.push([Date.now()-t0, await p.evaluate(()=>Math.round(scrollY))]) }
console.log(JSON.stringify(out), 'target', await p.evaluate(()=>Math.round(document.getElementById('expertises').getBoundingClientRect().top+scrollY)))
await b.close()
