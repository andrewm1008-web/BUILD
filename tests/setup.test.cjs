const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context=vm.createContext({Date});
for(const file of ['calendar.js','data.js','setup.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const setup=vm.runInContext('BuildSetup',context);
test('goals belong to the user, with an optional target and a required valid race date',()=>{
 assert.equal(setup.goal({race:'London Marathon',raceDate:'2027-04-25',goal:''}).goal,'');
 assert.equal(setup.goal({race:'London Marathon',raceDate:'2027-04-25',goal:'2:39:59'}).goal,'2:39:59');
 for(const input of [{race:'',raceDate:'2027-04-25'},{race:'London',raceDate:''},{race:'London',raceDate:'2027-02-30'},{race:'London',raceDate:'2027-04-25',goal:'2:75'},{race:'London',raceDate:'2027-04-25',goal:'0:00'}])assert.throws(()=>setup.goal(input));
});
test('race date and plan length calculate the correct start across DST',()=>{
 assert.equal(setup.schedule('2027-04-25',12).startDate,'2027-02-01');
 assert.equal(setup.schedule('2027-04-25',16).startDate,'2027-01-04');
 assert.equal(setup.schedule('2027-02-14',2).startDate,'2027-02-01');
 assert.throws(()=>setup.schedule('2027-04-25',0));assert.throws(()=>setup.schedule('2027-04-25',12.5));
});
test('a non-Sunday race stays the last day of the build',()=>{
 const p=setup.create({race:'Saturday marathon',raceDate:'2027-04-24',goal:'3:30',weeks:16,sessions:[{week:16,day:'Sat',title:'Race',type:'long',distanceKm:42.195}]});
 assert.equal(vm.runInContext('BuildCalendar',context).sessionDate(p,p.sessions[0]),'2027-04-24');
});
test('the plan editor validates sessions and records the goal without inventing workouts',()=>{
 const p=setup.create({race:'London',raceDate:'2027-04-25',goal:'',weeks:16,sessions:[{week:1,day:'Mon',title:'Easy run',type:'easy',distanceKm:10}]});
 assert.equal(p.sessions.length,1);assert.equal(p.goal,'No time goal');assert.equal(p.startDate,'2027-01-04');
 assert.throws(()=>setup.create({...p,sessions:[]}));
 assert.throws(()=>setup.create({...p,goal:'3:30',sessions:[{week:17,day:'Mon',title:'Outside plan'}]}));
});
test('copying a week preserves original sessions and refuses to replace populated weeks',()=>{
 const sessions=[{week:1,day:'Mon',title:'Easy run',type:'easy',distanceKm:10}],copied=setup.duplicateWeek(sessions,1,2);
 assert.equal(sessions.length,1);assert.equal(copied.length,2);assert.equal(copied[1].week,2);
 copied[1].title='Modified week';assert.equal(sessions[0].title,'Easy run');
 assert.throws(()=>setup.duplicateWeek(copied,1,2));assert.throws(()=>setup.duplicateWeek(sessions,1,1));
});
test('first-time setup never displays the example race or time as the user goal',()=>{
 const element={innerHTML:'',addEventListener(){}};
 const app=vm.createContext({Date,localStorage:{getItem(){return null},setItem(){}},navigator:{},document:{getElementById(id){return id==='app'||id.endsWith('FileInput')?element:null},querySelectorAll(){return []},querySelector(){return null}}});
 for(const file of ['calendar.js','data.js','setup.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8'),app);
 const html=vm.runInContext('state.onboardStep=1;onboarding()',app);
 assert.ok(html.includes('id="raceInput"'));assert.equal(html.includes('value="London Marathon"'),false);assert.equal(html.includes('value="2:39:59"'),false);
});
