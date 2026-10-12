const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx=vm.createContext({Date});for(const file of ['calendar.js','data.js','setup.js','plan-generator.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const generate=vm.runInContext('BuildGenerator.generate',ctx),calendar=vm.runInContext('BuildCalendar',ctx);
const input={race:'London',raceDate:'2027-04-25',goal:'3:30:00',experience:'regular',weeklyKm:40,longestKm:15,weeks:16,days:['Tue','Thu','Sat','Sun'],longDay:'Sun'};
test('generated plans use chosen days, current training, recovery weeks and taper',()=>{
 const {plan,summary}=generate(input,'2026-10-12');
 assert.equal(plan.startDate,'2027-01-04');assert.equal(plan.weeks,16);assert.equal(plan.goal,'3:30:00');
 assert.ok(plan.sessions.every(s=>input.days.includes(s.day)));assert.ok(plan.sessions.every(s=>s.distanceKm>0));
 assert.equal(summary.weeklySummary[3].phase,'Recovery');
 assert.ok(summary.weeklySummary[3].trainingKm<summary.weeklySummary[2].trainingKm);
 assert.ok(summary.weeklySummary[13].trainingKm<summary.weeklySummary[12].trainingKm);
 assert.ok(summary.weeklySummary[14].trainingKm<summary.weeklySummary[13].trainingKm);
 assert.ok(summary.weeklySummary[15].trainingKm<summary.weeklySummary[14].trainingKm);
 assert.ok(summary.longestKm<=30);assert.ok(summary.weeklySummary[0].trainingKm<=41);
});
test('beginners receive effort-based foundation work and no invented goal paces',()=>{
 const {plan,summary}=generate({...input,goal:'2:39:00',experience:'beginner',weeklyKm:0,longestKm:0,weeks:24,days:['Tue','Thu','Sun']},'2026-10-12');
 assert.equal(summary.tier,'beginner');assert.equal(summary.weeklySummary[0].phase,'Foundation');
 assert.ok(plan.sessions[0].target.includes('run/walk'));
 assert.equal(plan.sessions.some(s=>['interval','threshold'].includes(s.type)),false);
 assert.equal(plan.sessions.some(s=>s.target.includes('3:47/km')),false);
});
test('changing the target alone does not change training prescription or workload',()=>{
 const a=generate({...input,recentDistance:5,recentTime:'24:00'},'2026-10-12');
 const b=generate({...input,goal:'2:15:00',recentDistance:5,recentTime:'24:00'},'2026-10-12');
 assert.equal(JSON.stringify(a.plan.sessions.slice(0,-1)),JSON.stringify(b.plan.sessions.slice(0,-1)));
 assert.ok(a.summary.notes.some(n=>n.includes('recent race result')));
});
test('insufficient preparation time, impossible availability and an active injury are rejected',()=>{
 for(const values of [{weeks:12,weeklyKm:10,longestKm:5},{weeks:16,weeklyKm:0,longestKm:0},{days:['Tue','Sun']},{longDay:'Mon'},{weeklyKm:-1},{weeklyKm:NaN},{injury:true},{recentTime:'0:00',recentDistance:5}])assert.throws(()=>generate({...input,...values},'2026-10-12'));
 assert.throws(()=>generate(input,'2027-04-01'));
});
test('race day is placed on the actual race date even when it differs from the long-run day',()=>{
 const {plan}=generate({...input,raceDate:'2027-04-24'},'2026-10-12');
 const race=plan.sessions.find(s=>s.title.includes('race day'));
 assert.equal(race.day,'Sat');assert.equal(calendar.sessionDate(plan,race),'2027-04-24');
 assert.equal(plan.sessions.filter(s=>s.week===16&&s.day==='Sat').length,1);
 assert.ok(plan.sessions.every(s=>calendar.sessionDate(plan,s)<=plan.raceDate));
});
test('two quality workouts only appear with an established base and spaced days',()=>{
 const {plan}=generate({...input,experience:'experienced',weeklyKm:70,longestKm:24,days:['Mon','Tue','Wed','Thu','Sat','Sun'],recentDistance:5,recentTime:'19:00'},'2026-10-12');
 for(let week=1;week<=16;week++){
  const hard=plan.sessions.filter(s=>s.week===week&&['interval','threshold'].includes(s.type));assert.ok(hard.length<=2);
  if(hard.length===2){const gap=Math.abs(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(hard[0].day)-['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(hard[1].day));assert.ok(Math.min(gap,7-gap)>=2);}
 }
});
