import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stravaRoute} from '../worker/routes.js';
const origin='https://private-build.example';
const env={STRAVA_CLIENT_ID:'123',STRAVA_CLIENT_SECRET:'test-only-secret',BUILD_SESSION_SECRET:'test-only-session-secret-long-enough-for-encryption'};
const req=(path,headers={})=>new Request(origin+path,{headers});
test('health reports configuration truthfully without exposing credentials',async()=>{
 const response=await stravaRoute(req('/api/health'),{});assert.equal((await response.json()).stravaConfigured,false);assert.equal(response.headers.get('Cache-Control'),'no-store');
 const configured=await stravaRoute(req('/api/health'),env);const text=await configured.text();assert.equal(JSON.parse(text).stravaConfigured,true);assert.ok(!text.includes(env.STRAVA_CLIENT_SECRET));
 const disconnected=await stravaRoute(req('/api/strava/activities'),{});assert.equal(disconnected.status,503);
});
test('OAuth uses this private origin, validates state and returns an encrypted HttpOnly session',async()=>{
 const connect=await stravaRoute(req('/api/strava/connect'),env);const target=new URL(connect.headers.get('Location'));
 assert.equal(target.searchParams.get('redirect_uri'),origin+'/api/strava/callback');assert.equal(target.searchParams.get('scope'),'activity:read_all');
 const state=target.searchParams.get('state');assert.ok(state.length>=32);const stateCookie=connect.headers.get('Set-Cookie').split(';')[0];
 const bad=await stravaRoute(req('/api/strava/callback?code=code&state=wrong',{cookie:stateCookie}),env);assert.equal(bad.status,400);
 const saved=global.fetch;global.fetch=async()=>new Response(JSON.stringify({access_token:'test-access',refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+7200,athlete:{id:1,firstname:'Runner'}}));
 try{
  const result=await stravaRoute(req('/api/strava/callback?code=code&state='+state,{cookie:stateCookie}),env);assert.equal(result.status,302);assert.equal(result.headers.get('Location'),'/?strava=connected');
  const cookie=result.headers.getSetCookie().find(v=>v.startsWith('build_strava='));assert.ok(cookie.includes('HttpOnly'));assert.ok(cookie.includes('Secure'));assert.ok(!cookie.includes('test-access'));
  global.fetch=async()=>new Response(JSON.stringify([{id:20,name:'Morning run',distance:10100,moving_time:3000,sport_type:'Run',start_date_local:'2026-10-15T06:00:00'},{id:21,sport_type:'Ride',distance:30000}]));
  const activities=await stravaRoute(req('/api/strava/activities',{cookie:cookie.split(';')[0]}),env);assert.equal(activities.status,200);const data=await activities.json();assert.equal(data.activities.length,1);assert.equal(data.activities[0].distanceKm,10.1);assert.equal(data.activities[0].source,'strava-api');assert.equal(data.activities[0].date,'2026-10-15');
  const tampered=await stravaRoute(req('/api/strava/activities',{cookie:'build_strava=tampered'}),env);assert.equal(tampered.status,401);
 }finally{global.fetch=saved}
});
test('token refresh rotates the encrypted cookie, pagination filters runs and rate limits are not successes',async()=>{
 const saved=global.fetch;let phase='login';
 global.fetch=async(url,options)=>{if(url.endsWith('/oauth/token'))return new Response(JSON.stringify({access_token:phase==='login'?'expired':'fresh',refresh_token:'rotated',expires_at:phase==='login'?1:Date.now()/1000+1000}));throw Error('unexpected')};
 try{
  const connect=await stravaRoute(req('/api/strava/connect'),env),state=new URL(connect.headers.get('Location')).searchParams.get('state');
  const callback=await stravaRoute(req('/api/strava/callback?code=c&state='+state,{cookie:connect.headers.get('Set-Cookie').split(';')[0]}),env);
  const cookie=callback.headers.getSetCookie().find(v=>v.startsWith('build_strava=')).split(';')[0];phase='refresh';let pages=0;
  global.fetch=async(url,options)=>{if(url.endsWith('/oauth/token')){assert.equal(new URLSearchParams(options.body).get('grant_type'),'refresh_token');return new Response(JSON.stringify({access_token:'fresh',refresh_token:'rotated',expires_at:Date.now()/1000+1000}))}assert.equal(options.headers.Authorization,'Bearer fresh');pages++;return new Response(JSON.stringify(pages===1?Array.from({length:100},(_,i)=>({id:i,name:'Run',distance:1000,moving_time:300,sport_type:'Run',start_date_local:'2026-10-15'})):[]))};
  const response=await stravaRoute(req('/api/strava/activities',{cookie}),env);assert.equal(response.status,200);assert.equal((await response.json()).activities.length,100);assert.equal(pages,2);assert.notEqual(response.headers.get('Set-Cookie').split(';')[0],cookie);
  const freshCookie=response.headers.get('Set-Cookie').split(';')[0];global.fetch=async()=>new Response('{}',{status:429});const limited=await stravaRoute(req('/api/strava/activities',{cookie:freshCookie}),env);assert.equal(limited.status,429);assert.equal((await limited.json()).error,'rate_limited');
 }finally{global.fetch=saved}
});
test('disconnect requires POST and rejects requests from another origin',async()=>{
 assert.equal((await stravaRoute(req('/api/strava/disconnect'),env)).status,405);
 const blocked=await stravaRoute(new Request(origin+'/api/strava/disconnect',{method:'POST',headers:{Origin:'https://another.example'}}),env);assert.equal(blocked.status,403);
 const done=await stravaRoute(new Request(origin+'/api/strava/disconnect',{method:'POST',headers:{Origin:origin}}),env);assert.equal(done.status,200);assert.ok(done.headers.get('Set-Cookie').includes('Max-Age=0'));
});
