const VERSION='0.5.0';
const IMPACT={long:1,marathon:.94,threshold:.80,interval:.86,easy:.36,strength:.28,recovery:.20,cross:.22};
const SCORES={nailed:100,mostly:84,modified:58,missed:15};
const SCORE_LABEL={100:'Nailed it',84:'Mostly',58:'Modified',15:'Missed'};

const defaultPlan={
  id:'london-239',name:'London Marathon Build',race:'London Marathon',goal:'2:39:59',weeks:12,currentWeek:5,
  sessions:[
    {week:1,day:'Tue',type:'interval',title:'6 × 1 km controlled',target:'3:28–3:35/km · 90s jog',distanceKm:12,objective:'Build speed reserve while keeping the session controlled.'},
    {week:1,day:'Thu',type:'threshold',title:'25 min threshold',target:'3:42–3:52/km',distanceKm:11,objective:'Establish sustainable threshold rhythm.'},
    {week:1,day:'Sun',type:'long',title:'24 km easy',target:'4:35–5:05/km',distanceKm:24,objective:'Build aerobic durability without chasing pace.'},
    {week:2,day:'Tue',type:'interval',title:'5 × 1200 m',target:'3:28–3:36/km · 2 min jog',distanceKm:13,objective:'Improve economy and controlled high-end aerobic power.'},
    {week:2,day:'Thu',type:'threshold',title:'2 × 15 min threshold',target:'3:42–3:52/km · 3 min easy',distanceKm:13,objective:'Extend threshold durability.'},
    {week:2,day:'Sun',type:'long',title:'26 km steady',target:'4:25–4:55/km',distanceKm:26,objective:'Add duration while remaining aerobically controlled.'},
    {week:3,day:'Tue',type:'interval',title:'8 × 800 m',target:'3:22–3:30/km · 90s jog',distanceKm:13,objective:'Improve running economy.'},
    {week:3,day:'Thu',type:'threshold',title:'35 min threshold',target:'3:42–3:52/km',distanceKm:14,objective:'Accumulate continuous quality at controlled threshold.'},
    {week:3,day:'Sun',type:'long',title:'28 km with final 6 km steady',target:'Easy → 4:05–4:15/km',distanceKm:28,objective:'Introduce controlled fatigue resistance.'},
    {week:4,day:'Tue',type:'interval',title:'6 × 600 m relaxed',target:'Fast but relaxed · full control',distanceKm:9,objective:'Maintain leg speed during recovery week.'},
    {week:4,day:'Thu',type:'threshold',title:'20 min light threshold',target:'Comfortably controlled',distanceKm:9,objective:'Keep rhythm without adding fatigue.'},
    {week:4,day:'Sun',type:'long',title:'20–22 km easy',target:'Recovery long run',distanceKm:21,objective:'Absorb the first block.'},
    {week:5,day:'Tue',type:'interval',title:'5 × 1600 m controlled',target:'3:35–3:45/km · 2–3 min recovery',distanceKm:15,objective:'Improve running economy and speed reserve without excessive fatigue.'},
    {week:5,day:'Thu',type:'threshold',title:'3 × 12 min threshold',target:'3:40–3:55/km · 2–3 min recovery',distanceKm:14,objective:'Raise sustainable aerobic power for marathon performance.'},
    {week:5,day:'Sun',type:'long',title:'30–32 km with 2 × 5 km at marathon pace',target:'Easy 4:35–5:00/km · MP 3:47/km',distanceKm:31,objective:'Build marathon-specific durability and practise holding goal pace late.'},
    {week:6,day:'Tue',type:'interval',title:'10 × 600 m',target:'3:20–3:28/km · 90s–2 min recovery',distanceKm:13,objective:'Sharpen speed and economy.'},
    {week:6,day:'Thu',type:'threshold',title:'2 × 20 min threshold',target:'3:40–3:55/km · 3 min recovery',distanceKm:15,objective:'Extend threshold durability.'},
    {week:6,day:'Sun',type:'long',title:'30–32 km with final 8 km steady to MP',target:'Progress 4:00/km → 3:47/km',distanceKm:31,objective:'Finish strongly under fatigue without forcing the early kilometres.'},
    {week:7,day:'Tue',type:'interval',title:'6 × 1 km sharp',target:'3:25–3:32/km · 90s jog',distanceKm:12,objective:'Keep speed reserve while marathon work peaks.'},
    {week:7,day:'Thu',type:'marathon',title:'3 × 5 km at marathon pace',target:'3:47/km · 3–4 min recovery',distanceKm:19,objective:'Increase confidence and economy at goal marathon pace.'},
    {week:7,day:'Sun',type:'long',title:'32 km with last 10 km at marathon pace',target:'Final 10 km at 3:47/km',distanceKm:32,objective:'Headline marathon-specific long run.'},
    {week:8,day:'Tue',type:'interval',title:'8 × 400 m relaxed',target:'Fast, relaxed, complete recovery',distanceKm:9,objective:'Maintain speed while unloading.'},
    {week:8,day:'Thu',type:'easy',title:'10 km easy + strides',target:'Easy aerobic',distanceKm:10,objective:'Recovery and movement quality.'},
    {week:8,day:'Sun',type:'long',title:'22–24 km easy',target:'Genuine recovery · no hard finish',distanceKm:23,objective:'Absorb the peak block and reduce accumulated fatigue.'},
    {week:9,day:'Tue',type:'threshold',title:'4 × 8 min threshold',target:'3:40–3:50/km · 2 min easy',distanceKm:14,objective:'Reinforce aerobic power.'},
    {week:9,day:'Thu',type:'marathon',title:'2 × 6 km at marathon pace',target:'3:47/km · 3 min recovery',distanceKm:16,objective:'Reinforce race-specific efficiency.'},
    {week:9,day:'Sun',type:'long',title:'28–30 km with 10–12 km at marathon pace',target:'MP block at 3:47/km',distanceKm:29,objective:'Specific but controlled marathon preparation.'},
    {week:10,day:'Tue',type:'interval',title:'5 × 1 km controlled',target:'10k effort, not maximal',distanceKm:11,objective:'Maintain economy without accumulating fatigue.'},
    {week:10,day:'Thu',type:'marathon',title:'10 km marathon pace',target:'3:47/km within 15–16 km total',distanceKm:16,objective:'Final substantial marathon-pace rehearsal.'},
    {week:10,day:'Sun',type:'long',title:'24–26 km easy-steady',target:'Finish feeling controlled',distanceKm:25,objective:'Maintain durability while taper begins.'},
    {week:11,day:'Tue',type:'threshold',title:'3 × 8 min threshold',target:'Controlled, fresh',distanceKm:10,objective:'Keep aerobic sharpness.'},
    {week:11,day:'Thu',type:'marathon',title:'6 km marathon pace',target:'3:47/km · smooth',distanceKm:10,objective:'Rehearse rhythm without fatigue.'},
    {week:11,day:'Sun',type:'long',title:'18–20 km easy',target:'Easy only',distanceKm:19,objective:'Reduce load while preserving routine.'},
    {week:12,day:'Tue',type:'easy',title:'7 km easy + 4 strides',target:'Relaxed',distanceKm:7,objective:'Stay loose.'},
    {week:12,day:'Thu',type:'marathon',title:'5 km with 2 km at marathon pace',target:'Short race-rhythm reminder',distanceKm:5,objective:'Finish wanting more.'},
    {week:12,day:'Sun',type:'long',title:'London Marathon',target:'Goal 2:39:59 · 3:47/km',distanceKm:42.195,objective:'Race day.'}
  ]
};

