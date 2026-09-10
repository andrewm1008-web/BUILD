const CACHE='build-v0.5.0';
const ASSETS=['./','./index.html','./styles.css','./extras.css','./calendar.js','./data.js','./workflow-client.js','./icon.svg','./icon-192.png','./icon-512.png','./sample-plan.csv','./app.js','./migration-client.js','./engine-v2.js','./profile-client.js','./plan-import-client.js','./insights-client.js','./strava-client.js','./manifest.webmanifest'];
const ASSET_URLS=new Set(ASSETS.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('build-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  // Never cache activity/API responses, authentication requests or third-party resources.
  if(event.request.method!=='GET'||!ASSET_URLS.has(event.request.url))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try {
      const response=await fetch(event.request);
      if(response.ok&&!response.redirected)await cache.put(event.request,response.clone());
      return response;
    } catch {
      const hit=await cache.match(event.request);
      if(hit)return hit;
      if(event.request.mode==='navigate')return await cache.match('./index.html')||Response.error();
      return Response.error();
    }
  })());
});
