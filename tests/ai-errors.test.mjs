import {test} from 'node:test';
import assert from 'node:assert/strict';
import {providerError,classifyAIError} from '../ai-errors.mjs';
import {generateAnalysis,prepareAnalysis} from '../analysis.mjs';
test('provider errors distinguish quota, credentials, model and rate limits without exposing messages',async()=>{
 for(const [status,code,expected] of [[429,'insufficient_quota','provider_quota'],[429,'rate_limit_exceeded','provider_rate_limit'],[401,'invalid_api_key','provider_auth'],[404,'model_not_found','provider_model'],[403,null,'provider_permission'],[400,null,'provider_request'],[503,null,'provider_unavailable']]){
  const error=await providerError({status,json:async()=>({error:{code,message:'secret-key-and-student-text'}})});
  assert.equal(classifyAIError(error),expected);assert.ok(!String(error).includes('secret'));
 }
 assert.equal(classifyAIError(new DOMException('secret','TimeoutError')),'analysis_timeout');
 assert.equal(classifyAIError(new TypeError('fetch failed')),'analysis_network');
});
test('analysis preserves upstream failures and distinguishes incomplete output',async()=>{
 const input=prepareAnalysis({kind:'compare',evidence:[{id:'E01',type:'surface',config:{angle:0,medium:'water'}},{id:'E02',type:'surface',config:{angle:35,medium:'water'}}]});
 for(const [response,reason] of [[{ok:false,status:429,json:async()=>({error:{code:'insufficient_quota'}})},'provider_quota'],[{ok:true,json:async()=>({status:'incomplete'})},'analysis_incomplete']]){
  await assert.rejects(()=>generateAnalysis(input,{key:'test-only',model:'test-only',fetcher:async()=>response}),error=>classifyAIError(error)===reason);
 }
});
