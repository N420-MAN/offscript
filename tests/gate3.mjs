import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 420, height: 300 } })
p.on('console',m=>m.text().startsWith('GATEW')&&console.log(m.text())); const errs=[]; p.on('pageerror',e=>errs.push(e.message))
await p.goto('http://127.0.0.1:5173/?intro=0'); await p.waitForTimeout(3000)
const gateY = await p.evaluate(()=>{const s=document.querySelector('[data-stage]'); return s.offsetHeight - innerHeight})
await p.mouse.move(200,150)
for (let i=0;i<20;i++){ await p.mouse.wheel(0,500); await p.waitForTimeout(60) }
await p.waitForTimeout(1200)
console.log('gateY',gateY,'after fast scroll',await p.evaluate(()=>Math.round(scrollY)))
await p.waitForTimeout(600)
await p.mouse.wheel(0,400); for (let k=0;k<5;k++){ await p.waitForTimeout(400); console.log(await p.evaluate(()=>[Math.round(scrollY),__stage.held])) }
console.log('after new gesture',await p.evaluate(()=>Math.round(scrollY)))
await b.close()
