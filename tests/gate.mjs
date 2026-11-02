import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 1100, height: 650 } })
const errs=[]; p.on('pageerror',e=>errs.push(e.message))
await p.goto('http://127.0.0.1:5173/?intro=0'); await p.waitForTimeout(3000)
const gateY = await p.evaluate(()=>{const s=document.querySelector('[data-stage]'); return s.offsetHeight - innerHeight})
await p.mouse.move(500,300)
for (let i=0;i<14;i++){ await p.mouse.wheel(0,500); await p.waitForTimeout(60) }
await p.waitForTimeout(1200)
console.log('gateY',gateY,'after fast scroll',await p.evaluate(()=>Math.round(scrollY)))
await p.waitForTimeout(600)
await p.mouse.wheel(0,400); await p.waitForTimeout(1500)
console.log('after new gesture',await p.evaluate(()=>Math.round(scrollY)))
// click a few windows
await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),gateY); await p.waitForTimeout(4000)
const n = await p.locator('[role=button][aria-label^="Ouvrir"]').count()
let opened=0
for (let i=0;i<n;i++){
  await p.evaluate(v=>{location.hash='#/'; window.scrollTo({top:v,behavior:'instant'})},gateY); await p.waitForTimeout(1500)
  const el = p.locator('[role=button][aria-label^="Ouvrir"]').nth(i)
  const box = await el.boundingBox(); if(!box) continue
  // click the top-most point of this window
  const pts=[[0.5,0.5],[0.3,0.3],[0.7,0.7],[0.3,0.7],[0.7,0.3]]
  let hit=false
  for (const [fx,fy] of pts){ const x=box.x+box.width*fx,y=box.y+box.height*fy; const id=await p.evaluate(([x,y,i])=>{const e=document.elementFromPoint(x,y)?.closest('[role=button]'); return e? [...document.querySelectorAll('[role=button][aria-label^="Ouvrir"]')].indexOf(e):-1},[x,y,i]); if(id===i){ await p.mouse.click(x,y); hit=true; break } }
  await p.waitForTimeout(3500)
  const h=await p.evaluate(()=>location.hash); if(h.startsWith('#/demo/')) opened++
  console.log(i,'reachable',hit,'hash',h)
}
console.log('opened',opened,'of',n,'errs',errs.slice(0,3))
await b.close()
