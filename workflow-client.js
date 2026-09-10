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
  const sheet=openWorkflow('Review your plan',`<p>${candidate.sessions.length} sessions across ${candidate.weeks} weeks.</p><label class="field">Plan name<input id="importName" value="${escapeHTML(candidate.name)}"></label><label class="field">Race<input id="importRace" value="${escapeHTML(candidate.race==='Marathon'?plan.race:candidate.race)}"></label><label class="field">Goal time<input id="importGoal" value="${escapeHTML(candidate.goal==='Your race goal'?plan.goal:candidate.goal)}"></label><label class="field">Plan start date<input id="importStart" type="date" value="${candidate.startDate||''}"></label><p class="muted-copy">Weeks run from your chosen start date. Leave it blank to advance the current week manually in Settings.</p><section class="card">${candidate.sessions.slice(0,3).map(s=>`<p>W${s.week} ${escapeHTML(s.day)} · ${escapeHTML(s.title)}</p>`).join('')}</section><p class="muted-copy">Replacing your plan clears its session assessments. Your imported runs stay available to match again. Download a backup first if you want to keep the existing build.</p><button class="primary full" id="confirmPlan">Use this plan</button>`);
  document.getElementById('confirmPlan').onclick=()=>{
    try{
      const next=BuildData.plan({...candidate,name:document.getElementById('importName').value,race:document.getElementById('importRace').value,goal:document.getElementById('importGoal').value,startDate:document.getElementById('importStart').value});
      const previous={plan,assessments,profile};plan=next;assessments={};profile={...profile,onboarded:true};
      try{save()}catch(error){({plan,assessments,profile}=previous);throw error}
      state.week=BuildCalendar.currentWeek(plan);state.screen='plan';state.selected=null;state.activity=null;sheet.remove();render();notify(`${plan.sessions.length} sessions imported. Your build is ready.`);
    }catch(error){notify(error.message)}
  };
}
function choosePlan(){
  const sheet=openWorkflow('Import your plan','<p>Use a CSV with Week, Day, Type and Title columns, or a BUILD plan JSON.</p><a class="download-link" href="sample-plan.csv" download>Download CSV template</a><button class="primary full" id="choosePlanCsv">Choose CSV</button><button class="secondary full" id="choosePlanJson">Choose JSON</button>');
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
  const ip=document.getElementById('importPlan');if(ip)ip.textContent='Import a plan';
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
