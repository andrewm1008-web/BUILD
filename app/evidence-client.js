// Bible v0.2: traceable evidence, purpose-led reviews and honest persistence.
// Calculation inputs come from the engine; this view does not re-score training.
function scoreEvidence(m){
  const rows=m.evidenceRows,reviewed=rows.filter(r=>r.score!==null);
  return `<section class="card score-evidence"><div class="section-kicker"><span>Behind your score</span><span class="info-label">Current model · v2</span></div><h2>Score calculation</h2><p>Your score uses reviewed sessions, weighted by their purpose and how recent they are.</p>${reviewed.length?`<div class="score-equation" aria-label="Score calculation"><span><b>${m.execution.toFixed(1)}</b><small>Weighted execution</small></span><span aria-hidden="true">−</span><span><b>${m.missedPenalty}</b><small>Missed-session adjustment</small></span><span aria-hidden="true">=</span><span><b>${m.progress}</b><small>BUILD Progress*</small></span></div><p class="fine-print">*Rounded after adjustment, limited to 0–100. An explicitly missed session has a review score of 15 and also adds an adjustment: 4 points for key work, 1 for other work, capped at 12. This model is not a validated measure of race readiness.</p>`:'<p class="evidence-empty">No score yet. Review completed work below; a missing review is not a missed session.</p>'}<details class="evidence-detail"><summary>Session-by-session evidence · ${reviewed.length} reviewed / ${rows.length} due</summary><p>Share is each reviewed session’s portion of the weighted average, before the missed-session adjustment. Older weeks retain 90% of their weight per week. Percentages are rounded.</p><div class="evidence-rows">${rows.length?rows.map(r=>{const s=plan.sessions.find(s=>skey(s)===r.key);return `<button class="evidence-row" ${runAction(s)}><span><strong>${escapeHTML(s.title)}</strong><small>W${s.week} · ${escapeHTML(s.day)} · ${escapeHTML(typeName(s.type))}${isKey(s)?' · Key session':''}</small><small>Impact ${r.impact.toFixed(2)} × recency ${r.recency.toFixed(2)}</small></span><span class="evidence-value"><b>${r.score===null?'—':r.score+' / 100'}</b><small>${r.score===null?'Review needed':(r.share*100).toFixed(1)+'% share'}</small><small>${r.score===null?'Not scored':'Edit review'} →</small></span></button>`}).join(''):'<p>No sessions are due yet. Your future plan does not count against you.</p>'}</div></details><p class="fine-print">This score reflects delivery of the original plan—not effort, personal worth or whether an adaptation was the right decision. Protect recovery; do not chase the score.</p></section>`;
}
const evidenceProgressSummary=progressSummary;
progressSummary=function(m){return evidenceProgressSummary(m)+(state.screen==='progress'?scoreEvidence(m):'')};

const evidenceSessionSheet=sessionSheet;
sessionSheet=function(s){
  const purpose=running(s)&&isKey(s)?'<div class="purpose-check"><b>Session purpose</b><p>Whole-run average pace cannot verify repetitions or a fast-finish block. Compare the prescribed work with what you actually completed; record useful detail in Notes.</p></div>':'';
  return evidenceSessionSheet(s).replace('<div class="question">',purpose+'<div class="question">').replace('<summary>Add context (optional)</summary>','<summary>Add context (optional)</summary><p class="adaptation-guidance">Changed the session? Note what changed and why—for example recovery, a coach’s adjustment, conditions or time available. Modified currently scores 58 regardless of the reason; it does not mean the decision was wrong.</p>').replace('placeholder="Anything the numbers do not tell us?"','placeholder="What changed, why, and did the key work feel controlled?"');
};

const persistenceOnboarding=onboarding;
onboarding=function(){return persistenceOnboarding().replace('<button class="primary full" id="onboardImport">','<p class="local-data-notice">Saved in this browser, not across devices. Export a backup before moving devices.</p><button class="primary full" id="onboardImport">')};
const persistenceSettings=settingsView;
settingsView=function(){return persistenceSettings().replace('A backup carries them to another device or app address.','A backup carries them to another device or app address. Clearing browser data can remove your build. Strava sync is not a backup of your plan or reviews.')};

