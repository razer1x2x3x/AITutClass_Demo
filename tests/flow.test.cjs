'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const flow=require('../dist/flow.js');
const o=require('../dist/optics.js');
const surface=(angle,medium='water')=>({type:'surface',config:{angle,medium}});
test('comparison needs two distinct surface conditions, not unrelated cards or duplicates',()=>{
 assert.equal(flow.canCompare([]),false);
 assert.equal(flow.canCompare([surface(35)]),false);
 assert.equal(flow.canCompare([surface(35),surface(35)]),false);
 assert.equal(flow.canCompare([surface(35),{type:'design',config:{}}]),false);
 assert.equal(flow.canCompare([surface(35),surface(0)]),true);
 assert.equal(flow.canCompare([surface(35),surface(35,'glass')]),true);
});
test('twenty-card cap applies to all types and preserves existing oversized collections',()=>{
 const cards=Array.from({length:19},(_,i)=>({type:i%2?'surface':'design'}));
 assert.equal(flow.canSave(cards),true);cards.push({type:'color'});
 assert.equal(flow.canSave(cards),false);
 cards.push({type:'color'});assert.equal(flow.canSave(cards),false);assert.equal(cards.length,21);
 cards.pop();cards.pop();assert.equal(flow.canSave(cards),true);
});
test('TIR needs high-to-low index and incidence strictly above the critical angle',()=>{
 const ray=a=>({x:Math.sin(o.rad(a)),y:-Math.cos(o.rad(a))}),normal={x:0,y:1};
 assert.equal(o.refract(ray(30),normal,1.5,1).tir,false);
 assert.equal(o.refract(ray(55),normal,1.5,1).tir,true);
 assert.equal(o.refract(ray(55),normal,1,1.5).tir,false);
});
test('new target B is reachable after genuine internal reflection, legacy target stays on right',()=>{
 const c={shape:'prism',x:100,y:100,angle:18,target:360,targetVersion:2};
 const r=o.design(c);
 assert.deepEqual(r.target,{x:525,y:435,r:25});assert.ok(r.hit&&r.through&&r.tir);
 assert.equal(r.reflections.length,1);assert.ok(r.segments.some(s=>s.inside&&s.tir));
 assert.equal(o.design({...c,angle:-10,y:210}).hit,false);
 assert.equal(o.design({...c,shape:'rectangle'}).tir,false);
 assert.deepEqual(o.targetPoint({...c,targetVersion:undefined}),{x:910,y:360,r:25});
});
test('target A requires an outgoing ray that passed through the block',()=>{
 const c={shape:'rectangle',x:100,y:280,angle:0,target:280,targetVersion:2};
 assert.equal(o.design(c).hit,true);assert.equal(o.design(c).tir,false);
 assert.equal(o.design({...c,y:100,angle:-25}).hit,false);
});
test('rainbow points lie inside the visible fan and reject hidden or monochromatic rays',()=>{
 const c={shape:'prism',color:'white',x:100,y:210,angle:8};
 for(const width of [700,950]){
  const point=o.rainbowSpot(c,width);assert.ok(point);assert.ok(point.x>600&&point.y<465);
  assert.equal(o.rainbowSpot({...c,color:'red'},width),null);
  assert.equal(o.rainbowSpot(c,width,{left:0,right:500}),null);
 }
});
test('color comparison requires actual transmission and consistent experimental conditions',()=>{
 const white={type:'color',config:{shape:'prism',color:'white',angle:8,x:100,y:210,spectrumVersion:2},result:{rays:[{through:true}]}};
 const red={...white,config:{...white.config,color:'red'}};
 assert.equal(flow.colorPair([white,red]),true);
 assert.equal(flow.colorPair([white,{...red,result:{rays:[{through:false}]}}]),false);
 assert.equal(flow.colorPair([white,{...red,config:{...red.config,x:120}}]),false);
 assert.equal(flow.colorPair([white,{...red,config:{...red.config,spectrumVersion:1}}]),false);
});
