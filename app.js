function forecastExplanation(){return ""}
const VERSION='0.12.1';
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
  const auto=automaticMatches();
  const distance=ss.reduce((total,s)=>{const a=assessed(s);if(a&&a.score<=20)return total;const recorded=a?.actualDistanceKm??activities.find(x=>a?.activityId?x.id===a.activityId:auto.get(x.id)===skey(s))?.distanceKm;return total+(Number.isFinite(recorded)&&recorded>=0?recorded:0)},0);
  const score=done.length?Math.round(done.reduce((a,s)=>a+assessed(s).score*impact(s),0)/done.reduce((a,s)=>a+impact(s),0)):null;
  return {count:ss.length,done:done.length,distance:Math.round(distance),score};
}
function statusCopy(m){
  if(m.forecast==null)return {tone:'neutral',label:'Building signal',text:'Assess a few more sessions before BUILD makes a forecast.'};
  if(m.forecast>=88)return {tone:'good',label:'On track',text:'The important work is landing. Protect consistency and avoid adding unnecessary load.'};
  if(m.forecast>=76)return {tone:'watch',label:'Within reach',text:'The build is viable, but the next key sessions matter. Prioritise execution over extra mileage.'};
  return {tone:'risk',label:'Needs attention',text:'Recent execution is pulling the build down. Protect recovery, then re-establish the key sessions.'};
}
function upcomingSessions(date=BuildCalendar.today()){const linked=new Set(automaticMatches().values());return BuildCalendar.upcoming(plan,date).filter(s=>!assessed(s)&&!linked.has(skey(s)))}
function nextPlannedRun(date=BuildCalendar.today()){return upcomingSessions(date).find(s=>!['strength','cross'].includes(s.type));}
function nextKey(){return nextPlannedRun();}
function plannedRunDate(session){const date=estimatedSessionDate(session);return date?new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):`Week ${session.week} · ${session.day}`;}
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
  const a=assessed(s), matched=a?.activityId?activities.find(x=>x.id===a.activityId):activities.find(x=>automaticMatches().get(x.id)===skey(s));
  return `<button class="session-row" data-session="${encodeURIComponent(skey(s))}"><span class="session-icon ${s.type}">${typeInitial(s.type)}</span><span class="session-copy"><strong>${escapeHTML(s.day)} · ${escapeHTML(s.title)}</strong><small>${escapeHTML(s.target)}</small>${matched?`<small class="matched">${a?'Reviewed':'Auto-matched'} · ${matched.distanceKm.toFixed(1)} km</small>`:''}</span><span class="session-right">${a?`<b class="score-pill s${a.score}">${a.score}</b>`:`<small>${matched?'Review':impact(s)>=.78?'Key':'Planned'}</small>`}<span>›</span></span></button>`;
}
function metricCard(label,value,caption,cls=''){return `<div class="metric-card ${cls}"><span>${label}</span><strong>${value}</strong><small>${caption}</small></div>`}
function nav(){
  const icons={today:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',plan:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18"/>',progress:'<path d="M4 3v17h17M8 15l4-5 4 3 5-7"/>',inbox:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>'};
  return `<nav class="bottom-nav" aria-label="Main navigation">${[['today','Today'],['plan','Plan'],['progress','Progress'],['inbox','Activity'],['settings','Settings']].map(([id,label])=>`<button data-nav="${id}" class="${state.screen===id?'active':''}" ${state.screen===id?'aria-current="page"':''}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id]}</svg><span>${label}</span></button>`).join('')}</nav>`;
}

function syncReviewBanner(){const runs=activities.filter(a=>a.source==='strava-api'&&!Object.values(assessments).some(x=>x.activityId===a.id));if(!runs.length)return '';return `<button class="sync-review-banner" data-nav="inbox"><span class="sync-review-icon" aria-hidden="true">↗</span><span><strong>${runs.length} synced run${runs.length===1?'':'s'} to review</strong><small>Your plan is updated. Review how each run went</small></span><b aria-hidden="true">→</b></button>`}
function header(){return `<header><button class="wordmark" data-nav="today" aria-label="BUILD home">BUILD<span>.</span></button><span class="header-race">${escapeHTML(plan.race)}</span><button class="profile-btn" aria-label="Open settings" data-nav="settings">${escapeHTML((profile.name||'R')[0].toUpperCase())}</button></header>`}

