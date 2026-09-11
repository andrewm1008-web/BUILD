const {test,after}=require('node:test');const assert=require('node:assert/strict');
const previous={...process.env};const originalFetch=global.fetch;
process.env.BUILD_SESSION_SECRET='a'.repeat(64);
const auth=require('../lib/strava.cjs');
function response(){return {headers:{},statusCode:200,setHeader(k,v){this.headers[k.toLowerCase()]=v},getHeader(k){return this.headers[k.toLowerCase()]},end(body){this.body=body}}}
function request(cookie=''){return {method:'GET',headers:{host:'build.example',cookie},query:{},url:'/api/strava/activities'}}
function cookie(){const res=response();auth.setSession(res,{access_token:'fake-access',refresh_token:'fake-refresh',expires_at:Date.now()/1000+3600,athlete:{id:1}});return res.headers['set-cookie'].split(';')[0]}
after(()=>{global.fetch=originalFetch;for(const k of ['BUILD_SESSION_SECRET','STRAVA_CLIENT_ID','STRAVA_CLIENT_SECRET']){previous[k]===undefined?delete process.env[k]:process.env[k]=previous[k]}});
test('session cookies round-trip and tampering fails closed',()=>{
 const value=cookie();assert.equal(auth.getSession(request(value)).athlete.id,1);assert.equal(auth.getSession(request(value.slice(0,-3)+'abc')),null);assert.equal(auth.getSession(request('build_strava=%invalid')),null);
});
test('session encryption requires its dedicated secret',()=>{
 const secret=process.env.BUILD_SESSION_SECRET;delete process.env.BUILD_SESSION_SECRET;assert.throws(()=>auth.setSession(response(),{}));process.env.BUILD_SESSION_SECRET=secret;
});
test('unauthenticated activity requests return a non-cacheable 401',async()=>{
 const res=response();await require('../api/strava/activities')(request(),res);assert.equal(res.statusCode,401);assert.equal(res.headers['cache-control'],'no-store');
});
test('activities paginate past the first 100 and preserve local run dates',async()=>{
 let calls=0;global.fetch=async url=>{calls++;assert.ok(String(url).includes(`page=${calls}`));return {ok:true,status:200,json:async()=>calls===1?Array.from({length:100},(_,i)=>({id:i,sport_type:'Ride',distance:10000,moving_time:1800})): [{id:101,name:'Run',sport_type:'Run',distance:25000,moving_time:7200,start_date_local:'2027-02-07T23:30:00Z'}]}};
 const res=response();await require('../api/strava/activities')(request(cookie()),res);const body=JSON.parse(res.body);assert.equal(calls,2);assert.equal(body.activities.length,1);assert.equal(body.activities[0].distanceKm,25);assert.equal(body.activities[0].date,'2027-02-07');
});
test('rate limiting is surfaced without a success payload',async()=>{
 global.fetch=async()=>({ok:false,status:429});const res=response();await require('../api/strava/activities')(request(cookie()),res);assert.equal(res.statusCode,429);assert.equal(JSON.parse(res.body).error,'rate_limited');
});
test('disconnect requires POST and rejects a foreign origin',async()=>{
 const handler=require('../api/strava/disconnect');let req=request(),res=response();await handler(req,res);assert.equal(res.statusCode,405);
 req.method='POST';req.headers.origin='https://foreign.example';res=response();await handler(req,res);assert.equal(res.statusCode,403);
 req.headers.origin='https://build.example';res=response();await handler(req,res);assert.equal(res.statusCode,204);assert.ok(res.headers['set-cookie'].includes('Max-Age=0'));
});
test('OAuth invalid state fails without a token request',async()=>{
 let called=false;global.fetch=async()=>{called=true};const req=request('build_oauth_state=valid');req.url='/api/strava/callback?code=fake&state=wrong';const res=response();await require('../api/strava/callback')(req,res);assert.equal(res.statusCode,400);assert.equal(called,false);
});
test('OAuth success clears the one-time state cookie and keeps the session HttpOnly',async()=>{
 global.fetch=async()=>({ok:true,json:async()=>({access_token:'a',refresh_token:'r',expires_at:Date.now()/1000+3600,athlete:{id:1,firstname:'Runner'}})});
 const req=request('build_oauth_state=valid');req.url='/api/strava/callback?code=fake&state=valid';const res=response();await require('../api/strava/callback')(req,res);assert.equal(res.statusCode,302);assert.equal(res.headers['set-cookie'].length,2);assert.ok(res.headers['set-cookie'][0].includes('HttpOnly'));assert.ok(res.headers['set-cookie'][1].includes('Max-Age=0'));
});
test('expired session refreshes its tokens and keeps the athlete identity',async()=>{
 let calls=0;
 global.fetch=async(url,options)=>{
  calls++;
  if(String(url).includes('/oauth/token')){assert.equal(options.body.get('refresh_token'),'old-refresh');return {ok:true,json:async()=>({access_token:'new-access',refresh_token:'new-refresh',expires_at:Date.now()/1000+7200})}}
  assert.equal(options.headers.Authorization,'Bearer new-access');return {ok:true,status:200,json:async()=>[]};
 };
 const seeded=response();auth.setSession(seeded,{access_token:'old-access',refresh_token:'old-refresh',expires_at:1,athlete:{id:7}});
 const res=response();await require('../api/strava/activities')(request(seeded.headers['set-cookie'].split(';')[0]),res);
 assert.equal(res.statusCode,200);assert.equal(calls,2);
 const saved=auth.getSession(request(res.headers['set-cookie'].split(';')[0]));assert.equal(saved.refresh_token,'new-refresh');assert.equal(saved.athlete.id,7);
});
test('rejected refresh asks for reconnection and clears the expired session',async()=>{
 global.fetch=async()=>({ok:false,status:400});
 const seeded=response();auth.setSession(seeded,{access_token:'old',refresh_token:'revoked',expires_at:1});
 const res=response();await require('../api/strava/activities')(request(seeded.headers['set-cookie'].split(';')[0]),res);
 assert.equal(res.statusCode,401);assert.equal(JSON.parse(res.body).error,'reconnect_required');assert.ok(res.headers['set-cookie'].includes('Max-Age=0'));
});
test('partial token responses cannot overwrite a valid stored session',async()=>{
 global.fetch=async()=>({ok:true,json:async()=>({access_token:'incomplete'})});
 await assert.rejects(()=>auth.tokenExchange({grant_type:'refresh_token'}),/invalid_token_response/);
});
