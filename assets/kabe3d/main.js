
// ======================================================================= math
const V = {
  sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],
  mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s], dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]},
  lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]
};
function persp(fovy,asp,n,f){const t=1/Math.tan(fovy/2);return [t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0];}
function lookAt(e,c,u){const z=V.norm(V.sub(e,c)),x=V.norm(V.cross(u,z)),y=V.cross(z,x);
 return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -V.dot(x,e),-V.dot(y,e),-V.dot(z,e),1];}
function mm(a,b){const o=new Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)o[j*4+i]+=a[k*4+i]*b[j*4+k];return o;}
function xform(m,p){const x=p[0],y=p[1],z=p[2];const r=[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14],m[3]*x+m[7]*y+m[11]*z+m[15]];return r;}
function rng(s){return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;}}

// ======================================================================= GL
const W=1080,H=1920; const SC=parseFloat(new URLSearchParams(location.search).get('s')||'1');
for(const id of ['gl','ov']){const c=document.getElementById(id); c.width=Math.round(1080*SC); c.height=Math.round(1920*SC); c.style.width=c.width+'px'; c.style.height=c.height+'px';}
document.body.style.width=Math.round(1080*SC)+'px'; document.body.style.height=Math.round(1920*SC)+'px';
const gl=document.getElementById('gl').getContext('webgl2',{antialias:true,alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true});
const VS=`#version 300 es
in vec3 aPos; in vec3 aNor; in vec2 aUV; in vec4 aInst; in vec4 aTan;
uniform mat4 uVP; uniform mat4 uLVP; uniform float uInst; uniform float uTime; uniform vec3 uCamV;
out vec3 vN; out vec2 vUV; out vec3 vW; out float vC; out vec4 vLS; out vec4 vT;
void main(){ vec3 p=aPos; vC=0.0;
 if(uInst>0.5){ float ang=aInst.y - uTime*(1.2/aInst.x)*aInst.z; p.xz*=1.0; p.x+=aInst.x*cos(ang); p.z+=aInst.x*sin(ang); vC=aInst.w; vec2 ip=vec2(aInst.x*cos(ang),aInst.x*sin(ang)); float cd=length(ip-uCamV.xz); if(cd<16.0) p*=smoothstep(10.0,16.0,cd); }
 vN=aNor; vT=aTan; vUV=aUV; vW=p; vLS=uLVP*vec4(p,1.0); gl_Position=uVP*vec4(p,1.0); }`;
const FS=`#version 300 es
precision highp float;
#define KH0 13.2
in vec3 vN; in vec2 vUV; in vec3 vW; in float vC; in vec4 vLS; in vec4 vT;
uniform sampler2D uNorm; uniform float uStudio; uniform float uHasN; uniform float uMode; uniform float uAlpha;
uniform sampler2D uTex; uniform highp sampler2DShadow uShadow; uniform vec3 uTint; uniform vec3 uEmis; uniform vec3 uCam; uniform vec3 uFog; uniform float uSpec; uniform float uFogD; uniform float uInst;
out vec4 o;
void main(){
 vec4 tx=texture(uTex,vUV); float alpha=1.0; if(uMode>0.5){ alpha=tx.a*uAlpha; if(alpha<0.03) discard; tx.a=1.0; } else if(tx.a<0.02) discard; vec3 base=tx.rgb*uTint;
 if(uInst>0.5){ base = vC<0.8? vec3(0.93,0.93,0.95) : (vC<0.9? vec3(0.12,0.12,0.14) : vec3(0.55,0.45,0.35)); }
 vec3 N=normalize(vN); if(!gl_FrontFacing && uMode>0.5) N=-N; if(uHasN>0.5){ vec3 nm=texture(uNorm,vUV).xyz*2.0-1.0; vec3 T=normalize(vT.xyz-N*dot(N,vT.xyz)); vec3 B=cross(N,T)*vT.w; N=normalize(T*nm.x+B*nm.y+N*nm.z*0.9); } vec3 Vd=normalize(uCam-vW);
 vec3 L1=normalize(vec3(-0.35,0.85,-0.45)); vec3 L2=normalize(vec3(0.6,0.5,0.7));
 float d1=max(dot(N,L1),0.0), d2=max(dot(N,L2),0.0);
 vec3 amb=uStudio>0.5?vec3(0.62,0.60,0.58):vec3(0.27,0.25,0.38); vec3 c1=uStudio>0.5?vec3(1.0,0.96,0.9)*0.95:vec3(1.0,0.92,0.80)*1.05; vec3 c2=vec3(0.55,0.55,0.8)*0.45;
 vec3 sp=vLS.xyz/vLS.w*0.5+0.5; float shd=1.0;
 if(sp.x>0.0&&sp.x<1.0&&sp.y>0.0&&sp.y<1.0){ shd=0.0; float bias=0.0012; vec2 ts=vec2(1.0/2048.0);
   for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++) shd+=texture(uShadow,vec3(sp.xy+vec2(i,j)*ts*1.3,sp.z-bias)); shd/=25.0; }
 if(uStudio>0.5) shd=mix(1.0,shd,0.55);
 float ao=1.0;
 if(vW.y<0.08){ float dd=length(max(abs(vW.xz)-vec2(6.5,5.5),0.0)); ao=mix(0.45,1.0,smoothstep(0.0,3.5,dd)); }
 if(abs(vW.x)<6.05&&abs(vW.z)<5.05&&vW.y<KH0) ao*=0.62+0.38*smoothstep(0.0,1.6,vW.y);
 vec3 col=base*(amb*ao+c1*d1*shd*ao+c2*d2*ao);
 if(uSpec>0.0){ vec3 Hh=normalize(L1+Vd); col+=vec3(1.0,0.9,0.7)*pow(max(dot(N,Hh),0.0),mix(10.0,60.0,tx.a))*uSpec*tx.a*shd*mix(0.6,1.4,tx.a);
                vec3 H2=normalize(L2+Vd); col+=vec3(0.9,0.85,1.0)*pow(max(dot(N,H2),0.0),30.0)*uSpec*0.5*tx.a; }
 col+=uEmis*tx.rgb;
 col=col*0.95; col=(col*(2.51*col+0.03))/(col*(2.43*col+0.59)+0.14);
 float d=length(vW-uCam); float f=uStudio>0.5?0.0:1.0-exp(-d*uFogD);
 o=vec4(pow(mix(col,uFog,f),vec3(0.98)),alpha); }`;
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(x);return x;}
const prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);
if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw gl.getProgramInfoLog(prog);
gl.useProgram(prog);
const A={tan:gl.getAttribLocation(prog,'aTan'),pos:gl.getAttribLocation(prog,'aPos'),nor:gl.getAttribLocation(prog,'aNor'),uv:gl.getAttribLocation(prog,'aUV'),inst:gl.getAttribLocation(prog,'aInst')};
const U={};['uStudio','uNorm','uHasN','uMode','uAlpha','uCamV','uVP','uLVP','uShadow','uInst','uTime','uTex','uTint','uEmis','uCam','uFog','uSpec','uFogD'].forEach(n=>U[n]=gl.getUniformLocation(prog,n));
gl.enable(gl.DEPTH_TEST);
const DVS=`#version 300 es
in vec3 aPos; uniform mat4 uLVP; void main(){ gl_Position=uLVP*vec4(aPos,1.0); }`;
const DFS=`#version 300 es
precision mediump float; out vec4 o; void main(){ o=vec4(1.0); }`;
const dprog=gl.createProgram();gl.attachShader(dprog,sh(gl.VERTEX_SHADER,DVS));gl.attachShader(dprog,sh(gl.FRAGMENT_SHADER,DFS));
gl.bindAttribLocation(dprog,A.pos,'aPos');gl.linkProgram(dprog);
const dU=gl.getUniformLocation(dprog,'uLVP');
const SM=2048; const shTex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,shTex);
gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,SM,SM,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
const shFB=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,shFB); gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shTex,0);
gl.bindFramebuffer(gl.FRAMEBUFFER,null);
function ortho(l,r,b,t,n,f){return [2/(r-l),0,0,0, 0,2/(t-b),0,0, 0,0,-2/(f-n),0, -(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1];}
const LDIR=[-0.35,0.85,-0.45]; const LVP=mm(ortho(-26,26,-26,26,1,140), lookAt(V.mul(V.norm(LDIR),70),[-3,0,-1],[0,1,0]));
let shadowDone=false;

// ======================================================================= textures
function canvasTex(w,h,draw,repeat){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);
 const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
 const ext=gl.getExtension('EXT_texture_filter_anisotropic');if(ext)gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,8);
 const wr=repeat?gl.REPEAT:gl.CLAMP_TO_EDGE;gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,wr);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,wr);return t;}
