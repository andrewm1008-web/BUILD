(()=>{
 const API='/api/strava';let checked=false,healthFailed=false,ready=false,connected=false,busy=false,lastSync=Number(localStorage.getItem('build.lastSync')||0),failed=false;
 async function sync(showMessage=false){
  if(!ready||busy)return false;busy=true;controls(true);
  try{
   const response=await fetch(`${API}/activities`,{credentials:'include',cache:'no-store'});
   if(response.status===401){connected=false;failed=false;if(showMessage)notify('Connect Strava to sync your runs.');return false}
   const data=await response.json();
   if(!response.ok||!data.connected)throw Error(data.error==='rate_limited'?'Strava is busy. Your existing training is safe; try again later.':'Sync could not finish. Your existing runs and reviews are safe.');
   const imported=(data.activities||[]).map(BuildData.activity),old=activities,oldProfile=profile,byId=new Map(activities.map(a=>[a.id,a]));let added=0,updated=0;
   imported.forEach(a=>{const previous=byId.get(a.id);if(!previous){byId.set(a.id,a);added++}else if(previous.source==='strava-api'){if(JSON.stringify(previous)!==JSON.stringify(a))updated++;byId.set(a.id,a)}});
   activities=[...byId.values()];profile={...profile,source:'strava-api',name:profile.name==='Runner'&&data.athlete?.firstname?data.athlete.firstname:profile.name};
   try{save()}catch(error){activities=old;profile=oldProfile;throw error}
   connected=true;failed=false;lastSync=Date.now();try{localStorage.setItem('build.lastSync',String(lastSync))}catch{}
   if(!document.querySelector('.sheet'))render();
   if(showMessage)notify(`${added?added+' new run'+(added===1?'':'s')+' synced':updated?updated+' run'+(updated===1?'':'s')+' updated':'Runs are up to date'} · ${automaticMatches().size} automatically matched. ${data.truncated?'Some older runs are outside this sync window.':''}`);
   return true;
  }catch(error){failed=true;if(showMessage)notify(error.message);return false}
  finally{busy=false;controls(true)}
 }
 function controls(replace=false){
  const mount=document.getElementById('stravaConnection');if(!mount)return;
  if(mount.querySelector('#liveStravaControl')&&!replace)return;
  let markup='';
  if(!checked)markup='<div><span class="eyebrow">Strava</span><p>Checking your connection…</p></div>';
  else if(healthFailed)markup='<div><span class="eyebrow">Connection check unavailable</span><p>Could not check Strava. Saved training is unchanged.</p></div><button class="secondary" id="retryConnection">Try again</button>';
  else if(!ready)markup='<div><span class="eyebrow">Strava setup needed</span><p>Strava is not configured for this address.</p></div><button class="secondary" id="retryConnection">Recheck setup</button>';
  else if(connected)markup=`<div><span class="strava-status"><i class="status-dot"></i>${failed?'Sync paused':'Strava connected'}</span><p>${busy?'Syncing your runs…':failed?'Could not sync. Your saved training is safe.':'Syncs on open and when you return.'}${lastSync&&!busy&&!failed?' Last synced '+new Date(lastSync).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})+'.':''}</p>${state.screen==='settings'?'<button class="text-btn" id="disconnectStrava">Disconnect Strava</button>':''}</div><button id="syncStrava" class="secondary" ${busy?'disabled':''}>${busy?'Syncing…':'Sync now'}</button>`;
  else markup='<div><span class="eyebrow">Connect Strava</span><p>Bring in runs automatically. BUILD links clear matches to your plan.</p></div><a id="connectStrava" class="primary" href="/api/strava/connect">Connect Strava</a>';
  const box=document.createElement('section');box.id='liveStravaControl';box.className='card live-strava';box.setAttribute('aria-busy',String(!checked||busy));box.innerHTML=markup;mount.replaceChildren(box);
  document.getElementById('retryConnection')?.addEventListener('click',initialise);
  document.getElementById('syncStrava')?.addEventListener('click',()=>sync(true));
  document.getElementById('disconnectStrava')?.addEventListener('click',async()=>{try{const r=await fetch(`${API}/disconnect`,{method:'POST',credentials:'include'});if(!r.ok)throw Error();connected=false;controls(true);notify('Strava disconnected. Your imported runs and reviews remain saved.')}catch{notify('Could not disconnect. Try again.')}});
 }
 new MutationObserver(()=>controls()).observe(document.documentElement,{childList:true,subtree:true});
 async function initialise(){
  checked=false;healthFailed=false;controls(true);
  try{const r=await fetch('/api/health',{cache:'no-store'});if(!r.ok||!r.headers.get('content-type')?.includes('application/json'))throw Error('Connection check failed');const h=await r.json();if(h.app!=='BUILD')throw Error('Unexpected response');ready=h.stravaConfigured===true}catch{healthFailed=true;ready=false}
  checked=true;controls(true);if(ready)await sync(false);
  const params=new URLSearchParams(location.search);if(params.has('strava')){if(params.get('strava')==='denied')notify('Strava connection cancelled. Your build is unchanged.');params.delete('strava');history.replaceState({},'',location.pathname+(params.size?`?${params}`:'')+location.hash)}
 }
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&ready&&connected&&Date.now()-lastSync>300000)sync(false)});
 window.addEventListener('online',()=>{if(connected)sync(false)});initialise();
})();