function onboarding(){
  const setup=state.setup||profile.setupDraft||{race:'',goal:'',raceDate:''};
  const steps=[
    `<div class="onboard-mark">BUILD</div><h1>Your plan.<br>Your progress.</h1><p>Import your plan. Connect Strava. See how your training is going.</p><button class="primary" data-onboard-next>Start your build</button>`,
    `<div class="eyebrow">Your goal</div><h1>Set your goal.</h1><label class="field">Marathon<input id="raceInput" placeholder="e.g. London Marathon" value="${escapeHTML(setup.race)}" maxlength="200" required></label><label class="field">Marathon date<input id="raceDateInput" type="date" value="${escapeHTML(setup.raceDate)}" required></label><label class="field">Goal time (optional)<input id="goalInput" placeholder="e.g. 3:30:00" value="${escapeHTML(setup.goal)}" maxlength="8"></label><p class="muted-copy">Your target time, not a prediction. Leave it blank if finishing is your goal.</p><button class="primary" data-onboard-next>Continue</button>`,
    `<div class="eyebrow">My plan</div><h1>Do you already<br>have a plan?</h1><p>Bring a plan you follow, or let BUILD make one for you.</p><button class="primary full" id="onboardImport">Import my plan</button><button class="secondary full" id="onboardGenerate">Make a plan for me</button><details><summary>More options</summary><button class="secondary full" id="onboardCreate">Enter my own sessions</button><button class="secondary full" id="onboardExample">Explore example plan</button></details>`,
    `<div class="eyebrow">Completed training</div><h1>You’re ready.</h1><p>Connect Strava in Activity. Clear matches are automatic.</p><button class="primary" data-onboard-finish>View my build</button>`
  ];
  return `<main class="onboarding"><div class="onboard-card">${steps[state.onboardStep]}</div><div class="step-dots">${steps.map((_,i)=>`<i class="${i===state.onboardStep?'active':''}"></i>`).join('')}</div></main>`;
}
function today(){
  const week=BuildCalendar.currentWeek(plan),ss=plan.sessions.filter(s=>s.week===week),ws=weekStats(week);
  const date=BuildCalendar.today();
  const dated=plan.sessions.map(session=>({session,date:estimatedSessionDate(session)})).filter(x=>x.date).sort((a,b)=>a.date.localeCompare(b.date));
  const next=nextPlannedRun(date);
  const current=next?{session:next,date:estimatedSessionDate(next)}:null;
  const latest=[...activities].sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
  const auto=automaticMatches(),reviewed=latest?plan.sessions.find(x=>assessed(x)?.activityId===latest.id):null;
  const matched=reviewed||(latest?plan.sessions.find(x=>skey(x)===auto.get(latest.id)):null);
  const planned=ss.reduce((n,x)=>n+(Number(x.distanceKm)||0),0);
  const dates=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return `${header()}<main><section class="page-head home-head"><div class="eyebrow">${plan.id==='london-239'?'Example plan · ':''}<span>Week ${week} of ${plan.weeks}</span></div><h1>Today</h1></section>
  ${next?`<section class="today-session"><div class="card-top"><span class="eyebrow">${current?.date===date?'Today’s session':'Next session'}</span><span class="type-tag">${typeName(next.type)}</span></div><h2>${escapeHTML(next.title)}</h2><p>${escapeHTML(next.target)}</p><div class="session-footer"><span>${next.distanceKm?`<strong>${next.distanceKm}</strong> km`:'As prescribed'} · ${escapeHTML(plannedRunDate(next))}</span><button class="session-link" data-session="${encodeURIComponent(skey(next))}">${assessed(next)?'View review':'View session'} <span aria-hidden="true">↗</span></button></div></section>`:`<section class="today-session"><div class="eyebrow">Your plan</div><h2>${dated.length&&dated.at(-1).date<date?'Build complete':'No session scheduled'}</h2><p>${dated.length&&dated.at(-1).date<date?'Your plan has reached its final day.':'Your next planned run will appear here.'}</p><button class="secondary" data-nav="plan">View plan</button></section>`}
  <div class="section-title"><h2>Latest run</h2></div><section id="stravaConnection" class="home-sync" aria-live="polite"></section>
  ${latest?`<section class="card latest-run"><div class="card-top"><h3>${escapeHTML(latest.name||'Run')}</h3><span class="run-date">${escapeHTML(latest.date||'No date')}</span></div><p class="match-state">${matched?`${reviewed?'✓ Reviewed':'✓ Automatically matched'} · ${escapeHTML(matched.day)}`:'Choose a planned session'}</p><div class="run-comparison"><div><span>Planned</span><strong>${matched?.distanceKm?`${matched.distanceKm} <small>km</small>`:'—'}</strong><small>${matched?escapeHTML(typeName(matched.type)):'No confirmed match'}</small></div><div><span>Actual</span><strong>${latest.distanceKm.toFixed(1)} <small>km</small></strong><small>${formatPace(latest.movingSeconds,latest.distanceKm)} · ${formatDuration(latest.movingSeconds)}</small></div></div><button class="primary full" ${reviewed?`data-session="${encodeURIComponent(skey(reviewed))}"`:`data-activity="${escapeHTML(latest.id)}"`}>${reviewed?'View review':matched?'Review run':'Match and review'} <span aria-hidden="true">↗</span></button></section>`:'<section class="card empty-run"><h3>Your first run goes here</h3><p>Connect Strava to bring in your completed runs.</p><button class="secondary" data-nav="inbox">View activity</button></section>'}
  <div class="section-title"><h2>This week</h2><span>${ws.done} / ${ws.count} reviewed</span></div><div class="week-days">${dates.map(day=>{const sessions=ss.filter(x=>x.day===day),first=sessions.find(x=>!assessed(x))||sessions[0],logged=sessions.some(x=>assessed(x)||[...auto.values()].includes(skey(x)));return `<button class="week-day ${logged?'logged':''}" ${first?`data-session="${encodeURIComponent(skey(first))}"`:'disabled'} aria-label="${day}${first?` · ${escapeHTML(first.title)}`:' · No planned session'}"><span>${day[0]}</span><i aria-hidden="true"></i></button>`}).join('')}</div><div class="week-foot"><span><b>${ws.distance} km</b> recorded</span><span>${Math.round(planned)} km planned</span></div>${activities.filter(x=>!Object.values(assessments).some(a=>a.activityId===x.id)).length>1?`<button class="text-btn full" data-nav="inbox">View all runs to review →</button>`:''}
  </main>${nav()}`;
}

