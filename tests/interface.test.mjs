import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
const root=new URL('../app/',import.meta.url);
const TestDate=class extends Date {constructor(...args){super(...(args.length?args:['2026-10-15T12:00:00Z']))}static now(){return Date.parse('2026-10-15T12:00:00Z')}};
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
function loadApp(saved={},api=null){
 const html=fs.readFileSync(new URL('index.html',root),'utf8'),{document,window}=parseHTML(html);
 window.HTMLElement.prototype.focus=function(){document._focus=this};
 const storage=new Map(Object.entries(saved).map(([k,v])=>[k,JSON.stringify(v)]));
 const listeners={},requests=[];
 const context=vm.createContext({console,document,MutationObserver:window.MutationObserver,navigator:{},location:{hostname:'build.example',protocol:'https:',search:'',pathname:'/',hash:'',reload(){},assign(){}},history:{replaceState(){}},window:{addEventListener(name,fn){listeners[name]=fn}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},structuredClone,Date:TestDate,URL,Blob,crypto,TextEncoder,TextDecoder,URLSearchParams,AbortSignal,Response,Request,confirm:()=>true,setTimeout:(fn,ms)=>{const t=setTimeout(fn,ms);t.unref();return t},clearTimeout,fetch:async(url,options)=>{requests.push({url,options});if(api)return api(url,options);return new Response(JSON.stringify({app:'BUILD',stravaConfigured:false}),{headers:{'Content-Type':'application/json'}})}});
 const files=[...html.matchAll(/<script src="([^"]+)"/g)].map(x=>x[1]);
 for(const name of files)vm.runInContext(fs.readFileSync(new URL(name,root),'utf8'),context,{filename:name});
 return {document,window,storage,context,listeners,requests,run:code=>vm.runInContext(code,context),click:selector=>{const el=document.querySelector(selector);assert.ok(el,'Element exists: '+selector);el.dispatchEvent(new window.Event('click'))},fill:(selector,value)=>{const el=document.querySelector(selector);assert.ok(el,'Field exists: '+selector);el.value=value}};
}
const fixture={id:'test',name:'Coach plan',race:'Spring Marathon',goal:'3:15:00',weeks:2,startDate:'2026-10-12',raceDate:'2026-10-25',currentWeek:1,sessions:[{week:1,day:'Sun',type:'long',title:'24 km endurance',distanceKm:24,target:'Easy effort',objective:'Build durability.'},{week:1,day:'Tue',type:'interval',title:'5 × 1 km',distanceKm:12,target:'Controlled reps, 90s jog',objective:'Build running economy.'},{week:1,day:'Thu',type:'easy',title:'8 km easy',distanceKm:8,target:'Conversational',objective:'Recover between key sessions.'},{week:2,day:'Mon',type:'strength',title:'Strength',target:'Normal routine',objective:'Support the build.'}]};
test('score evidence reconciles to the engine and opens the exact review',()=>{
 const app=loadApp(existing());app.run("Date=class extends Date {constructor(...args){super(...(args.length?args:['2026-10-26T12:00:00Z']))}};assessments[skey(plan.sessions[0])]={score:100,at:new Date().toISOString()};assessments[skey(plan.sessions[1])]={score:15,at:new Date().toISOString()};state.screen='progress';render()");
 const m=app.run('metrics()');assert.equal(m.missedPenalty,4);assert.equal(m.progress,Math.round(m.execution-4));assert.ok(Math.abs(m.evidenceRows.reduce((n,r)=>n+r.share,0)-1)<1e-10);assert.equal(m.evidenceRows.filter(r=>r.score===null).length,2);assert.equal(app.document.querySelectorAll('.evidence-row').length,4);assert.ok(app.document.querySelector('.score-equation').textContent.includes(String(m.progress)));
 app.click('.evidence-row');assert.equal(app.run('state.selected.title'),'24 km endurance');app.click('[data-rate="mostly"]');app.click('#saveReview');assert.equal(app.run('metrics().evidenceRows[0].score'),84);
});
test('empty evidence and future sessions never invent a score',()=>{
 const app=loadApp(existing());app.run("BuildCalendar.today=()=> '2026-10-15';state.screen='progress';render()");assert.equal(app.document.querySelector('.score-equation'),null);assert.equal(app.document.querySelectorAll('.evidence-row').length,2);assert.ok(app.document.querySelector('.evidence-empty').textContent.includes('No score yet'));assert.equal(app.run('metrics().execution'),null);
});
test('adaptation context is optional, saved and preserved through backup validation',()=>{
 const app=loadApp(existing());app.run("state.selected=plan.sessions[0];render()");assert.ok(app.document.querySelector('.purpose-check'));assert.ok(app.document.querySelector('.adaptation-guidance').textContent.includes('regardless of the reason'));app.fill('#reviewNotes','Coach adjustment: 20 km easy to protect recovery.');app.click('[data-rate="modified"]');app.click('#saveReview');assert.equal(app.run('Object.values(assessments)[0].score'),58);assert.equal(app.run('BuildData.backup({format:"BUILD_BACKUP",version:1,plan,activities,assessments,profile}).assessments[skey(plan.sessions[0])].notes'),'Coach adjustment: 20 km easy to protect recovery.');
});
test('local storage is disclosed before import and offline notice does not discard an open review',()=>{
 const fresh=loadApp();assert.ok(fresh.document.querySelector('.local-data-notice').textContent.includes('not across devices'));
 const app=loadApp(existing());app.run("state.selected=plan.sessions[1];render()");app.fill('#reviewNotes','Unsaved context');app.run('navigator.onLine=false');app.listeners.offline();assert.equal(app.document.querySelector('#networkNotice').hidden,false);assert.equal(app.document.querySelector('#reviewNotes').value,'Unsaved context');app.run('navigator.onLine=true;updateNetworkNotice()');assert.equal(app.document.querySelector('#networkNotice').hidden,true);assert.equal(app.document.querySelector('#reviewNotes').value,'Unsaved context');
});
function existing(extra={}){return {'build.plan':fixture,'build.profile':{onboarded:true,name:'Runner',source:'strava-api'},...extra}}
test('import calculates start when race date is entered after opening and responds to weeks',()=>{
 const app=loadApp();app.run('previewPlan(BuildData.plan({weeks:12,sessions:[{week:1,day:"Mon",title:"Easy",type:"easy"}]}))');
 assert.equal(app.document.querySelector('#importRaceDate').value,'');assert.equal(app.document.querySelector('#manualPlanStart').checked,false);
 app.fill('#importRaceDate','2027-04-25');app.document.querySelector('#importRaceDate').dispatchEvent(new app.window.Event('input'));assert.equal(app.document.querySelector('#importStart').value,'2027-02-01');
 app.fill('#importWeeks','13');app.document.querySelector('#importWeeks').dispatchEvent(new app.window.Event('input'));assert.equal(app.document.querySelector('#importStart').value,'2027-01-25');
 app.document.querySelector('#manualPlanStart').checked=true;app.document.querySelector('#manualPlanStart').dispatchEvent(new app.window.Event('change'));app.fill('#importStart','2027-01-20');app.fill('#importWeeks','14');app.document.querySelector('#importWeeks').dispatchEvent(new app.window.Event('input'));assert.equal(app.document.querySelector('#importStart').value,'2027-01-20');
 app.document.querySelector('#manualPlanStart').checked=false;app.document.querySelector('#manualPlanStart').dispatchEvent(new app.window.Event('change'));assert.equal(app.document.querySelector('#importStart').value,'2027-01-18');app.click('#confirmPlan');assert.equal(app.run('plan.startDate'),'2027-01-18');assert.equal(app.run('plan.weeks'),14);
});
test('settings calculates start on opening and recalculates before save',()=>{
 const app=loadApp(existing());app.run('plan.weeks=12;plan.raceDate="2027-04-25";delete plan.startDate;state.screen="settings";render()');app.click('#editGoals');assert.equal(app.document.querySelector('#editStartDate').value,'2027-02-01');
 app.fill('#editPlanWeeks','13');app.document.querySelector('#editPlanWeeks').dispatchEvent(new app.window.Event('input'));assert.equal(app.document.querySelector('#editStartDate').value,'2027-01-25');app.fill('#editPlanWeeks','14');app.click('#saveGoal');assert.equal(app.run('plan.startDate'),'2027-01-18');assert.equal(app.run('plan.weeks'),14);
});
test('Strava setup never navigates to old BUILD and configured connect stays on this origin',async()=>{
 let configured=false;const app=loadApp(existing(),async url=>new Response(JSON.stringify(url==='/api/health'?{app:'BUILD',stravaConfigured:configured}:{error:'unauthorized'}),{status:url==='/api/health'?200:401,headers:{'Content-Type':'application/json'}}));await flush();assert.equal(app.document.querySelector('#stravaConnection a'),null);assert.ok(app.document.querySelector('#retryConnection'));
 const before=app.storage.get('build.plan');configured=true;app.click('#retryConnection');await flush();await flush();assert.equal(app.document.querySelector('#connectStrava').getAttribute('href'),'/api/strava/connect');assert.equal(app.storage.get('build.plan'),before);
});
test('uploaded complete plan reaches preview, saves all rows and survives reload',{skip:!process.env.BUILD_IMPORT_TEST_FILE},async()=>{
 const source=fs.readFileSync(process.env.BUILD_IMPORT_TEST_FILE,'utf8'),app=loadApp(existing());
 const input=app.document.querySelector('#planCsvFileInput');Object.defineProperty(input,'files',{configurable:true,value:[{size:Buffer.byteLength(source),text:async()=>source}]});input.dispatchEvent(new app.window.Event('change'));await flush();
 assert.ok(app.document.querySelector('#confirmPlan'),'Exact uploaded CSV reaches confirmation');assert.equal(app.document.querySelectorAll('#importWeekPreview details').length,12);assert.ok(app.document.querySelector('#importWeekPreview').textContent.includes('partial'));
 app.click('#confirmPlan');await flush();assert.equal(app.run('plan.sessions.length'),84);assert.equal(app.run('plan.sessions.filter(s=>s.distanceKm!=null).length'),61);assert.equal(app.run('plan.sessions.filter(s=>s.type==="steady").length'),2);assert.equal(app.run('plan.sessions.find(s=>s.type==="race").title'),'London Marathon');app.run('state.week=1;render()');assert.ok(app.document.querySelector('.imported-week').textContent.includes('82 km'));
 const saved=Object.fromEntries([...app.storage].filter(([k])=>['build.plan','build.activities','build.assessments','build.profile'].includes(k)).map(([k,v])=>[k,JSON.parse(v)])),again=loadApp(saved);
 assert.equal(again.run('plan.sessions.length'),84);assert.equal(again.run('plan.sessions[0].weeklyTargetKm'),82);assert.equal(again.run('plan.sessions[0].phase'),'Build');assert.equal(again.run('BuildData.backup({format:"BUILD_BACKUP",version:1,plan,activities,assessments,profile}).plan.sessions[0].weekFocus'),'Aerobic long run only.');
 again.run('state.selected=plan.sessions.find(s=>s.type==="rest");render()');assert.equal(again.document.querySelector('#saveReview'),null);assert.ok(again.document.querySelector('.sheet').textContent.includes('No execution review'));again.click('[data-close]');again.run('state.selected=plan.sessions.find(s=>s.type==="interval");render()');assert.ok(again.document.querySelector('.planned-actual').textContent.includes('Distance not specified'));
});
test('race and rest entries cannot distort progress or forecast evidence',()=>{
 const app=loadApp(existing());app.run('plan.sessions.push({week:1,day:"Mon",type:"race",title:"Race",target:"Race",objective:"Race"},{week:1,day:"Mon",type:"rest",title:"Rest",target:"Rest",objective:"Recovery"});plan.sessions.filter(s=>["race","rest"].includes(s.type)).forEach(s=>assessments[skey(s)]={score:15,at:new Date().toISOString()});render()');assert.equal(app.run('metrics().assessedCount'),0);assert.equal(app.run('metrics().missedPenalty'),0);assert.equal(app.run('weekStats(1).score'),null);
});
test('first visit explains imported-plan progress, offers restore, and labels example data',async()=>{
 const app=loadApp();await flush();assert.ok(app.document.querySelector('#onboardImport').textContent.includes('Import my plan'));assert.ok(app.document.querySelector('#restoreBackup'));assert.equal(app.document.querySelector('#onboardGenerate'),null);
 app.click('#onboardExample');await flush();assert.ok(app.document.querySelector('#confirmPlan'));assert.equal(app.run('profile.onboarded'),false);app.click('#confirmPlan');await flush();assert.equal(app.run('profile.onboarded'),true);assert.ok(app.document.querySelector('.example-label'));
});
test('plan preview is reversible, valid import preserves activities, and timeline contains all weekdays',async()=>{
 const app=loadApp(existing({'build.activities':[{id:'run',name:'Morning',date:'2026-10-15',distanceKm:8,movingSeconds:2400,source:'strava-api'}]}));
 app.run("BuildCalendar.today=()=> '2026-10-15';state.screen='plan';state.week=1;render()");await flush();
 assert.equal(app.document.querySelectorAll('.session-row').length,3,'Full week includes Tue and Thu as well as Sunday');
 const rows=[...app.document.querySelectorAll('.session-copy strong')].map(x=>x.textContent);assert.deepEqual(rows,['5 × 1 km','8 km easy','24 km endurance']);
 const before=app.storage.get('build.plan');app.run('previewPlan(structuredClone(plan))');app.click('#cancelWorkflow');assert.equal(app.storage.get('build.plan'),before);
 app.run('previewPlan(structuredClone(plan))');app.fill('#importName','Imported coach plan');app.click('#confirmPlan');await flush();assert.equal(app.run('plan.name'),'Imported coach plan');assert.equal(app.run('activities.length'),1);assert.equal(app.run('Object.keys(assessments).length'),0);
 const after=app.storage.get('build.plan');const input=app.document.querySelector('#planFileInput');Object.defineProperty(input,'files',{configurable:true,value:[{size:12,text:async()=>'{bad json'}]});input.dispatchEvent(new app.window.Event('change'));await flush();assert.equal(app.storage.get('build.plan'),after);assert.ok(app.document.querySelector('#notice').textContent.length>0);
});
test('synced runs match automatically, saving a review updates progress, and corrections stay available',async()=>{
 const app=loadApp(existing({'build.activities':[{id:'r1',name:'Easy run',date:'2026-10-15',distanceKm:8.1,movingSeconds:2500,source:'strava-api'}]}));app.run("BuildCalendar.today=()=> '2026-10-15';state.screen='today';render()");await flush();
 assert.ok(app.document.querySelector('.review-callout').textContent.includes('Automatically matched'));assert.equal(app.run('Object.keys(assessments).length'),0);
 app.click('[data-activity="r1"]');await flush();assert.ok(app.document.querySelector('.planned-actual').textContent.includes('8.1 km'));assert.ok(app.document.querySelector('#correctMatch'));
 app.click('#saveReview');assert.equal(app.run('Object.keys(assessments).length'),0,'No default score is silently awarded');
 app.click('[data-rate="nailed"]');app.click('#saveReview');await flush();assert.equal(app.run('Object.values(assessments)[0].activityId'),'r1');assert.equal(app.run('Object.values(assessments)[0].score'),100);assert.equal(app.run('metrics().progress'),100);assert.equal(app.run('metrics().forecast'),null,'One review cannot unlock a forecast');assert.equal(app.document.querySelector('.sheet'),null);assert.ok(app.document.querySelector('#notice').textContent.includes('Review saved'));
 app.run("state.screen='inbox';render()");app.click('[data-session]');await flush();app.click('#correctMatch');await flush();assert.ok(app.document.querySelector('#otherMatch'));assert.equal(app.run('Object.keys(assessments).length'),1,'Opening a correction does not discard a saved review');
});
test('strength review stays simple and saved data survives a reload',async()=>{
 const app=loadApp(existing());app.run("state.screen='plan';state.week=2;render()");app.click('[data-session]');assert.equal(app.document.querySelector('#reviewDistance').type,'hidden');assert.equal(app.document.querySelectorAll('[data-rate]').length,3);app.click('[data-rate="modified"]');app.click('#saveReview');await flush();
 const values=Object.fromEntries([...app.storage].filter(([k])=>['build.plan','build.activities','build.profile','build.assessments'].includes(k)).map(([k,v])=>[k,JSON.parse(v)]));const reloaded=loadApp(values);assert.equal(reloaded.run('Object.values(assessments)[0].score'),58);
});
test('all navigation screens render, future browsing does not change metrics, trend weeks are interactive',async()=>{
 const app=loadApp(existing());app.run("BuildCalendar.today=()=> '2026-10-15';render()");const before=app.run('JSON.stringify(metrics())');
 app.click('[data-nav="plan"]');app.click('[data-week="2"]');assert.equal(app.run('JSON.stringify(metrics())'),before);app.click('[data-nav="progress"]');assert.ok(app.document.body.textContent.includes('not a predicted finish time'));app.click('[data-trend-week="1"]');assert.ok(app.document.querySelector('#trendDetail').textContent.includes('Week 1:'));app.click('[data-nav="inbox"]');assert.ok(app.document.querySelector('.manual-import'));assert.equal(app.document.querySelector('.manual-import').hasAttribute('open'),false);app.click('[data-nav="settings"]');assert.ok(app.document.querySelector('#restoreBackup'));app.click('#editGoals');assert.ok(app.document.querySelector('#saveGoal'));app.click('#cancelWorkflow');await flush();assert.equal(app.document.querySelector('.sheet'),null);
});
test('automatic sync deduplicates, preserves active reviews, and refreshes when returning',async()=>{
 let calls=0;const api=async(url)=>new Response(JSON.stringify(url==='/api/health'?{app:'BUILD',stravaConfigured:true}:{connected:true,athlete:{firstname:'Andy'},activities:[{id:'synced',name:'Easy run',date:'2026-10-15',distanceKm:8,movingSeconds:2400,source:'strava-api'}]}),{headers:{'Content-Type':'application/json'}});
 const app=loadApp(existing(),async(...args)=>{if(args[0].endsWith('/activities'))calls++;return api(...args)});await flush();await flush();assert.equal(calls,1);assert.equal(app.run('activities.length'),1);assert.ok(app.document.querySelector('#syncStrava'));
 app.run("state.selected=plan.sessions[1];render()");app.listeners.online();await flush();assert.equal(app.run('activities.length'),1);assert.ok(app.document.querySelector('.sheet'),'Background sync preserves a review in progress');assert.ok(calls>=2);
 app.click('[data-close]');const beforeReturn=calls;app.run('Date=class extends Date {static now(){return super.now()+301000}}');Object.defineProperty(app.document,'visibilityState',{value:'visible'});app.document.dispatchEvent(new app.window.Event('visibilitychange'));await flush();assert.ok(calls>beforeReturn);assert.equal(app.run('activities.length'),1);
});
test('unconfigured private connection is explicit and does not falsely claim Strava is connected',async()=>{
 const app=loadApp(existing());await flush();assert.ok(app.document.querySelector('#stravaConnection').textContent.includes('Strava setup needed'));assert.equal(app.document.querySelector('#connectStrava'),null);assert.equal(app.document.querySelector('#syncStrava'),null);
});
test('correcting a saved match moves its contribution once, and storage failure restores the previous review',async()=>{
 const oldKey='1|Thu|8 km easy',run={id:'r1',name:'Run',date:'2026-10-15',distanceKm:8,movingSeconds:2400,source:'strava-api'};
 const app=loadApp(existing({'build.activities':[run],'build.assessments':{[oldKey]:{score:100,label:'Nailed it',at:new Date().toISOString(),notes:'',activityId:'r1',actualDistanceKm:8,movingSeconds:2400}}}));
 app.run("state.screen='inbox';render()");app.click('[data-session]');app.click('#correctMatch');app.run("beginMatch('1|Tue|5 × 1 km')");app.click('[data-rate="mostly"]');
 app.run("const realSet=localStorage.setItem;let failNextSave=true;localStorage.setItem=(k,v)=>{if(k==='build.assessments'&&failNextSave){failNextSave=false;throw Error('disk full')}realSet(k,v)}");app.click('#saveReview');assert.equal(app.run('Object.keys(assessments).length'),1);assert.equal(app.run("assessments['1|Thu|8 km easy'].activityId"),'r1');assert.equal(app.run("assessments['1|Tue|5 × 1 km']"),undefined);
 app.click('#saveReview');await flush();assert.equal(app.run('Object.keys(assessments).length'),1);assert.equal(app.run("assessments['1|Thu|8 km easy']"),undefined);assert.equal(app.run("assessments['1|Tue|5 × 1 km'].score"),84);assert.equal(app.run('BuildData.backup({format:"BUILD_BACKUP",version:1,plan,activities,assessments,profile}).activities.length'),1);
});
test('existing BUILD backup restores through the file workflow after preview and confirmation',async()=>{
 const app=loadApp(),backup={format:'BUILD_BACKUP',version:1,plan:fixture,activities:[],assessments:{},profile:{onboarded:true,name:'Andy',source:'manual'}};
 const input=app.document.querySelector('#backupFileInput');Object.defineProperty(input,'files',{configurable:true,value:[{size:100,text:async()=>JSON.stringify(backup)}]});input.dispatchEvent(new app.window.Event('change'));await flush();assert.ok(app.document.querySelector('#confirmRestore'));assert.equal(app.run('profile.onboarded'),false);app.click('#confirmRestore');await flush();assert.equal(app.run('plan.id'),'test');assert.equal(app.run('profile.name'),'Andy');assert.ok(app.document.querySelector('.race-banner'));assert.equal(app.document.querySelector('.onboard-intro'),null);
});

