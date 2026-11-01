// ===================================================================== Tavaf videosu zaman çizelgesi
// Zamanlar şimdilik tahmini (önizleme). Ses gelince SEG başlangıç/bitişleri segment.py çıktısına göre güncellenir.
(function(){
const SEG = [ // [t0, t1, altyazı, vurgulu kelimeler]
 [0.2, 4.2, "Bir Müslüman olarak... Kâbe'de tavaf yapmayı biliyor musun?", ['biliyor','musun?']],
 [4.4, 7.4, "Nereden başlanır, nerede biter? Gel, birlikte bir tur atalım.", ['başlanır,','biter?']],
 [7.7, 10.3, "Tavaf, Kâbe'nin etrafında yedi kez dönmektir.", ['yedi']],
 [10.6, 17.2, "Peygamber Efendimiz buyurur ki: “Kâbe'yi tavaf etmek namaz gibidir... ancak tavafta konuşmanıza izin verilmiştir.”", ['namaz','gibidir...']],
 [17.5, 19.6, "Bu yüzden tavafa abdestli girilir.", ['abdestli']],
 [19.9, 22.4, "Tur, Hacerülesved'in hizasında başlar.", ["Hacerülesved'in"]],
 [22.7, 25.4, "Niyet edersin... Kâbe'yi soluna alırsın.", ['soluna']],
 [25.7, 30.2, "Elini Hacerülesved'e doğru kaldırıp “Bismillâhi Allâhu ekber” dersin. Buna istilam denir.", ['istilam']],
 [30.5, 32.4, "Şimdi yürüyelim... yedi durak var.", ['yedi','durak']],
 [32.7, 35.3, "Birinci durak: Hacerülesved, cennetten gelen taş.", ['Birinci']],
 [35.6, 40.8, "İkinci durak: Mültezem ve Kâbe'nin kapısı. Burası duaların kabul olunduğu umulan yerdir.", ['İkinci','Mültezem']],
 [41.1, 45.8, "Üçüncü durak: Makam-ı İbrâhim. Hz. İbrâhim'in, Kâbe'yi inşa ederken üzerinde durduğu taş.", ['Üçüncü']],
 [46.1, 48.3, "Dördüncü durak: Rükn-i Irâkî köşesi.", ['Dördüncü']],
 [48.6, 55.2, "Beşinci durak: Hicr-i İsmâil. Bu yarım daire aslında Kâbe'den sayılır... bu yüzden tavaf onun dışından yapılır.", ['Beşinci','dışından']],
 [55.5, 57.8, "Üstündeki altın oluk ise Mîzâb-ı Rahmet.", ['Mîzâb-ı','Rahmet.']],
 [58.1, 63.8, "Osmanlı padişahı Sultan Abdülmecid, 1857'de buraya altın bir oluk koydurdu. Bugünkü oluk, onun birebir benzeridir.", ['Sultan','Abdülmecid,']],
 [64.1, 66.3, "Altıncı durak: Rükn-i Şâmî köşesi.", ['Altıncı']],
 [66.6, 73.7, "Yedinci durak: Rükn-i Yemânî. Efendimiz, Kâbe'de yalnızca iki köşeye dokunurdu: Hacerülesved'e ve Rükn-i Yemânî'ye.", ['Yedinci','iki']],
 [74.0, 81.2, "Buradan Hacerülesved'e kadar şu dua okunur: “Rabbenâ âtinâ fi'd-dünyâ haseneten ve fi'l-âhireti haseneten ve kınâ azâbe'n-nâr.”", ['dua']],
 [81.5, 87.7, "Hacerülesved'e varınca bir şavt tamamlanır. Bunu yedi kez yaparsın. Erkekler ilk üç şavtta hızlı adımlarla yürür; buna remel denir.", ['şavt','yedi','remel']],
 [88.0, 92.7, "Yedinci şavtın sonunda tavaf biter. Ardından Makam-ı İbrâhim'in arkasında iki rekat tavaf namazı kılınır.", ['iki','rekat']],
 [93.0, 95.3, "İşte tavaf... bu şekilde yapılır.", ['tavaf...']],
 [95.6, 99.0, "Bu videoyu kaydet... umreye ya da hacca gidecek birine gönder.", ['kaydet...','gönder.']],
];
window.SEG = SEG;
const WO=[0.0, 0.2, 4.2, 4.4, 7.4, 7.7, 10.3, 10.6, 17.2, 17.5, 19.6, 19.9, 22.4, 22.7, 25.4, 25.7, 30.2, 30.5, 32.4, 32.7, 35.3, 35.6, 40.8, 41.1, 45.8, 46.1, 48.3, 48.6, 55.2, 55.5, 57.8, 58.1, 63.8, 64.1, 66.3, 66.6, 73.7, 74.0, 81.2, 81.5, 87.7, 88.0, 92.7, 93.0, 95.3, 95.6, 99.0, 101.0], WN=[0.0, 0.04, 3.52, 3.9, 7.8, 8.22, 11.42, 11.84, 18.88, 19.4, 21.54, 22.08, 24.46, 24.88, 27.36, 27.76, 34.3, 34.72, 36.78, 37.24, 40.62, 41.04, 47.36, 47.84, 54.16, 54.6, 57.18, 57.58, 65.2, 65.6, 68.3, 68.68, 76.8, 77.28, 79.66, 80.06, 88.44, 88.9, 99.5, 100.04, 109.46, 109.9, 116.9, 117.26, 119.26, 119.66, 123.44, 125.6];
function warpInv(t){ for(let i=0;i<WN.length-1;i++){ if(t<=WN[i+1]){ const u=(t-WN[i])/Math.max(1e-6,WN[i+1]-WN[i]); return WO[i]+u*(WO[i+1]-WO[i]); } } return WO[WO.length-1]+(t-WN[WN.length-1]); }
const CAPS=[[0.04, 1.38, "Bir Müslüman olarak...", []], [1.8, 3.52, "Kâbe'de tavaf yapmayı biliyor musun?", ["biliyor", "musun?"]], [3.9, 5.62, "Nereden başlanır, nerede biter?", ["başlanır,", "biter?"]], [6.0, 7.8, "Gel, birlikte bir tur atalım.", ["tur"]], [8.22, 11.42, "Tavaf, Kâbe'nin etrafında yedi kez dönmektir.", ["yedi"]], [11.84, 13.38, "Peygamber Efendimiz buyurur ki:", []], [13.78, 16.0, "“Kâbe'yi tavaf etmek namaz gibidir...", ["namaz", "gibidir..."]], [16.44, 18.88, "ancak tavafta konuşmanıza izin verilmiştir.”", ["konuşmanıza"]], [19.4, 21.54, "Bu yüzden tavafa abdestli girilir.", ["abdestli"]], [22.08, 24.46, "Tur, Hacerülesved'in hizasında başlar.", ["Hacerülesved'in"]], [24.88, 25.7, "Niyet edersin...", ["Niyet"]], [26.02, 27.36, "Kâbe'yi soluna alırsın.", ["soluna"]], [27.76, 29.68, "Elini Hacerülesved'e doğru kaldırıp", []], [30.06, 32.58, "“Bismillâhi Allâhu ekber” dersin.", ["“Bismillâhi", "Allâhu", "ekber”"]], [32.96, 34.3, "Buna istilam denir.", ["istilam"]], [34.72, 36.78, "Şimdi yürüyelim... yedi durak var.", ["yedi", "durak"]], [37.24, 37.94, "Birinci durak:", ["Birinci"]], [38.3, 40.62, "Hacerülesved, cennetten gelen taş.", ["Hacerülesved,"]], [41.04, 44.02, "İkinci durak: Mültezem ve Kâbe'nin kapısı.", ["İkinci", "Mültezem"]], [44.4, 47.36, "Burası duaların kabul olunduğu umulan yerdir.", ["duaların"]], [47.84, 49.9, "Üçüncü durak: Makam-ı İbrâhim.", ["Üçüncü"]], [50.28, 54.16, "Hz. İbrâhim'in, Kâbe'yi inşa ederken üzerinde durduğu taş.", []], [54.6, 57.18, "Dördüncü durak: Rükn-i Irâkî köşesi.", ["Dördüncü"]], [57.58, 58.34, "Beşinci durak:", ["Beşinci"]], [58.68, 59.54, "Hicr-i İsmâil.", ["Hicr-i", "İsmâil."]], [60.0, 62.62, "Bu yarım daire aslında Kâbe'den sayılır...", ["Kâbe'den"]], [62.96, 65.2, "bu yüzden tavaf onun dışından yapılır.", ["dışından"]], [65.6, 68.3, "Üstündeki altın oluk ise Mîzâb-ı Rahmet.", ["Mîzâb-ı", "Rahmet."]], [68.68, 74.04, "Osmanlı padişahı Sultan Abdülmecid, 1857'de buraya altın bir oluk koydurdu.", ["Sultan", "Abdülmecid,", "1857'de"]], [74.44, 76.8, "Bugünkü oluk, onun birebir benzeridir.", ["birebir"]], [77.28, 79.66, "Altıncı durak: Rükn-i Şâmî köşesi.", ["Altıncı"]], [80.06, 82.06, "Yedinci durak: Rükn-i Yemânî.", ["Yedinci"]], [82.54, 85.68, "Efendimiz, Kâbe'de yalnızca iki köşeye dokunurdu:", ["iki"]], [86.1, 88.44, "Hacerülesved'e ve Rükn-i Yemânî'ye.", []], [88.9, 91.54, "Buradan Hacerülesved'e kadar şu dua okunur:", ["dua"]], [92.02, 95.16, "“Rabbenâ âtinâ fi'd-dünyâ haseneten,", []], [95.52, 97.48, "ve fi'l-âhireti haseneten,", []], [97.84, 99.5, "ve kınâ azâbe'n-nâr.”", []], [100.04, 102.72, "Hacerülesved'e varınca bir şavt tamamlanır.", ["şavt"]], [103.2, 104.62, "Bunu yedi kez yaparsın.", ["yedi"]], [105.12, 109.46, "Erkekler ilk üç şavtta hızlı adımlarla yürür; buna remel denir.", ["remel"]], [109.9, 112.16, "Yedinci şavtın sonunda tavaf biter.", ["biter."]], [112.6, 116.9, "Ardından Makam-ı İbrâhim'in arkasında iki rekat tavaf namazı kılınır.", ["iki", "rekat"]], [117.26, 119.26, "İşte tavaf... bu şekilde yapılır.", ["tavaf..."]], [119.66, 123.44, "Bu videoyu kaydet... umreye ya da hacca gidecek birine gönder.", ["kaydet...", "gönder."]]];
window.VDUR=125.6;


// kamera: duruşlar (hold) + aralarında Hermite süzülüş geçişleri
// [t0, t1, poz0, poz1]   poz = [az, el, dist, tx, ty, tz]
const HC=[5.2,2.6,-4.6], MK=[-0.6,3,-11.2];
const P=(az,el,d,t)=>[az,el,d,t[0],t[1],t[2]];
const HOLDS = [
 [0.0, 4.3,  P(10,46,78,[0,5,0]),    P(-22,32,56,[0,5,0])],
 [4.6, 7.5,  P(-30,28,50,[0,5,0]),   P(-48,24,46,[0,5,0])],
 [7.7, 17.0, P(-52,22,44,[0,5,0]),   P(-95,20,42,[0,5,0])],
 [17.9,19.6, P(-70,14,32,[2,4,-2]),  P(-62,12,28,[2,4,-2])],
 [20.4,30.0, P(-32,5,12.5,HC),       P(-50,6,10.5,HC)],
 [30.8,32.3, P(-40,16,24,[4,4,-3]),  P(-48,13,21,[4,4,-3])],
 [33.0,35.4, P(-36,6,12,HC),         P(-46,5,11,HC)],
 [36.0,40.9, P(-70,8,16,[3.2,4.4,-6]), P(-90,7,14.5,[2.6,4.6,-6])],
 [41.5,45.9, P(-52,9,16,MK),         P(-72,8,14,MK)],
 [46.5,48.4, P(-128,11,20,[-5.5,6,-5.5]), P(-140,10,18,[-5.5,6,-5.5])],
 [49.1,55.3, P(-148,20,25,[-11,1.5,0]),   P(-170,17,22,[-11,1.5,0])],
 [55.9,63.9, P(-180,20,14,[-7.5,11.2,0]), P(-198,15,12.5,[-7.5,11.0,0])],
 [64.5,66.4, P(-218,11,20,[-5.5,6,5.5]),  P(-232,10,18,[-5.5,6,5.5])],
 [67.2,73.8, P(-305,9,17,[5.5,4,5.5]),    P(-322,8,15,[5.5,4,5.5])],
 [74.3,81.1, P(-335,13,25,[3,4,0]),       P(-398,12,24,[3,4,-2])],
 [81.8,87.6, P(-410,24,44,[0,5,0]),       P(-770,24,44,[0,5,0])],
 [88.6,92.4, P(-778,11,18,MK),            P(-796,9,16,MK)],
 [93.4,95.4, P(-805,30,46,[0,4,0]),       P(-830,52,78,[0,4,0])],
 [95.6,101,  P(-835,55,82,[0,4,0]),       P(-860,62,92,[0,4,0])],
];
function vel(h){ const T=h[1]-h[0]; return h[3].map((v,i)=>(v-h[2][i])/T); }
function camAt(t){
 for(let i=0;i<HOLDS.length;i++){ const h=HOLDS[i];
   if(t>=h[0]&&t<=h[1]){ // duruş içinde sabit hızlı hafif hareket (hafif yavaşlayarak)
     const u=(t-h[0])/(h[1]-h[0]); const q=h[2].map((v,j)=>v+(h[3][j]-v)*u);
     return [q[0],q[1],q[2],[q[3],q[4],q[5]]]; }
   const n=HOLDS[i+1];
   if(n&&t>h[1]&&t<n[0]){ // Hermite geçiş: hız sürekliliği + drone kavisi
     const T=n[0]-h[1], u=(t-h[1])/T;
     const lim=(v,j)=>j===0?Math.max(-30,Math.min(30,v)):(j===2?Math.max(-12,Math.min(12,v)):v);
     const v0=vel(h).map(lim), v1=vel(n).map(lim);
     const h00=2*u*u*u-3*u*u+1, h10=u*u*u-2*u*u+u, h01=-2*u*u*u+3*u*u, h11=u*u*u-u*u;
     const q=h[3].map((p0,j)=>h00*p0+h10*T*v0[j]+h01*n[2][j]+h11*T*v1[j]);
     const arc=Math.pow(Math.sin(Math.PI*u),2); const span=Math.abs(n[2][0]-h[3][0]);
     q[1]+=arc*Math.min(8,span*0.06); q[2]*=1+arc*Math.min(0.25,span*0.004);
     return [q[0],q[1],q[2],[q[3],q[4],q[5]]]; }
 }
 const z=HOLDS[HOLDS.length-1][3]; return [z[0],z[1],z[2],[z[3],z[4],z[5]]]; }
window.camAt=camAt;

const cl = x => Math.max(0, Math.min(1, x));
const env = (t, t0, t1, fi=0.45, fo=0.3) => cl((t-t0)/fi) * cl((t1-t)/fo);
// etiketler: [anahtar, başlık, alt, t0, t1, numara, yön]
const LAB = [
 ['hacer','Hacerülesved','Tavafın başlangıç noktası',20.8,30.3,null],
 ['hacer','Hacerülesved','Cennetten gelen taş',33.2,35.4,'1'],
 ['multezem','Mültezem','Hacerülesved ile kapı arası',37.0,40.9,'2'],
 ['makam','Makam-ı İbrâhim','Hz. İbrâhim\'in taşı',41.9,45.9,'3'],
 ['iraki','Rükn-i Irâkî','Kuzey köşesi',47.0,48.4,'4'],
 ['hicr','Hicr-i İsmâil (Hatîm)','Kâbe\'den sayılır',49.6,55.3,'5','below'],
 ['mizab','Mîzâb-ı Rahmet','Altın oluk',56.2,63.9,null],
 ['sami','Rükn-i Şâmî','Batı köşesi',65.0,66.4,'6'],
 ['yemani','Rükn-i Yemânî','Güney köşesi',67.6,73.8,'7'],
 ['makam','Makam-ı İbrâhim','Arkasında 2 rekat',89.0,92.8,null],
];

// ------------------------------------------------------------- bilgi kartları (ekran ortası)
function rr2(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();}
function infoCard(p, cy, tag, lines, src){ // lines: [text, font, color]
 if(p<=0) return; const x=ov; x.save(); x.globalAlpha=Math.min(1,p*1.5);
 const w=900, lh=lines.reduce((a,l)=>a+(l[3]||64),0), h=lh+(tag?70:40)+(src?70:20), X=90, Y=cy-h/2;
 const sc=0.94+0.06*Math.min(1,p*1.5); x.translate(540,cy); x.scale(sc,sc); x.translate(-540,-cy);
 x.shadowColor='rgba(0,0,0,.45)'; x.shadowBlur=34; x.fillStyle='rgba(18,16,38,.82)'; rr2(x,X,Y,w,h,24); x.fill(); x.shadowBlur=0;
 x.strokeStyle='rgba(243,207,122,.7)'; x.lineWidth=2.5; rr2(x,X,Y,w,h,24); x.stroke();
 let y=Y+(tag?40:24);
 if(tag){ x.font='800 26px IXB'; const tw=x.measureText(tag).width+44; x.fillStyle='#f3cf7a'; rr2(x,540-tw/2,Y-20,tw,42,21); x.fill();
   x.fillStyle='#1a1630'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(tag,540,Y+1); y+=14; }
 x.textAlign='center'; x.textBaseline='middle';
 for(const [txt,font,col,lhh] of lines){ const L=lhh||64; x.font=font; x.fillStyle=col||'#fff';
   if(/Amiri/.test(font)) x.direction='rtl'; else x.direction='ltr';
   x.fillText(txt,540,y+L/2); y+=L; }
 x.direction='ltr';
 if(src){ x.font='500 26px IM'; const tw=x.measureText(src).width+40; x.fillStyle='rgba(255,255,255,.12)'; rr2(x,540-tw/2,y+12,tw,44,22); x.fill();
   x.fillStyle='rgba(235,228,255,.9)'; x.fillText(src,540,y+35); }
 x.restore(); }

function savtCounter(t){ const t0=82.6, t1=87.7; if(t<t0-0.4||t>t1+0.6) return; const p=env(t,t0-0.4,t1+0.6,0.4,0.4);
 const x=ov; x.save(); x.globalAlpha=p; const n=Math.min(7,Math.floor(cl((t-t0)/(t1-t0))*7)+1);
 x.fillStyle='rgba(18,16,38,.78)'; rr2(x,140,330,800,170,24); x.fill(); x.strokeStyle='rgba(243,207,122,.7)'; x.lineWidth=2.5; rr2(x,140,330,800,170,24); x.stroke();
 for(let i=0;i<7;i++){ const cx=215+i*108, cy=415, on=i<n; x.beginPath(); x.arc(cx,cy,40,0,7); x.fillStyle=on?'#f3cf7a':'rgba(255,255,255,.08)'; x.fill();
   x.strokeStyle='#f3cf7a'; x.lineWidth=3; x.stroke(); x.fillStyle=on?'#1a1630':'#f3cf7a'; x.font='700 36px IDB'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(String(i+1),cx,cy+2);
   if(i<3&&t>85.0){ x.font='600 22px ISB'; x.fillStyle='#d9c9ff'; x.fillText('remel',cx,cy+62); } }
 x.font='800 26px IXB'; x.fillStyle='#d9c9ff'; x.textAlign='center'; x.fillText('ŞAVT',540,310);
 x.restore(); }

function directionArrow(t){ const p=env(t,22.8,25.6,0.5,0.4); if(p<=0) return; const x=ov; x.save(); x.globalAlpha=p;
 // ekranda Kâbe solda kalacak şekilde ilerleme oku
 x.strokeStyle='#f3cf7a'; x.lineWidth=10; x.lineCap='round'; x.beginPath(); x.moveTo(820,1120); x.quadraticCurveTo(880,900,800,700); x.stroke();
 x.fillStyle='#f3cf7a'; x.beginPath(); x.moveTo(775,690); x.lineTo(830,700); x.lineTo(795,745); x.fill();
 x.font='700 40px IDB'; x.fillStyle='#fff'; x.textAlign='center'; x.shadowColor='rgba(0,0,0,.6)'; x.shadowBlur=14; x.fillText('Kâbe solunda',800,640); x.restore(); }

function endCard(t){ const p=cl((t-95.4)/0.6); if(p<=0) return; const x=ov; x.save(); x.globalAlpha=p;
 x.fillStyle='rgba(12,10,30,.45)'; x.fillRect(0,0,1080,1920);
 x.textAlign='center'; x.fillStyle='#fff'; x.font='700 76px IDB'; x.shadowColor='rgba(0,0,0,.6)'; x.shadowBlur=20;
 x.fillText('Kaydet  ↓', 540, 700); x.fillStyle='#f3cf7a'; x.fillText('Gönder  →', 540, 820);
 x.font='500 36px IM'; x.fillStyle='#e8e2ff'; x.fillText('Umreye ya da hacca gidecek birine', 540, 920); x.restore(); }

window.vframe = function(tr){ const t=warpInv(tr);
 ov.setTransform(SC,0,0,SC,0,0); ov.clearRect(0,0,W,H);
 render3D(t, camOrbit(...camAt(t))); bloom(); vignette();
 // başlık
 const tp=env(t,0.3,7.4,0.6,0.5); if(tp>0){ ov.save(); ov.globalAlpha=tp; topTitle('3D TAVAF REHBERİ','Kâbe\'de tavaf nasıl yapılır?'); ov.restore(); }
 for(const [k,a,b,t0,t1,num,side] of LAB){ const p=env(t,t0,t1,0.6,0.3); if(p>0) label(ANCH[k],a,b,p*Math.min(1,(t-t0)/0.6+0.01),num,side); }
 // kartlar
 infoCard(env(t,7.9,10.4), 520, null, [['Tavaf = 7 şavt','700 84px IDB','#fff',100],["Kâbe'nin etrafında 7 tur",'500 40px IM','#d9c9ff',56]]);
 infoCard(env(t,10.8,17.3), 560, 'HADİS', [["“Kâbe'yi tavaf etmek",'700 54px IDB','#fff',70],['namaz gibidir...','700 64px IDB','#f3cf7a',80],['ancak tavafta konuşmanıza','500 40px IM','#e8e2ff',54],['izin verilmiştir.”','500 40px IM','#e8e2ff',54]], 'Tirmizî, Hac 112');
 infoCard(env(t,17.6,19.7), 520, null, [['Abdestli gir  ✓','700 72px IDB','#f3cf7a',96]]);
 infoCard(env(t,26.4,30.3), 470, 'İSTİLAM', [['بِسْمِ اللّٰهِ اللّٰهُ أَكْبَر','64px Amiri','#f3cf7a',100],['“Bismillâhi Allâhu ekber”','600 44px ISB','#fff',60]]);
 infoCard(env(t,30.6,32.5), 480, null, [['7 DURAK','700 92px IDB','#f3cf7a',110]]);
 infoCard(env(t,58.4,63.9), 420, 'OSMANLI MİRASI', [['Sultan Abdülmecid','700 62px IDB','#f3cf7a',80],["1857'de altın oluk koydurdu",'500 40px IM','#fff',56],['Bugünkü oluk onun birebir benzeri','500 34px IM','#d9c9ff',50]], 'TDV İslâm Ansiklopedisi, "Altın Oluk"');
 infoCard(env(t,70.0,73.8), 470, 'HADİS', [['Efendimiz yalnızca','600 46px ISB','#fff',62],['2 köşeye dokunurdu','700 62px IDB','#f3cf7a',80],['Hacerülesved · Rükn-i Yemânî','500 36px IM','#d9c9ff',52]], 'Müslim, 1267');
 infoCard(env(t,75.6,81.3), 500, 'DUA', [['رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً','58px Amiri','#f3cf7a',86],['وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ','52px Amiri','#f3cf7a',86]], 'Bakara 2/201 · Ebû Dâvûd, 1892');
 savtCounter(t);
 infoCard(env(t,90.2,92.8), 430, null, [['2 rekat','700 84px IDB','#f3cf7a',100],['tavaf namazı','500 44px IM','#fff',60]], 'Bakara 2/125');
 infoCard(env(t,93.2,95.4), 560, null, [['İşte tavaf','700 80px IDB','#fff',96],['bu şekilde yapılır','700 60px IDB','#f3cf7a',80]]);
 directionArrow(t);
 endCard(t);
 // altyazı
 for(const [t0,t1,txt,hi] of CAPS){ if(tr>=t0-0.05&&tr<=t1+0.32){
   const ws=txt.split(' '); const chunks=[]; let cur=[];
   for(const w of ws){ cur.push(w); if(cur.length>=6){ chunks.push(cur); cur=[]; } }
   if(cur.length){ if(cur.length<3&&chunks.length) chunks[chunks.length-1].push(...cur); else chunks.push(cur); }
   const total=ws.length; let acc=0; const u=cl((tr-t0)/(t1-t0));
   for(const c of chunks){ const a0=acc/total, a1=(acc+c.length)/total; acc+=c.length;
     if(u<=a1+1e-6 || c===chunks[chunks.length-1]){ caption(c.join(' '),hi,cl((u-a0)/(a1-a0)*1.1)); break; } }
   break; } }
 logo();
 return true;
};
})();
