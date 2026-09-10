(()=>{
  const API='/api/strava';
  const isApiHost=()=>!location.hostname.endsWith('github.io');
  async function sync(showMessage=false){
    if(!isApiHost())return false;
    try{
      const r=await fetch(`${API}/activities`,{credentials:'include'});
      if(r.status===401){setConnected(false);return false}
      if(!r.ok)return false;
      const data=await r.json();
      if(!data.connected)return false;
      const current=JSON.parse(localStorage.getItem('build.activities')||'[]');
      const map=new Map(current.map(a=>[String(a.id),a]));
      (data.activities||[]).forEach(a=>map.set(String(a.id),a));
      localStorage.setItem('build.activities',JSON.stringify([...map.values()]));
      const p=JSON.parse(localStorage.getItem('build.profile')||'{}');
      p.source='strava-api';
      if(data.athlete?.firstname&&!p.name)p.name=data.athlete.firstname;
      localStorage.setItem('build.profile',JSON.stringify(p));
      setConnected(true);
      if(showMessage)alert(`${(data.activities||[]).length} Strava runs synced.`);
      return true;
    }catch{return false}
  }
  function setConnected(v){localStorage.setItem('build.strava.connected',v?'1':'0')}
  function connected(){return localStorage.getItem('build.strava.connected')==='1'}
  function addControls(){
    if(!isApiHost())return;
    const eyebrow=document.querySelector('.page-head .eyebrow');
    if(!eyebrow||eyebrow.textContent.trim()!=='Activity inbox')return;
    const main=eyebrow.closest('main');
    if(!main||main.querySelector('#liveStravaControl'))return;
    const box=document.createElement('section');box.id='liveStravaControl';box.className='card live-strava';
    box.innerHTML=connected()?`<div><span class="eyebrow">Strava connected</span><p>Pull your latest runs directly into BUILD.</p></div><button id="syncStrava" class="primary">Sync now</button>`:`<div><span class="eyebrow">Live Strava</span><p>Connect once, then BUILD can pull completed runs automatically.</p></div><button id="connectStrava" class="primary">Connect Strava</button>`;
    const action=main.querySelector('.action-grid');if(action)action.after(box);else main.prepend(box);
    const connect=document.getElementById('connectStrava');if(connect)connect.onclick=()=>location.href=`${API}/connect`;
    const syncBtn=document.getElementById('syncStrava');if(syncBtn)syncBtn.onclick=async()=>{syncBtn.disabled=true;syncBtn.textContent='Syncing…';const ok=await sync(true);if(ok)location.reload();else{syncBtn.disabled=false;syncBtn.textContent='Try again'}};
  }
  const observer=new MutationObserver(addControls);observer.observe(document.documentElement,{subtree:true,childList:true});addControls();
  const params=new URLSearchParams(location.search);
  if(params.get('strava')==='connected'){setConnected(true);sync(false).finally(()=>{history.replaceState({},'',location.pathname);location.reload()})}
  else if(isApiHost())sync(false);
})();