const KH=13.0;               // Kâbe yüksekliği (m)
const BAND0=8.55, BAND1=9.55;// altın kuşak
const STONE=2.1;             // örtünün kalktığı alt taş bölüm
const PXM=110;               // px / m
function goldGrad(x,y0,y1){const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#f6dc8c');g.addColorStop(.45,'#c99a3c');g.addColorStop(1,'#8a6420');return g;}
function kiswaFace(widthM, opts){
 return canvasTex(Math.round(widthM*PXM), Math.round(KH*PXM), (x,w,h)=>{
  const Y=m=>h-m*PXM; // metre (aşağıdan) -> canvas y
  x.fillStyle='#121214';x.fillRect(0,0,w,h);
  // jakar desen: zikzak bantlar + silik yazı
  x.save();x.globalAlpha=1;
  for(let row=0;row<Math.ceil(h/120)+1;row++){
    const y=row*120;
    x.strokeStyle='#1f1f23';x.lineWidth=3;x.beginPath();
    for(let i=0;i<=w/60+1;i++){x.lineTo(i*60,y+(i%2?28:0));}x.stroke();
    x.fillStyle='#1c1c20';x.font='34px Amiri';x.textAlign='center';
    for(let i=0;i<w/240+1;i++){x.fillText('لا إله إلا الله',i*240+(row%2?120:0),y+80);}
  }
  x.restore();
  // altın kuşak
  const b0=Y(BAND1),b1=Y(BAND0);
  x.fillStyle='#0d0d0f';x.fillRect(0,b0,w,b1-b0);
  x.strokeStyle=goldGrad(x,b0,b1);x.lineWidth=7;x.strokeRect(-10,b0+8,w+20,b1-b0-16);
  x.fillStyle=goldGrad(x,b0,b1);x.font=`${Math.round((b1-b0)*0.62)}px Amiri`;x.textAlign='center';x.textBaseline='middle';
  const embossText=(txt,X,Y)=>{x.save();x.fillStyle='rgba(0,0,0,.9)';x.fillText(txt,X+3,Y+4);x.fillStyle='#fff1c4';x.fillText(txt,X-1.5,Y-1.5);x.restore();x.fillText(txt,X,Y);};
  const verses=['إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِي بِبَكَّةَ مُبَارَكًا','وَإِذْ يَرْفَعُ إِبْرَاهِيمُ الْقَوَاعِدَ مِنَ الْبَيْتِ وَإِسْمَاعِيلُ','وَطَهِّرْ بَيْتِيَ لِلطَّائِفِينَ وَالْقَائِمِينَ'];
  const seg=w/3; for(let i=0;i<3;i++){ x.save(); x.beginPath(); x.rect(i*seg+30,b0,seg-60,b1-b0); x.clip();
     x.direction='rtl'; x.fillStyle=goldGrad(x,b0,b1); embossText(verses[(i+opts.seed)%3], i*seg+seg/2, (b0+b1)/2+4); x.restore();
     // madalyon ayraç
     const cx=i*seg; x.fillStyle=goldGrad(x,b0,b1); x.beginPath(); x.arc(cx,(b0+b1)/2,(b1-b0)*0.36,0,7); x.fill();
     x.fillStyle='#0d0d0f'; x.beginPath(); x.arc(cx,(b0+b1)/2,(b1-b0)*0.22,0,7); x.fill(); x.fillStyle=goldGrad(x,b0,b1); }
  // kuşağın altındaki kandil/madalyonlar
  for(const u of opts.lamps||[]){ const cx=u*w, cy=Y(BAND0-0.75), pw=150, ph=70; x.strokeStyle=goldGrad(x,cy-40,cy+40); x.lineWidth=5;
     x.strokeRect(cx-pw/2,cy-ph/2,pw,ph); x.fillStyle=goldGrad(x,cy-40,cy+40); x.font='34px Amiri'; x.textAlign='center'; x.textBaseline='middle'; x.direction='rtl';
     x.fillText('الله أكبر',cx,cy+4); }
  // alt taş bölüm (örtü kaldırılmış)
  const s0=Y(STONE);
  x.fillStyle='#e9e3d6'; x.fillRect(0,s0-14,w,26);              // beyaz örtü kenarı
  x.fillStyle='#4a3c34'; x.fillRect(0,s0+12,w,h-s0);
  const r=rng(opts.seed*77+3);
  for(let yy=s0+12; yy<h; yy+=38){ for(let xx=-(r()*60); xx<w; xx+=70+r()*40){ const c=95+r()*30|0;
     x.fillStyle=`rgb(${c-10},${c-22},${c-34})`; x.fillRect(xx+3,yy+3,64+r()*30,32); } }
  // kapı
  if(opts.door){ const [u0,u1]=opts.door, dx0=u0*w, dx1=u1*w, dy0=Y(2.2+3.2), dy1=Y(2.2);
     x.fillStyle=goldGrad(x,dy0,dy1); x.fillRect(dx0,dy0,dx1-dx0,dy1-dy0);
     x.fillStyle='#3a2b12'; x.fillRect(dx0+16,dy0+16,dx1-dx0-32,dy1-dy0-32);
     x.fillStyle=goldGrad(x,dy0,dy1);
     for(let i=0;i<2;i++)for(let j=0;j<5;j++){const pw=(dx1-dx0-48)/2, ph=(dy1-dy0-56)/5; x.fillRect(dx0+20+i*(pw+8),dy0+20+j*(ph+4),pw,ph);
        x.fillStyle='#5a4417'; x.fillRect(dx0+30+i*(pw+8),dy0+30+j*(ph+4),pw-20,ph-20); x.fillStyle=goldGrad(x,dy0,dy1);
        x.beginPath(); x.arc(dx0+20+i*(pw+8)+pw/2, dy0+20+j*(ph+4)+ph/2, 14,0,7); x.fill(); }
     // perde (sitâre) üst kısım
     x.fillStyle='#141416'; x.fillRect(dx0-40,dy0-150,dx1-dx0+80,150);
     x.fillStyle=goldGrad(x,dy0-150,dy0); x.font='46px Amiri'; x.textAlign='center'; x.direction='rtl';
     x.fillText('بسم الله الرحمن الرحيم',(dx0+dx1)/2,dy0-80); }
  // spec maskesi -> alfa: altın/işleme parlak, siyah ipek hafif (desen biraz daha parlak)
  const id=x.getImageData(0,0,w,h), d=id.data;
  for(let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2]; const gold=(r>110&&r>b+30); const lum=(r+g+b)/3;
    d[i+3]= gold?255 : (lum<60? (lum>30?150:70) : 40); }
  x.putImageData(id,0,0);
 });
}
const T_white=canvasTex(4,4,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,4,4)});
const T_marble=canvasTex(1024,1024,(x,w,h)=>{x.fillStyle='#f2f1ee';x.fillRect(0,0,w,h);const r=rng(5);
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){const c=236+r()*14|0;x.fillStyle=`rgb(${c},${c},${c+2})`;x.fillRect(i*256+2,j*256+2,252,252);}
 x.globalAlpha=.08;x.strokeStyle='#8a8a9a';for(let i=0;i<40;i++){x.lineWidth=1+r()*2;x.beginPath();let px=r()*w,py=r()*h;x.moveTo(px,py);for(let k=0;k<6;k++){px+=r()*120-60;py+=r()*120-60;x.lineTo(px,py);}x.stroke();}
},true);
const T_gold=canvasTex(256,256,(x,w,h)=>{x.fillStyle=goldGrad(x,0,h);x.fillRect(0,0,w,h);x.fillStyle='rgba(90,60,10,.5)';for(let i=0;i<8;i++)x.fillRect(0,i*32,w,4);});
const T_silver=canvasTex(256,320,(x,w,h)=>{x.clearRect(0,0,w,h);
 x.save();x.translate(128,160);x.scale(1,1.25);x.fillStyle='#b8b8c2';x.beginPath();x.arc(0,0,128,0,7);x.fill();
 let g=x.createLinearGradient(-110,-110,110,110);g.addColorStop(0,'#ffffff');g.addColorStop(.35,'#a8a8b4');g.addColorStop(.6,'#f2f2f6');g.addColorStop(1,'#7c7c88');
 x.fillStyle=g;x.beginPath();x.arc(0,0,118,0,7);x.fill();
 x.fillStyle='#55555e';x.beginPath();x.arc(0,0,86,0,7);x.fill();
 x.fillStyle='#d8d8de';x.beginPath();x.arc(0,0,80,0,7);x.fill();
 x.fillStyle='#1c1612';x.beginPath();x.ellipse(0,0,46,56,0,0,7);x.fill();
 const r=rng(4);for(let i=0;i<14;i++){x.fillStyle=`rgb(${50+r()*30|0},${38+r()*20|0},${30+r()*15|0})`;x.beginPath();x.arc((r()-.5)*60,(r()-.5)*70,6+r()*9,0,7);x.fill();}
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;x.fillStyle='#fafafe';x.beginPath();x.arc(Math.cos(a)*100,Math.sin(a)*100,4,0,7);x.fill();}
 x.restore();});
