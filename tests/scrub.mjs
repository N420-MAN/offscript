import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
const errs=[]; p.on('pageerror',e=>errs.push(e.message))
await p.goto('http://127.0.0.1:5173/?intro=0'); await p.waitForTimeout(3000)
const y = await p.evaluate(()=>{const s=[...document.querySelectorAll('div')].find(d=>d.style.height==='320vh'); return s.offsetHeight - innerHeight})
const fr=[0,0.4,0.56,0.64,0.72,0.8,0.9,1.0]
for (const [i,f] of fr.entries()) { await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y*f); await p.waitForTimeout(2600); await p.screenshot({path:`shots/sc${i}.png`}) }
// scroll back to top: windows must be hidden
await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'})); await p.waitForTimeout(2500)
console.log('visible windows at top:', await p.evaluate(()=>[...document.querySelectorAll('[role=button][aria-label^="Ouvrir"]')].filter(e=>getComputedStyle(e).visibility!=='hidden').length), 'errs', errs)
await p.screenshot({path:'shots/sc-top.png'})
await b.close()