const store={
  get(k,fallback){try{let v=localStorage.getItem(k);return v?JSON.parse(v):fallback}catch{return fallback}},
  set(k,v){localStorage.setItem(k,JSON.stringify(v))}
};
let plan=store.get('build.plan',defaultPlan);
let assessments=store.get('build.assessments',{});
let activities=store.get('build.activities',[]);
let profile=store.get('build.profile',{onboarded:false,name:'Runner',source:'demo'});
let state={pendingActivityId:null,reviewRate:null,screen:profile.onboarded?'today':'onboarding',week:BuildCalendar.currentWeek(plan),selected:null,activity:null,onboardStep:0};

const escapeHTML=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const skey=s=>`${s.week}|${s.day}|${s.title}`;
const assessed=s=>assessments[skey(s)];
const impact=s=>IMPACT[s.type]??.4;
const typeName=t=>({long:'Long run',marathon:'Marathon pace',threshold:'Threshold',interval:'Intervals',easy:'Easy',strength:'Strength',recovery:'Recovery',cross:'Cross-training'})[t]||'Session';
const typeInitial=t=>({long:'L',marathon:'M',threshold:'T',interval:'I',easy:'E',strength:'S',recovery:'R',cross:'C'})[t]||'•';
function save(){
  const values={'build.plan':plan,'build.assessments':assessments,'build.activities':activities,'build.profile':profile};
  const before=Object.fromEntries(Object.keys(values).map(k=>[k,localStorage.getItem(k)]));
  try{for(const [k,v]of Object.entries(values))store.set(k,v)}catch(error){for(const [k,v]of Object.entries(before)){try{v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch{}}throw Error('Your browser could not save this change. Free some storage and try again.');}
}
let noticeTimer;
function notify(message){const el=document.getElementById('notice');if(!el)return;el.textContent=message;el.classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('visible'),6000)}
function formatPace(sec,km){if(!sec||!km)return '—';const total=Math.round(sec/km);return `${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}/km`}
function closeSheet(){state.selected=null;state.activity=null;state.pendingActivityId=null;state.reviewRate=null;render()}


