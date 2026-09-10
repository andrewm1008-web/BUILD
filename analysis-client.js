(()=>{
  const pace=secPerKm=>{if(!Number.isFinite(secPerKm)||secPerKm<=0)return'—';const total=Math.round(secPerKm),m=Math.floor(total/60),s=total%60;return `${m}:${String(s).padStart(2,'0')}/km`};
  function inject(){
    const block=document.querySelector('.panel .actual-block');
    if(!block||document.querySelector('.panel .planned-actual'))return;
    if(typeof state==='undefined'||!state.selected)return;
    const a=assessed(state.selected);if(!a?.activityId)return;
    const act=activities.find(x=>x.id===a.activityId);if(!act)return;
    const planned=Number(state.selected.distanceKm)||null,actual=Number(act.distanceKm)||null;
    const diff=planned&&actual?Math.round((actual-planned)/planned*100):null;
    const avg=actual&&act.movingSeconds?pace(act.movingSeconds/actual):'—';
    const div=document.createElement('div');div.className='planned-actual';
    div.innerHTML=`<div><span>Planned</span><b>${planned?`${planned.toFixed(1)} km`:'—'}</b></div><div><span>Actual</span><b>${actual?`${actual.toFixed(1)} km`:'—'}</b></div><div><span>Distance</span><b>${diff==null?'—':`${diff>0?'+':''}${diff}%`}</b></div><div><span>Avg pace</span><b>${avg}</b></div>`;
    block.after(div);
  }
  const o=new MutationObserver(inject);o.observe(document.documentElement,{childList:true,subtree:true});inject();
})();
