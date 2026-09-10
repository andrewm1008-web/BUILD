const {test}=require('node:test');
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx=vm.createContext({Date});vm.runInContext(fs.readFileSync('data.js','utf8'),ctx);const data=vm.runInContext('BuildData',ctx);
const session={week:1,day:'Sun',type:'long',title:'Long run',distanceKm:24};
test('sample CSV and JSON plans import with correct ordering and types',()=>{
 const csv=data.planCSV(fs.readFileSync('sample-plan.csv','utf8'));assert.equal(csv.sessions.length,6);assert.equal(csv.sessions[0].type,'interval');assert.equal(csv.sessions[2].day,'Sun');
 const json=data.plan(JSON.parse(fs.readFileSync('sample-plan.json','utf8')));assert.equal(json.sessions.length,3);assert.equal(json.weeks,12);
});
test('malformed plans fail before replacement, including partial CSV rows',()=>{
 for(const p of [{sessions:[]},{sessions:[{...session,week:1.5}]},{sessions:[{...session,day:'Someday'}]},{sessions:[{...session,distanceKm:-4}]},{sessions:[session,session]},{sessions:[session],weeks:53},{sessions:[session],startDate:'2027-02-30'}])assert.throws(()=>data.plan(p));
 assert.throws(()=>data.planCSV('Week,Day,Title\n1,Sun,Long run\n,Mon,Missing week'));
});
test('CSV respects quoted commas, line breaks, escaped quotes and duplicate headers',()=>{
 const rows=data.csv('Name,Notes,Name\n"Run, easy","Felt ""good""\nnext day",Secondary');
 assert.equal(rows[0].name,'Run, easy');assert.equal(rows[0]['name.1'],'Secondary');assert.equal(rows[0].notes,'Felt "good"\nnext day');
 assert.throws(()=>data.csv('Name,Notes\n"unclosed,text'));assert.throws(()=>data.csv('Name,Notes\nOne'));
});
test('activity import uses explicit units, handles duplicate exports and skips other sports',()=>{
 const csv='Activity ID,Activity Name,Activity Type,Activity Date,Distance,Moving Time\n42,Long run,Run,2027-02-07,10,1:20:00\n42,Long run,Run,2027-02-07,10,1:20:00\n43,Ride,Ride,2027-02-07,25,3600';
 const result=data.activitiesCSV(csv,'miles');assert.equal(result.activities.length,1);assert.equal(result.activities[0].distanceKm,16.09344);assert.equal(result.activities[0].movingSeconds,4800);assert.equal(result.skipped,1);
});
test('activity import never guesses that a long distance is metres',()=>{
 const csv='Activity ID,Distance,Moving Time\n42,10000,3600';
 assert.throws(()=>data.activitiesCSV(csv,'km'));assert.equal(data.activitiesCSV(csv,'m').activities[0].distanceKm,10);
});
test('invalid activity dates, negative distance and invalid clock times are rejected',()=>{
 assert.throws(()=>data.activitiesCSV('Distance,Date\n10,not-a-date'));
 assert.throws(()=>data.activitiesCSV('Distance,Date\n-10,2027-02-07'));
 assert.throws(()=>data.seconds('1:65:00'));assert.throws(()=>data.seconds('garbage'));assert.equal(data.seconds('40:30'),2430);
});
test('backup validates links and round-trips plan, activities and optional review details',()=>{
 const source={format:'BUILD_BACKUP',version:1,plan:{weeks:12,sessions:[session]},activities:[{id:'1',name:'Run',distanceKm:23.5,movingSeconds:7200,date:'2027-02-07'}],assessments:{'1|Sun|Long run':{score:84,activityId:'1',actualDistanceKm:23.5,rpe:7,notes:'Controlled'}},profile:{name:'Andy'}};
 const restored=data.backup(JSON.parse(JSON.stringify(source)));assert.equal(restored.assessments['1|Sun|Long run'].notes,'Controlled');assert.equal(restored.activities[0].distanceKm,23.5);assert.equal(restored.profile.name,'Andy');
 source.assessments['1|Sun|Long run'].activityId='missing';assert.throws(()=>data.backup(source));
});
