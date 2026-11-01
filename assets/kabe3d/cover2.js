const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1080,height:1920}}); p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://127.0.0.1:8766/scene.html'); await p.waitForFunction(()=>window.ready); await p.evaluate(()=>window.ready);
 await p.evaluate(()=>{ window.frame(0,{cam:[-62,14,30,[1.5,6.2,-1]]}); });
 await p.screenshot({path:'shots/cover_base.png'}); await b.close(); })();
