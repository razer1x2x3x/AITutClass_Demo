import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTrialAccess} from '../trial-access.mjs';
test('cloud mode requires HTTPS origin and a long private trial code',()=>{
 assert.equal(createTrialAccess({}),null);
 for(const origin of ['http://trial.example','https://trial.example/path','https://user:pass@trial.example'])assert.throws(()=>createTrialAccess({origin,code:'long-example-code'}));
 assert.throws(()=>createTrialAccess({origin:'https://trial.example',code:'short'}));
});
test('trial cookie is signed, secure and cannot be forged by extending expiry',()=>{
 const access=createTrialAccess({origin:'https://trial.example',code:'long-example-code'}),cookie=access.cookie();
 assert.ok(access.acceptsCode('long-example-code'));assert.ok(!access.acceptsCode('incorrect'));
 assert.match(cookie,/HttpOnly; Secure; SameSite=Lax/);assert.ok(access.authorized(cookie));assert.ok(!access.authorized(''));
 assert.ok(!access.authorized(cookie.replace(/light_trial=\d+/,`light_trial=${Date.now()+10*86400000}`)));
 assert.ok(!access.authorized(cookie.replace(/\.[a-f0-9]+;/,'.0000;')));
});
