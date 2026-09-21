import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import http from 'node:http';
test('cloud trial gates pages and APIs; configured origin and signed cookie are required',async()=>{
 const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'4197',PUBLIC_ORIGIN:'https://trial.example',TRIAL_ACCESS_CODE:'test-only-trial-code',OPENAI_API_KEY:'',OPENAI_MODEL:''},windowsHide:true,stdio:['ignore','pipe','pipe']});
 const request=(path,options={})=>new Promise((resolve,reject)=>{const req=http.request({hostname:'127.0.0.1',port:4197,path,method:options.method||'GET',headers:{Host:'trial.example',...options.headers}},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});req.on('error',reject);req.end(options.body);});
 try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('startup timeout')),5000);child.stdout.once('data',()=>{clearTimeout(timer);resolve();});child.once('error',reject);child.once('exit',code=>{clearTimeout(timer);reject(Error('startup exit '+code));});});
  assert.equal((await request('/api/status')).status,401);
  assert.match((await request('/')).body,/試用碼/);
  assert.equal((await request('/trial-login',{method:'POST',headers:{Origin:'https://evil.example'},body:'code=test-only-trial-code'})).status,403);
  const login=await request('/trial-login',{method:'POST',headers:{Origin:'https://trial.example'},body:'code=test-only-trial-code'});assert.equal(login.status,303);
  const cookie=login.headers['set-cookie'][0].split(';')[0];
  assert.match((await request('/',{headers:{Cookie:cookie}})).body,/id="main"/);
  assert.equal(JSON.parse((await request('/api/status',{headers:{Cookie:cookie}})).body).mode,'preset');
  assert.equal((await request('/api/analyze',{method:'POST',headers:{Cookie:cookie,Origin:'https://trial.example'},body:'{}'})).status,503);
  assert.equal((await request('/api/analyze',{method:'POST',headers:{Cookie:cookie,Origin:'https://evil.example'},body:'{}'})).status,403);
  assert.equal((await request('/',{headers:{Host:'evil.example',Cookie:cookie}})).status,403);
  assert.equal((await request('/healthz')).status,200);
 }finally{child.kill();}
});
