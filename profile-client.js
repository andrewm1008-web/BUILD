(()=>{
  const PLAN_KEY='build.plan';
  const getPlan=()=>{try{return JSON.parse(localStorage.getItem(PLAN_KEY)||'null')}catch{return null}};
  const savePlan=p=>localStorage.setItem(PLAN_KEY,JSON.stringify(p));
  function iso(d){return d.toISOString().slice(0,10)}
  function derivedStart(raceDate,weeks){const d=new Date(`${raceDate}T12:00:00`);d.setDate(d.getDate()-((Number(weeks)||12)*7-1));return iso(d)}
  function currentWeek(p){if(!p?.startDate)return p?.currentWeek||1;const s=new Date(`${p.startDate}T00:00:00`),t=new Date();t.setHours(0,0,0,0);return Math.max(1,Math.min(Number(p.weeks)||12,Math.floor((t-s)/604800000)+1))}
  function syncWeek(){const p=getPlan();if(!p?.startDate)return;const w=currentWeek(p);if(w!==p.currentWeek){p.currentWeek=w;savePlan(p);location.reload()}}
  function openEditor(){
    const p=getPlan();if(!p)return;
    const sheet=document.createElement('div');sheet.className='sheet';sheet.id='goalEditor';
    sheet.innerHTML=`<div class="panel"><div class="handle"></div><div class="eyebrow">Race goal</div><h2>Edit your build</h2><label class="field">Race<input id="editRace" value="${String(p.race||'').replace(/"/g,'&quot;')}"></label><label class="field">Goal time<input id="editGoal" value="${String(p.goal||'').replace(/"/g,'&quot;')}"></label><label class="field">Race date<input id="editRaceDate" type="date" value="${p.raceDate||''}"></label><button class="primary full" id="saveGoal">Save build</button><button class="text-btn" id="cancelGoal">Cancel</button></div>`;
    document.body.appendChild(sheet);
    document.getElementById('cancelGoal').onclick=()=>sheet.remove();
    document.getElementById('saveGoal').onclick=()=>{const race=document.getElementById('editRace').value.trim(),goal=document.getElementById('editGoal').value.trim(),raceDate=document.getElementById('editRaceDate').value;if(race)p.race=race;if(goal)p.goal=goal;if(raceDate){p.raceDate=raceDate;p.startDate=derivedStart(raceDate,p.weeks);p.currentWeek=currentWeek(p)}savePlan(p);sheet.remove();location.reload()};
  }
  function inject(){
    const reset=document.getElementById('resetData');if(!reset||document.getElementById('editBuildGoal'))return;
    const b=document.createElement('button');b.id='editBuildGoal';b.className='primary full';b.textContent='Edit race & goal';reset.before(b);b.onclick=openEditor;
  }
  const obs=new MutationObserver(inject);obs.observe(document.documentElement,{childList:true,subtree:true});inject();syncWeek();
})();
