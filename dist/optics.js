'use strict';
(function(root){
const rad=x=>x*Math.PI/180,deg=x=>x*180/Math.PI, dot=(a,b)=>a.x*b.x+a.y*b.y, cross=(a,b)=>a.x*b.y-a.y*b.x,sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y}),add=(a,b)=>({x:a.x+b.x,y:a.y+b.y}),mul=(a,k)=>({x:a.x*k,y:a.y*k}),unit=a=>mul(a,1/Math.hypot(a.x,a.y));
function refract(d,n,n1,n2){let nn=n;if(dot(d,nn)>0)nn=mul(nn,-1);const c=-dot(d,nn),eta=n1/n2,k=1-eta*eta*(1-c*c);return k<0?{dir:unit(add(d,mul(nn,2*c))),tir:true}:{dir:unit(add(mul(d,eta),mul(nn,eta*c-Math.sqrt(k)))),tir:false};}
function surface(angle,medium='water'){const n={air:1,water:1.333,glass:1.5}[medium]||1.333;return {input:angle,output:deg(Math.asin(Math.sin(rad(angle))/n)),n,bent:Math.abs(angle)>0.01&&n!==1};}
function polygon(shape){return shape==='rectangle'?[{x:400,y:85},{x:610,y:85},{x:610,y:395},{x:400,y:395}]:[{x:485,y:75},{x:355,y:395},{x:650,y:395}];}
function trace(origin,dir,poly,n=1.5){let p=origin,d=unit(dir),inside=false;const segments=[];for(let bounce=0;bounce<12;bounce++){let closest=null;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],edge=sub(b,a),den=cross(d,edge);if(Math.abs(den)<1e-8)continue;const ap=sub(a,p),t=cross(ap,edge)/den,u=cross(ap,d)/den;if(t>0.00001&&u>=0&&u<=1&&(!closest||t<closest.t))closest={t,p:add(p,mul(d,t)),normal:unit({x:-edge.y,y:edge.x})};}if(!closest){segments.push({a:p,b:add(p,mul(d,1400)),inside,dir:d});break;}const r=refract(d,closest.normal,inside?n:1,inside?1:n);segments.push({a:p,b:closest.p,inside,dir:d,tir:r.tir});if(!r.tir)inside=!inside;d=r.dir;p=add(closest.p,mul(d,.0001));}return segments;}
function targetPoint(c){return c.targetVersion===2&&c.target===360?{x:525,y:435,r:25}:{x:910,y:c.target??280,r:25};}
function design(c){
 const dir={x:Math.cos(rad(c.angle)),y:Math.sin(rad(c.angle))},seg=trace({x:c.x??65,y:c.y},dir,polygon(c.shape||'prism'),c.n||1.5),target=targetPoint(c);
 let targetY=null;
 for(const s of seg){if(s.a.x<=910&&s.b.x>=910&&s.dir.x>0)targetY=s.a.y+(910-s.a.x)*s.dir.y/s.dir.x;}
 const through=seg.some(s=>s.inside),hit=c.targetVersion!==2?(targetY!==null&&Math.abs(targetY-(c.target||280))<=25):seg.some((s,i)=>{
  if(i===0||s.inside||!seg.slice(0,i).some(p=>p.inside))return false;
  const offset=sub(target,s.a),length=Math.hypot(s.b.x-s.a.x,s.b.y-s.a.y),t=Math.max(0,Math.min(length,dot(offset,s.dir)));
  return Math.hypot(offset.x-s.dir.x*t,offset.y-s.dir.y*t)<=target.r;
 });
 const reflections=seg.filter(s=>s.tir).map(s=>s.b);
 return {segments:seg,targetY,hit,through,target,reflections,tir:reflections.length>0};
}
function lens(curvature){const k=Math.max(-100,Math.min(100,curvature)),power=k*(k>=0?.000032:.00004),eyeDistance=300,objectDistance=180,den=eyeDistance+objectDistance-power*eyeDistance*objectDistance,magnification=1/(1-power*objectDistance),imageDistance=objectDistance*magnification;return {power,eyeDistance,objectDistance,magnification,imageDistance,scale:(eyeDistance+objectDistance)/den,heights:[-75,0,75].map(h=>({object:h,lens:h*eyeDistance/den})),virtual:power===0?null:-imageDistance,edge:24,bow:k*.4};}

const spectrumColors=['#ff6464','#ffad4c','#ffe568','#80ec9c','#65c8ff','#a89aff','#de9fff'];
function colorRays(c){
 const spectrum=c.spectrumVersion===1?[1.5,1.506,1.512,1.518,1.524,1.530,1.536]:[1.47,1.48,1.49,1.50,1.51,1.52,1.53];
 const indices=c.color==='white'?spectrum:[spectrum[c.color==='red'?0:4]];
 return indices.map((n,i)=>{
  const dir={x:Math.cos(rad(c.angle)),y:Math.sin(rad(c.angle))},a={x:c.x??65,y:c.y};
  const result=c.shape==='none'?{segments:[{a,b:add(a,mul(dir,1400)),dir,inside:false}],through:false}:design({...c,n});
  return {...result,n,color:c.color==='white'?spectrumColors[i]:c.color==='red'?spectrumColors[0]:spectrumColors[4]};
 });
}
// Find a visible fan of all seven outgoing rays. Measure across the rays in CSS pixels.
function rainbowSpot(c,width=1000,visible={left:0,right:1000}){
 if(c.color!=='white'||c.shape!=='prism'||width<=0)return null;
 const rays=colorRays(c),exits=rays.map(r=>r.segments.at(-1));
 if(rays.some(r=>!r.through)||exits.some(s=>s.inside||s.dir.x<=0))return null;
 let run=0;
 const firstX=Math.max(...exits.map(s=>s.a.x))+15;
 for(let x=Math.ceil(firstX/5)*5;x<=980;x+=5){
  const ys=exits.map(s=>s.a.y+(x-s.a.x)*s.dir.y/s.dir.x);
  const inView=x>=visible.left&&x<=visible.right&&ys.every(y=>y>=55&&y<=465);
  const gaps=ys.slice(1).map((y,i)=>Math.abs(y-ys[i])*Math.min(exits[i].dir.x,exits[i+1].dir.x)*width/1000);
  const clear=inView&&Math.min(...gaps)>=1.1&&(Math.max(...ys)-Math.min(...ys))*width/1000>=12;
  run=clear?run+5:0;
  if(run*width/1000>=12)return {x,y:ys.reduce((sum,y)=>sum+y,0)/7};
 }
 return null;
}
function rainbowVisible(c,width=1000,visible={left:0,right:1000}){return !!rainbowSpot(c,width,visible);}
function snapCurvature(value){return Math.abs(value)<=4?0:Math.max(-100,Math.min(100,value));}

root.Optics={rad,deg,refract,surface,polygon,trace,targetPoint,design,lens,colorRays,rainbowSpot,rainbowVisible,spectrumColors,snapCurvature};if(typeof module!=='undefined')module.exports=root.Optics;
})(typeof window!=='undefined'?window:globalThis);