const T_arcade=canvasTex(1024,512,(x,w,h)=>{x.fillStyle='#d9cdb7';x.fillRect(0,0,w,h);
 for(let lv=0;lv<3;lv++){const y0=h-lv*160-150;for(let i=0;i<8;i++){const ax=i*128+18;
   const g=x.createLinearGradient(0,y0,0,y0+130);g.addColorStop(0,'#ffd99a');g.addColorStop(1,'#c9894a');x.fillStyle=g;
   x.beginPath();x.moveTo(ax,y0+130);x.lineTo(ax,y0+50);x.arc(ax+46,y0+50,46,Math.PI,0);x.lineTo(ax+92,y0+130);x.fill();
   x.strokeStyle='#8f7a5a';x.lineWidth=4;x.stroke();}
  x.fillStyle='#b9a888';x.fillRect(0,y0-14,w,10);}
},true);
const T_hijr=canvasTex(512,128,(x,w,h)=>{x.fillStyle='#ece6da';x.fillRect(0,0,w,h);x.fillStyle='#b8ab92';x.fillRect(0,h-30,w,8);x.fillRect(0,18,w,6);},true);
const T_lamp=canvasTex(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'#fff8e0');g.addColorStop(1,'#ffb84a');x.fillStyle=g;x.fillRect(0,0,w,h);});
const T_glass=canvasTex(128,256,(x,w,h)=>{x.fillStyle='#c79a42';x.fillRect(0,0,w,h);x.fillStyle='#fff0c8';for(let i=0;i<3;i++)x.fillRect(12+i*40,30,28,200);});
const T_clock=canvasTex(512,1024,(x,w,h)=>{x.fillStyle='#cfc4ae';x.fillRect(0,0,w,h);x.fillStyle='#e8f5ff';x.beginPath();x.arc(256,300,170,0,7);x.fill();
 x.strokeStyle='#2a8a5a';x.lineWidth=18;x.stroke();x.fillStyle='#ffe9b0';for(let j=0;j<10;j++)for(let i=0;i<6;i++)x.fillRect(40+i*75,560+j*45,40,22);});

// ======================================================================= geometry
const meshes=[];
function Mesh(tex,o={}){const m={tex,tint:o.tint||[1,1,1],emis:o.emis||[0,0,0],spec:o.spec||0,v:[]};meshes.push(m);return m;}
function quad(m,a,b,c,d,uv=[[0,0],[1,0],[1,1],[0,1]]){const n=V.norm(V.cross(V.sub(b,a),V.sub(d,a)));
 const P=[a,b,c,a,c,d],T=[uv[0],uv[1],uv[2],uv[0],uv[2],uv[3]];for(let i=0;i<6;i++)m.v.push(...P[i],...n,...T[i]);}
