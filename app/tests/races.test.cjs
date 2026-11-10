const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx=vm.createContext({Date});for(const file of ['calendar.js','data.js','setup.js','race-catalog.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const races=vm.runInContext('BuildRaces',ctx),setup=vm.runInContext('BuildSetup',ctx);
test('London offers both confirmed dates without guessing the runner’s assigned day',()=>{
 assert.equal(races.get('london-2027-sat').date,'2027-04-24');assert.equal(races.get('london-2027-sun').date,'2027-04-25');
 assert.equal(races.find('London Marathon','2027-04-24').id,'london-2027-sat');
 assert.equal(races.find('London Marathon','2027-04-25').id,'london-2027-sun');
 assert.equal(races.find('London Marathon',''),undefined);
});
test('each catalog entry has a valid full-marathon date, unique ID and organizer source',()=>{
 const ids=new Set();for(const race of races.races){assert.ok(!ids.has(race.id));ids.add(race.id);assert.ok(race.source.startsWith('https://'));assert.equal(setup.goal({race:race.name,raceDate:race.date}).raceDate,race.date);}
 assert.equal(races.get('rotterdam-2027').date,'2027-04-11');assert.equal(races.get('edinburgh-2027').date,'2027-05-30');
});
test('the chosen London day changes the automatic plan start by one day',()=>{
 assert.equal(setup.schedule(races.get('london-2027-sat').date,16).startDate,'2027-01-03');
 assert.equal(setup.schedule(races.get('london-2027-sun').date,16).startDate,'2027-01-04');
});
test('expanded European catalog keeps exact dates and one country group per entry',()=>{
 assert.equal(races.races.length,18);
 const groups=races.groups();assert.equal(groups.at(-1).country,'United States');
 assert.equal(groups.flatMap(g=>g.races).length,18);
 for(const g of groups)assert.ok(g.races.every(r=>r.country===g.country));
 assert.equal(races.find('Berlin Marathon','2027-09-26').id,'berlin-2027');
 assert.equal(races.get('rome-2027').date,'2027-03-14');
 assert.equal(races.get('prague-2027').date,'2027-05-02');
 assert.equal(races.get('seville-2027').date,'2027-02-21');
 assert.equal(races.get('zurich-2027').date,'2027-04-11');
});
