const crypto=require('crypto');

const COOKIE='build_strava';
function key(){return crypto.createHash('sha256').update(process.env.BUILD_SESSION_SECRET||process.env.STRAVA_CLIENT_SECRET||'').digest()}
function seal(value){const iv=crypto.randomBytes(12);const cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);const body=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);const tag=cipher.getAuthTag();return Buffer.concat([iv,tag,body]).toString('base64url')}
function open(token){try{const raw=Buffer.from(token,'base64url'),iv=raw.subarray(0,12),tag=raw.subarray(12,28),body=raw.subarray(28);const decipher=crypto.createDecipheriv('aes-256-gcm',key(),iv);decipher.setAuthTag(tag);return JSON.parse(Buffer.concat([decipher.update(body),decipher.final()]).toString('utf8'))}catch{return null}}
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),decodeURIComponent(x.slice(i+1))]}))}
function setSession(res,data){res.setHeader('Set-Cookie',`${COOKIE}=${encodeURIComponent(seal(data))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`)}
function clearSession(res){res.setHeader('Set-Cookie',`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)}
function getSession(req){const c=cookies(req);return c[COOKIE]?open(c[COOKIE]):null}
async function tokenExchange(params){const body=new URLSearchParams(params);const r=await fetch('https://www.strava.com/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});if(!r.ok)throw new Error(`Strava token exchange failed ${r.status}`);return r.json()}
async function freshSession(session){if(!session)return null;if(session.expires_at && session.expires_at>Date.now()/1000+120)return session;const data=await tokenExchange({client_id:process.env.STRAVA_CLIENT_ID,client_secret:process.env.STRAVA_CLIENT_SECRET,grant_type:'refresh_token',refresh_token:session.refresh_token});return {...session,...data}}
function origin(req){const proto=req.headers['x-forwarded-proto']||'https';return `${proto}://${req.headers.host}`}
module.exports={COOKIE,setSession,clearSession,getSession,tokenExchange,freshSession,origin};
