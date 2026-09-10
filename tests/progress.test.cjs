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
