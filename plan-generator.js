// BUILD's transparent starting-plan rules. No API, chatbot or provider key is needed.
const BuildGenerator=(()=>{
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const round=n=>Math.round(n*10)/10;
  const dateDay=date=>days[(new Date(`${date}T12:00:00Z`).getUTCDay()+6)%7];
  const pace=sec=>{const n=Math.round(sec);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}/km`;};
  function generate(input,today=BuildCalendar.today()){
    const target=BuildSetup.goal(input),weeks=Number(input.weeks),weekly=Number(input.weeklyKm),longest=Number(input.longestKm);
    if(!['beginner','regular','experienced'].includes(input.experience))throw Error('Choose your running experience.');
    if(!Number.isFinite(weekly)||weekly<0||weekly>200||input.weeklyKm==='')throw Error('Enter your average weekly running distance, from 0 to 200 km.');
    if(!Number.isFinite(longest)||longest<0||longest>60||input.longestKm==='')throw Error('Enter your longest recent run, from 0 to 60 km.');
    if(longest>weekly*1.5+5)throw Error('Check your weekly distance and longest recent run.');
    if(![12,16,20,24].includes(weeks))throw Error('Choose a 12, 16, 20 or 24-week build.');
    if(input.injury)throw Error('An injury affecting your running needs an individually adapted plan. Import one from your coach or clinician instead.');
    const dates=BuildSetup.schedule(target.raceDate,weeks);
    if(dates.startDate<today)throw Error('That length would start in the past. Choose a shorter build that fits before race day.');
    if((weekly<15||longest<5)&&weeks<24)throw Error('Choose 24 weeks to include a gradual run/walk foundation from your current training.');
    if(weeks===12&&(weekly<40||longest<15))throw Error('A 12-week build needs an established base: at least 40 km/week and a recent 15 km run. Choose a longer build.');
    const selected=[...new Set(input.days||[])].filter(day=>days.includes(day));
    if(selected.length<3||selected.length>6)throw Error('Choose 3–6 running days per week.');
    if(!selected.includes(input.longDay))throw Error('Include your preferred long-run day in your running days.');
    const beginner=input.experience==='beginner'||weekly<30||longest<10;
    const advanced=input.experience==='experienced'&&weekly>=50&&longest>=18&&selected.length>=5;
    const tier=advanced?'experienced':beginner?'beginner':'regular';
    let racePace=null;
    if(input.recentTime){
      const distance=Number(input.recentDistance),seconds=BuildData.seconds(input.recentTime);
      if(![5,10,21.1].includes(distance)||!Number.isFinite(seconds)||seconds<=0)throw Error('Enter a valid recent 5 km, 10 km or half-marathon time.');
      racePace=seconds*Math.pow(5/distance,1.06)/5;
      if(racePace<120||racePace>900)throw Error('Check the recent race time and distance.');
    }
    const easy=racePace?`${pace(racePace*1.25)}–${pace(racePace*1.48)} · conversational effort`:'Conversational effort · slow down if breathing becomes laboured';
    const controlled=racePace?`${pace(racePace*1.08)}–${pace(racePace*1.14)} · controlled, never all-out`:'Controlled effort · short phrases, never all-out';
    const longIndex=days.indexOf(input.longDay);
    const candidates=selected.filter(day=>{const gap=(longIndex-days.indexOf(day)+7)%7;return gap>=2&&gap<=5;}).sort((a,b)=>days.indexOf(a)-days.indexOf(b));
    const quality=candidates.slice(0,1);
    if(advanced){const second=candidates.find(day=>quality.every(q=>{const gap=Math.abs(days.indexOf(q)-days.indexOf(day));return Math.min(gap,7-gap)>=2;}));if(second)quality.push(second);}
    const notes=[];
    if(!quality.length&&!beginner)notes.push('Your chosen days cluster around the long run, so the draft keeps those runs easy. Spread the days out to include quality work.');
    if(weekly<15||longest<5)notes.push('This build starts with a run/walk foundation. Progress depends on how you respond, not just reaching a calendar date.');
    notes.push(racePace?'Pace estimates use your recent race result, not the goal time. Effort takes priority.':'No recent race result: sessions use effort instead of invented pace targets.');
    let load=Math.max(weekly,selected.length*2),longLoad=Math.max(2,Math.min(longest||2,load*.42));
    const peakCap=Math.max(load,beginner?60:advanced?110:80),longCap=beginner?26:advanced?32:30;
    const sessions=[],weeklySummary=[];
    let peak=load,peakLong=longLoad;
    for(let week=1;week<=weeks;week++){
      const taper=week>weeks-3,cutback=!taper&&week%4===0,foundation=beginner&&(weekly<15||longest<5)&&week<=8;
      if(week>1&&!taper&&!cutback){load=Math.min(peakCap,load*1.07+(beginner?1:0));longLoad=Math.min(longCap,longLoad+1.5,load*.42);}
      if(!taper){peak=load;peakLong=longLoad;}
      const fraction=taper?[.75,.55,.30][week-(weeks-2)]:cutback?.78:1;
      const total=round((taper?peak:load)*fraction),longKm=round(Math.min((taper?peakLong:longLoad)*fraction,total*.42));
      const ordinary=round((total-longKm)/(selected.length-1)),raceWeek=week===weeks;
      const current=[];
      for(const day of selected){
        const date=BuildCalendar.sessionDate({...dates},{week,day});
        if(raceWeek&&date>=target.raceDate)continue;
        if(raceWeek&&day===input.longDay)continue;
        const isLong=day===input.longDay;
        let type=isLong?'long':'easy',km=isLong?longKm:ordinary,title=isLong?`${km} km long run`:`${km} km easy`,instructions=easy;
        if(foundation)instructions='Easy run/walk · start with 1–3 minutes running / 1 minute walking; shorten the running blocks as needed';
        if(isLong){instructions+=` · stop at 3 hours; the distance is a ceiling, not a requirement${cutback?' · recovery week':''}`;}
        else if(!beginner&&!cutback&&!taper&&week>=3&&quality.includes(day)&&km>=5){
          const proposed=quality.indexOf(day)===1||week%2===0?'threshold':'interval',block=proposed==='threshold'?6:3;
          const easyMinutes=racePace?racePace*1.38/60:6,workMinutes=racePace?racePace*1.11/60:5.3;
          let reps=Math.min(proposed==='threshold'?3:advanced?6:5,3+Math.floor((week-3)/4));
          while(reps>=2&&20/easyMinutes+reps*block/workMinutes+(reps-1)*2/easyMinutes>km)reps--;
          if(reps>=2){type=proposed;title=`${reps} × ${block} min ${type==='threshold'?'controlled':'intervals'}`;instructions=`${title} · 2 min easy jog between · ${controlled} · 10 min easy warm-up and cool-down; ${km} km total is approximate`;}
        }
        else if(beginner&&!foundation&&!cutback&&!taper&&weekly>=25&&week>=5&&quality.includes(day)&&km>=5){title=`${km} km easy + 4 strides`;instructions=easy+' · 4 × 15 sec relaxed strides, full walking recovery';}
        current.push({week,day,type,title,distanceKm:km,target:instructions,objective:isLong?'Build time on feet and practise race-day fuelling.':type==='easy'?'Build aerobic consistency.':'Practise controlled quality while preserving recovery.'});
      }
      if(raceWeek)current.push({week,day:dateDay(target.raceDate),type:'long',title:`${target.race} · race day`,distanceKm:42.195,target:target.goal?`Your target: ${target.goal}. Start controlled and adjust to conditions.`:'Complete the marathon at a sustainable effort. Run/walk is an option.',objective:'Race day. Use the fitness you have built.'});
      sessions.push(...current);
      weeklySummary.push({week,phase:raceWeek?'Race week':taper?'Taper':cutback?'Recovery':foundation?'Foundation':'Build',trainingKm:round(current.filter(s=>!s.title.endsWith('· race day')).reduce((n,s)=>n+s.distanceKm,0))});
    }
    const plan=BuildData.plan({id:`generated-${Date.now()}`,name:`${target.race} · ${weeks}-week build`,...target,...dates,goal:target.goal||'No time goal',sessions});
    return {plan,summary:{tier,weeks,startDate:dates.startDate,days:selected.length,peakKm:Math.max(...weeklySummary.map(w=>w.trainingKm)),longestKm:Math.max(...sessions.filter(s=>s.type==='long'&&!s.title.endsWith('· race day')).map(s=>s.distanceKm)),weeklySummary,notes}};
  }
  return {generate};
})();