function box(m,x0,y0,z0,x1,y1,z1,us=1,vs=1){
 quad(m,[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[[0,0],[us,0],[us,vs],[0,vs]]);
 quad(m,[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[[0,0],[us,0],[us,vs],[0,vs]]);
 quad(m,[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[[0,0],[us,0],[us,vs],[0,vs]]);
 quad(m,[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[[0,0],[us,0],[us,vs],[0,vs]]);
 quad(m,[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[[0,0],[us,0],[us,vs],[0,vs]]);}
function cyl(m,cx,cz,r,y0,y1,n=16,r1=null,cap=true,us=1){r1=r1??r;for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2;
 const p=(a,rr,y)=>[cx+Math.cos(a)*rr,y,cz+Math.sin(a)*rr];
 quad(m,p(a1,r,y0),p(a0,r,y0),p(a0,r1,y1),p(a1,r1,y1),[[i/n*us,0],[(i+1)/n*us,0],[(i+1)/n*us,1],[i/n*us,1]].map(([u,v],k)=>[[(i+1)/n*us,0],[i/n*us,0],[i/n*us,1],[(i+1)/n*us,1]][k]));
 if(cap&&r1>0)quad(m,[cx,y1,cz],[cx,y1,cz],p(a0,r1,y1),p(a1,r1,y1));}}

const OWN0=meshes.length;
// --- Kâbe (yüzler dışarıdan bakınca sol->sağ)
const HX=6, HZ=5;
const fNE=Mesh(kiswaFace(12,{seed:0,door:[(6-4.25)/12,(6-2.25)/12],lamps:[.62,.82]}),{spec:.6});
quad(fNE,[HX,0,-HZ],[-HX,0,-HZ],[-HX,KH,-HZ],[HX,KH,-HZ]);
const fNW=Mesh(kiswaFace(10,{seed:1,lamps:[.25,.5,.75]}),{spec:.6}); quad(fNW,[-HX,0,-HZ],[-HX,0,HZ],[-HX,KH,HZ],[-HX,KH,-HZ]);
const fSW=Mesh(kiswaFace(12,{seed:2,lamps:[.2,.4,.6,.8]}),{spec:.6}); quad(fSW,[-HX,0,HZ],[HX,0,HZ],[HX,KH,HZ],[-HX,KH,HZ]);
const fSE=Mesh(kiswaFace(10,{seed:3,lamps:[.3,.7]}),{spec:.6});      quad(fSE,[HX,0,HZ],[HX,0,-HZ],[HX,KH,-HZ],[HX,KH,HZ]);
const roof=Mesh(T_white,{tint:[.22,.22,.24]}); quad(roof,[-HX,KH,HZ],[HX,KH,HZ],[HX,KH,-HZ],[-HX,KH,-HZ]);
const mar=Mesh(T_marble,{tint:[.86,.85,.9]});
// şâzervân (eğimli mermer kaide)
const o=0.55,sh0=0.38;
quad(mar,[HX+o,0,-HZ-o],[-HX-o,0,-HZ-o],[-HX,sh0,-HZ],[HX,sh0,-HZ]);
quad(mar,[-HX-o,0,-HZ-o],[-HX-o,0,HZ+o],[-HX,sh0,HZ],[-HX,sh0,-HZ]);
quad(mar,[-HX-o,0,HZ+o],[HX+o,0,HZ+o],[HX,sh0,HZ],[-HX,sh0,HZ]);
quad(mar,[HX+o,0,HZ+o],[HX+o,0,-HZ-o],[HX,sh0,-HZ],[HX,sh0,HZ]);
// çatı korkuluğu
const par=Mesh(T_white,{tint:[.18,.18,.2]});box(par,-HX,KH,-HZ,HX,KH+.35,-HZ+.25);box(par,-HX,KH,HZ-.25,HX,KH+.35,HZ);box(par,-HX,KH,-HZ,-HX+.25,KH+.35,HZ);box(par,HX-.25,KH,-HZ,HX,KH+.35,HZ);
// Hacerülesved (doğu köşesi) — gümüş çerçeve
const BS=[HX,1.5,-HZ];
const hs=Mesh(T_silver,{spec:1.3}); { // köşeyi saran gümüş kabarık çerçeve (elipsoid; duvar içinde kalan kısmı görünmez)
  const C=[HX,1.55,-HZ], bv=V.norm([1,0,-1]), tv=V.norm([1,0,1]); const RB=0.34, RT=0.62, RY=0.78; const NU=36, NV=28;
  const P=(i,j)=>{const th=i/NU*Math.PI*2, ph=-Math.PI/2+j/NV*Math.PI; const cb=Math.cos(ph)*Math.cos(th), ct=Math.cos(ph)*Math.sin(th), cy=Math.sin(ph);
    const p=[C[0]+bv[0]*cb*RB+tv[0]*ct*RT, C[1]+cy*RY, C[2]+bv[2]*cb*RB+tv[2]*ct*RT];
    const n=V.norm([bv[0]*cb/RB+tv[0]*ct/RT, cy/RY, bv[2]*cb/RB+tv[2]*ct/RT]);
    const uv=[0.5+ct*0.5*0.98, 0.5+cy*0.5*0.98]; return {p,n,uv}; };
  for(let i=0;i<NU;i++)for(let j=0;j<NV;j++){ const q=[P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)];
    for(const k of [0,1,2,0,2,3]) hs.v.push(...q[k].p,...q[k].n,...q[k].uv); } }
// kapı kabartması
const dr=Mesh(T_gold,{spec:1}); box(dr,2.15,2.1,-HZ-.18,4.35,2.25,-HZ); box(dr,2.15,5.4,-HZ-.18,4.35,5.55,-HZ);
// Mîzâb-ı Rahmet (altın oluk, Hicr tarafında çatı ortası)
const mz=Mesh(T_gold,{spec:1.4}); box(mz,-HX-2.6,KH-.55,-.2,-HX,KH-.25,.2);
// Rükn-i Yemânî işareti yok (çıplak köşe); köşe kenarlarına ince gümüş şerit Hacerülesved'de
// --- Hicr-i İsmâil duvarı
const hj=Mesh(T_hijr,{tint:[1,1,1]}); const hjf=Mesh(T_marble,{tint:[.78,.74,.9]});
{ const N=40, a0=-78, a1=78, rx=8.2, rz=4.8, th=1.45, hh=1.3;
  const P=(deg,off,y)=>{const a=deg*Math.PI/180;return [-HX-(rx+off)*Math.cos(a),y,(rz+off)*Math.sin(a)];};
  for(let i=0;i<N;i++){const d0=a0+(a1-a0)*i/N, d1=a0+(a1-a0)*(i+1)/N;
    quad(hj,P(d0,th,0),P(d1,th,0),P(d1,th,hh),P(d0,th,hh),[[i/4,0],[(i+1)/4,0],[(i+1)/4,1],[i/4,1]]);  // dış
    quad(hj,P(d1,0,0),P(d0,0,0),P(d0,0,hh),P(d1,0,hh),[[i/4,0],[(i+1)/4,0],[(i+1)/4,1],[i/4,1]]);     // iç
    quad(mar,P(d0,0,hh),P(d1,0,hh),P(d1,th,hh),P(d0,th,hh),[[0,0],[.2,0],[.2,.1],[0,.1]]);              // üst
    // iç zemin (yelpaze)
    quad(hjf,[-HX,0.03,0],P(d0,0,.03),P(d1,0,.03),[-HX,0.03,0],[[.5,.5],[0,0],[.2,0],[.5,.5]]); }
  for(const d of [a0,a1]) quad(mar,P(d,0,0),P(d,th,0),P(d,th,hh),P(d,0,hh));
  // lambalar
  const lp=Mesh(T_gold,{spec:1}); const lg=Mesh(T_lamp,{emis:[1.2,1.0,.7]});
  for(const d of [-62,-30,0,30,62]){const p=P(d,th/2,hh); cyl(lp,p[0],p[2],.07,hh,hh+2.3,8); box(lg,p[0]-.22,hh+2.3,p[2]-.22,p[0]+.22,hh+2.95,p[2]+.22); box(lp,p[0]-.27,hh+2.95,p[2]-.27,p[0]+.27,hh+3.05,p[2]+.27);}
}
// --- Makam-ı İbrâhim (kapının karşısında)
const MK=[2.6,0,-15.5];
{ const b=Mesh(T_marble,{tint:[.9,.9,.92]}); cyl(b,MK[0],MK[2],1.0,0,.35,8);
  const g=Mesh(T_glass,{emis:[.5,.42,.25],spec:1}); cyl(g,MK[0],MK[2],.78,.35,2.3,8,null,false,8);
  const dm=Mesh(T_gold,{spec:1.3}); cyl(dm,MK[0],MK[2],.86,2.3,2.45,8); cyl(dm,MK[0],MK[2],.86,2.45,3.25,12,.12); cyl(dm,MK[0],MK[2],.05,3.25,3.7,6); }
for(let i=OWN0;i<meshes.length;i++) meshes[i].hide=true;
// --- referans stili: altın işlemeli çatı + siyah/altın kaide (yalnız STYLE modunda)
const T_roofGold=canvasTex(1024,1024,(x,w,h)=>{x.fillStyle='#0b0a09';x.fillRect(0,0,w,h);
 const G=(a,b)=>goldGrad(x,a,b);
 const band=(m,t)=>{x.strokeStyle=G(m,m+t);x.lineWidth=t;x.strokeRect(m+t/2,m+t/2,w-2*m-t,h-2*m-t);};
 band(10,26); band(70,8); band(270,10); band(300,5);
 // kenar bandı içinde motifler
 x.fillStyle=G(0,h); for(let i=0;i<14;i++){const p=110+i*57; for(const [cx,cy] of [[p,170],[p,h-170],[170,p],[w-170,p]]){ if(cx<160||cx>w-160&&cy<160) {}
   x.save();x.translate(cx,cy);x.rotate(Math.PI/4);x.fillRect(-14,-14,28,28);x.restore(); x.fillStyle='#0b0a09';x.beginPath();x.arc(cx,cy,7,0,7);x.fill();x.fillStyle=G(0,h);} }
 // köşe gülleri
 for(const [cx,cy] of [[170,170],[w-170,170],[170,h-170],[w-170,h-170]]){x.beginPath();x.arc(cx,cy,40,0,7);x.fill();x.fillStyle='#0b0a09';x.beginPath();x.arc(cx,cy,22,0,7);x.fill();x.fillStyle=G(0,h);}
 // merkez madalyon
 const c=w/2; for(const [r,lw] of [[230,10],[200,4],[150,14],[110,4],[70,10]]){x.strokeStyle=G(c-r,c+r);x.lineWidth=lw;x.beginPath();x.arc(c,c,r,0,7);x.stroke();}
 x.fillStyle=G(c-200,c+200); for(let i=0;i<16;i++){const a=i/16*Math.PI*2; x.save();x.translate(c+Math.cos(a)*175,c+Math.sin(a)*175);x.rotate(a);x.beginPath();x.ellipse(0,0,20,9,0,0,7);x.fill();x.restore();}
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2; x.save();x.translate(c+Math.cos(a)*90,c+Math.sin(a)*90);x.rotate(a+Math.PI/4);x.fillRect(-13,-13,26,26);x.restore();}
 x.beginPath();x.arc(c,c,34,0,7);x.fill();
 // ince arabesk dolgu
 x.strokeStyle='rgba(200,160,80,.55)';x.lineWidth=3; for(let i=0;i<24;i++){const a=i/24*Math.PI*2; x.beginPath(); x.moveTo(c+Math.cos(a)*240,c+Math.sin(a)*240); x.quadraticCurveTo(c+Math.cos(a+.2)*330,c+Math.sin(a+.2)*330,c+Math.cos(a+.1)*400,c+Math.sin(a+.1)*400); x.stroke();}
});
const T_blackBrick=canvasTex(1024,512,(x,w,h)=>{x.fillStyle='#d6a94e';x.fillRect(0,0,w,h);const r=rng(11);
 const rows=6, bh=h/rows, bw=w/6; for(let j=0;j<rows;j++){ for(let i=-1;i<7;i++){ const xx=i*bw+(j%2?bw/2:0); const c=18+r()*14|0; x.fillStyle=`rgb(${c},${c-2},${c-4})`; x.fillRect(xx+5,j*bh+5,bw-10,bh-10);} }},true);
const roofM=Mesh(T_roofGold,{spec:.9}); roofM.styleOnly=true; quad(roofM,[6.0,12.97,-6.0],[-6.0,12.97,-6.0],[-6.0,12.97,6.0],[6.0,12.97,6.0],[[0,0],[1,0],[1,1],[0,1]]);
const rimM=Mesh(T_white,{tint:[.07,.07,.08]}); rimM.styleOnly=true;
box(rimM,-6.0,12.2,-6.0,6.0,12.96,-5.9); box(rimM,-6.0,12.2,5.9,6.0,12.96,6.0); box(rimM,-6.0,12.2,-6.0,-5.9,12.96,6.0); box(rimM,5.9,12.2,-6.0,6.0,12.96,6.0);
const ENV0=meshes.length;
// --- zemin
const fl=Mesh(T_marble,{tint:[.86,.84,.95]}); fl.noShadow=true; quad(fl,[-260,0,260],[260,0,260],[260,0,-260],[-260,0,-260],[[0,0],[130,0],[130,130],[0,130]]);
// --- Mescid revakları + minareler + saat kulesi
{ const ar=Mesh(T_arcade,{emis:[.35,.28,.18]}); const roofM=Mesh(T_white,{tint:[.7,.66,.6]}); ar.noShadow=roofM.noShadow=true; const R=56, N=96, Ht=24;
  for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+1)/N*Math.PI*2;const p=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
    quad(ar,p(a1,R,0),p(a0,R,0),p(a0,R,Ht),p(a1,R,Ht),[[0,0],[1,0],[1,1],[0,1]]);
    quad(roofM,p(a0,R,Ht),p(a0,R+14,Ht),p(a1,R+14,Ht),p(a1,R,Ht));}
  const mn=Mesh(T_white,{tint:[.86,.82,.74]}); const ml=Mesh(T_lamp,{emis:[1,.9,.6]});
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2+.3, r=80; const x=Math.cos(a)*r, z=Math.sin(a)*r;
    cyl(mn,x,z,2.0,0,60,10,1.6); cyl(ml,x,z,2.6,60,62,10); cyl(mn,x,z,1.5,62,80,10,1.1); cyl(ml,x,z,1.8,80,81.5,10); cyl(mn,x,z,1.1,81.5,92,10,0);}
  const ck=Mesh(T_clock,{emis:[.55,.55,.5]}); box(ck,-22,0,175,22,330,215); const sp=Mesh(T_gold,{emis:[.4,.3,.1]}); cyl(sp,0,195,10,330,420,8,0);
}
// --- kalabalık (uzak halka, tavaf yönünde yavaşça akar)
const crowd={v:[],inst:[]};
{ const m={v:[]}; cyl(m,0,0,.2,0,1.0,7,.17); cyl(m,0,0,.17,1.0,1.42,7,.12); cyl(m,0,0,.11,1.45,1.68,7,.09); crowd.v=m.v;
  const r=rng(9); for(let i=0;i<5200;i++){ const rad=23+Math.pow(r(),1.1)*32; crowd.inst.push(rad, r()*Math.PI*2, .7+r()*.6, r()); } }

