const cookieName='build_strava';
const base64=bytes=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const unbase64=s=>Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
const configured=env=>!!(env.STRAVA_CLIENT_ID&&env.STRAVA_CLIENT_SECRET&&env.BUILD_SESSION_SECRET?.length>=32);
const cookies=request=>Object.fromEntries((request.headers.get('cookie')||'').split(';').map(s=>s.trim().split(/=(.*)/s)).filter(a=>a.length>=2).map(([k,v])=>[k,decodeURIComponent(v)]));
const cookie=(name,value,age=31536000)=>`${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const redirect=(url,headers={})=>new Response(null,{status:302,headers:{Location:url,'Cache-Control':'no-store',...headers}});
async function sessionKey(env){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.BUILD_SESSION_SECRET));return crypto.subtle.importKey('raw',digest,{name:'AES-GCM'},false,['encrypt','decrypt'])}
async function sealSession(env,value){const iv=crypto.getRandomValues(new Uint8Array(12));const result=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await sessionKey(env),new TextEncoder().encode(JSON.stringify(value))));const body=result.slice(0,-16),tag=result.slice(-16);return base64(new Uint8Array([...iv,...tag,...body]))}
async function readSession(env,request){try{const value=cookies(request)[cookieName];if(!value)return null;const raw=unbase64(value),iv=raw.slice(0,12),tag=raw.slice(12,28),body=raw.slice(28);const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv},await sessionKey(env),new Uint8Array([...body,...tag]));return JSON.parse(new TextDecoder().decode(clear))}catch{return null}}
async function tokenExchange(env,params){
 const response=await fetch('https://www.strava.com/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.STRAVA_CLIENT_ID,client_secret:env.STRAVA_CLIENT_SECRET,...params}),signal:AbortSignal.timeout(12000)});
 if(!response.ok){const e=Error('token_exchange_failed');e.status=response.status;throw e}
 const value=await response.json();if(!value.access_token||!value.refresh_token||!Number.isFinite(value.expires_at))throw Error('invalid_token_response');return value;
}
export async function stravaRoute(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/health')return json({app:'BUILD',version:'0.13.0',stravaConfigured:configured(env)});
 if(!path.startsWith('/api/strava/'))return null;
 if(path.endsWith('/disconnect')){if(request.method!=='POST')return json({error:'method_not_allowed'},405,{Allow:'POST'});if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'invalid_origin'},403);return json({connected:false},200,{'Set-Cookie':cookie(cookieName,'',0)})}
 if(request.method!=='GET')return json({error:'method_not_allowed'},405,{Allow:'GET'});
 if(!configured(env))return json({error:'strava_not_configured',connected:false},503);
 if(path.endsWith('/connect')){
  const state=base64(crypto.getRandomValues(new Uint8Array(24))),target=new URL('https://www.strava.com/oauth/authorize');
  target.search=new URLSearchParams({client_id:env.STRAVA_CLIENT_ID,redirect_uri:`${url.origin}/api/strava/callback`,response_type:'code',approval_prompt:'auto',scope:'activity:read_all',state});
  return redirect(target.toString(),{'Set-Cookie':cookie('build_oauth_state',state,600)});
 }
 if(path.endsWith('/callback')){
  const state=url.searchParams.get('state'),stored=cookies(request).build_oauth_state;
  if(!state||!stored||state!==stored)return json({error:'invalid_oauth_state'},400);
  if(url.searchParams.has('error'))return redirect('/?strava=denied',{'Set-Cookie':cookie('build_oauth_state','',0)});
  const code=url.searchParams.get('code');if(!code)return json({error:'invalid_callback'},400);
  try{const data=await tokenExchange(env,{code,grant_type:'authorization_code'}),session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at,athlete:data.athlete?{id:data.athlete.id,firstname:data.athlete.firstname,lastname:data.athlete.lastname}:null};const headers=new Headers({'Location':'/?strava=connected','Cache-Control':'no-store'});headers.append('Set-Cookie',cookie(cookieName,await sealSession(env,session)));headers.append('Set-Cookie',cookie('build_oauth_state','',0));return new Response(null,{status:302,headers})}catch{return json({error:'connection_failed'},502)}
 }
 if(path.endsWith('/activities')){
  let session=await readSession(env,request);if(!session)return json({connected:false},401);
  try{
   if(!session.expires_at||session.expires_at<=Date.now()/1000+120){try{session={...session,...await tokenExchange(env,{grant_type:'refresh_token',refresh_token:session.refresh_token})}}catch(e){if(e.status===400||e.status===401)return json({connected:false,error:'reconnect_required'},401,{'Set-Cookie':cookie(cookieName,'',0)});throw e}}
   const after=url.searchParams.has('after')?Number(url.searchParams.get('after')):Math.floor(Date.now()/1000)-86400*120;
   if(!Number.isFinite(after)||after<0)return json({error:'invalid_date'},400);
   let truncated=false;const activities=[];
   for(let page=1;page<=10;page++){
    const r=await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${Math.floor(after)}&per_page=100&page=${page}`,{headers:{Authorization:`Bearer ${session.access_token}`},signal:AbortSignal.timeout(12000)});
    if(r.status===401)return json({connected:false,error:'reconnect_required'},401,{'Set-Cookie':cookie(cookieName,'',0)});
    if(r.status===429)return json({error:'rate_limited'},429,{'Set-Cookie':cookie(cookieName,await sealSession(env,session))});
    if(!r.ok)throw Error('activity_request_failed');const rows=await r.json();if(!Array.isArray(rows))throw Error('invalid_activities');
    activities.push(...rows.filter(a=>/^(Run|TrailRun|VirtualRun)$/.test(a.sport_type||a.type||'')).map(a=>({id:String(a.id),name:a.name,distanceKm:a.distance/1000,movingSeconds:a.moving_time,date:(a.start_date_local||a.start_date||'').slice(0,10),source:'strava-api',averageHeartrate:a.average_heartrate||null})));
    if(rows.length<100)break;if(page===10)truncated=true;
   }
   return json({connected:true,athlete:session.athlete,activities,truncated},200,{'Set-Cookie':cookie(cookieName,await sealSession(env,session))});
  }catch(e){return json({error:e.status===429?'rate_limited':e.name==='TimeoutError'?'sync_timeout':'sync_failed'},e.status===429?429:e.name==='TimeoutError'?504:502)}
 }
 return json({error:'not_found'},404);
}
