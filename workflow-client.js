function beginMatch(key){
  const session=plan.sessions.find(s=>skey(s)===key);
  if(!session||!state.activity){notify('Choose a session first.');return}
  state.pendingActivityId=state.activity.id;state.reviewRate=null;state.selected=session;state.activity=null;render();
}
function saveReview(){
  const session=state.selected,key=skey(session),old=assessments[key];
  const choice=state.reviewRate||Object.keys(SCORES).find(k=>SCORES[k]===old?.score);
  if(!choice){notify('Choose how well the session delivered its objective.');return}
  try{
    const score=SCORES[choice],distance=document.getElementById('reviewDistance').value,time=document.getElementById('reviewTime').value,rpe=document.getElementById('reviewRpe').value;
    const actualDistanceKm=distance===''?undefined:Number(distance);
    if(actualDistanceKm!=null&&(!Number.isFinite(actualDistanceKm)||actualDistanceKm<0||actualDistanceKm>300))throw Error('Actual distance must be between 0 and 300 km.');
    if(rpe!==''&&(!Number.isInteger(Number(rpe))||Number(rpe)<1||Number(rpe)>10))throw Error('Choose an effort from 1 to 10.');
    const activityId=state.pendingActivityId||old?.activityId;
    if(score===15&&activityId)throw Error('A matched run cannot be marked missed. Choose Modified, or cancel and remove the existing assessment first.');
    const before=metrics();
    const next={score,label:SCORE_LABEL[score],at:new Date().toISOString(),notes:document.getElementById('reviewNotes').value.trim(),...(activityId?{activityId}:{}),...(actualDistanceKm!=null?{actualDistanceKm:score===15?0:actualDistanceKm}:{}),...(time?{movingSeconds:BuildData.seconds(time)}:{}),...(rpe?{rpe:Number(rpe)}:{})};
    assessments[key]=next;
    try{save()}catch(error){old?assessments[key]=old:delete assessments[key];throw error}
    const after=metrics(),delta=after.progress-before.progress;
    closeSheet();notify(`Review saved · BUILD Progress ${after.progress}% (${delta>0?'+':''}${delta} points) · Forecast ${after.forecast==null?'building signal':`${after.forecast}%`}.`);
  }catch(error){notify(error.message)}
}
function downloadJSON(name,data){
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function openWorkflow(title,content){
  document.getElementById('workflowSheet')?.remove();
  const sheet=document.createElement('div');sheet.id='workflowSheet';sheet.className='sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label',title);
  sheet.innerHTML=`<div class="panel"><div class="handle"></div><h2>${escapeHTML(title)}</h2>${content}<button class="text-btn" id="cancelWorkflow">Cancel</button></div>`;
  document.body.appendChild(sheet);document.getElementById('cancelWorkflow').onclick=()=>sheet.remove();sheet.querySelector('input,button,select')?.focus();return sheet;
}
function previewPlan(candidate){
  const setup=!profile.onboarded?(state.setup||profile.setupDraft):null;
  const race=setup?.race||(candidate.race==='Marathon'?(plan.id==='london-239'?'':plan.race):candidate.race);
  const goal=setup?.goal??(candidate.goal==='Your race goal'?(plan.id==='london-239'?'':plan.goal):candidate.goal);
  const raceDate=setup?.raceDate||candidate.raceDate||plan.raceDate||'';
  const sheet=openWorkflow('Review your plan',`<p>${candidate.sessions.length} sessions. Check your dates before saving.</p><label class="field">Plan name<input id="importName" value="${escapeHTML(candidate.name)}"></label><label class="field">Marathon<input id="importRace" value="${escapeHTML(race)}"></label><label class="field">Goal time (optional)<input id="importGoal" placeholder="e.g. 3:30:00" value="${escapeHTML(goal==='No time goal'?'':goal)}"></label><label class="field">Marathon date<input id="importRaceDate" type="date" value="${escapeHTML(raceDate)}"></label><label class="field">Plan length (weeks)<input id="importWeeks" type="number" min="${Math.max(...candidate.sessions.map(s=>s.week))}" max="52" step="1" value="${candidate.weeks}"></label><label class="field">Plan start date<input id="importStart" type="date" value="${candidate.startDate||''}" ${raceDate?'readonly':''}></label><label class="schedule-override"><input id="manualPlanStart" type="checkbox" ${raceDate?'':'checked'}> Choose a different start date</label><p class="muted-copy" id="importSchedule" aria-live="polite"></p><section class="card" id="importWeekPreview"></section><p class="muted-copy">Saving replaces your plan and clears its reviews. Your runs stay available. Download a backup first to keep the current build.</p><button class="primary full" id="confirmPlan">Use this plan</button>`);
  function refresh(){
    const weeks=Number(document.getElementById('importWeeks').value),date=document.getElementById('importRaceDate').value,manual=document.getElementById('manualPlanStart').checked;
    const start=document.getElementById('importStart');start.readOnly=!!date&&!manual;
    try{
      if(date&&!manual){start.value=BuildSetup.schedule(date,weeks).startDate;}
      document.getElementById('importSchedule').textContent=date&&!manual?`A ${weeks}-week build starts on ${start.value} and ends on race day, ${date}.`:date?'Using your chosen start date. Check that your final training week fits race day.':'Choose a race date to calculate the start automatically.';
      if(!Number.isInteger(weeks)||weeks<1||weeks>52)throw Error('Choose 1–52 whole weeks.');
      document.getElementById('importWeekPreview').innerHTML=Array.from({length:weeks},(_,i)=>{const sessions=candidate.sessions.filter(s=>s.week===i+1),km=sessions.filter(s=>!['strength','cross'].includes(s.type)).reduce((n,s)=>n+(s.distanceKm||0),0);return `<details><summary>Week ${i+1} · ${sessions.length} sessions · ${km.toFixed(1)} km</summary>${sessions.map(s=>`<p>${escapeHTML(s.day)} · ${escapeHTML(s.title)}<br><small>${escapeHTML(s.target||'No target supplied')}</small></p>`).join('')||'<p>No sessions supplied.</p>'}</details>`}).join('');
    }catch(error){document.getElementById('importSchedule').textContent=error.message;}
  }
  for(const id of ['importWeeks','importRaceDate','manualPlanStart'])document.getElementById(id).onchange=refresh;refresh();
  document.getElementById('confirmPlan').onclick=()=>{
    try{
      const dates=document.getElementById('importRaceDate').value&&!document.getElementById('manualPlanStart').checked?BuildSetup.schedule(document.getElementById('importRaceDate').value,document.getElementById('importWeeks').value):{weeks:Number(document.getElementById('importWeeks').value),raceDate:document.getElementById('importRaceDate').value,startDate:document.getElementById('importStart').value};
      const next=BuildData.plan({...candidate,...dates,name:document.getElementById('importName').value,race:document.getElementById('importRace').value,goal:document.getElementById('importGoal').value.trim()||'No time goal'});
      const previous={plan,assessments,profile};plan=next;assessments={};profile={...profile,onboarded:true};delete profile.setupDraft;
      try{save()}catch(error){({plan,assessments,profile}=previous);throw error}
      state.setup=null;state.builderDraft=null;state.week=BuildCalendar.currentWeek(plan);state.screen='plan';state.selected=null;state.activity=null;sheet.remove();render();notify('Your plan is ready.');
    }catch(error){notify(error.message)}
  };
}
function choosePlan(){
  const sheet=openWorkflow('Import your plan','<p>Use a CSV with Week, Day and Title columns, or a BUILD plan JSON. Optional columns: Type, Target, Distance Km and Objective. Use Mon–Sun for days and kilometres for distance. Keep interval or fast-finish instructions in Target.</p><a class="download-link" href="sample-plan.csv" download>Download CSV template</a><button class="primary full" id="choosePlanCsv">Choose CSV</button><button class="secondary full" id="choosePlanJson">Choose JSON</button>');
  document.getElementById('choosePlanCsv').onclick=()=>{sheet.remove();document.getElementById('planCsvFileInput').click()};
  document.getElementById('choosePlanJson').onclick=()=>{sheet.remove();document.getElementById('planFileInput').click()};
}
function previewActivities(source){
  const sheet=openWorkflow('Import activities','<p>Select the distance unit used in your CSV. A Strava export can use your account’s preferred unit.</p><label class="field">Distance unit<select id="distanceUnit"><option value="km">Kilometres</option><option value="miles">Miles</option><option value="m">Metres</option></select></label><div id="activityPreview" class="card"></div><button class="primary full" id="confirmActivities">Import runs</button>');
  let parsed;
  const refresh=()=>{try{parsed=BuildData.activitiesCSV(source,document.getElementById('distanceUnit').value);document.getElementById('activityPreview').innerHTML=`<b>${parsed.activities.length} runs</b><p>${parsed.skipped} non-running activities skipped.</p>${parsed.activities.slice(0,3).map(a=>`<p>${escapeHTML(a.date)} · ${escapeHTML(a.name)} · ${a.distanceKm.toFixed(2)} km</p>`).join('')}`;document.getElementById('confirmActivities').disabled=false}catch(error){parsed=null;document.getElementById('activityPreview').textContent=error.message;document.getElementById('confirmActivities').disabled=true}};
  document.getElementById('distanceUnit').onchange=refresh;refresh();
  document.getElementById('confirmActivities').onclick=()=>{
    if(!parsed)return;const old=activities,oldProfile=profile;
    const byId=new Map(activities.map(a=>[a.id,a]));let added=0;
    // Keep existing imports and assessments stable when the same export is imported twice.
    parsed.activities.forEach(a=>{if(!byId.has(a.id)){byId.set(a.id,a);added++}});
    activities=[...byId.values()];profile={...profile,source:'strava-csv'};
    try{save();sheet.remove();state.screen='inbox';render();notify(`${added} runs added; ${parsed.activities.length-added} already imported.`)}catch(error){activities=old;profile=oldProfile;notify(error.message)}
  };
}
function manualActivity(){
  const local=new Date(),day=`${local.getFullYear()}-${String(local.getMonth()+1).padStart(2,'0')}-${String(local.getDate()).padStart(2,'0')}`;
  const sheet=openWorkflow('Add a completed run',`<label class="field">Name<input id="runName" value="Run" maxlength="240"></label><label class="field">Date<input id="runDate" type="date" value="${day}"></label><label class="field">Distance (km)<input id="runDistance" type="number" min="0.01" max="300" step="0.01" placeholder="10.00"></label><label class="field">Moving time (h:mm:ss or m:ss)<input id="runTime" placeholder="45:00"></label><button class="primary full" id="saveRun">Add run</button>`);
  document.getElementById('saveRun').onclick=()=>{try{
    const distance=document.getElementById('runDistance').value;if(!distance||Number(distance)<=0)throw Error('Enter the distance you ran.');
    const a=BuildData.activity({id:`manual-${crypto.randomUUID()}`,name:document.getElementById('runName').value,date:document.getElementById('runDate').value,distanceKm:distance,movingSeconds:BuildData.seconds(document.getElementById('runTime').value),source:'manual'});
    activities.push(a);try{save()}catch(error){activities.pop();throw error}
    sheet.remove();state.screen='inbox';state.activity=a;render();notify('Run added. Choose its planned session or keep it unmatched.');
  }catch(error){notify(error.message)}};
}
function bindWorkflows(){
  const bind=(id,fn)=>{const e=document.getElementById(id);if(e)e.onclick=fn};
  bind('manualActivity',manualActivity);bind('onboardImport',choosePlan);bind('importPlan',choosePlan);
  bind('onboardCreate',()=>openPlanBuilder());
  bind('onboardGenerate',()=>openPlanGenerator());
  bind('onboardExample',()=>previewPlan({...structuredClone(defaultPlan),...(state.setup||profile.setupDraft||{})}));
  const ip=document.getElementById('importPlan');if(ip)ip.textContent='Import a plan';
  if(ip&&!document.getElementById('generatePlan')){const b=document.createElement('button');b.id='generatePlan';b.className='primary full';b.textContent='Make a plan for me';b.onclick=()=>openPlanGenerator();ip.after(b);}
  if(ip&&!document.getElementById('createPlan')){const b=document.createElement('button');b.id='createPlan';b.className='secondary full';b.textContent='Enter my own sessions';b.onclick=()=>openPlanBuilder();document.getElementById('generatePlan').after(b);}
  bind('exportBackup',()=>downloadJSON(`BUILD-backup-${new Date().toISOString().slice(0,10)}.json`,{format:'BUILD_BACKUP',version:1,exportedAt:new Date().toISOString(),plan,assessments,activities,profile}));
  bind('restoreBackup',()=>document.getElementById('backupFileInput').click());
}
document.getElementById('activityFileInput').addEventListener('change',async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>10000000)throw Error('Choose an activity CSV under 10 MB.');previewActivities(await file.text())}catch(error){notify(error.message)}});
document.getElementById('backupFileInput').addEventListener('change',async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;
  try{
    if(file.size>10000000)throw Error('Choose a backup under 10 MB.');
    const restored=BuildData.backup(JSON.parse(await file.text()));
    const sheet=openWorkflow('Restore your build',`<p>${escapeHTML(restored.plan.name)} · ${restored.plan.sessions.length} planned sessions · ${restored.activities.length} runs · ${Object.keys(restored.assessments).length} reviews.</p><p>This replaces this browser’s current build. Download a backup of the current build first if you want to keep it.</p><button class="primary full" id="confirmRestore">Restore this backup</button>`);
    document.getElementById('confirmRestore').onclick=()=>{const old={plan,activities,assessments,profile};({plan,activities,assessments,profile}=restored);try{save();sheet.remove();state.week=BuildCalendar.currentWeek(plan);state.screen='today';state.selected=null;state.activity=null;render();notify('Build restored.')}catch(error){({plan,activities,assessments,profile}=old);notify(error.message)}};
  }catch(error){notify(error.message||'Could not read that backup.')}
});
document.addEventListener('keydown',e=>{
  const sheet=document.querySelector('.sheet');if(!sheet)return;
  if(e.key==='Escape'){sheet.id==='workflowSheet'||sheet.id==='goalEditor'?sheet.remove():closeSheet();return}
  if(e.key==='Tab'){
    const els=[...sheet.querySelectorAll('button,input,select,textarea,a[href],summary')].filter(el=>!el.disabled&&el.getClientRects().length);
    const first=els[0],last=els.at(-1);if(!first)return;
    if(e.shiftKey&&(document.activeElement===first||!sheet.contains(document.activeElement))){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&(document.activeElement===last||!sheet.contains(document.activeElement))){e.preventDefault();first.focus()}
  }
});
bindWorkflows();

