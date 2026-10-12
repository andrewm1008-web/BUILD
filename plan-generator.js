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
    if(![12,16,20,24,28,32].includes(weeks))throw Error('Choose a 12–32 week build from the available lengths.');
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
    let easySeconds=null;
    if(input.easyPace){easySeconds=BuildData.seconds(input.easyPace);if(!Number.isFinite(easySeconds)||easySeconds<120||easySeconds>900)throw Error('Enter an easy pace in min:sec per km, such as 6:00.');}
    else if(racePace)easySeconds=racePace*1.38;
    const approach=input.longRunApproach||'standard';
    if(!['standard','extended'].includes(approach))throw Error('Choose a standard or extended long-run approach.');
    const extended=approach==='extended';
    if(extended&&(!advanced||weeks<16))throw Error('Extended long runs need an experienced marathon runner, at least 50 km/week, a recent 18 km run, five running days and at least 16 weeks. Choose Standard or review your answers.');
    if(extended&&!easySeconds)throw Error('Add your usual easy pace or a recent race result to check the duration of extended long runs.');
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
    // Endurance has its own progression; it is not capped at 42% for every runner.
    const longShare=selected.length===3?.55:selected.length===4?.50:selected.length===5?.45:.42;
    const maxLongMinutes=extended?210:beginner?210:advanced?180:195;
    const timeBudget=easySeconds?maxLongMinutes*60/easySeconds:Infinity;
    const targetLong=Math.min(extended?35:beginner?28:advanced?32:30,timeBudget);
    const requiredLong=extended?34:Math.min(beginner?26:advanced?30:28,timeBudget);
    if(extended&&timeBudget<34)throw Error('At your current easy pace, 34 km exceeds the extended 210-minute limit. Choose Standard for a shorter, time-based peak.');
    if(extended)notes.push('Extended endurance: aim for 34–35 km within 210 minutes. Eligibility uses recent mileage, experience, availability and pace, not your goal time. The longest runs stay easy; practise fuelling and shorten them if recovery suffers.');
    if(timeBudget<20)throw Error('Your current easy pace needs a marathon run/walk strategy tailored to the event time limit. Use an individually adapted plan rather than this generator.');
    const frequencyCap=selected.length===3?60:selected.length===4?80:110;
    let load=Math.max(Math.min(weekly,frequencyCap),selected.length*2),longLoad=Math.max(2,Math.min(longest||2,load*longShare,targetLong));
    const peakCap=Math.max(load,Math.min(frequencyCap,beginner?60:advanced?110:80));
    if(weekly>frequencyCap)notes.push(`With ${selected.length} running days, this draft reduces volume rather than compressing your recent ${weekly} km/week into fewer, oversized sessions.`);
    const loadSteps=Array.from({length:weeks-3},(_,i)=>i+1).filter(w=>w>1&&w%4!==0).length;
    const longStep=Math.min(2,Math.max(.5,(targetLong-longLoad)/Math.max(1,loadSteps)));
    const weights=new Map(selected.filter(day=>day!==input.longDay).map(day=>[day,(longIndex-days.indexOf(day)+7)%7===1?.7:quality.includes(day)?1.2:(days.indexOf(day)-longIndex+7)%7===1?.8:1]));
    const weightTotal=[...weights.values()].reduce((n,w)=>n+w,0);
    const sessions=[],weeklySummary=[];
    let peak=load,peakLong=longLoad;
    for(let week=1;week<=weeks;week++){
      const taper=week>weeks-3,cutback=!taper&&week%4===0,foundation=beginner&&(weekly<15||longest<5)&&week<=8;
      if(week>1&&!taper&&!cutback){load=Math.min(peakCap,load*1.08+(beginner&&load<25?1:0));longLoad=Math.min(targetLong,longLoad+longStep,load*longShare);}
      if(!taper){peak=load;peakLong=longLoad;}
      const fraction=taper?[.75,.55,.30][week-(weeks-2)]:cutback?.78:1;
      const total=round((taper?peak:load)*fraction),longKm=round(Math.min((taper?peakLong:longLoad)*fraction,total*longShare));
      const raceWeek=week===weeks,specific=!foundation&&week>=weeks-7&&!taper&&!cutback;
      const current=[];
      for(const day of selected){
        const date=BuildCalendar.sessionDate({...dates},{week,day});
        if(raceWeek&&date>=target.raceDate)continue;
        if(raceWeek&&day===input.longDay)continue;
        const isLong=day===input.longDay;
        let type=isLong?'long':'easy',km=isLong?longKm:round((total-longKm)*weights.get(day)/weightTotal),title=isLong?`${km} km long run`:`${km} km easy`,instructions=easy;
        if(foundation)instructions='Easy run/walk · start with 1–3 minutes running / 1 minute walking; shorten the running blocks as needed';
        if(isLong){
          instructions+=` · up to ${maxLongMinutes} minutes; stop earlier if the effort or recovery demands it${cutback?' · recovery week':''}`;
          if(specific&&!beginner&&weekly>=40&&longest>=15&&km>=24&&(!extended||km<=32)&&week%2===1){const block=Math.min(6,Math.floor(km*.2));title=`${km} km with final ${block} km at marathon effort`;instructions+=` · final ${block} km controlled marathon effort${racePace?` (approximately ${pace(racePace*Math.pow(42.195/5,.06))}, estimated from recent fitness)`:''}; skip the faster finish if fatigued`;}
        }
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
      weeklySummary.push({week,phase:raceWeek?'Race week':taper?'Taper':cutback?'Recovery':foundation?'Foundation':specific?'Marathon-specific':week<=Math.max(3,Math.floor((weeks-3)*.3))?'Base':'Build',trainingKm:round(current.filter(s=>!s.title.endsWith('· race day')).reduce((n,s)=>n+s.distanceKm,0))});
    }
    const achievedLong=Math.max(...sessions.filter(s=>s.type==='long'&&!s.title.endsWith('· race day')).map(s=>s.distanceKm));
    if(achievedLong+0.2<requiredLong)throw Error(`With these answers, this length reaches only ${achievedLong} km for the long run. Choose a longer build or review your running days.`);
    notes.push(`Endurance target: ${round(targetLong)} km, based on your training history and ${selected.length} running days. Recovery weeks interrupt the progression before the taper.`);
    if(timeBudget<(beginner?26:advanced?30:28))notes.push(`Your long runs are time-based: up to ${maxLongMinutes} minutes (about ${round(timeBudget)} km at your current easy pace). A slower runner is not required to cover the same distance as a faster runner.`);
    const plan=BuildData.plan({id:`generated-${Date.now()}`,name:`${target.race} · ${weeks}-week build`,...target,...dates,goal:target.goal||'No time goal',sessions});
    return {plan,summary:{tier,weeks,startDate:dates.startDate,days:selected.length,peakKm:Math.max(...weeklySummary.map(w=>w.trainingKm)),longestKm:achievedLong,targetLongKm:round(targetLong),maxLongMinutes,longRunApproach:approach,longRunMode:timeBudget<(beginner?26:advanced?30:28)?'time':'distance',weeklySummary,notes}};
  }
  function recommend(input,today=BuildCalendar.today()){
    for(const weeks of [16,20,24,28,32,12]){
      try{const result=generate({...input,weeks},today);return {weeks,longestKm:result.summary.longestKm,startDate:result.summary.startDate};}catch{}
    }
    return null;
  }
  return {generate,recommend};
})();