function metrics(){
  const due=plan.sessions.filter(s=>s.week<=state.week);
  let possible=0,earned=0,qualityPossible=0,qualityEarned=0;
  due.forEach(s=>{const w=impact(s);possible+=w;if(w>.5)qualityPossible+=w;const a=assessed(s);if(a){earned+=w*a.score/100;if(w>.5)qualityEarned+=w*a.score/100}});
  const progress=possible?Math.round(100*earned/possible):0;
  const quality=qualityPossible?Math.round(100*qualityEarned/qualityPossible):0;
  const assessedCount=due.filter(assessed).length;
  const coverage=due.length?assessedCount/due.length:0;
  const recent=due.filter(s=>s.week>=Math.max(1,state.week-2)&&assessed(s)).map(s=>assessed(s).score);
  const recentAvg=recent.length?recent.reduce((a,b)=>a+b,0)/recent.length:progress;
  const forecast=coverage<.30?null:Math.round(progress*.40+quality*.35+recentAvg*.25);
  const confidence=coverage>=.7?'High':coverage>=.45?'Medium':'Low';
  return {progress,quality,forecast,confidence,coverage,assessedCount,dueCount:due.length,recentAvg:Math.round(recentAvg)};
}
function weekStats(week){
  const ss=plan.sessions.filter(s=>s.week===week), done=ss.filter(assessed);
  const distance=done.reduce((total,s)=>{const a=assessed(s);if(a.score<=20)return total;const recorded=a.actualDistanceKm??activities.find(x=>x.id===a.activityId)?.distanceKm;return total+(Number.isFinite(recorded)&&recorded>=0?recorded:0)},0);
  const score=done.length?Math.round(done.reduce((a,s)=>a+assessed(s).score*impact(s),0)/done.reduce((a,s)=>a+impact(s),0)):null;
  return {count:ss.length,done:done.length,distance:Math.round(distance),score};
}
function statusCopy(m){
  if(m.forecast==null)return {tone:'neutral',label:'Building signal',text:'Assess a few more sessions before BUILD makes a forecast.'};
  if(m.forecast>=88)return {tone:'good',label:'On track',text:'The important work is landing. Protect consistency and avoid adding unnecessary load.'};
  if(m.forecast>=76)return {tone:'watch',label:'Within reach',text:'The build is viable, but the next key sessions matter. Prioritise execution over extra mileage.'};
  return {tone:'risk',label:'Needs attention',text:'Recent execution is pulling the build down. Protect recovery, then re-establish the key sessions.'};
}
function nextKey(){const week=BuildCalendar.currentWeek(plan);return plan.sessions.find(s=>s.week>=week&&impact(s)>=.78&&!assessed(s))||plan.sessions.find(s=>s.week>=week&&!assessed(s));}
function coachingInsight(){
  const m=metrics(), n=nextKey();
  const missed=plan.sessions.filter(s=>s.week>=Math.max(1,state.week-2)&&s.week<=state.week&&assessed(s)?.score<=20&&impact(s)>.7);
  if(missed.length)return `A key session was missed recently. Don’t try to repay it with extra volume. Make ${escapeHTML(n?.title||'the next key session')} the next clean win.`;
  if(m.quality>=88)return `Your key-session execution is strong. The biggest risk now is doing more than the plan asks. Keep ${escapeHTML(n?.title||'the next session')} controlled.`;
  if(n)return `${escapeHTML(n.title)} is the next high-impact session. Its job is ${escapeHTML(n.objective.toLowerCase())}`;
  return 'The build is complete. Shift attention to recovery and race execution.';
}
function scoreTrend(){return Array.from({length:plan.weeks},(_,i)=>{let w=i+1,st=weekStats(w);return {week:w,score:st.score}})}