// Matching happens automatically; a review still records the runner’s assessment.
function openQuickMatch(run,session){
  const sheet=openWorkflow('Review synced run',`<p><b>${escapeHTML(run.name)}</b> · ${escapeHTML(run.date)}</p><div class="actual-block"><strong>${run.distanceKm.toFixed(1)} km</strong><span>${formatPace(run.movingSeconds,run.distanceKm)}</span></div><p>Matched to <b>${escapeHTML(session.day)} · ${escapeHTML(session.title)}</b></p><p class="match-context">Week ${session.week}${estimatedSessionDate(session)?` · Planned ${estimatedSessionDate(session)}`:''}${estimatedSessionDate(session)!==run.date?' · Run completed on a different day':''}</p><p class="muted-copy">${escapeHTML(session.target)}</p><label class="field">How did it go?<select id="quickOutcome"><option value="nailed">Completed as planned</option><option value="mostly">Mostly completed</option><option value="modified">Modified</option></select></label><button class="primary full" id="confirmQuickMatch">Save review</button><button class="secondary full" id="changeQuickMatch">Choose another session</button>`);
  document.getElementById('changeQuickMatch').onclick=()=>{sheet.remove();state.selected=null;state.activity=run;state.pendingActivityId=null;state.reviewRate=null;render()};
  document.getElementById('confirmQuickMatch').onclick=()=>{
    const key=skey(session);
    if(assessments[key]||Object.values(assessments).some(a=>a.activityId===run.id)){sheet.remove();notify('Already reviewed. Open Activity to see the saved session.');return;}
    const score=SCORES[document.getElementById('quickOutcome').value];
    assessments[key]={score,label:SCORE_LABEL[score],at:new Date().toISOString(),activityId:run.id,actualDistanceKm:run.distanceKm,movingSeconds:run.movingSeconds,notes:''};
    try{save()}catch(error){delete assessments[key];notify(error.message);return;}
    sheet.remove();state.selected=null;state.activity=null;state.pendingActivityId=null;state.reviewRate=null;render();notify('Run matched and review saved. Progress updated.');
  };
}