test('plan filters preserve the build, show an empty state, and return to the current week',async()=>{
 const app=loadApp(existing());app.run("BuildCalendar.today=()=> '2026-10-15';state.screen='plan';state.week=1;render()");
 const before=app.run('JSON.stringify({plan,assessments,activities})');
 app.click('[data-plan-filter="key"]');assert.equal(app.document.querySelectorAll('.session-row').length,2);
 app.click('[data-plan-filter="review"]');assert.equal(app.document.querySelectorAll('.session-row').length,2);
 app.click('[data-week="2"]');assert.equal(app.document.querySelectorAll('.session-row').length,0);assert.ok(app.document.body.textContent.includes('Nothing in this view.'));
 app.click('#currentWeek');assert.equal(app.run('state.week'),1);assert.equal(app.run('state.planFilter'),'all');assert.equal(app.document.querySelectorAll('.session-row').length,3);assert.equal(app.run('JSON.stringify({plan,assessments,activities})'),before);
});
test('forecast requirements reflect actual evidence and unlock only after sufficient reviewed work',async()=>{
 const expanded=structuredClone(fixture);expanded.sessions.push({week:1,day:'Mon',type:'easy',title:'Recovery jog',distanceKm:5,target:'Easy',objective:'Recovery'});
 const app=loadApp({'build.plan':expanded,'build.profile':{onboarded:true,name:'Andy'}});app.run("BuildCalendar.today=()=> '2026-10-26';state.screen='progress';render()");
 assert.equal(app.document.querySelectorAll('.evidence-checklist li.complete').length,0);assert.equal(app.document.querySelector('.forecast-signal'),null);
 app.run("plan.sessions.filter(s=>s.week===1).forEach(s=>assessments[skey(s)]={score:84,at:new Date().toISOString()});render()");
 assert.equal(app.run('metrics().forecast'),84);assert.ok(app.document.querySelector('.forecast-signal'));assert.equal(app.document.querySelector('.evidence-checklist'),null);assert.ok(app.document.body.textContent.includes('not a predicted finish time'));
});
test('matched-run review cannot select missed and keeps synced numbers prefilled',async()=>{
 const app=loadApp(existing({'build.activities':[{id:'r2',name:'Easy run',date:'2026-10-15',distanceKm:8.2,movingSeconds:2580,source:'strava-api'}]}));app.run("BuildCalendar.today=()=> '2026-10-15';render()");app.click('[data-activity="r2"]');
 assert.equal(app.document.querySelector('[data-rate="missed"]'),null);assert.equal(app.document.querySelector('#reviewDistance').value,'8.2');assert.equal(app.document.querySelector('#reviewTime').value,'00:43:00');
 app.click('[data-rate="mostly"]');app.click('#saveReview');await flush();assert.equal(app.run('Object.values(assessments)[0].score'),84);assert.equal(app.run('Object.values(assessments)[0].actualDistanceKm'),8.2);assert.ok(app.document.querySelector('#notice').classList.contains('visible'));
});
test('workflow close buttons and Escape dismiss dialogs without changing data',async()=>{
 const app=loadApp(existing());app.run("state.screen='settings';render()");app.click('#editGoals');await flush();assert.ok(app.document.body.classList.contains('has-sheet'));
 const before=app.storage.get('build.plan');app.fill('#editRace','Unsaved race');app.click('.sheet-close');await flush();assert.equal(app.storage.get('build.plan'),before);assert.equal(app.document.body.classList.contains('has-sheet'),false);
 app.click('#importPlan');await flush();const event=new app.window.Event('keydown');event.key='Escape';app.document.dispatchEvent(event);await flush();assert.equal(app.document.querySelector('.sheet'),null);assert.equal(app.storage.get('build.plan'),before);
});
test('expired connection offers reconnect without inventing a connection or runs',async()=>{
 const app=loadApp(existing(),async url=>url==='/api/health'?new Response(JSON.stringify({app:'BUILD',stravaConfigured:true}),{headers:{'Content-Type':'application/json'}}):new Response(JSON.stringify({error:'unauthorized'}),{status:401,headers:{'Content-Type':'application/json'}}));
 await flush();await flush();assert.ok(app.document.querySelector('#connectStrava'));assert.equal(app.document.querySelector('#syncStrava'),null);assert.equal(app.run('activities.length'),0);
});
test('rate-limited automatic sync keeps training and exposes a retry without a success message',async()=>{
 let limited=false;const oldKey='1|Thu|8 km easy';const app=loadApp(existing({'build.assessments':{[oldKey]:{score:84,at:new Date().toISOString()}},'build.activities':[{id:'saved',date:'2026-10-15',name:'Run',distanceKm:8,movingSeconds:2400,source:'strava-api'}]}),async url=>new Response(JSON.stringify(url==='/api/health'?{app:'BUILD',stravaConfigured:true}:limited?{error:'rate_limited'}:{connected:true,activities:[]}),{status:url!=='/api/health'&&limited?429:200,headers:{'Content-Type':'application/json'}}));
 await flush();await flush();const previous=app.run('JSON.stringify({activities,assessments})');limited=true;app.click('#syncStrava');await flush();await flush();assert.equal(app.run('JSON.stringify({activities,assessments})'),previous);assert.ok(app.document.querySelector('#stravaConnection').textContent.includes('Sync paused'));assert.ok(app.document.querySelector('#notice').textContent.includes('Strava is busy'));assert.equal(app.document.querySelector('#syncStrava').hasAttribute('disabled'),false);
});
test('connection-check failure is distinct from missing credentials and can be retried',async()=>{
 let offline=true;const app=loadApp(existing(),async()=>{if(offline)throw Error('offline');return new Response(JSON.stringify({app:'BUILD',stravaConfigured:false}),{headers:{'Content-Type':'application/json'}})});await flush();assert.ok(app.document.querySelector('#retryConnection'));assert.ok(app.document.querySelector('#stravaConnection').textContent.includes('Connection check unavailable'));assert.ok(!app.document.querySelector('#stravaConnection').textContent.includes('setup needed'));offline=false;app.click('#retryConnection');await flush();assert.ok(app.document.querySelector('#stravaConnection').textContent.includes('Strava setup needed'));
});
test('removing a run during match correction also removes its linked review and keeps backups valid',async()=>{
 const key='1|Thu|8 km easy',app=loadApp(existing({'build.activities':[{id:'r3',date:'2026-10-15',name:'Run',distanceKm:8,movingSeconds:2400,source:'strava-api'}],'build.assessments':{[key]:{score:84,at:new Date().toISOString(),activityId:'r3'}}}));app.run("state.screen='inbox';render()");app.click('[data-session]');app.click('#correctMatch');app.click('#deleteActivity');await flush();assert.equal(app.run('activities.length'),0);assert.equal(app.run('Object.keys(assessments).length'),0);assert.equal(app.run('BuildData.backup({format:"BUILD_BACKUP",version:1,plan,activities,assessments,profile}).activities.length'),0);
});