function sessionRow(s){
  const a=assessed(s), matched=a?.activityId?activities.find(x=>x.id===a.activityId):null;
  return `<button class="session-row" data-session="${encodeURIComponent(skey(s))}"><span class="session-icon ${s.type}">${typeInitial(s.type)}</span><span class="session-copy"><strong>${escapeHTML(s.day)} · ${escapeHTML(s.title)}</strong><small>${escapeHTML(s.target)}</small>${matched?`<small class="matched">Matched · ${matched.distanceKm.toFixed(1)} km</small>`:''}</span><span class="session-right">${a?`<b class="score-pill s${a.score}">${a.score}</b>`:`<small>${Math.round(impact(s)*100)}</small>`}<span>›</span></span></button>`;
}
function metricCard(label,value,caption,cls=''){return `<div class="metric-card ${cls}"><span>${label}</span><strong>${value}</strong><small>${caption}</small></div>`}
function nav(){return `<nav class="bottom-nav">${[['today','⌂','Today'],['plan','▦','Plan'],['progress','◔','Progress'],['inbox','⇄','Activity']].map(([id,ico,label])=>`<button data-nav="${id}" class="${state.screen===id?'active':''}"><i aria-hidden="true">${ico}</i><span>${label}</span></button>`).join('')}</nav>`}
function header(){return `<header><button class="wordmark" data-nav="today">BUILD</button><button class="profile-btn" aria-label="Settings" data-nav="settings">${escapeHTML((profile.name||'R')[0].toUpperCase())}</button></header>`}

