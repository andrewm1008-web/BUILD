(()=>{
  function parseCSV(text){
    const rows=[];let row=[],cur='',q=false;
    for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(q&&text[i+1]==='"'){cur+='"';i++}else q=!q}else if(c===','&&!q){row.push(cur);cur=''}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cur);if(row.some(v=>v.trim()))rows.push(row);row=[];cur=''}else cur+=c}
    row.push(cur);if(row.some(v=>v.trim()))rows.push(row);if(rows.length<2)return[];
    const headers=rows[0].map(h=>h.trim().toLowerCase());
    return rows.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||'').trim()])));
  }
  const pick=(r,names)=>{for(const n of names){if(r[n]!==undefined&&r[n]!=='')return r[n]}return''};
  function normalize(rows){
    const sessions=rows.map((r,i)=>{
      const week=Number(pick(r,['week','wk']));
      const day=pick(r,['day','weekday']);
      const title=pick(r,['title','session','workout','workout name']);
      if(!week||!day||!title)return null;
      let type=(pick(r,['type','session type','workout type'])||'easy').toLowerCase();
      if(/long/.test(type))type='long';else if(/marathon|\bmp\b/.test(type))type='marathon';else if(/threshold|tempo/.test(type))type='threshold';else if(/interval|speed|track/.test(type))type='interval';else if(/strength|gym/.test(type))type='strength';else type='easy';
      const distanceRaw=pick(r,['distance km','distance_km','distance','km']);
      const distanceKm=distanceRaw?Number(String(distanceRaw).replace(/[^0-9.]/g,'')):undefined;
      return {week,day:day.slice(0,3),type,title,target:pick(r,['target','pace','details','description'])||'As prescribed',distanceKm:Number.isFinite(distanceKm)?distanceKm:undefined,objective:pick(r,['objective','purpose','why it matters'])||'Contribute to the marathon build.'};
    }).filter(Boolean);
    if(!sessions.length)throw new Error('No sessions');
    const weeks=Math.max(...sessions.map(s=>s.week));
    return {id:`import-${Date.now()}`,name:'Imported Marathon Build',race:'Marathon',goal:'Race goal',weeks,currentWeek:1,sessions};
  }
  function inject(){
    const btn=document.getElementById('importPlan');
    if(!btn||document.getElementById('importPlanCsv'))return;
    const csv=document.createElement('button');csv.id='importPlanCsv';csv.className='secondary full';csv.textContent='Import plan CSV';
    btn.after(csv);csv.onclick=()=>document.getElementById('planCsvFileInput').click();
  }
  const obs=new MutationObserver(inject);obs.observe(document.documentElement,{childList:true,subtree:true});inject();
  const input=document.getElementById('planCsvFileInput');
  if(input)input.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const plan=normalize(parseCSV(await f.text()));localStorage.setItem('build.plan',JSON.stringify(plan));localStorage.removeItem('build.assessments');alert(`${plan.sessions.length} planned sessions imported.`);location.reload()}catch{alert('Could not read that plan. Use columns such as Week, Day, Type, Title, Target, Distance Km and Objective.')}});
})();
