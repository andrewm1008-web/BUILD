// Shared validation for first-time setup, imported plans and the plan editor.
const BuildSetup=(()=>{
  function goal(input){
    const race=String(input.race||'').trim(),target=String(input.goal||'').trim();
    if(!race||race.length>200)throw Error('Enter the marathon you are training for.');
    const raceDate=String(input.raceDate||'');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(raceDate)||!Number.isFinite(Date.parse(raceDate))||new Date(raceDate).toISOString().slice(0,10)!==raceDate)throw Error('Choose a valid marathon date.');
    if(target&&!/^(?:[0-9]|1[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/.test(target))throw Error('Use a goal time such as 3:30 or 3:30:00, or leave it blank.');
    if(target&&Number(target.replaceAll(':',''))===0)throw Error('Enter a goal time greater than zero.');
    return {race,goal:target,raceDate};
  }
  function schedule(raceDate,weeks){
    const length=Number(weeks);
    if(!Number.isInteger(length)||length<1||length>52)throw Error('Choose a plan length from 1 to 52 whole weeks.');
    const valid=goal({race:'Marathon',raceDate});
    return {raceDate:valid.raceDate,weeks:length,startDate:BuildCalendar.startForRace(valid.raceDate,length)};
  }
  function create(input){
    const target=goal(input),dates=schedule(target.raceDate,input.weeks);
    return BuildData.plan({...input,...target,...dates,goal:target.goal||'No time goal',currentWeek:1});
  }
  function duplicateWeek(sessions,from,to){
    if(from===to)throw Error('Choose a different destination week.');
    if(sessions.some(s=>s.week===to))throw Error('That week already has sessions. Choose an empty week.');
    const source=sessions.filter(s=>s.week===from);
    if(!source.length)throw Error('Add a session before copying this week.');
    return [...sessions,...source.map(s=>({...s,week:to}))];
  }
  return {goal,schedule,create,duplicateWeek};
})();
