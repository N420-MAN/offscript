import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const errs=[]
const m = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:3, hasTouch:true, isMobile:true })
const p = await m.newPage(); p.on('pageerror',e=>errs.push(e.message))
await p.goto('http://127.0.0.1:5173/?intro=0'); await p.waitForTimeout(6000)
await p.screenshot({path:'shots/ph0.png'})
const y = await p.evaluate(()=>document.querySelector('[data-stage]').offsetHeight - innerHeight)
await p.evaluate(v=>window.scrollTo({top:v*0.36,behavior:'instant'}),y); await p.waitForTimeout(5000)
await p.screenshot({path:'shots/ph1.png'})
console.log('dpr', await p.evaluate(()=>devicePixelRatio), 'canvas', await p.evaluate(()=>{const c=document.querySelector('canvas'); return c? [c.width,c.height,c.clientWidth]:null}), errs)
// short desktop window: logo vs headline
const d = await b.newPage({ viewport:{width:987,height:455} }); await d.goto('http://127.0.0.1:5173/?intro=0'); await d.waitForTimeout(5000); await d.screenshot({path:'shots/logo.png'})
await b.close()