for(const format of ['json','csv'])test(`supplied ${format.toUpperCase()} plan preserves all 84 sessions through import, reload and restore`,async()=>{
 const source=fs.readFileSync(new URL(`../app/tests/fixtures/BUILD_12_week_marathon_plan.${format}`,import.meta.url),'utf8');
 const app=loadApp(),input=app.document.querySelector(format==='json'?'#planFileInput':'#planCsvFileInput');
 Object.defineProperty(input,'files',{value:[{size:Buffer.byteLength(source),text:async()=>source}]});input.dispatchEvent(new app.window.Event('change'));await flush();
 assert.ok(app.document.querySelector('#confirmPlan'));assert.equal(app.document.querySelectorAll('#importWeekPreview details').length,12);
 assert.equal(app.document.querySelectorAll('[data-import-change]').length,5);
 assert.equal(app.document.querySelector('#importRaceDate').value,'');
 assert.equal(app.document.querySelectorAll('[data-import-change]:checked').length,0,'Suggestions do not alter source types by default');
 app.click('#confirmPlan');await flush();assert.equal(app.run('plan.sessions.length'),84);assert.equal(app.run('plan.sessions.filter(s=>s.distanceKm!=null).length'),61);
 const canonical=JSON.parse(fs.readFileSync(new URL('../app/tests/fixtures/BUILD_12_week_marathon_plan.json',import.meta.url),'utf8'));
 assert.deepEqual(JSON.parse(app.run('JSON.stringify(plan.sessions)')),canonical.sessions,'Every supplied session field survives unchanged');
 const expected=app.run('JSON.stringify(plan.sessions)');assert.equal(app.run('plan.sessions.find(s=>s.title==="London Marathon").type'),'long');
 assert.equal(app.run('plan.sessions.filter(s=>s.originalType).length'),0);
 if(format==='json'){assert.equal(app.run('plan.goal'),'2:39:59');assert.equal(app.run('plan.id'),'andrew-london-240-12wk')}
 const saved=Object.fromEntries([...app.storage].filter(([k])=>['build.plan','build.activities','build.assessments','build.profile'].includes(k)).map(([k,v])=>[k,JSON.parse(v)]));
 const reloaded=loadApp(saved);assert.equal(reloaded.run('JSON.stringify(plan.sessions)'),expected);
 const validated=JSON.parse(reloaded.run('JSON.stringify(BuildData.backup({format:"BUILD_BACKUP",version:1,plan,activities,assessments,profile}))'));
 const restored=loadApp(Object.fromEntries(Object.entries(validated).map(([key,value])=>['build.'+key,value])));
 assert.equal(restored.run('JSON.stringify(plan.sessions)'),expected);assert.equal(restored.run('plan.startDate'),undefined);
});
test('import classification choices are reversible, explicit and retain provenance in backups',()=>{
 const source=JSON.parse(fs.readFileSync(new URL('../app/tests/fixtures/BUILD_12_week_marathon_plan.json',import.meta.url),'utf8'));
 const app=loadApp(existing());app.run(`previewPlan(${JSON.stringify(source)})`);
 const before=app.storage.get('build.plan');
 for(const input of app.document.querySelectorAll('[data-import-change]')){input.checked=true;input.dispatchEvent(new app.window.Event('change'))}
 const first=app.document.querySelector('[data-import-change]');first.checked=false;first.dispatchEvent(new app.window.Event('change'));first.checked=true;first.dispatchEvent(new app.window.Event('change'));
 assert.equal(app.storage.get('build.plan'),before,'Reviewing changes never writes the plan');
 app.click('#confirmPlan');assert.equal(app.run('plan.sessions.filter(s=>s.originalType).length'),5);
 assert.equal(app.run('plan.sessions.find(s=>s.title==="London Marathon").type'),'race');assert.equal(app.run('plan.sessions.find(s=>s.title==="London Marathon").originalType'),'long');
 assert.equal(app.run('plan.sessions.filter(s=>s.type==="steady").length'),2);
 assert.equal(app.run('plan.sessions.filter(s=>s.distanceKm!=null).length'),61);
 assert.equal(app.run('BuildData.backup({format:"BUILD_BACKUP",version:1,plan,activities,assessments,profile}).plan.sessions.filter(s=>s.originalType).length'),5);
 app.run('state.selected=plan.sessions.find(s=>s.type==="rest");render()');assert.equal(app.document.querySelector('#saveReview'),null);
});
test('provider updates refresh an existing run but preserve saved reviews and manual runs',async()=>{
 const key='1|Thu|8 km easy';let changed=false;
 const response=()=>({connected:true,activities:[{id:'r1',name:changed?'Corrected title':'Run',date:'2026-10-15',distanceKm:changed?8.4:8,movingSeconds:changed?2520:2400,source:'strava-api'},{id:'manual',name:'Provider collision',date:'2026-10-15',distanceKm:20,movingSeconds:5000,source:'strava-api'}]});
 const app=loadApp(existing({'build.activities':[{id:'r1',name:'Run',date:'2026-10-15',distanceKm:8,movingSeconds:2400,source:'strava-api'},{id:'manual',name:'My run',date:'2026-10-15',distanceKm:5,movingSeconds:1800,source:'manual'}],'build.assessments':{[key]:{score:84,at:'2026-10-15T14:00:00Z',activityId:'r1',actualDistanceKm:8,notes:'Keep my assessment'}}}),async url=>new Response(JSON.stringify(url==='/api/health'?{app:'BUILD',stravaConfigured:true}:response()),{headers:{'Content-Type':'application/json'}}));
 await flush();await flush();const review=app.run('JSON.stringify(assessments)');changed=true;app.click('#syncStrava');await flush();await flush();
 assert.equal(app.run('activities.length'),2);assert.equal(app.run('activities.find(a=>a.id==="r1").distanceKm'),8.4);assert.equal(app.run('activities.find(a=>a.id==="manual").name'),'My run');assert.equal(app.run('JSON.stringify(assessments)'),review);
 assert.ok(app.document.querySelector('#notice').textContent.includes('1 run updated'));
 app.run('state.selected=plan.sessions.find(s=>s.day==="Thu");render()');assert.ok(app.document.querySelector('.source-note').textContent.includes('Comparison fields retain your saved values'));assert.equal(app.document.querySelector('#reviewDistance').value,'8');
});
test('workout observations identify limitations without assigning a score',()=>{
 const app=loadApp(existing({'build.activities':[{id:'evidence',name:'Repetitions',date:'2026-10-13',distanceKm:12.2,movingSeconds:3600,averageHeartrate:153,source:'manual'}]}));
 app.run('state.selected=plan.sessions.find(s=>s.type==="interval");state.pendingActivityId="evidence";render()');
 const text=app.document.querySelector('.session-evidence').textContent;assert.ok(text.includes('12.20 km'));assert.ok(text.includes('153 bpm'));assert.ok(text.includes('cannot establish completion'));assert.ok(text.includes('Splits, laps and heart-rate streams are not available'));assert.equal(app.run('Object.keys(assessments).length'),0);
});