// ======================================================================= GLB model (agrees_putra, CC BY 4.0)
const GLBM=[]; const GSC=1.25;
function m4mul(a,b){return mm(a,b);}
function nodeMat(n){ if(n.matrix) return n.matrix.slice(); let M=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
 if(n.translation){const t=n.translation; M=m4mul(M,[1,0,0,0,0,1,0,0,0,0,1,0,t[0],t[1],t[2],1]);}
 if(n.rotation){const [x,y,z,w]=n.rotation; M=m4mul(M,[1-2*(y*y+z*z),2*(x*y+z*w),2*(x*z-y*w),0, 2*(x*y-z*w),1-2*(x*x+z*z),2*(y*z+x*w),0, 2*(x*z+y*w),2*(y*z-x*w),1-2*(x*x+y*y),0, 0,0,0,1]);}
 if(n.scale){const s=n.scale; M=m4mul(M,[s[0],0,0,0,0,s[1],0,0,0,0,s[2],0,0,0,0,1]);} return M; }
async function loadGLB(url){
 const ab=await (await fetch(url)).arrayBuffer(); const dv=new DataView(ab);
 const jl=dv.getUint32(12,true); const J=JSON.parse(new TextDecoder().decode(new Uint8Array(ab,20,jl)));
 const binOff=20+jl+8;
 const acc=(i)=>{ const a=J.accessors[i], bv=J.bufferViews[a.bufferView]; const nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
   const C={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; const es=C.BYTES_PER_ELEMENT;
   const off=binOff+(bv.byteOffset||0)+(a.byteOffset||0); const stride=bv.byteStride||nc*es;
   if(stride===nc*es && off%es===0) return {d:new C(ab,off,a.count*nc),nc};
   const out=new C(a.count*nc); for(let k=0;k<a.count;k++)for(let c=0;c<nc;c++) out[k*nc+c]=new C(ab.slice(off+k*stride+c*es,off+k*stride+c*es+es))[0]; return {d:out,nc}; };
 // dokular
 const texCache={};
 async function tex(ti){ if(ti==null) return null; if(texCache[ti]) return texCache[ti]; const im=J.images[J.textures[ti].source]; const bv=J.bufferViews[im.bufferView];
   const blob=new Blob([new Uint8Array(ab,binOff+(bv.byteOffset||0),bv.byteLength)],{type:im.mimeType});
   const bmp=await createImageBitmap(blob,{imageOrientation:'none',premultiplyAlpha:'none',colorSpaceConversion:'none'});
   const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,bmp); gl.generateMipmap(gl.TEXTURE_2D);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
   const ext=gl.getExtension('EXT_texture_filter_anisotropic'); if(ext) gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,8);
   bmp.close&&bmp.close(); texCache[ti]=t; return t; }
 // dünya dönüşümü: Y ekseninde 180° + ölçek
 const G=[-GSC,0,0,0, 0,GSC,0,0, 0,0,-GSC,0, 0,0,0,1];
 const SKIP=/Plane\.002|inside|pillar|Cube\.00[5-9]|Cube\.01[0-4]|Cylinder\.00[5-8]|roof|Cube\.002__/;
 async function walk(ni,P){ const n=J.nodes[ni]; const M=m4mul(P,nodeMat(n));
   if(n.mesh!=null && !SKIP.test(n.name||'')){ for(const pr of J.meshes[n.mesh].primitives){
     const P0=acc(pr.attributes.POSITION), N0=acc(pr.attributes.NORMAL), T0=pr.attributes.TEXCOORD_0!=null?acc(pr.attributes.TEXCOORD_0):null, TA=pr.attributes.TANGENT!=null?acc(pr.attributes.TANGENT):null;
     const cnt=P0.d.length/3; const v=new Float32Array(cnt*12);
     for(let k=0;k<cnt;k++){ const x=P0.d[k*3],y=P0.d[k*3+1],z=P0.d[k*3+2];
       v[k*12]=M[0]*x+M[4]*y+M[8]*z+M[12]; v[k*12+1]=M[1]*x+M[5]*y+M[9]*z+M[13]; v[k*12+2]=M[2]*x+M[6]*y+M[10]*z+M[14];
       const a=N0.d[k*3],b=N0.d[k*3+1],c=N0.d[k*3+2]; let nx=M[0]*a+M[4]*b+M[8]*c, ny=M[1]*a+M[5]*b+M[9]*c, nz=M[2]*a+M[6]*b+M[10]*c; const l=Math.hypot(nx,ny,nz)||1;
       v[k*12+3]=nx/l; v[k*12+4]=ny/l; v[k*12+5]=nz/l;
       if(T0){ v[k*12+6]=T0.d[k*2]; v[k*12+7]=T0.d[k*2+1]; }
       if(TA){ const a=TA.d[k*4],b=TA.d[k*4+1],c=TA.d[k*4+2]; let tx=M[0]*a+M[4]*b+M[8]*c, ty=M[1]*a+M[5]*b+M[9]*c, tz=M[2]*a+M[6]*b+M[10]*c; const l2=Math.hypot(tx,ty,tz)||1;
         v[k*12+8]=tx/l2; v[k*12+9]=ty/l2; v[k*12+10]=tz/l2; v[k*12+11]=TA.d[k*4+3]; } else { v[k*12+8]=1; v[k*12+11]=1; } }
     // dönüşüm determinantı negatifse üçgen sırasını çevir (yüz yönü)
     let idx; if(pr.indices!=null){ const I=acc(pr.indices).d; idx=new Uint32Array(I.length); for(let k=0;k<I.length;k++) idx[k]=I[k]; } else { idx=new Uint32Array(cnt); for(let k=0;k<cnt;k++) idx[k]=k; }
     const mat=J.materials[pr.material]||{}; const pbr=mat.pbrMetallicRoughness||{};
     const bc=pbr.baseColorFactor||[1,1,1,1]; const met=pbr.metallicFactor??1, rough=pbr.roughnessFactor??1;
     const cx=[0,0,0]; for(let k=0;k<cnt;k++){cx[0]+=v[k*12];cx[1]+=v[k*12+1];cx[2]+=v[k*12+2];}
     const item={name:(n.name||'')+'|'+(mat.name||''), tex:(await tex(pbr.baseColorTexture?.index))||T_white, ntex:TA?await tex(mat.normalTexture?.index):null,
       tint:[bc[0],bc[1],bc[2]], alpha:bc[3], spec:(0.35+met*0.9)*(1-rough*0.6), blend:mat.alphaMode==='BLEND', c:cx.map(q=>q/cnt)};
     item.buf=upload(v); item.ibuf=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,item.ibuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW); item.n=idx.length;
     GLBM.push(item); } }
   for(const c of n.children||[]) await walk(c,M); }
 for(const r of J.scenes[J.scene||0].nodes) await walk(r,G);
 shadowDone=false; return GLBM.length; }
