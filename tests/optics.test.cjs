'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const o=require('../dist/optics.js');
const clear={shape:'prism',color:'white',x:100,y:150,angle:-5};
test('rainbow requires seven clearly separated outgoing rays in view',()=>{
 assert.equal(o.rainbowVisible(clear,700),true);
 for(const patch of [{shape:'none'},{shape:'rectangle'},{color:'red'},{color:'blue'},{y:100,angle:-25},{y:350,angle:25}])assert.equal(o.rainbowVisible({...clear,...patch},700),false,JSON.stringify(patch));
 assert.equal(o.rainbowVisible({ ...clear,angle:8,y:210 },700),true,'user-tested fan should unlock');
 assert.equal(o.rainbowVisible(clear,100),false,'unreadably small separation cannot unlock');
 assert.equal(o.rainbowVisible(clear,700,{left:500,right:570}),false,'rays near the exit must still separate');
 assert.equal(o.rainbowVisible(clear,700,{left:0,right:500}),false,'offscreen rainbow cannot unlock');
 assert.equal(o.rainbowVisible(clear,700,{left:500,right:1000}),true);
});
test('spectrum colors follow the same ray model as their single-color equivalents',()=>{
 const white=o.colorRays(clear);
 assert.equal(white.length,7);
 assert.deepEqual(white[0].segments,o.colorRays({...clear,color:'red'})[0].segments);
 assert.deepEqual(white[4].segments,o.colorRays({...clear,color:'blue'})[0].segments);
 assert.ok(white.every(r=>r.through&&!r.segments.at(-1).inside));
});
test('parallel block exits parallel, empty scene does not bend light',()=>{
 for(const r of o.colorRays({...clear,shape:'rectangle',angle:5,y:180})){
  assert.ok(Math.abs(o.deg(Math.atan2(r.segments.at(-1).dir.y,r.segments.at(-1).dir.x))-5)<1e-8);
 }
 for(const r of o.colorRays({...clear,shape:'none'})){
  assert.equal(r.through,false);assert.equal(r.segments.length,1);
 }
});
test('central snap is symmetric with usable values beyond the small deadband',()=>{
 for(let k=-4;k<=4;k++)assert.equal(o.snapCurvature(k),0);
 assert.equal(o.snapCurvature(-5),-5);assert.equal(o.snapCurvature(5),5);
 assert.equal(o.lens(o.snapCurvature(3)).scale,1);
});
test('old evidence retains its original refractive indices',()=>{
 const old=o.colorRays({...clear,spectrumVersion:1});
 assert.deepEqual(old.map(r=>r.n),[1.5,1.506,1.512,1.518,1.524,1.530,1.536]);
 assert.equal(o.colorRays({...clear,color:'blue',spectrumVersion:1})[0].n,1.524);
});