function updateNetworkNotice(){
  const notice=document.getElementById('networkNotice');
  if(notice){notice.hidden=navigator.onLine!==false;notice.textContent='Offline · You can review saved training in this browser. Strava sync needs a connection. Download a backup when you can.'}
}
const evidenceHeader=header;
header=function(){return evidenceHeader()+'<div id="networkNotice" class="network-notice" role="status" '+(navigator.onLine===false?'':'hidden')+'>'+(navigator.onLine===false?'Offline · You can review saved training in this browser. Strava sync needs a connection. Download a backup when you can.':'')+'</div>'};
window.addEventListener('online',updateNetworkNotice);
window.addEventListener('offline',updateNetworkNotice);
function importedWeekContext(week){
  const sessions=plan.sessions.filter(s=>s.week===week),targets=[...new Set(sessions.filter(s=>s.weeklyTargetKm!=null).map(s=>s.weeklyTargetKm))],phases=[...new Set(sessions.map(s=>s.phase).filter(Boolean))],goals=[...new Set(sessions.map(s=>s.weekGoal).filter(Boolean))],focus=[...new Set(sessions.map(s=>s.weekFocus).filter(Boolean))],missing=sessions.filter(s=>running(s)&&s.distanceKm==null).length;
  if(!targets.length&&!phases.length&&!goals.length&&!focus.length&&!missing)return '';
  return `<section class="card imported-week"><span class="eyebrow">FROM YOUR IMPORTED PLAN</span>${phases.length?`<h2>${escapeHTML(phases.join(' / '))}</h2>`:''}${targets.length?`<p><b>${targets.map(numKm).join(' / ')} km</b> weekly target${targets.length>1?' (multiple values supplied)':''}</p>`:''}${goals.map(x=>`<p>${escapeHTML(x)}</p>`).join('')}${focus.map(x=>`<p><b>Week focus:</b> ${escapeHTML(x)}</p>`).join('')}${missing?`<p class="fine-print">${missing} session${missing===1?' has':'s have'} no total distance specified. Distance totals are partial.</p>`:''}</section>`;
}
const importedPlanView=planView;
planView=function(){return importedPlanView().replace('<div class="week-nav">',importedWeekContext(state.week)+'<div class="week-nav">')};
const importedWeekCard=weekCard;
weekCard=function(week){return importedWeekCard(week)+importedWeekContext(week)};
const importedSessionSheet=sessionSheet;
sessionSheet=function(s){
  if(s.type==='rest')return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Rest day"><div class="panel"><div class="handle"></div><button class="sheet-close icon-button" data-close aria-label="Close rest day">${glyph('close')}</button><span class="eyebrow">REST / OPTIONAL RECOVERY</span><h2>${escapeHTML(s.title)}</h2><p>${escapeHTML(s.target)}</p><p class="fine-print">No execution review is required. This entry is excluded from BUILD Progress and forecast evidence. Any optional run remains available in Runs.</p><button class="secondary full" data-close>Back to my plan</button></div></div>`;
  return importedSessionSheet(s).replace('<b>As prescribed</b>','<b>Distance not specified</b>').replace('<div class="question">',(s.type==='race'?'<p class="fine-print">Race-day reviews do not change your training execution score or its forecast evidence.</p>':'')+'<div class="question">');
};
const importedSessionStatus=sessionStatus;
sessionStatus=function(s){return s.type==='rest'?{a:null,run:null,label:'Rest / optional · no review needed'}:importedSessionStatus(s)};
render();

// Recorded measurements, interpretation and evidence gaps remain distinct.
const measuredSessionSheet=sessionSheet;
sessionSheet=function(session){
  const activity=activities.find(a=>a.id===(state.pendingActivityId||assessed(session)?.activityId));
  const evidence=BuildSessionEvidence.describe(session,activity);
  const provenance=session.originalType?`<p class="fine-print">Import classification: ${escapeHTML(typeName(session.originalType))} → ${escapeHTML(typeName(session.type))}. ${escapeHTML(session.classificationNote||'Changed during import review.')}</p>`:'';
  const savedReview=assessed(session),different=activity&&savedReview&&((savedReview.actualDistanceKm!=null&&savedReview.actualDistanceKm!==activity.distanceKm)||(savedReview.movingSeconds!=null&&savedReview.movingSeconds!==activity.movingSeconds));
  const sourceNote=different?'<p class="source-note">The recording and saved review differ. Comparison fields retain your saved values; observations use the latest recording. Your outcome and notes have not been changed.</p>':'';
  const block=evidence?`<section class="session-evidence" aria-label="Workout evidence"><h3>What the data shows</h3><span class="eyebrow">OBSERVED</span><ul>${evidence.observed.map(text=>`<li>${escapeHTML(text)}</li>`).join('')}</ul><span class="eyebrow">INTERPRETATION</span><p>${escapeHTML(evidence.interpretation)}</p><details><summary>Evidence limits</summary>${evidence.limits.map(text=>`<p>${escapeHTML(text)}</p>`).join('')}</details></section>`:'';
  return measuredSessionSheet(session).replace('<div class="question">',provenance+sourceNote+block+'<div class="question">');
};
render();
