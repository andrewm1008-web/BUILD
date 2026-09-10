// Import boundaries shared by plan, activity and backup workflows.
const BuildData = (() => {
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const text=(v,fallback='')=>String(v??fallback).trim();
  const finite=(v,min,max,label)=>{const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw Error(`${label} must be between ${min} and ${max}.`);return n};
  function csv(source){
    const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<source.length;i++){
      const c=source[i];
      if(c==='"'){if(quoted&&source[i+1]==='"'){field+='"';i++}else quoted=!quoted}
      else if(c===','&&!quoted){row.push(field);field=''}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&source[i+1]==='\n')i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field=''}
      else field+=c;
    }
    if(quoted)throw Error('A quoted CSV field is not closed.');
    row.push(field);if(row.some(v=>v.trim()))rows.push(row);
    if(rows.length<2)throw Error('Include a header and at least one row.');
    const seen={};const headers=rows.shift().map(h=>{h=h.replace(/^\uFEFF/,'').trim().toLowerCase();const count=seen[h]||0;seen[h]=count+1;return count?`${h}.${count}`:h});
    return rows.map((r,i)=>{if(r.length!==headers.length)throw Error(`CSV row ${i+2} has ${r.length} columns; expected ${headers.length}.`);return Object.fromEntries(headers.map((h,j)=>[h,r[j].trim()]))});
  }
  const pick=(r,names)=>{for(const key of names)if(r[key]!=null&&r[key]!=='')return r[key];return ''};
  function type(value){
    const t=text(value,'easy').toLowerCase();
    if(/long/.test(t))return 'long';if(/marathon|\bmp\b/.test(t))return 'marathon';
    if(/threshold|tempo/.test(t))return 'threshold';if(/interval|speed|track/.test(t))return 'interval';
    if(/strength|gym/.test(t))return 'strength';if(/recovery/.test(t))return 'recovery';
    if(/cross|pilates|hiit|hitt|cycle|swim/.test(t))return 'cross';if(/easy|rest/.test(t))return 'easy';
    throw Error(`Unknown session type: ${t}.`);
  }
  function date(value,label){
    if(!value)return undefined;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw Error(`${label} must be a valid YYYY-MM-DD date.`);
    return value;
  }
  function plan(input){
    if(!input||!Array.isArray(input.sessions)||!input.sessions.length||input.sessions.length>2000)throw Error('A plan needs 1–2,000 sessions.');
    const keys=new Set();
    const sessions=input.sessions.map((s,i)=>{
      const week=finite(s.week,1,52,`Session ${i+1} week`);if(!Number.isInteger(week))throw Error(`Session ${i+1} week must be a whole number.`);
      const day=days.find(d=>d.toLowerCase()===text(s.day).slice(0,3).toLowerCase());if(!day)throw Error(`Session ${i+1} needs a valid weekday.`);
      const title=text(s.title);if(!title||title.length>240)throw Error(`Session ${i+1} needs a title under 240 characters.`);
      const key=`${week}|${day}|${title}`;if(keys.has(key))throw Error(`Duplicate session: week ${week}, ${day}, ${title}.`);keys.add(key);
      return {week,day,title,type:type(s.type),target:text(s.target,'As prescribed'),objective:text(s.objective,'Contribute to the marathon build.'),...(s.distanceKm!=null&&s.distanceKm!==''?{distanceKm:finite(s.distanceKm,0,300,'Distance in km')}:{})};
    }).sort((a,b)=>a.week-b.week||days.indexOf(a.day)-days.indexOf(b.day));
    const maxWeek=Math.max(...sessions.map(s=>s.week));
    const weeks=finite(input.weeks||maxWeek,maxWeek,52,'Plan length');if(!Number.isInteger(weeks))throw Error('Plan length must be a whole number.');
    const currentWeek=finite(input.currentWeek||1,1,weeks,'Current week');if(!Number.isInteger(currentWeek))throw Error('Current week must be a whole number.');
    return {id:text(input.id,`import-${Date.now()}`),name:text(input.name,'Imported Marathon Build'),race:text(input.race,'Marathon'),goal:text(input.goal,'Your race goal'),weeks,currentWeek,startDate:date(input.startDate,'Start date'),raceDate:date(input.raceDate,'Race date'),sessions};
  }
  function planCSV(source){return plan({sessions:csv(source).map(r=>({week:pick(r,['week','wk']),day:pick(r,['day','weekday']),title:pick(r,['title','session','workout','workout name']),type:pick(r,['type','session type','workout type'])||'easy',target:pick(r,['target','pace','details','description'])||'As prescribed',distanceKm:pick(r,['distance km','distance_km','distance','km']),objective:pick(r,['objective','purpose','why it matters'])||'Contribute to the marathon build.'}))})}
  function seconds(value){
    if(value==null||value==='')return undefined;
    if(String(value).includes(':')){
      const parts=String(value).split(':');if(parts.length<2||parts.length>3||parts.some(p=>!/^\d+$/.test(p)))throw Error('Use minutes:seconds or hours:minutes:seconds.');
      if(parts.slice(1).some(p=>Number(p)>=60))throw Error('Minutes and seconds after a colon must be below 60.');
      return finite(parts.reduce((n,p)=>n*60+Number(p),0),0,604800,'Moving time');
    }
    return finite(value,0,604800,'Moving time in seconds');
  }
  function activity(a){
    const id=text(a.id);if(!id)throw Error('Activity ID is missing.');
    return {id,name:text(a.name,'Run'),distanceKm:finite(a.distanceKm,0,300,'Activity distance'),movingSeconds:seconds(a.movingSeconds)||0,date:date(a.date,'Activity date')||'',source:text(a.source,'manual'),...(a.averageHeartrate!=null?{averageHeartrate:finite(a.averageHeartrate,0,250,'Heart rate')}:{})};
  }
  function activitiesCSV(source,unit='km'){
    const multiplier={km:1,m:0.001,miles:1.609344}[unit];if(!multiplier)throw Error('Choose the distance unit used in your export.');
    const rows=csv(source);let skipped=0;const output=[];
    rows.forEach((r,i)=>{
      const sport=pick(r,['activity type','type','sport type']);if(sport&&!/^(run|running|trailrun|trail run|virtualrun|virtual run)$/i.test(sport)){skipped++;return}
      const distance=pick(r,['distance','distance km','distance_km']);
      if(distance==='')throw Error(`Activity row ${i+2} needs a distance.`);
      let day=pick(r,['activity date','date','start date']);
      if(day){const d=new Date(day);if(!Number.isFinite(+d))throw Error(`Activity row ${i+2} has an invalid date.`);day=/^\d{4}-\d{2}-\d{2}/.test(day)?day.slice(0,10):d.toISOString().slice(0,10)}
      const name=pick(r,['activity name','name'])||'Run',moving=seconds(pick(r,['moving time','moving seconds','elapsed time']))||0;
      const km=finite(distance,0,300000,'Export distance')*multiplier;
      const id=pick(r,['activity id','id'])||`csv-${day}-${km}-${moving}-${name}`;
      output.push(activity({id,name,date:day,distanceKm:km,movingSeconds:moving,source:'strava-csv'}));
    });
    if(!output.length)throw Error('No running activities found in that file.');
    return {activities:[...new Map(output.map(a=>[a.id,a])).values()],skipped};
  }
  function backup(input){
    if(input?.format!=='BUILD_BACKUP'||input.version!==1)throw Error('Choose a BUILD backup file.');
    const p=plan(input.plan),acts=(input.activities||[]).map(activity),ids=new Set(acts.map(a=>a.id)),linked=new Set();
    if(ids.size!==acts.length)throw Error('Backup contains duplicate activity IDs.');
    const assessments={};
    for(const s of p.sessions){
      const key=`${s.week}|${s.day}|${s.title}`,a=input.assessments?.[key];if(!a)continue;
      const score=Number(a.score);if(![15,58,84,100].includes(score))throw Error('Backup contains an invalid session score.');
      if(a.activityId&&(!ids.has(a.activityId)||linked.has(a.activityId)))throw Error('Backup contains an invalid or duplicate activity match.');
      if(a.activityId)linked.add(a.activityId);
      assessments[key]={score,label:({15:'Missed',58:'Modified',84:'Mostly',100:'Nailed it'})[score],at:text(a.at),notes:text(a.notes),...(a.activityId?{activityId:a.activityId}:{}),...(a.actualDistanceKm!=null?{actualDistanceKm:finite(a.actualDistanceKm,0,300,'Actual distance')}:{ }),...(a.movingSeconds!=null?{movingSeconds:seconds(a.movingSeconds)}:{}),...(a.rpe!=null?{rpe:finite(a.rpe,1,10,'Effort')}:{})};
    }
    return {plan:p,activities:acts,assessments,profile:{name:text(input.profile?.name,'Runner'),source:text(input.profile?.source,'manual'),onboarded:true}};
  }
  return {csv,plan,planCSV,activity,activitiesCSV,seconds,backup};
})();
