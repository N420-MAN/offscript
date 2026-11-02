import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs=[]; p.on('pageerror',e=>errs.push(e.message))
await p.goto('http://127.0.0.1:5173/?intro=0'); await p.waitForTimeout(3000)
const h = await p.evaluate(()=>document.querySelector('[data-hero-fade]')?.closest('div[style*="320vh"]')?.offsetHeight ?? 0)
const y = await p.evaluate(()=>{const s=[...document.querySelectorAll('div')].find(d=>d.style.height==='320vh'); return s? s.offsetHeight - innerHeight : 0})
await p.evaluate(v=>window.scrollTo({top:v*0.70,behavior:'instant'}),y); await p.waitForTimeout(1500)
await p.evaluate(v=>window.scrollTo({top:v*0.80,behavior:'instant'}),y)
for (const [i,ms] of [[0,500],[1,700],[2,900],[3,1500],[4,4000]]) { await p.waitForTimeout(ms); await p.screenshot({path:`shots/w${i}.png`}) }
console.log('y',y,'errs',errs)
await b.close()
