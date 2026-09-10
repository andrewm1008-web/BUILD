(()=>{
  const API='/api/strava';let ready=false,connected=false,busy=false;
  async function sync(showMessage=false){
    if(!ready||busy)return false;busy=true;
    try{
      const response=await fetch(`${API}/activities`,{credentials:'include',cache:'no-store'});
      if(response.status===401){connected=false;if(showMessage)notify('Reconnect Strava to sync your runs.');return false}
      const data=await response.json();if(!response.ok||!data.connected)throw Error(data.error==='rate_limited'?'Strava is busy. Try again later.':'Could not sync Strava. Your existing runs are safe.');
      const imported=(data.activities||[]).map(BuildData.activity);
      const old=activities,oldProfile=profile,byId=new Map(activities.map(a=>[a.id,a]));let added=0;
      imported.forEach(a=>{if(!byId.has(a.id)){byId.set(a.id,a);added++}});
      activities=[...byId.values()];profile={...profile,source:'strava-api',name:profile.name==='Runner'&&data.athlete?.firstname?data.athlete.firstname:profile.name};
      try{save()}catch(error){activities=old;profile=oldProfile;throw error}
      connected=true;
      // Do not discard an in-progress session review or import dialog during a background sync.
      if(!document.querySelector('.sheet'))render();
      if(showMessage)notify(`${added} new runs synced${data.truncated?' · Older runs can be added by CSV':''}.`);
      return true;
    }catch(error){if(showMessage)notify(error.message);return false}
    finally{busy=false;document.getElementById('liveStravaControl')?.remove();addControls()}
  }
  function addControls(){
    if(!ready)return;
    const eyebrow=document.querySelector('.page-head .eyebrow');if(eyebrow?.textContent.trim()!=='Activity inbox')return;
    const main=eyebrow.closest('main');if(main.querySelector('#liveStravaControl'))return;
    const box=document.createElement('section');box.id='liveStravaControl';box.className='card live-strava';
    box.innerHTML=connected?'<div><span class="eyebrow">Strava connected</span><p>Your newest runs, ready to review.</p><button class="text-btn" id="disconnectStrava">Disconnect</button></div><button id="syncStrava" class="primary">Sync now</button>':'<div><span class="eyebrow">Live Strava</span><p>Connect to bring in your completed runs.</p></div><button id="connectStrava" class="primary">Connect Strava</button>';
    main.querySelector('.action-grid').after(box);
    const connect=document.getElementById('connectStrava');if(connect)connect.onclick=()=>location.assign(`${API}/connect`);
    const button=document.getElementById('syncStrava');if(button){button.disabled=busy;button.textContent=busy?'Syncing…':'Sync now';button.onclick=()=>sync(true)}
    const disconnect=document.getElementById('disconnectStrava');if(disconnect)disconnect.onclick=async()=>{
      try{const response=await fetch(`${API}/disconnect`,{method:'POST',credentials:'include'});if(!response.ok)throw Error();connected=false;box.remove();addControls();notify('Disconnected. Your imported runs remain in BUILD.')}catch{notify('Could not disconnect. Try again.')}
    };
  }
  const observer=new MutationObserver(addControls);observer.observe(document.documentElement,{childList:true,subtree:true});
  async function initialise(){
    if(location.hostname.endsWith('github.io')||location.protocol==='file:')return;
    try{const response=await fetch('/api/health',{cache:'no-store'});if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))return;const health=await response.json();ready=health.app==='BUILD'&&health.stravaConfigured===true;if(!ready)return;addControls();await sync(false)}catch{}
    const params=new URLSearchParams(location.search);if(params.has('strava')){if(params.get('strava')==='denied')notify('Strava connection cancelled. You can still import a CSV.');params.delete('strava');history.replaceState({},'',location.pathname+(params.size?`?${params}`:'')+location.hash)}
  }
  initialise();
})();
