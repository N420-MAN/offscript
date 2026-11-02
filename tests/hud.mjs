import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport:{width:1600,height:800} }); const errs=[]; p.on('pageerror',e=>errs.push(e.message))
await p.goto('http://127.0.0.1:5173/?intro=0&debug'); await p.waitForTimeout(7000)
await p.screenshot({path:'shots/hud.png'})
const y = await p.evaluate(()=>document.querySelector('[data-stage]').offsetHeight - innerHeight)
await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await p.waitForTimeout(6000)
await p.screenshot({path:'shots/hud_end.png'}); console.log(errs); await b.close()
