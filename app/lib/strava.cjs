const crypto=require('crypto');

const COOKIE='build_strava';
function key(){const secret=process.env.BUILD_SESSION_SECRET;if(!secret||secret.length<32)throw Error('BUILD_SESSION_SECRET must contain at least 32 characters.');return crypto.createHash('sha256').update(secret).digest()}
function seal(value){const iv=crypto.randomBytes(12);const cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);const body=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);const tag=cipher.getAuthTag();return Buffer.concat([iv,tag,body]).toString('base64url')}
function open(token){try{const raw=Buffer.from(token,'base64url'),iv=raw.subarray(0,12),tag=raw.subarray(12,28),body=raw.subarray(28);const decipher=crypto.createDecipheriv('aes-256-gcm',key(),iv);decipher.setAuthTag(tag);return JSON.parse(Buffer.concat([decipher.update(body),decipher.final()]).toString('utf8'))}catch{return null}}
function cookies(req){const result={};for(const part of (req.headers.cookie||'').split(';')){const i=part.indexOf('=');if(i<1)continue;try{result[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1))}catch{}}return result}
function setSession(res,data){res.setHeader('Set-Cookie',`${COOKIE}=${encodeURIComponent(seal(data))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`)}
function clearSession(res){res.setHeader('Set-Cookie',`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)}
function getSession(req){const c=cookies(req);return c[COOKIE]?open(c[COOKIE]):null}
class StravaError extends Error{constructor(status,code){super(code);this.status=status;this.code=code}}
async function tokenExchange(params){
 const body=new URLSearchParams(params);
 const r=await fetch('https://www.strava.com/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw new StravaError(r.status,r.status===429?'rate_limited':'token_exchange_failed');
 const data=await r.json();
 if(typeof data.access_token!=='string'||!data.access_token||typeof data.refresh_token!=='string'||!data.refresh_token||!Number.isFinite(data.expires_at))throw new StravaError(502,'invalid_token_response');
 return data;
}
async function freshSession(session){if(!session)return null;if(session.expires_at && session.expires_at>Date.now()/1000+120)return session;const data=await tokenExchange({client_id:process.env.STRAVA_CLIENT_ID,client_secret:process.env.STRAVA_CLIENT_SECRET,grant_type:'refresh_token',refresh_token:session.refresh_token});return {...session,...data}}
function origin(req){const proto=req.headers['x-forwarded-proto']||'https';return `${proto}://${req.headers.host}`}
module.exports={cookies,COOKIE,setSession,clearSession,getSession,tokenExchange,freshSession,origin};