function planView(){
  const ss=plan.sessions.filter(s=>s.week===state.week),ws=weekStats(state.week);
  return `${header()}<main><section class="page-head"><div class="eyebrow">Build Timeline</div><h1>Plan</h1><p>${escapeHTML(plan.name)}</p></section><div class="week-strip" aria-label="Plan weeks">${Array.from({length:plan.weeks},(_,i)=>`<button class="week ${state.week===i+1?'active':''}" data-week="${i+1}" aria-pressed="${state.week===i+1}">W${i+1}</button>`).join('')}</div><section class="week-summary"><div><span>Week ${state.week}</span><strong>${ws.distance} <small>km</small></strong><small>recorded</small></div><div><span>Reviews</span><strong>${ws.done} <small>/ ${ws.count}</small></strong><small>sessions reviewed</small></div></section><section class="card session-list">${ss.length?ss.map(sessionRow).join(''):'<p class="empty">No sessions this week.</p>'}</section><button class="secondary full" id="importPlan">Import a plan</button></main>${nav()}`;
}

function progressView(){
  const m=metrics(), trend=scoreTrend(), maxH=82;
  return `${header()}<main><section class="page-head"><div class="eyebrow">Build Progress</div><h1>Progress</h1><p>How your reviewed training is shaping the build.</p></section><section class="card"><div class="progress-head"><b>Build Progress · ${m.assessedCount?m.progress+'%':'Awaiting reviews'}</b><span>${statusCopy(m).label}</span></div><div class="big-track"><div style="width:${m.progress}%"></div></div><div class="progress-labels"><span>Lower execution</span><span>Higher execution</span></div></section><section class="metrics-grid two">${metricCard('KEY SESSIONS',m.assessedCount?`${m.quality}%`:'—','Quality of the primary sessions')}${metricCard('RECENT CONTRIBUTION',m.assessedCount?`${m.recentAvg}%`:'—','Reviewed work from the last three weeks')}${metricCard('BUILD FORECAST',m.forecast==null?'—':`${m.forecast}%`,'current trajectory')}${metricCard('GOAL CONFIDENCE',m.confidence,'Confidence in the available evidence')}</section>${forecastExplanation(m)}<div class="section-title"><h2>Your build over time</h2></div><section class="card"><div class="bar-chart">${trend.map(t=>`<div class="bar-col"><div class="bar-wrap"><div class="bar" style="height:${t.score==null?4:Math.max(6,t.score/100*maxH)}px"></div></div><small>W${t.week}</small></div>`).join('')}</div></section><div class="section-title"><h2>What this means for your build</h2></div><section class="card insight"><span class="insight-mark">i</span><p>${coachingInsight()}</p></section></main>${nav()}`;
}
function inboxView(){
  const unmatched=activities.filter(a=>!Object.values(assessments).some(x=>x.activityId===a.id)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const matched=plan.sessions.filter(s=>assessed(s)?.activityId);
  return `${header()}<main><section class="page-head"><div class="eyebrow">Your completed training</div><h1>Activity</h1><p>Your runs, connected to your plan.</p></section><section id="stravaConnection" aria-live="polite"></section>${!plan.startDate?'<p class="matching-help">Add your plan start date in Settings to enable automatic matching.</p>':'<p class="matching-help">Clear matches are automatic. Tap a run to review it.</p>'}<details class="manual-import"><summary>Other ways to add runs</summary><p class="muted-copy">Use these if a run is missing from Strava or you have an older export.</p><div class="action-grid"><button class="secondary" id="importActivities">Import activity CSV</button><button class="secondary" id="manualActivity">Add a run</button></div></details><div class="section-title"><h2>Ready to review</h2><span>${unmatched.length}</span></div><section class="card activity-list">${unmatched.length?unmatched.map(activityRow).join(''):'<p class="empty">You’re up to date. Your next run will appear here.</p>'}</section><div class="section-title"><h2>Reviewed runs</h2><span>${matched.length}</span></div><section class="card session-list">${matched.length?matched.map(sessionRow).join(''):'<p class="empty">No reviewed runs yet.</p>'}</section></main>${nav()}`;
}
function activityRow(a){const key=automaticMatches().get(a.id),candidate=key?plan.sessions.find(s=>skey(s)===key):bestMatch(a);return `<button class="activity-row" data-activity="${escapeHTML(a.id)}"><span class="activity-icon">↗</span><span><strong>${escapeHTML(a.name||'Run')}</strong><small>${a.distanceKm.toFixed(1)} km · ${formatDuration(a.movingSeconds)}${a.date?` · ${escapeHTML(a.date)}`:''}</small>${candidate?`<em>${key?'Auto-matched':'Suggested'}: W${candidate.week} · ${escapeHTML(candidate.day)} · ${escapeHTML(candidate.title)}</em>`:''}</span><b>›</b></button>`}
function settingsView(){return `${header()}<main><section class="page-head"><div class="eyebrow">Settings</div><h1>Settings</h1></section><section class="card settings-list"><div><span>Race</span><b>${escapeHTML(plan.race)}</b></div><div><span>Goal</span><b>${escapeHTML(plan.goal)}</b></div><div><span>Activity source</span><b>${profile.source==='strava-csv'?'Strava CSV':profile.source==='strava-api'?'Strava sync':'Local / manual'}</b></div><div><span>BUILD version</span><b>${VERSION}</b></div></section><button class="secondary full" id="exportBackup">Download backup</button><button class="secondary full" id="restoreBackup">Restore backup</button><button class="secondary full" id="resetData">Reset local data</button><p class="privacy">Your plan and training history are saved in this browser. Download a backup to keep a copy or move to another device. On iPhone, use Safari → Share → Add to Home Screen.</p></main>${nav()}`}

function sessionSheet(s){
  const a=assessed(s),act=activities.find(x=>x.id===(state.pendingActivityId||a?.activityId));
  const actual=a?.actualDistanceKm??act?.distanceKm;
  const seconds=a?.movingSeconds??act?.movingSeconds;
  const selected=state.reviewRate||Object.keys(SCORES).find(k=>SCORES[k]===a?.score);
  const difference=s.distanceKm&&actual!=null?Math.round((actual-s.distanceKm)/s.distanceKm*100):null;
  return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Review session"><div class="panel"><div class="handle"></div><div class="eyebrow">${typeName(s.type)} · Week ${s.week} · ${escapeHTML(s.day)}</div><h2>${escapeHTML(s.title)}</h2><div class="info-block"><span>The planned work</span><p>${escapeHTML(s.target)}</p></div><div class="info-block"><span>Session purpose</span><p>${escapeHTML(s.objective)}</p></div>${act?`<div class="actual-block"><span>Matched activity</span><strong>${act.distanceKm.toFixed(1)} km · ${formatDuration(act.movingSeconds)}</strong><small>${escapeHTML(act.name)}</small></div>`:''}${['strength','cross'].includes(s.type)?'':`<div class="planned-actual"><div><span>Planned</span><b>${s.distanceKm!=null?`${s.distanceKm} km`:'As prescribed'}</b></div><div><span>Actual</span><b>${actual!=null?`${actual} km`:'Not recorded'}</b></div><div><span>Distance difference</span><b>${difference==null?'—':`${difference>0?'+':''}${difference}%`}</b></div><div><span>Average pace</span><b>${formatPace(seconds,actual)}</b></div></div>`}<details class="review-guidance"><summary>What to consider</summary><p>${escapeHTML(({long:'Consider the planned duration, controlled effort and any prescribed fast finish. Extra distance does not automatically improve the session.',interval:'Compare the repetitions and recovery with the target. Whole-run average pace includes warm-up and recovery, so it cannot grade the intervals.',threshold:'Consider time at the prescribed sustained effort and whether it remained controlled.',marathon:'Consider how much of the prescribed marathon-pace block you completed and how controlled it felt.',strength:'Record whether you completed the prescribed routine. No exercise-by-exercise logging is needed.'})[s.type]||'Compare the completed session with its planned purpose and effort.')}</p></details><div class="question"><span>How did it go?</span><div class="score-grid">${[['nailed',['strength','cross'].includes(s.type)?'Completed':'As planned','Delivered the planned objective'],...(['strength','cross'].includes(s.type)?[]:[['mostly','Mostly','Most of the planned objective']]),['modified','Modified','Adapted from the plan'],['missed','Missed','Session not completed']].map(([k,l,d])=>`<button data-rate="${k}" aria-pressed="${selected===k}" class="${selected===k?'selected':''}"><b>${l}</b><small>${d}</small></button>`).join('')}</div></div><details class="review-details" ${a?.notes?'open':''}><summary>Add context (optional)</summary>${['strength','cross'].includes(s.type)?'<input id="reviewDistance" type="hidden"><input id="reviewTime" type="hidden">':`<label class="field">Actual distance (km)<input id="reviewDistance" type="number" min="0" max="300" step="0.01" value="${actual??''}"></label><label class="field">Moving time (h:mm:ss or m:ss)<input id="reviewTime" placeholder="1:35:00" value="${seconds?new Date(seconds*1000).toISOString().slice(11,19):''}"></label>`}<label class="field">Effort (1–10)<input id="reviewRpe" type="number" min="1" max="10" value="${a?.rpe??''}"></label><label class="field">Notes<textarea id="reviewNotes" maxlength="2000" placeholder="Anything the numbers do not tell us?">${escapeHTML(a?.notes||'')}</textarea></label></details><button class="primary full" id="saveReview">Save review</button>${a?'<button class="text-btn" id="removeReview">Remove review</button>':''}<button class="text-btn" data-close>Cancel</button></div></div>`;
}
function activitySheet(a){
  const candidates=rankMatches(a).slice(0,3);
  const available=plan.sessions.filter(s=>!['strength','cross'].includes(s.type)&&(!assessed(s)||assessed(s).activityId===a.id));
  return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Match activity"><div class="panel"><div class="handle"></div><div class="eyebrow">Imported activity</div><h2>${escapeHTML(a.name||'Run')}</h2><div class="actual-block"><strong>${a.distanceKm.toFixed(1)} km</strong><span>${formatDuration(a.movingSeconds)} · ${escapeHTML(a.date||'No date')} · ${formatPace(a.movingSeconds,a.distanceKm)}</span></div><div class="question"><span>Which planned session was this?</span><div class="match-list">${candidates.length?candidates.map(s=>`<button data-match="${encodeURIComponent(skey(s))}"><span><b>${escapeHTML(s.title)}</b><small>Week ${s.week} · ${escapeHTML(s.day)} · ${s.distanceKm??'—'} km${estimatedSessionDate(s)?` · ${estimatedSessionDate(s)}`:''}</small></span><em>Review ›</em></button>`).join(''):'<p class="empty">No close match found. Choose a session below or keep this as an unplanned run.</p>'}</div></div><label class="field">Choose another session<select id="otherMatch"><option value="">Select a planned session</option>${available.map(s=>`<option value="${escapeHTML(skey(s))}">W${s.week} ${escapeHTML(s.day)} · ${escapeHTML(s.title)}</option>`).join('')}</select></label><button class="secondary full" id="chooseOtherMatch">Review selected session</button><button class="text-btn" id="deleteActivity">Delete this activity</button><button class="text-btn" data-close>Keep unmatched</button></div></div>`;
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
  document.querySelectorAll('[data-session]').forEach(b=>b.onclick=()=>{const k=decodeURIComponent(b.dataset.session);state.pendingActivityId=null;state.reviewRate=null;state.selected=plan.sessions.find(s=>skey(s)===k);const candidate=activities.find(a=>automaticMatches().get(a.id)===skey(state.selected));if(candidate&&!assessed(state.selected)){const session=state.selected;state.selected=null;openQuickMatch(candidate,session)}else render()});
  document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{state.reviewRate=b.dataset.rate;document.querySelectorAll('[data-rate]').forEach(x=>{const selected=x===b;x.classList.toggle('selected',selected);x.setAttribute('aria-pressed',String(selected))})});
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeSheet);
  document.querySelectorAll('[data-activity]').forEach(b=>b.onclick=()=>{state.activity=activities.find(a=>a.id===b.dataset.activity);const key=automaticMatches().get(state.activity.id);if(key){state.selected=plan.sessions.find(s=>skey(s)===key);state.pendingActivityId=state.activity.id;state.activity=null;state.reviewRate=null;}render()});
  document.querySelectorAll('[data-match]').forEach(b=>b.onclick=()=>beginMatch(decodeURIComponent(b.dataset.match)));
  const other=document.getElementById('chooseOtherMatch');if(other)other.onclick=()=>beginMatch(document.getElementById('otherMatch').value);
  const review=document.getElementById('saveReview');if(review)review.onclick=saveReview;
  const remove=document.getElementById('removeReview');if(remove)remove.onclick=()=>{if(!confirm('Remove this assessment? Any matched run returns to your activity inbox.'))return;const key=skey(state.selected),old=assessments[key];delete assessments[key];try{save();closeSheet();notify('Assessment removed.')}catch(e){assessments[key]=old;notify(e.message)}};
  const deleteRun=document.getElementById('deleteActivity');if(deleteRun)deleteRun.onclick=()=>{if(!confirm('Delete this activity from BUILD?'))return;const old=activities;activities=activities.filter(a=>a.id!==state.activity.id);try{save();closeSheet();notify('Activity deleted.')}catch(e){activities=old;notify(e.message)}};
  document.querySelectorAll('[data-onboard-next]').forEach(b=>b.onclick=()=>{if(state.onboardStep===1){try{const setup=BuildSetup.goal({race:document.getElementById('raceInput').value,goal:document.getElementById('goalInput').value,raceDate:document.getElementById('raceDateInput').value});const old=profile;profile={...profile,setupDraft:setup};try{save()}catch(error){profile=old;throw error}state.setup=setup;}catch(error){notify(error.message);return}}state.onboardStep++;render()});
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
function rankMatches(a){return plan.sessions.filter(s=>!['strength','cross'].includes(s.type)&&(!assessed(s)||assessed(s).activityId===a.id)).map(s=>[s,matchScore(a,s)]).filter(x=>x[1]>=45||(a.date&&estimatedSessionDate(x[0])===a.date)).sort((x,y)=>Number(Boolean(a.date)&&estimatedSessionDate(y[0])===a.date)-Number(Boolean(a.date)&&estimatedSessionDate(x[0])===a.date)||y[1]-x[1]).map(x=>x[0])}
// Link clear Strava matches to the plan without inventing a review or score.
// Recomputed from local data so imports, date edits and removed reviews stay consistent.
function automaticMatches(){
  const result=new Map(),occupied=new Set(Object.keys(assessments));
  const reviewed=new Set(Object.values(assessments).map(a=>a.activityId));
  const runs=activities.filter(a=>a.source==='strava-api'&&a.date&&!reviewed.has(a.id));
  const sessions=plan.sessions.filter(s=>!['strength','cross'].includes(s.type)&&!occupied.has(skey(s))&&estimatedSessionDate(s));
  const proposals=[];
  for(const run of runs){
    const sameDay=sessions.filter(s=>estimatedSessionDate(s)===run.date);
    let choices=sameDay.length?sameDay:sessions.filter(s=>dateDiffDays(run.date,estimatedSessionDate(s))<=1&&s.distanceKm&&Math.abs(run.distanceKm-s.distanceKm)/Math.max(s.distanceKm,5)<=.25);
    choices=choices.map(session=>({run,session,score:matchScore(run,session),exact:estimatedSessionDate(session)===run.date})).sort((a,b)=>b.score-a.score);
    if(!choices.length||(choices.length>1&&choices[0].score-choices[1].score<12))continue;
    proposals.push(choices[0]);
  }
  proposals.sort((a,b)=>Number(b.exact)-Number(a.exact)||b.score-a.score||a.run.id.localeCompare(b.run.id));
  for(const proposal of proposals){
    const key=skey(proposal.session);
    const competing=proposals.filter(p=>skey(p.session)===key&&p.run.id!==proposal.run.id&&p.exact===proposal.exact);
    if(occupied.has(key)||competing.some(p=>Math.abs(p.score-proposal.score)<12))continue;
    result.set(proposal.run.id,key);occupied.add(key);
  }
  return result;
}
function bestMatch(a){return rankMatches(a)[0]||null}

function loadDemoActivities(){const demo=[{id:'demo-1',name:'Tuesday intervals',distanceKm:14.8,movingSeconds:3900,date:'',source:'demo'},{id:'demo-2',name:'Threshold reps',distanceKm:13.7,movingSeconds:4100,date:'',source:'demo'},{id:'demo-3',name:'Sunday Long Run',distanceKm:31.2,movingSeconds:9050,date:'',source:'demo'}];activities=[...activities.filter(a=>!a.id.startsWith('demo-')),...demo];save();render()}

if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();

// A phone may keep the app open overnight: refresh the schedule on return.
let scheduleDay=BuildCalendar.today();
document.addEventListener?.('visibilitychange',()=>{const date=BuildCalendar.today();if(document.visibilityState==='visible'&&date!==scheduleDay){scheduleDay=date;render();}});
