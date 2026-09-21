'use strict';
(function(root){
 const text=(v,n=1200)=>String(v??'').slice(0,n);
 function payload(kind,state){
  const evidence=(kind==='compare'?state.selected.map(id=>state.evidence.find(e=>e.id===id)).filter(Boolean):state.evidence).slice(-20).map(e=>({id:e.id,type:e.type,config:e.config,guess:text(e.guess,300)}));
  const base={kind,evidence};
  if(kind==='compare')return {...base,comparison:text(state.comparison)};
  const post=state.post?{version:state.post.version,answers:state.post.answers}:null;
  if(kind==='assessment')return {...base,evidence:[],post};
  return {...base,post,hypothesis:text(state.hypothesis),comparison:text(state.comparison),explanation:text(state.explanation),colorReason:text(state.colorReason),thoughts:(state.thoughts||[]).slice(-10).map(x=>text(x.text)),questions:[...(state.questions||[]).map(x=>x.text),...(state.hints||[]).filter(x=>x.question).map(x=>x.question)].slice(-20).map(x=>text(x,300))};
 }
 function comparisonGap(cards){
  if(cards.length!==2||cards.some(e=>e.type!=='surface'))return '回到「動手找證據」：選水，保存一張角度 0° 的結果，再保存一張角度 35° 的結果；回來選取這兩張卡。';
  const [a,b]=cards.map(e=>e.config),angle=a.angle!==b.angle,medium=a.medium!==b.medium;
  if(!angle&&!medium)return '兩張卡的條件相同。回到「動手找證據」，固定水為材料，分別保存 0° 與 35° 的結果，再選取這兩張卡。';
  if(angle&&medium)return '角度和材料一起改變，還不能確定是哪個條件造成差異。回到「動手找證據」，固定水為材料，分別保存 0° 與 35° 的結果，再選取這兩張卡。';
  return '';
 }
 root.LabAnalysis={payload,comparisonGap};
 if(typeof module!=='undefined')module.exports=root.LabAnalysis;
})(typeof window!=='undefined'?window:globalThis);
