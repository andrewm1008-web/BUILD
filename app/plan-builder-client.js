// Enter an existing personal training prescription; no workouts are generated.
function openPlanBuilder(){
  const setup=state.setup||profile.setupDraft||{race:plan.id==='london-239'?'':plan.race,goal:plan.id==='london-239'||plan.goal==='No time goal'?'':plan.goal,raceDate:plan.raceDate||''};
  const draft=state.builderDraft||{name:'My marathon plan',race:setup.race,goal:setup.goal,raceDate:setup.raceDate,weeks:16,sessions:[],week:1};
  state.builderDraft=draft;
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const types=['easy','recovery','long','interval','threshold','marathon','strength','cross'];
  let sheet;
  function capture(){
    for(const [key,id]of Object.entries({name:'builderName',race:'builderRace',goal:'builderGoal',raceDate:'builderRaceDate'}))draft[key]=document.getElementById(id).value;
    for(const row of sheet.querySelectorAll('[data-builder-row]')){
      const session=draft.sessions[Number(row.dataset.builderRow)];
      for(const field of row.querySelectorAll('[data-builder-field]'))session[field.dataset.builderField]=field.value;
      if(session.distanceKm==='')delete session.distanceKm;
    }
  }
  function updateSchedule(){
    try{document.getElementById('builderSchedule').textContent=`Starts ${BuildSetup.schedule(draft.raceDate,draft.weeks).startDate} · race day ${draft.raceDate}`;}
    catch{document.getElementById('builderSchedule').textContent='Choose a marathon date to calculate the start.';}
  }
  function draw(){
    const sessions=draft.sessions.map((session,index)=>({session,index})).filter(x=>x.session.week===draft.week);
    sheet=openWorkflow('Create your plan',`<p>Enter the sessions you want to follow. Days without a session are rest days.</p><details class="builder-settings" ${draft.raceDate?'':'open'}><summary>Race & plan details</summary><label class="field">Plan name<input id="builderName" maxlength="200" value="${escapeHTML(draft.name)}"></label><label class="field">Marathon<input id="builderRace" maxlength="200" value="${escapeHTML(draft.race)}" placeholder="e.g. London Marathon"></label><label class="field">Goal time (optional)<input id="builderGoal" value="${escapeHTML(draft.goal)}" placeholder="e.g. 3:30:00"></label><label class="field">Marathon date<input id="builderRaceDate" type="date" value="${escapeHTML(draft.raceDate)}"></label><label class="field">Plan length (weeks)<input id="builderWeeks" type="number" min="1" max="52" step="1" value="${draft.weeks}"></label></details><p id="builderSchedule" class="muted-copy" aria-live="polite"></p><label class="field">Editing week<select id="builderWeek">${Array.from({length:draft.weeks},(_,i)=>`<option value="${i+1}" ${draft.week===i+1?'selected':''}>Week ${i+1}</option>`).join('')}</select></label><div class="builder-sessions">${sessions.map(({session,index})=>`<section class="builder-session" data-builder-row="${index}"><div class="builder-row-head"><span>Session ${index+1}</span><button class="text-btn" data-remove-session="${index}" aria-label="Remove session ${index+1}">Remove</button></div><div class="builder-two"><label class="field">Day<select data-builder-field="day">${days.map(day=>`<option ${session.day===day?'selected':''}>${day}</option>`).join('')}</select></label><label class="field">Type<select data-builder-field="type">${types.map(type=>`<option value="${type}" ${session.type===type?'selected':''}>${typeName(type)}</option>`).join('')}</select></label></div><label class="field">Session title<input data-builder-field="title" maxlength="240" value="${escapeHTML(session.title)}" placeholder="e.g. Easy 10 km"></label><label class="field">Distance (km, optional)<input data-builder-field="distanceKm" type="number" min="0" max="300" step="0.1" value="${session.distanceKm??''}"></label><label class="field">Target / instructions<input data-builder-field="target" maxlength="1000" value="${escapeHTML(session.target||'')}" placeholder="e.g. Easy effort, or 6 × 1 km / 90s jog"></label><details><summary>Add session purpose (optional)</summary><label class="field">Purpose<input data-builder-field="objective" maxlength="1000" value="${escapeHTML(session.objective||'')}" placeholder="What should this session achieve?"></label></details></section>`).join('')||'<p class="empty">No sessions in this week yet.</p>'}</div><button class="secondary full" id="builderAdd">+ Add session</button><details class="builder-copy"><summary>Reuse this week</summary><label class="field">Copy to an empty week<select id="builderCopyWeek">${Array.from({length:draft.weeks},(_,i)=>i+1).filter(w=>w!==draft.week).map(w=>`<option value="${w}" ${draft.sessions.some(s=>s.week===w)?'disabled':''}>Week ${w}${draft.sessions.some(s=>s.week===w)?' · already planned':''}</option>`).join('')}</select></label><button class="secondary full" id="builderCopy">Copy sessions</button></details><p class="muted-copy">${draft.sessions.length} sessions entered across ${draft.weeks} weeks. Review the full plan before using it.</p><button class="primary full" id="builderPreview">Review my plan</button>`);
    updateSchedule();
    sheet.querySelectorAll('input,[data-builder-field]').forEach(field=>field.addEventListener('input',()=>{capture();updateSchedule();}));
    document.getElementById('builderWeeks').onchange=e=>{
      capture();const weeks=Number(e.target.value),latest=Math.max(1,...draft.sessions.map(s=>s.week));
      if(!Number.isInteger(weeks)||weeks<latest||weeks>52){e.target.value=draft.weeks;notify(`Choose ${latest}–52 whole weeks. Existing sessions will not be removed.`);return;}
      draft.weeks=weeks;draft.week=Math.min(draft.week,weeks);draw();
    };
    document.getElementById('builderWeek').onchange=e=>{capture();draft.week=Number(e.target.value);draw();};
    document.getElementById('builderAdd').onclick=()=>{capture();draft.sessions.push({week:draft.week,day:'Mon',type:'easy',title:'',target:'',objective:''});draw();};
    sheet.querySelectorAll('[data-remove-session]').forEach(b=>b.onclick=()=>{capture();draft.sessions.splice(Number(b.dataset.removeSession),1);draw();});
    document.getElementById('builderCopy').onclick=()=>{capture();try{draft.sessions=BuildSetup.duplicateWeek(draft.sessions,draft.week,Number(document.getElementById('builderCopyWeek').value));draw();notify('Week copied. You can adjust the sessions.');}catch(error){notify(error.message);}};
    document.getElementById('builderPreview').onclick=()=>{capture();try{const candidate=BuildSetup.create({...draft,id:`personal-${Date.now()}`});if(!profile.onboarded)state.setup={race:candidate.race,goal:draft.goal,raceDate:candidate.raceDate};previewPlan(candidate);}catch(error){notify(error.message);}};
  }
  draw();
}

// Rebind once this module is available; normal rendering also binds these controls.
bindWorkflows();
