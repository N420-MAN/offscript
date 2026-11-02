import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
for (const [name, vp] of [['d',{width:1440,height:900}],['m',{width:390,height:844}]]) {
  const p = await b.newPage({ viewport: vp })
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()))
  await p.goto('http://127.0.0.1:5173/?intro=0'); await p.waitForTimeout(3000)
  for (const id of ['expertises','studio','process','contact','formulaire']) {
    await p.evaluate(i=>document.getElementById(i)?.scrollIntoView({behavior:'instant'}),id)
    await p.waitForTimeout(2500)
    await p.screenshot({ path: `shots/s-${name}-${id}.png` })
  }
  const w = await p.evaluate(()=>[document.documentElement.scrollWidth, innerWidth])
  console.log(name,'overflow',w,'errors',errs.slice(0,5))
  await p.close()
}
await b.close()
