'use strict';
(function(root){
 const LIMIT=20;
 function surfaceCount(evidence){return new Set(evidence.filter(e=>e.type==='surface').map(e=>e.config.medium+'|'+e.config.angle)).size;}
 function canCompare(evidence){return surfaceCount(evidence)>=2;}
 function canSave(evidence){return evidence.length<LIMIT;}
 function colorPair(evidence){
  const cards=evidence.filter(e=>e.type==='color'&&e.config.shape==='prism'&&e.result.rays?.length&&e.result.rays.every(r=>r.through));
  return cards.some(a=>a.config.color==='white'&&cards.some(b=>b.config.color!=='white'&&a.config.angle===b.config.angle&&a.config.y===b.config.y&&(a.config.x??65)===(b.config.x??65)&&(a.config.spectrumVersion??1)===(b.config.spectrumVersion??1)));
 }
 root.LabFlow={LIMIT,surfaceCount,canCompare,canSave,colorPair};
 if(typeof module!=='undefined')module.exports=root.LabFlow;
})(typeof window!=='undefined'?window:globalThis);
