const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function app(){
  const element={innerHTML:'',addEventListener(){}};
  const context=vm.createContext({console,Date,localStorage:{getItem(){return null},setItem(){}},navigator:{},document:{getElementById(id){return id==='app'||id.endsWith('FileInput')?element:null},querySelectorAll(){return []},querySelector(){return null}}});
  for(const file of ['calendar.js','data.js','app.js','engine-v2.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
  return code=>vm.runInContext(code,context);
}
test('Sunday belongs at the end of a Monday-start training week',()=>{
  const run=app();
  assert.equal(run("BuildCalendar.sessionDate({startDate:'2027-02-01'},{week:1,day:'Sun'})"),'2027-02-07');
  assert.equal(run("BuildCalendar.sessionDate({startDate:'2027-02-01'},{week:2,day:'Tue'})"),'2027-02-09');
});
test('next sessions follow dates even if Sunday appears first in the stored plan',()=>{
 const run=app();run("plan={startDate:'2027-02-01',weeks:2,currentWeek:1,sessions:[{week:1,day:'Sun',title:'Long run',type:'long'},{week:1,day:'Tue',title:'Intervals',type:'interval'},{week:1,day:'Mon',title:'Easy',type:'easy'}]};assessments={};activities=[];BuildCalendar.today=()=> '2027-02-01'");
 assert.equal(run('upcomingSessions()[0].title'),'Easy');
 assert.equal(run('nextKey().title'),'Easy');
 run("assessments[skey(plan.sessions[2])]={score:100}");assert.equal(run('upcomingSessions()[0].title'),'Intervals');
});
test('next-session ordering excludes past runs and already auto-matched runs',()=>{
 const run=app();run("plan={startDate:'2027-02-01',weeks:2,currentWeek:1,sessions:[{week:1,day:'Sun',title:'Long run',type:'long',distanceKm:20},{week:1,day:'Tue',title:'Intervals',type:'interval',distanceKm:10},{week:1,day:'Mon',title:'Easy',type:'easy',distanceKm:10}]};assessments={};activities=[{id:'done',source:'strava-api',date:'2027-02-01',distanceKm:10}]");
 assert.equal(run("upcomingSessions('2027-02-01')[0].title"),'Intervals');
 assert.equal(run("upcomingSessions('2027-02-03')[0].title"),'Long run');
});
test('undated plans still order the current week by weekday rather than insertion order',()=>{
 const run=app();run("plan={weeks:2,currentWeek:1,sessions:[{week:1,day:'Sun',title:'Long run',type:'long'},{week:1,day:'Tue',title:'Intervals',type:'interval'}]};assessments={};activities=[]");
 assert.equal(run("upcomingSessions('2027-02-01')[0].title"),'Intervals');
});
test('the rendered Next session card shows Tuesday before Sunday with its exact date',()=>{
 const run=app();run("plan={id:'test',race:'London',goal:'3:30',startDate:'2027-02-01',weeks:2,currentWeek:1,sessions:[{week:1,day:'Sun',title:'Sunday long run',type:'long',distanceKm:20,target:'Easy',objective:'Endurance'},{week:1,day:'Tue',title:'Tuesday intervals',type:'interval',distanceKm:10,target:'Controlled',objective:'Quality'}]};assessments={};activities=[];BuildCalendar.today=()=> '2027-02-01'");
 const card=run("today().split('today-session')[1].split('</section>')[0]");
 assert.ok(card.includes('Tuesday intervals'));assert.ok(card.includes('Tue, 2 Feb 2027'));assert.ok(!card.includes('Sunday long run'));
 run("BuildCalendar.today=()=> '2027-02-03'");assert.equal(run('nextPlannedRun().title'),'Sunday long run');
});
test('the next run skips strength but never skips an earlier easy run for a key workout',()=>{
 const run=app();run("plan={id:'test',race:'London',startDate:'2027-02-01',weeks:2,sessions:[{week:1,day:'Sun',title:'Long',type:'long',distanceKm:20},{week:1,day:'Tue',title:'Easy first',type:'easy',distanceKm:8},{week:1,day:'Mon',title:'Strength',type:'strength'}]};assessments={};activities=[];BuildCalendar.today=()=> '2027-02-01'");
 assert.equal(run('nextPlannedRun().title'),'Easy first');assert.equal(run('nextKey().title'),'Easy first');
 run("assessments[skey(plan.sessions[1])]={score:100}");assert.equal(run('nextPlannedRun().title'),'Long');
 run("assessments[skey(plan.sessions[0])]={score:100}");assert.equal(run('nextPlannedRun()'),undefined);
});
test('race date and week arithmetic survive daylight-saving boundaries',()=>{
  const run=app();
  assert.equal(run("BuildCalendar.startForRace('2027-04-25',12)"),'2027-02-01');
  assert.equal(run("BuildCalendar.currentWeek({startDate:'2027-03-22',weeks:12},'2027-03-29')"),2);
  assert.equal(run("BuildCalendar.isDue({startDate:'2027-02-01'},{week:1,day:'Sun'},'2027-02-06')"),false);
  assert.equal(run("BuildCalendar.isDue({startDate:'2027-02-01'},{week:1,day:'Sun'},'2027-02-07')"),true);
});
test('browsing future or past weeks cannot alter progress or forecast',()=>{
  const run=app();
  run("plan.currentWeek=5;for(const s of plan.sessions.filter(s=>s.week<5)) assessments[skey(s)]={score:s.week===4?58:100};state.week=5");
  const before=run('JSON.stringify(metrics())');
  assert.notEqual(run('metrics().forecast'),null);
  run('state.week=12');assert.equal(run('JSON.stringify(metrics())'),before);
  run('state.week=1');assert.equal(run('JSON.stringify(metrics())'),before);
});
test('recorded volume excludes missed and unmeasured sessions but keeps actual kilometres',()=>{
  const run=app();
  run("plan.sessions=[{week:1,day:'Tue',title:'Missed',type:'interval',distanceKm:12},{week:1,day:'Thu',title:'Manual',type:'threshold',distanceKm:15},{week:1,day:'Sun',title:'Actual',type:'long',distanceKm:30}];assessments={};assessments[skey(plan.sessions[0])]={score:15,actualDistanceKm:12};assessments[skey(plan.sessions[1])]={score:100};assessments[skey(plan.sessions[2])]={score:84,actualDistanceKm:27}");
  assert.equal(run('weekStats(1).distance'),27);
  run('assessments[skey(plan.sessions[2])].actualDistanceKm=0');
  assert.equal(run('weekStats(1).distance'),0);
});
test('forecast stays suppressed without enough evidence',()=>{
  const run=app();
  assert.equal(run('metrics().forecast'),null);
  run('assessments[skey(plan.sessions[0])]={score:100}');
  assert.equal(run('metrics().forecast'),null);
  assert.equal(run('metrics().confidence'),'Low');
});
test('session priority follows long run, intervals, threshold, easy',()=>{
  const run=app();
  assert.equal(run('IMPACT.long>IMPACT.interval&&IMPACT.interval>IMPACT.threshold&&IMPACT.threshold>IMPACT.easy'),true);
});
test('offline cache includes all entry-point scripts and styles',()=>{
  const html=fs.readFileSync('index.html','utf8');
  const sw=fs.readFileSync('sw.js','utf8');
  for(const [,path]of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g))assert.ok(sw.includes(`'./${path}'`),path);
});
test('service worker ignores API, OAuth and third-party requests',()=>{
  const handlers={};
  vm.runInNewContext(fs.readFileSync('sw.js','utf8'),{URL,Set,self:{registration:{scope:'https://example.com/BUILD/'},addEventListener(type,fn){handlers[type]=fn}}});
  for(const url of ['https://example.com/api/strava/activities','https://example.com/api/strava/connect','https://other.com/app.js']){
    let intercepted=false;
    handlers.fetch({request:{method:'GET',url},respondWith(){intercepted=true}});
    assert.equal(intercepted,false,url);
  }
});

function matchingApp(){
  const run=app();
  run("plan={startDate:'2027-02-01',weeks:2,sessions:[{week:1,day:'Mon',title:'Easy run',type:'easy',distanceKm:12},{week:1,day:'Sat',title:'Easy Saturday',type:'easy',distanceKm:10}]};assessments={};activities=[]");
  return run;
}
test('Strava sync automatically links a same-day run without writing a review',()=>{
  const run=matchingApp();
  run("activities=[{id:'1',source:'strava-api',name:'Lunch run',date:'2027-02-01',distanceKm:10}]");
  assert.equal(run("automaticMatches().get('1')"),'1|Mon|Easy run');
  assert.equal(run('Object.keys(assessments).length'),0);
  assert.ok(run('sessionRow(plan.sessions[0])').includes('Auto-matched · 10.0 km'));
  assert.equal(run('weekStats(1).distance'),10);
  assert.equal(run('weekStats(1).score'),null);
});
test('matching handles reduced distance, a moved day, and repeated sync deterministically',()=>{
  const run=matchingApp();
  run("activities=[{id:'short',source:'strava-api',date:'2027-02-01',distanceKm:1,name:'Run'},{id:'moved',source:'strava-api',date:'2027-02-07',distanceKm:10,name:'Run'}]");
  assert.equal(run("automaticMatches().get('short')"),'1|Mon|Easy run');
  assert.equal(run("automaticMatches().get('moved')"),'1|Sat|Easy Saturday');
  assert.equal(run("automaticMatches().size"),2);
  assert.equal(run("automaticMatches().size"),2);
});
test('ambiguous sessions or competing runs stay unresolved and reviews are protected',()=>{
  const run=matchingApp();
  run("activities=[{id:'1',source:'strava-api',date:'2027-02-01',distanceKm:12},{id:'2',source:'strava-api',date:'2027-02-01',distanceKm:12}]");
  assert.equal(run('automaticMatches().size'),0);
  run("activities.pop();plan.sessions.push({...plan.sessions[0],title:'Second run'})");
  assert.equal(run('automaticMatches().size'),0);
  run("plan.sessions.pop();assessments[skey(plan.sessions[0])]={score:100,activityId:'existing'}");
  assert.equal(run('automaticMatches().size'),0);
});
test('undated plans, unrelated historical runs and non-Strava activities are not auto-linked',()=>{
  const run=matchingApp();
  run("activities=[{id:'1',source:'strava-api',date:'2026-01-01',distanceKm:12},{id:'2',source:'manual',date:'2027-02-01',distanceKm:12}]");
  assert.equal(run('automaticMatches().size'),0);
  run("activities=[{id:'1',source:'strava-api',date:'2027-02-01',distanceKm:12}];plan.startDate=''");
  assert.equal(run('automaticMatches().size'),0);
});