function drawGLB(){
 gl.uniform1f(U.uMode,1);
 const draw=(m)=>{ gl.bindBuffer(gl.ARRAY_BUFFER,m.buf);
   gl.enableVertexAttribArray(A.pos);gl.vertexAttribPointer(A.pos,3,gl.FLOAT,false,48,0);
   gl.enableVertexAttribArray(A.nor);gl.vertexAttribPointer(A.nor,3,gl.FLOAT,false,48,12);
   gl.enableVertexAttribArray(A.uv);gl.vertexAttribPointer(A.uv,2,gl.FLOAT,false,48,24);
   gl.enableVertexAttribArray(A.tan);gl.vertexAttribPointer(A.tan,4,gl.FLOAT,false,48,32);
   gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,(window.STYLE&&/Kabaa Brick/.test(m.name))?T_blackBrick:m.tex);
   gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D,m.ntex||T_white); gl.uniform1i(U.uNorm,2); gl.uniform1f(U.uHasN,m.ntex?1:0); gl.activeTexture(gl.TEXTURE0);
   let tint=m.tint, sp=m.spec; if(window.STYLE){ if(/Ornament|Gutter/.test(m.name)){ tint=[1.0*2.1,0.80*2.1,0.45*2.1].map((v,i)=>v*tint[i]); sp*=1.5; } else if(/Kabaa Wall/.test(m.name)){ tint=tint.map(v=>v*0.72); } }
   gl.uniform3fv(U.uTint,tint); gl.uniform3fv(U.uEmis,[0,0,0]); gl.uniform1f(U.uSpec,sp); gl.uniform1f(U.uAlpha,m.alpha);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ibuf); gl.drawElements(gl.TRIANGLES,m.n,gl.UNSIGNED_INT,0); };
 gl.disable(gl.CULL_FACE);
 const vis=m=>!(window.STUDIO&&/SoI|Sphere\.001/.test(m.name));
 for(const m of GLBM) if(!m.blend&&vis(m)) draw(m);
 const bl=GLBM.filter(m=>m.blend).sort((a,b)=>V.dot(V.sub(b.c,CAM.eye),V.sub(b.c,CAM.eye))-V.dot(V.sub(a.c,CAM.eye),V.sub(a.c,CAM.eye)));
 gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2,-8);
 for(const m of bl) if(vis(m)) draw(m);
 gl.depthMask(true); gl.disable(gl.BLEND); gl.disable(gl.POLYGON_OFFSET_FILL); gl.disableVertexAttribArray(A.tan); gl.vertexAttrib4f(A.tan,1,0,0,1); gl.uniform1f(U.uMode,0); gl.uniform1f(U.uHasN,0);
}
// --- upload
function upload(arr){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);return b;}
for(const m of meshes){m.buf=upload(m.v);m.n=m.v.length/8;}
crowd.buf=upload(crowd.v);crowd.n=crowd.v.length/8;crowd.ibuf=upload(crowd.inst);crowd.cnt=crowd.inst.length/4;
function bindGeom(buf){gl.bindBuffer(gl.ARRAY_BUFFER,buf);
 gl.enableVertexAttribArray(A.pos);gl.vertexAttribPointer(A.pos,3,gl.FLOAT,false,32,0);
 gl.enableVertexAttribArray(A.nor);gl.vertexAttribPointer(A.nor,3,gl.FLOAT,false,32,12);
 gl.enableVertexAttribArray(A.uv);gl.vertexAttribPointer(A.uv,2,gl.FLOAT,false,32,24);}

