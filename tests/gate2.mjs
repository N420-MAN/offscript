import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 1100, height: 650 } })
p.on('console',m=>m.text().startsWith('GATE')&&console.log(m.text())); await p.goto('http://127.0.0.1:5173/?intro=0'); await p.waitForTimeout(3000)
await p.evaluate(()=>{ window.__log=[]; window.addEventListener('scroll',()=>window.__log.push(Math.round(scrollY))); window.addEventListener('wheel',e=>window.__log.push('w'+(e.defaultPrevented?'P':'')),{capture:false}) })
await p.mouse.move(500,300)
for (let i=0;i<6;i++){ await p.mouse.wheel(0,500); await p.waitForTimeout(80); console.log(i, await p.evaluate(()=>[Math.round(scrollY), __stage.held, __stage.paused, __stage.gateBypass])) }
await p.waitForTimeout(1500)
console.log(JSON.stringify(await p.evaluate(()=>window.__log)))
await b.close()