function onboarding(){
  const steps=[
    `<div class="onboard-mark">BUILD</div><h1>Make the plan mean something.</h1><p>BUILD turns your marathon plan and completed training into a clear view of whether you’re moving toward race day.</p><button class="primary" data-onboard-next>Start your build</button>`,
    `<div class="eyebrow">Your goal</div><h1>One race. One build.</h1><label class="field">Race<input id="raceInput" value="${escapeHTML(plan.race)}"></label><label class="field">Goal time<input id="goalInput" value="${escapeHTML(plan.goal)}"></label><button class="primary" data-onboard-next>Continue</button>`,
    `<div class="eyebrow">Your plan</div><h1>Bring the plan you trust.</h1><p>BUILD does not replace your coach or generate a new plan. Import your existing plan as CSV or JSON, or explore the example build first.</p><button class="primary" id="onboardImport">Import my plan</button><button class="secondary full" data-onboard-next>Explore example plan</button>`,
    `<div class="eyebrow">Completed training</div><h1>Connect the work.</h1><p>Import an activity CSV or add a run manually. BUILD suggests a session match, and you decide how well the run delivered its objective.</p><button class="primary" data-onboard-finish>Enter BUILD</button>`
  ];
  return `<main class="onboarding"><div class="onboard-card">${steps[state.onboardStep]}</div><div class="step-dots">${steps.map((_,i)=>`<i class="${i===state.onboardStep?'active':''}"></i>`).join('')}</div></main>`;
}
function today(){
  const m=metrics(), st=statusCopy(m), n=nextKey(), ss=plan.sessions.filter(s=>s.week===state.week), ws=weekStats(state.week);
  return `${header()}<main><section class="hero"><div><div class="eyebrow">${plan.id==='london-239'?'Example build · ':''}Week ${state.week} of ${plan.weeks}</div><h1>${st.label}.</h1><p>${st.text}</p></div><div class="race-chip"><span>${escapeHTML(plan.race)}</span><b>${escapeHTML(plan.goal)}</b></div></section><section class="metrics-grid">${metricCard('BUILD PROGRESS',`${m.progress}%`,`${m.assessedCount}/${m.dueCount} assessed`)}${metricCard('FORECAST',m.forecast==null?'—':`${m.forecast}%`,st.label,st.tone)}${metricCard('KEY WORK',`${m.quality}%`,'weighted execution')}${metricCard('CONFIDENCE',m.confidence,'signal quality')}</section>${n?`<section class="focus-card"><div><span class="eyebrow">Next high-impact session</span><h2>${escapeHTML(n.title)}</h2><p>${escapeHTML(n.target)}</p></div><button data-session="${encodeURIComponent(skey(n))}">Review ›</button></section>`:''}<div class="section-title"><h2>This week</h2><span>${ws.done}/${ws.count} assessed</span></div><section class="card session-list">${ss.length?ss.map(sessionRow).join(''):'<p class="empty">No sessions in this week.</p>'}</section><div class="section-title"><h2>Coach view</h2></div><section class="card insight"><span class="insight-mark">i</span><p>${coachingInsight()}</p></section></main>${nav()}`;
}
function planView(){
  const ss=plan.sessions.filter(s=>s.week===state.week), ws=weekStats(state.week);
  return `${header()}<main><section class="page-head"><div class="eyebrow">The Plan</div><h1>${escapeHTML(plan.name)}</h1><p>The plan is the source of truth. BUILD owns the interpretation.</p></section><div class="week-strip">${Array.from({length:plan.weeks},(_,i)=>`<button class="week ${state.week===i+1?'active':''}" data-week="${i+1}">W${i+1}</button>`).join('')}</div><section class="week-summary"><div><span>Week ${state.week}</span><strong>${ws.distance} km</strong><small>recorded distance</small></div><div><span>Execution</span><strong>${ws.score??'—'}</strong><small>${ws.done}/${ws.count} sessions</small></div></section><section class="card session-list">${ss.length?ss.map(sessionRow).join(''):'<p class="empty">No sessions stored for this week.</p>'}</section><button class="secondary full" id="importPlan">Import BUILD plan JSON</button></main>${nav()}`;
}
function progressView(){
  const m=metrics(), trend=scoreTrend(), maxH=82;
  return `${header()}<main><section class="page-head"><div class="eyebrow">Build Progress</div><h1>${m.progress}%</h1><p>Progress reflects assessed session execution, weighted by importance. Unassessed sessions reduce confidence. Forecast describes training execution; it is not a predicted finish time or probability of reaching your goal.</p></section><section class="card"><div class="progress-head"><b>Build health</b><span>${statusCopy(m).label}</span></div><div class="big-track"><div style="width:${m.progress}%"></div></div><div class="progress-labels"><span>Lower execution</span><span>Higher execution</span></div></section><section class="metrics-grid two">${metricCard('KEY WORK',`${m.quality}%`,'quality-session execution')}${metricCard('RECENT FORM',`${m.recentAvg}%`,'last three weeks')}${metricCard('FORECAST',m.forecast==null?'—':`${m.forecast}%`,'current trajectory')}${metricCard('CONFIDENCE',m.confidence,'data coverage')}</section><div class="section-title"><h2>Weekly execution</h2></div><section class="card"><div class="bar-chart">${trend.map(t=>`<div class="bar-col"><div class="bar-wrap"><div class="bar" style="height:${t.score==null?4:Math.max(6,t.score/100*maxH)}px"></div></div><small>W${t.week}</small></div>`).join('')}</div></section><div class="section-title"><h2>What BUILD sees</h2></div><section class="card insight"><span class="insight-mark">i</span><p>${coachingInsight()}</p></section></main>${nav()}`;
}
function inboxView(){
  const unmatched=activities.filter(a=>!Object.values(assessments).some(x=>x.activityId===a.id)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const matched=plan.sessions.filter(s=>assessed(s)?.activityId);
  return `${header()}<main><section class="page-head"><div class="eyebrow">Activity inbox</div><h1>Completed work, interpreted.</h1><p>Bring in your completed runs. Match each one to your plan, then review what it contributed to the build.</p></section><div class="action-grid"><button class="primary" id="importActivities">Import Strava CSV</button><button class="secondary" id="manualActivity">Add a run</button></div><div class="section-title"><h2>Needs matching</h2><span>${unmatched.length}</span></div><section class="card activity-list">${unmatched.length?unmatched.map(activityRow).join(''):'<p class="empty">Nothing waiting. Your activity inbox is clear.</p>'}</section><div class="section-title"><h2>Reviewed runs</h2><span>${matched.length}</span></div><section class="card session-list">${matched.length?matched.map(sessionRow).join(''):'<p class="empty">Reviewed runs will appear here.</p>'}</section><div class="section-title"><h2>How matching works</h2></div><section class="card"><p class="muted-copy">BUILD compares date proximity, distance and the planned session type. It proposes a match; you stay in control of the final confirmation.</p></section></main>${nav()}`;
}
function activityRow(a){const candidate=bestMatch(a);return `<button class="activity-row" data-activity="${escapeHTML(a.id)}"><span class="activity-icon">↗</span><span><strong>${escapeHTML(a.name||'Run')}</strong><small>${a.distanceKm.toFixed(1)} km · ${formatDuration(a.movingSeconds)}${a.date?` · ${escapeHTML(a.date)}`:''}</small>${candidate?`<em>Likely: ${escapeHTML(candidate.title)}</em>`:''}</span><b>›</b></button>`}
function settingsView(){return `${header()}<main><section class="page-head"><div class="eyebrow">Settings</div><h1>Your build.</h1></section><section class="card settings-list"><div><span>Race</span><b>${escapeHTML(plan.race)}</b></div><div><span>Goal</span><b>${escapeHTML(plan.goal)}</b></div><div><span>Activity source</span><b>${profile.source==='strava-csv'?'Strava CSV':profile.source==='strava-api'?'Strava sync':'Local / manual'}</b></div><div><span>BUILD version</span><b>${VERSION}</b></div></section><button class="secondary full" id="exportBackup">Download backup</button><button class="secondary full" id="restoreBackup">Restore backup</button><button class="secondary full" id="resetData">Reset local data</button><p class="privacy">Your plan and training history are saved in this browser. Download a backup to keep a copy or move to another device. On iPhone, use Safari → Share → Add to Home Screen.</p></main>${nav()}`}

function sessionSheet(s){
  const a=assessed(s),act=activities.find(x=>x.id===(state.pendingActivityId||a?.activityId));
  const actual=a?.actualDistanceKm??act?.distanceKm;
  const seconds=a?.movingSeconds??act?.movingSeconds;
  const selected=state.reviewRate||Object.keys(SCORES).find(k=>SCORES[k]===a?.score);
  const difference=s.distanceKm&&actual!=null?Math.round((actual-s.distanceKm)/s.distanceKm*100):null;
  return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Review session"><div class="panel"><div class="handle"></div><div class="eyebrow">${typeName(s.type)} · Week ${s.week} · ${escapeHTML(s.day)}</div><h2>${escapeHTML(s.title)}</h2><div class="info-block"><span>Planned target</span><p>${escapeHTML(s.target)}</p></div><div class="info-block"><span>Why it matters</span><p>${escapeHTML(s.objective)}</p></div>${act?`<div class="actual-block"><span>Matched activity</span><strong>${act.distanceKm.toFixed(1)} km · ${formatDuration(act.movingSeconds)}</strong><small>${escapeHTML(act.name)}</small></div>`:''}<div class="planned-actual"><div><span>Planned</span><b>${s.distanceKm!=null?`${s.distanceKm} km`:'As prescribed'}</b></div><div><span>Actual</span><b>${actual!=null?`${actual} km`:'Not recorded'}</b></div><div><span>Distance difference</span><b>${difference==null?'—':`${difference>0?'+':''}${difference}%`}</b></div><div><span>Average pace</span><b>${formatPace(seconds,actual)}</b></div></div><p class="muted-copy">Distance and average pace are context. For intervals or a fast finish, assess the work blocks against your planned target.</p><div class="question"><span>How well did this session deliver its objective?</span><div class="score-grid">${[['nailed','Nailed it','Exactly the job'],['mostly','Mostly','Minor miss'],['modified','Modified','Different stimulus'],['missed','Missed','Didn’t happen']].map(([k,l,d])=>`<button data-rate="${k}" aria-pressed="${selected===k}" class="${selected===k?'selected':''}"><b>${l}</b><small>${d}</small></button>`).join('')}</div></div><details class="review-details" ${a?.notes?'open':''}><summary>Optional details</summary><label class="field">Actual distance (km)<input id="reviewDistance" type="number" min="0" max="300" step="0.01" value="${actual??''}"></label><label class="field">Moving time (h:mm:ss or m:ss)<input id="reviewTime" placeholder="1:35:00" value="${seconds?new Date(seconds*1000).toISOString().slice(11,19):''}"></label><label class="field">Effort (1–10)<input id="reviewRpe" type="number" min="1" max="10" value="${a?.rpe??''}"></label><label class="field">Notes<textarea id="reviewNotes" maxlength="2000" placeholder="How did the key work feel?">${escapeHTML(a?.notes||'')}</textarea></label></details><button class="primary full" id="saveReview">Save review</button>${a?'<button class="text-btn" id="removeReview">Remove assessment & return run to inbox</button>':''}<button class="text-btn" data-close>Cancel</button></div></div>`;
}
function activitySheet(a){
  const candidates=rankMatches(a).slice(0,3);
  const available=plan.sessions.filter(s=>!assessed(s)||assessed(s).activityId===a.id);
  return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Match activity"><div class="panel"><div class="handle"></div><div class="eyebrow">Imported activity</div><h2>${escapeHTML(a.name||'Run')}</h2><div class="actual-block"><strong>${a.distanceKm.toFixed(1)} km</strong><span>${formatDuration(a.movingSeconds)} · ${escapeHTML(a.date||'No date')} · ${formatPace(a.movingSeconds,a.distanceKm)}</span></div><div class="question"><span>Which planned session was this?</span><div class="match-list">${candidates.length?candidates.map(s=>`<button data-match="${encodeURIComponent(skey(s))}"><span><b>${escapeHTML(s.title)}</b><small>Week ${s.week} · ${escapeHTML(s.day)} · ${s.distanceKm??'—'} km</small></span><em>Review ›</em></button>`).join(''):'<p class="empty">No close match found. Choose a session below or keep this as an unplanned run.</p>'}</div></div><label class="field">Choose another session<select id="otherMatch"><option value="">Select a planned session</option>${available.map(s=>`<option value="${escapeHTML(skey(s))}">W${s.week} ${escapeHTML(s.day)} · ${escapeHTML(s.title)}</option>`).join('')}</select></label><button class="secondary full" id="chooseOtherMatch">Review selected session</button><button class="text-btn" id="deleteActivity">Delete this activity</button><button class="text-btn" data-close>Keep unmatched</button></div></div>`;
}
function render(){
  if(state.screen==='onboarding'){document.getElementById('app').innerHTML=onboarding();bind();return}
  let body=state.screen==='plan'?planView():state.screen==='progress'?progressView():state.screen==='inbox'?inboxView():state.screen==='settings'?settingsView():today();
  if(state.selected)body+=sessionSheet(state.selected);
  if(state.activity)body+=activitySheet(state.activity);
  document.getElementById('app').innerHTML=body;bind();
}
function bind(){
  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{state.pendingActivityId=null;state.reviewRate=null;state.screen=b.dataset.nav;if(state.screen==='today')state.week=BuildCalendar.currentWeek(plan);state.selected=null;state.activity=null;render()});
  document.querySelectorAll('[data-week]').forEach(b=>b.onclick=()=>{state.week=+b.dataset.week;render()});
  document.querySelectorAll('[data-session]').forEach(b=>b.onclick=()=>{const k=decodeURIComponent(b.dataset.session);state.pendingActivityId=null;state.reviewRate=null;state.selected=plan.sessions.find(s=>skey(s)===k);render()});
  document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{state.reviewRate=b.dataset.rate;document.querySelectorAll('[data-rate]').forEach(x=>{const selected=x===b;x.classList.toggle('selected',selected);x.setAttribute('aria-pressed',String(selected))})});
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeSheet);
  document.querySelectorAll('[data-activity]').forEach(b=>b.onclick=()=>{state.activity=activities.find(a=>a.id===b.dataset.activity);render()});
  document.querySelectorAll('[data-match]').forEach(b=>b.onclick=()=>beginMatch(decodeURIComponent(b.dataset.match)));
  const other=document.getElementById('chooseOtherMatch');if(other)other.onclick=()=>beginMatch(document.getElementById('otherMatch').value);
  const review=document.getElementById('saveReview');if(review)review.onclick=saveReview;
  const remove=document.getElementById('removeReview');if(remove)remove.onclick=()=>{if(!confirm('Remove this assessment? Any matched run returns to your activity inbox.'))return;const key=skey(state.selected),old=assessments[key];delete assessments[key];try{save();closeSheet();notify('Assessment removed.')}catch(e){assessments[key]=old;notify(e.message)}};
  const deleteRun=document.getElementById('deleteActivity');if(deleteRun)deleteRun.onclick=()=>{if(!confirm('Delete this activity from BUILD?'))return;const old=activities;activities=activities.filter(a=>a.id!==state.activity.id);try{save();closeSheet();notify('Activity deleted.')}catch(e){activities=old;notify(e.message)}};
  document.querySelectorAll('[data-onboard-next]').forEach(b=>b.onclick=()=>{if(state.onboardStep===1){let r=document.getElementById('raceInput'),g=document.getElementById('goalInput');if(r?.value)plan.race=r.value;if(g?.value)plan.goal=g.value;save()}state.onboardStep++;render()});
  const finish=document.querySelector('[data-onboard-finish]');if(finish)finish.onclick=()=>{profile.onboarded=true;save();state.screen='today';render()};
  const ip=document.getElementById('importPlan');if(ip)ip.onclick=()=>document.getElementById('planFileInput').click();
  const ia=document.getElementById('importActivities');if(ia)ia.onclick=()=>document.getElementById('activityFileInput').click();
  const demo=document.getElementById('loadDemo');if(demo)demo.onclick=loadDemoActivities;
  if(typeof bindWorkflows==='function')bindWorkflows();
  const reset=document.getElementById('resetData');if(reset)reset.onclick=()=>{if(confirm('Reset BUILD on this device?')){['build.plan','build.assessments','build.activities','build.profile'].forEach(k=>localStorage.removeItem(k));location.reload()}};
}