// ======================================================================= render
let VP=null, CAM=null;
const FOG=[0.33,0.29,0.52];
function render3D(t, cam){
 const asp=W/H; const P=persp(cam.fov*Math.PI/180,asp,window.STUDIO?Math.max(0.3,V.dot(V.sub(cam.eye,cam.target),V.sub(cam.eye,cam.target))**0.5-40):0.3,window.STUDIO?Math.max(200,(V.dot(V.sub(cam.eye,cam.target),V.sub(cam.eye,cam.target))**0.5)+60):1500); const Vw=lookAt(cam.eye,cam.target,[0,1,0]); VP=mm(P,Vw); CAM=cam;
 if(!shadowDone){ gl.useProgram(dprog); gl.bindFramebuffer(gl.FRAMEBUFFER,shFB); gl.viewport(0,0,SM,SM); gl.clear(gl.DEPTH_BUFFER_BIT);
   gl.uniformMatrix4fv(dU,false,new Float32Array(LVP)); gl.disableVertexAttribArray(A.nor); gl.disableVertexAttribArray(A.uv);
   for(const m of GLBM){ gl.bindBuffer(gl.ARRAY_BUFFER,m.buf); gl.enableVertexAttribArray(A.pos); gl.vertexAttribPointer(A.pos,3,gl.FLOAT,false,48,0); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ibuf); gl.drawElements(gl.TRIANGLES,m.n,gl.UNSIGNED_INT,0); }
   for(const m of meshes){ if(m.noShadow||m.hide) continue; gl.bindBuffer(gl.ARRAY_BUFFER,m.buf); gl.enableVertexAttribArray(A.pos); gl.vertexAttribPointer(A.pos,3,gl.FLOAT,false,32,0); gl.drawArrays(gl.TRIANGLES,0,m.n); }
   gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.useProgram(prog); shadowDone=true; }
 gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.uniformMatrix4fv(U.uVP,false,new Float32Array(VP)); gl.uniform3fv(U.uCam,cam.eye); gl.uniform3fv(U.uCamV,cam.eye); gl.uniform3fv(U.uFog,FOG); gl.uniform1f(U.uFogD,0.0055);
 gl.uniform1f(U.uTime,t); gl.uniform1f(U.uStudio,window.STUDIO?1:0); gl.uniformMatrix4fv(U.uLVP,false,new Float32Array(LVP));
 gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,shTex); gl.uniform1i(U.uShadow,1);
 gl.uniform1i(U.uTex,0); gl.activeTexture(gl.TEXTURE0);
 gl.uniform1f(U.uInst,0); gl.disableVertexAttribArray(A.inst); gl.vertexAttrib4f(A.inst,1,0,0,0);
 gl.uniform1f(U.uMode,0); gl.uniform1f(U.uHasN,0); gl.disableVertexAttribArray(A.tan); gl.vertexAttrib4f(A.tan,1,0,0,1);
 meshes.forEach((m,mi)=>{ if(window.STUDIO&&mi>=ENV0) m._skip=true; else m._skip=false; });
 for(const m of meshes){ if(m.hide||m._skip||(m.styleOnly&&!window.STYLE)) continue; bindGeom(m.buf); gl.bindTexture(gl.TEXTURE_2D,m.tex); gl.uniform3fv(U.uTint,m.tint); gl.uniform3fv(U.uEmis,m.emis); gl.uniform1f(U.uSpec,m.spec); gl.drawArrays(gl.TRIANGLES,0,m.n); }
 drawGLB();
 // kalabalık
 bindGeom(crowd.buf); gl.uniform1f(U.uInst,1); gl.bindTexture(gl.TEXTURE_2D,T_white); gl.uniform3fv(U.uEmis,[0,0,0]); gl.uniform1f(U.uSpec,0);
 gl.bindBuffer(gl.ARRAY_BUFFER,crowd.ibuf); gl.enableVertexAttribArray(A.inst); gl.vertexAttribPointer(A.inst,4,gl.FLOAT,false,16,0); gl.vertexAttribDivisor(A.inst,1);
 if(window.CROWD) gl.drawArraysInstanced(gl.TRIANGLES,0,crowd.n,crowd.cnt); gl.vertexAttribDivisor(A.inst,0); gl.disableVertexAttribArray(A.inst);
}
function project(p){const c=xform(VP,p); if(c[3]<=0) return null; return [(c[0]/c[3]*0.5+0.5)*W,(1-(c[1]/c[3]*0.5+0.5))*H];}

// ======================================================================= overlay (etiket, altyazı, logo)
const ov=document.getElementById('ov').getContext('2d');
let LOGO=null;
function rr(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();}
function label(anchor, title, sub, p, num, side){
 const s=project(anchor); if(!s||p<=0) return; const x=ov; const e=Math.min(1,p*1.4);
 x.save();
 // halka işaret
 x.globalAlpha=e; x.strokeStyle='rgba(255,255,255,.95)'; x.lineWidth=2.5; x.beginPath(); x.arc(s[0],s[1],15,0,7); x.stroke();
 x.fillStyle='#fff'; x.beginPath(); x.arc(s[0],s[1],5,0,7); x.fill();
 const pulse=(p*1.2)%1; x.globalAlpha=e*(1-pulse)*.6; x.beginPath(); x.arc(s[0],s[1],15+pulse*22,0,7); x.stroke(); x.globalAlpha=e;
 // kart ölçüleri
 x.font='700 40px IDB'; const tw=x.measureText(title).width; x.font='500 27px IM'; const sw=sub?x.measureText(sub).width:0;
 const padL=num?96:44, w=Math.max(tw,sw)+padL+34, h=sub?118:78;
 let cx=Math.min(Math.max(s[0]-w*0.18,60),1080-60-w); let cy=(side==='below')? s[1]+110 : s[1]-110-h; cy=Math.max(cy,240);
 // kesikli çizgi (yukarı doğru akarak çizilir)
 const y0=s[1]+(side==='below'?20:-20), y1=(side==='below')?cy:cy+h, lx=Math.min(Math.max(s[0],cx+22),cx+w-22);
 const lp=Math.min(1,p*2.2); x.setLineDash([3,7]); x.strokeStyle='rgba(255,255,255,.9)'; x.lineWidth=2.5;
 x.beginPath(); x.moveTo(s[0],y0); x.lineTo(s[0]+(lx-s[0])*lp, y0+(y1-y0)*lp); x.stroke(); x.setLineDash([]);
 if(p>0.25){ const q=Math.min(1,(p-0.25)/0.35), sc=0.92+0.08*q;
  x.globalAlpha=q; x.translate(cx,cy+h/2); x.scale(sc,sc); x.translate(-cx,-(cy+h/2));
  x.shadowColor='rgba(0,0,0,.45)'; x.shadowBlur=30; x.fillStyle='rgba(18,16,38,.78)'; rr(x,cx,cy,w,h,16); x.fill(); x.shadowBlur=0;
  x.strokeStyle='rgba(255,255,255,.55)'; x.lineWidth=2; rr(x,cx,cy,w,h,16); x.stroke();
  // sol dikey çubuk
  x.fillStyle='#f3cf7a'; rr(x,cx+20,cy+20,6,h-40,3); x.fill();
  let tx=cx+44;
  if(num){ x.strokeStyle='#f3cf7a'; x.lineWidth=2.5; x.beginPath(); x.arc(cx+64,cy+h/2,22,0,7); x.stroke();
    x.fillStyle='#f3cf7a'; x.font='700 26px IDB'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(num,cx+64,cy+h/2+1); tx=cx+padL; }
  x.textAlign='left'; x.textBaseline='alphabetic';
  x.fillStyle='#ffffff'; x.font='700 40px IDB'; x.fillText(title,tx,cy+(sub?54:52));
  if(sub){ x.fillStyle='rgba(222,216,240,.85)'; x.font='500 27px IM'; x.fillText(sub,tx,cy+92); } }
 x.restore();
}
function caption(text, hi, prog){ const x=ov; x.save(); x.font='700 56px IDB'; x.textAlign='left'; x.textBaseline='middle';
 const words=text.split(' '); const lines=[[]]; let wcur=0; const sp=x.measureText(' ').width;
 for(const w of words){ const ww=x.measureText(w).width; if(wcur+ww>860&&lines[lines.length-1].length){lines.push([]);wcur=0;} lines[lines.length-1].push(w); wcur+=ww+sp; }
 const LH=70, y0=1350-(lines.length-1)*LH/2; let k=0; const nShow=prog==null?1e9:Math.ceil(prog*words.length);
 lines.forEach((ln,i)=>{ const full=ln.reduce((a,w)=>a+x.measureText(w).width,0)+sp*(ln.length-1); let xx=540-full/2;
   for(const w of ln){ const on=k<nShow; const isHi=hi&&hi.some(h=>w.replace(/[.,?!:;"“”]/g,'')===h.replace(/[.,?!:;"“”]/g,''));
     x.shadowColor='rgba(0,0,0,.55)'; x.shadowBlur=18; x.shadowOffsetY=3;
     x.fillStyle= !on? 'rgba(255,255,255,.28)' : (isHi?'#f3cf7a':'#ffffff'); x.fillText(w,xx,y0+i*LH);
     if(isHi&&on){ x.shadowBlur=0; x.fillStyle='#f3cf7a'; x.fillRect(xx,y0+i*LH+34,x.measureText(w).width,4); }
     xx+=x.measureText(w).width+sp; k++; } });
 x.restore(); }
