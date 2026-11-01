// node vid.js <scale> <fps> <t0> <t1> <out.mp4|stills:t1,t2,...>
const { chromium } = require('playwright'); const { spawn } = require('child_process');
const [sc, fps, T0, T1, out] = [parseFloat(process.argv[2]), parseFloat(process.argv[3]), parseFloat(process.argv[4]), parseFloat(process.argv[5]), process.argv[6]];
(async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const W=Math.round(1080*sc), H=Math.round(1920*sc);
 const p=await b.newPage({viewport:{width:W,height:H}}); p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto(`http://127.0.0.1:8765/scene.html?s=${sc}`); await p.waitForFunction(()=>window.ready); await p.evaluate(()=>window.ready);
 await p.addScriptTag({path:'video.js'});
 if(out.startsWith('stills:')){ for(const t of out.slice(7).split(',')){ await p.evaluate(t=>window.vframe(t),parseFloat(t)); await p.screenshot({path:`shots/v_${t}.png`}); } await b.close(); return; }
 const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-i','-','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p',out]);
 const N=Math.round((T1-T0)*fps); const st=Date.now();
 for(let f=0;f<N;f++){ const t=T0+f/fps; await p.evaluate(t=>window.vframe(t),t);
   const buf=await p.screenshot({type:'jpeg',quality:90}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
   if(f%60===0) console.log('frame',f,'/',N, ((Date.now()-st)/1000).toFixed(0)+'s'); }
 ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close(); console.log('DONE');
})();
