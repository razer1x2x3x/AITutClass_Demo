'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {grade,migrate}=require('../dist/assessment.js');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../dist/content.js'),'utf8'),context);
const content=JSON.parse(JSON.stringify(context.window.LabContent));
const qs=content.post,answers=[1,2,0,1,2,0,1,2,0,1];
test('ten basic concepts have stable identities and grade correctly',()=>{
 assert.equal(qs.length,10);
 assert.equal(new Set(qs.map(q=>q.id)).size,10);
 for(const q of qs){assert.ok(q.topic&&q.why);assert.ok(q.o[q.a]);}
 assert.equal(grade(qs,answers).score,10);
 const wrong=answers.map((a,i)=>i<3?(a+1)%3:a);
 assert.equal(grade(qs,wrong).score,7);
 assert.equal(grade(qs,wrong).total,10);
 assert.equal(grade(qs,answers.map(a=>(a+1)%3)).score,0);
 assert.deepEqual(grade(qs,answers).questionIds,qs.map(q=>q.id));
});
test('missing and invalid choices cannot be counted as answer zero',()=>{
 for(const choices of [[],answers.slice(0,9),Array(10),[null,...answers.slice(1)],['1',...answers.slice(1)],[-1,...answers.slice(1)],[3,...answers.slice(1)]]){
  assert.throws(()=>grade(qs,choices),/完成每一題/);
 }
});
test('legacy three-question attempts are archived without losing evidence or duplicating records',()=>{
 const state={pre:{answers:[0,1,2],score:3,time:'2026-09-17'},post:{answers:[1,2,0],score:3,time:'2026-09-17'},evidence:[{id:'E01'}],quizDraft:{version:'old',answers:[1]}};
 migrate(state,content);migrate(state,content);
 assert.equal(state.pre,null);assert.equal(state.post,null);assert.equal(state.quizDraft,null);
 assert.equal(state.assessmentHistory.length,2);
 assert.equal(state.assessmentHistory[1].questions.length,3);
 assert.equal(state.assessmentHistory[1].questions[1].o[2],'硬幣的光跨越水面後改變路徑，再進入眼睛');
 assert.deepEqual(state.evidence,[{id:'E01'}]);
});
test('current ten-question results and partial drafts survive migration',()=>{
 const post={...grade(qs,answers),version:content.assessmentVersion};
 const draft={version:content.assessmentVersion,answers:[1,null,null,null,null,null,null,null,null,null]};
 const state={post,quizDraft:draft};
 migrate(state,content);
 assert.equal(state.post,post);assert.equal(state.quizDraft,draft);
 assert.equal(state.assessmentHistory.length,0);
});