function topTitle(small, big){ const x=ov; x.save(); x.textAlign='center'; x.shadowColor='rgba(0,0,0,.5)'; x.shadowBlur=16;
 x.fillStyle='#d9c9ff'; x.font='800 28px IXB'; x.letterSpacing='6px'; x.fillText(small,540,250); x.letterSpacing='0px';
 x.fillStyle='#fff'; x.font='700 60px IDB'; x.fillText(big,540,322); x.restore(); }
function logo(){ if(!LOGO) return; const x=ov; const h=LOGO.height, w=LOGO.width;
 x.save(); x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high';
 x.shadowColor='rgba(0,0,0,.55)'; x.shadowBlur=14; x.shadowOffsetY=3;
 x.drawImage(LOGO,Math.round(540-w/2),Math.round(1548-h/2),w,h); x.restore(); }
function vignette(){ const g=ov.createLinearGradient(0,1150,0,1920); g.addColorStop(0,'rgba(20,16,40,0)'); g.addColorStop(1,'rgba(20,16,40,.75)'); ov.fillStyle=g; ov.fillRect(0,1150,1080,770);
 const g2=ov.createLinearGradient(0,0,0,420); g2.addColorStop(0,'rgba(10,10,30,.55)'); g2.addColorStop(1,'rgba(10,10,30,0)'); ov.fillStyle=g2; ov.fillRect(0,0,1080,420); }

// ======================================================================= kamera
function camOrbit(az, el, dist, target, fov=50){ const a=az*Math.PI/180, e=el*Math.PI/180;
 return {eye:[target[0]+dist*Math.cos(e)*Math.cos(a), target[1]+dist*Math.sin(e), target[2]+dist*Math.cos(e)*Math.sin(a)], target, fov}; }

const GLOWS=[]; window.GLOWS=GLOWS;
window.ANCH={ sami_top:[-5.95,12.95,5.95], yemani_top:[5.95,12.95,5.95], iraki_top:[-5.95,12.95,-5.95], hacer_top:[5.95,12.95,-5.95], hacer:[5.95,1.95,-5.95], multezem:[4.9,3.6,-5.92], kapi:[2.3,5.6,-5.95], makam:[-0.65,2.9,-14.75], iraki:[-5.9,7,-5.9], hicr:[-12.6,1.0,0], mizab:[-7.2,11.6,0], sami:[-5.9,7,5.9], yemani:[5.9,3,5.9] };
GLOWS.push([-15.7,3.9,0,70],[-12.3,3.9,-4.9,70],[-12.3,3.9,4.86,70],[-0.65,1.6,-14.75,110]);
function bloom(){ const x=ov; x.save(); x.globalCompositeOperation='lighter';
 const hit=(o,p)=>{ // kamera->ışık doğrusu Kâbe kutusunu kesiyor mu
   let t0=0,t1=1; const mn=[-6.0,0,-6.0], mx=[6.0,12.95,6.0];
   for(let k=0;k<3;k++){ const d=p[k]-o[k]; if(Math.abs(d)<1e-6){ if(o[k]<mn[k]||o[k]>mx[k]) return false; continue; }
     let a=(mn[k]-o[k])/d, b=(mx[k]-o[k])/d; if(a>b)[a,b]=[b,a]; t0=Math.max(t0,a); t1=Math.min(t1,b); if(t0>t1) return false; } return true; };
 for(const g of GLOWS){ if(hit(CAM.eye,[g[0],g[1],g[2]])) continue; const s=project([g[0],g[1],g[2]]); if(!s) continue; const dist=Math.hypot(CAM.eye[0]-g[0],CAM.eye[1]-g[1],CAM.eye[2]-g[2]); const r=g[3]*14/Math.max(dist,6);
   const gr=x.createRadialGradient(s[0],s[1],0,s[0],s[1],r); gr.addColorStop(0,'rgba(255,220,150,.55)'); gr.addColorStop(.35,'rgba(255,180,90,.18)'); gr.addColorStop(1,'rgba(255,160,60,0)'); x.fillStyle=gr; x.fillRect(s[0]-r,s[1]-r,2*r,2*r); }
 x.restore(); }
window.ANCH_OLD={ hacer:BS, multezem:[HX-0.9,3.2,-HZ], kapi:[3.25,4,-HZ], makam:[MK[0],2.6,MK[2]], iraki:[-HX,6,-HZ], hicr:[-HX-6.5,1.4,0], mizab:[-HX-2.4,KH-.4,0], sami:[-HX,6,HZ], yemani:[HX,2.5,HZ] };
window.proj=(k)=>project(ANCH[k]);
window.frame=function(t, shot){ ov.setTransform(SC,0,0,SC,0,0); ov.clearRect(0,0,W,H);
 render3D(t, camOrbit(...shot.cam)); if(window.STUDIO){ return true; } bloom(); vignette();
 if(shot.title) topTitle(...shot.title);
 for(const L of shot.labels||[]) label(ANCH[L[0]],L[1],L[2],L[3]??1,L[4],L[5]);
 if(shot.cap) caption(shot.cap, shot.hi, shot.capProg); logo(); return true; };
window.ready=(async()=>{ window.NGLB=await loadGLB('model/kaaba.glb'); LOGO=new Image(); LOGO.src='kurandan_logo_video.png'; await LOGO.decode(); return true; })();