test('goal pace is calculated from hours and minutes, never displayed as a prediction',()=>{
 const app=loadApp(existing());app.run('plan.goal="2:39:59";state.screen="today";render()');assert.equal(app.run('raceGoalPace()'),'3:47/km');assert.ok(app.document.querySelector('.target-pace').textContent.includes('3:47/km'));
 app.run('plan.goal="3:30";render()');assert.equal(app.run('raceGoalPace()'),'4:59/km');
 app.run('plan.goal="No time goal";render()');assert.equal(app.document.querySelector('.target-pace'),null);
});
test('iPhone preview appearance and navigation preserve training and remove photography',()=>{
 const app=loadApp(existing()),before=app.run('JSON.stringify({plan,activities,assessments})');
 assert.ok(app.document.querySelector('.phone-screen'));
 for(const theme of ['dark','light','system']){app.click(`[data-theme="${theme}"]`);assert.equal(app.storage.get('build.previewAppearance'),theme);assert.equal(app.run('JSON.stringify({plan,activities,assessments})'),before)}
 for(const screen of ['today','plan','inbox','progress','settings']){app.click(`[data-preview-screen="${screen}"]`);assert.equal(app.run('state.screen'),screen);assert.equal(app.document.querySelectorAll('#app img').length,0);assert.equal(app.run('JSON.stringify({plan,activities,assessments})'),before)}
 assert.ok(app.document.querySelector('[data-theme-select]'));
 app.run("state.screen='onboarding';render()");assert.equal(app.document.querySelectorAll('#app img').length,0);assert.ok(!app.document.body.textContent.includes('YOUR PLAN. EVERY RUN. ONE BUILD.'));
});
