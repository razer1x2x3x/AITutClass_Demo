import {createHmac,timingSafeEqual} from 'node:crypto';
const equal=(a,b)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);};
export function createTrialAccess({origin,code}){
 if(!origin)return null;
 const publicURL=new URL(origin);
 if(publicURL.protocol!=='https:'||publicURL.pathname!=='/'||publicURL.search||publicURL.hash||publicURL.username||publicURL.password)throw Error('PUBLIC_ORIGIN must be an HTTPS origin');
 if(!code||code.length<16)throw Error('TRIAL_ACCESS_CODE must contain at least 16 characters');
 const signature=value=>createHmac('sha256',code).update(value).digest('hex');
 return {origin:publicURL.origin,host:publicURL.host,
  acceptsCode:value=>typeof value==='string'&&equal(signature(value),signature(code)),
  cookie:()=>{const expiry=String(Date.now()+3*86400000);return `light_trial=${expiry}.${signature(expiry)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=259200`;},
  authorized:header=>{const value=String(header||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('light_trial='))?.slice(12);if(!value)return false;const [expiry,sig]=value.split('.');return /^\d+$/.test(expiry)&&Number(expiry)>Date.now()&&Number(expiry)<=Date.now()+3*86400000&&equal(sig||'',signature(expiry));}
 };
}
export const loginPage=`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>光的旅行 · 試用入口</title><style>body{font:18px/1.7 system-ui;background:#f3f6ff;color:#0b1d4a;padding:24px}main{max-width:420px;margin:10vh auto;padding:28px;background:white;border-radius:20px}input,button{box-sizing:border-box;font:inherit;width:100%;padding:12px;margin-top:12px;border:1px solid #bbcaff;border-radius:10px}button{background:#2f6bff;color:white}small{display:block;margin-top:18px}</style><main><h1>光的旅行</h1><p>輸入收到的試用碼，開始探索。</p><form action="/trial-login" method="post"><label for="code">試用碼</label><input id="code" name="code" type="password" required maxlength="200" autocomplete="off"><button>進入體驗</button></form><small>學習紀錄保存在這台裝置的瀏覽器。完成後可匯出給老師。</small></main></html>`;