function formatDuration(sec){if(!sec)return '—';let h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);return h?`${h}h ${String(m).padStart(2,'0')}m`:`${m}m`}
function dateDiffDays(a,b){if(!a||!b)return 10;return Math.abs((new Date(a)-new Date(b))/86400000)}
function estimatedSessionDate(s){return BuildCalendar.sessionDate(plan,s)}
function matchScore(a,s){
  if(assessed(s)?.activityId && assessed(s).activityId!==a.id)return 0;
  let dist=s.distanceKm?Math.max(0,1-Math.abs(a.distanceKm-s.distanceKm)/Math.max(s.distanceKm,5)):0.55;
  let date=estimatedSessionDate(s), dp=date?Math.max(0,1-dateDiffDays(a.date,date)/5):.55;
  let name=(a.name||'').toLowerCase(), semantic=.45;
  if(s.type==='long'&&(name.includes('long')||a.distanceKm>=22))semantic=.9;
  if(s.type==='interval'&&(name.includes('interval')||name.includes('track')))semantic=.85;
  if(s.type==='threshold'&&(name.includes('tempo')||name.includes('threshold')))semantic=.9;
  if(s.type==='marathon'&&(name.includes('marathon')||name.includes('mp')))semantic=.9;
  return Math.round(100*(dist*.5+dp*.25+semantic*.25));
}
function rankMatches(a){return plan.sessions.filter(s=>!['strength','cross'].includes(s.type)&&(!assessed(s)||assessed(s).activityId===a.id)).map(s=>[s,matchScore(a,s)]).filter(x=>x[1]>=45).sort((a,b)=>b[1]-a[1]).map(x=>x[0])}
function bestMatch(a){return rankMatches(a)[0]||null}

function loadDemoActivities(){const demo=[{id:'demo-1',name:'Tuesday intervals',distanceKm:14.8,movingSeconds:3900,date:'',source:'demo'},{id:'demo-2',name:'Threshold reps',distanceKm:13.7,movingSeconds:4100,date:'',source:'demo'},{id:'demo-3',name:'Sunday Long Run',distanceKm:31.2,movingSeconds:9050,date:'',source:'demo'}];activities=[...activities.filter(a=>!a.id.startsWith('demo-')),...demo];save();render()}

if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
