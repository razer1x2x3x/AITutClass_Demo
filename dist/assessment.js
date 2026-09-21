'use strict';
(function(root){
 function grade(questions,answers){
  if(!Array.isArray(answers)||answers.length!==questions.length||questions.some((q,i)=>!Number.isInteger(answers[i])||answers[i]<0||answers[i]>=q.o.length))throw new Error('請完成每一題，再提交作答。');
  return {answers:answers.slice(),score:answers.filter((a,i)=>a===questions[i].a).length,total:questions.length,questionIds:questions.map(q=>q.id)};
 }
 function migrate(state,content){
  state.assessmentHistory=state.assessmentHistory||[];
  if(state.pre){state.assessmentHistory.push({...state.pre,label:'舊版暖身題',total:content.legacyPre.length,questions:content.legacyPre});state.pre=null;}
  if(state.post&&state.post.version!==content.assessmentVersion){
   state.assessmentHistory.push({...state.post,label:'舊版新情境挑戰',total:content.legacyPost.length,questions:content.legacyPost});state.post=null;
  }
  if(state.quizDraft?.version!==content.assessmentVersion)state.quizDraft=null;
  return state;
 }
 root.LabAssessment={grade,migrate};
 if(typeof module!=='undefined')module.exports=root.LabAssessment;
})(typeof window!=='undefined'?window:globalThis);
