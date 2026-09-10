(()=>{
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const recencyWeight=week=>Math.pow(.90,Math.max(0,state.week-week));
  const dueSessions=()=>plan.sessions.filter(s=>s.week<state.week || (s.week===state.week && assessed(s)));
  const weightedAverage=(items,valueFn,weightFn)=>{let num=0,den=0;for(const item of items){const v=valueFn(item),w=weightFn(item);if(Number.isFinite(v)&&w>0){num+=v*w;den+=w}}return den?num/den:null};

  metrics=function(){
    const historical=plan.sessions.filter(s=>s.week<=state.week);
    const due=dueSessions();
    const known=due.filter(assessed);
    const knownImpact=known.reduce((a,s)=>a+impact(s),0);
    const possibleImpact=due.reduce((a,s)=>a+impact(s),0);
    const coverage=possibleImpact?knownImpact/possibleImpact:0;

    const execution=weightedAverage(known,s=>assessed(s).score,s=>impact(s)*recencyWeight(s.week));
    const key=known.filter(s=>impact(s)>=.78);
    const keyExecution=weightedAverage(key,s=>assessed(s).score,s=>impact(s)*1.15*recencyWeight(s.week));
    const recent=known.filter(s=>s.week>=Math.max(1,state.week-2));
    const recentExecution=weightedAverage(recent,s=>assessed(s).score,s=>impact(s));

    const explicitMisses=known.filter(s=>assessed(s).score<=20);
    const keyMisses=explicitMisses.filter(s=>impact(s)>=.78).length;
    const missedPenalty=Math.min(12,keyMisses*4+explicitMisses.filter(s=>impact(s)<.78).length);

    const progress=Math.round(clamp((execution??0)-missedPenalty,0,100));
    const quality=Math.round(clamp(keyExecution??execution??0,0,100));
    const recentAvg=Math.round(clamp(recentExecution??execution??0,0,100));

    const evidence=known.length;
    const keyEvidence=key.length;
    const confidenceScore=clamp(coverage*.55+Math.min(1,evidence/10)*.25+Math.min(1,keyEvidence/5)*.20,0,1);
    const confidence=confidenceScore>=.72?'High':confidenceScore>=.45?'Medium':'Low';
    const enoughSignal=evidence>=4 && keyEvidence>=1 && coverage>=.30;

    let forecast=null;
    if(enoughSignal){
      const base=(execution??0)*.35+(keyExecution??execution??0)*.40+(recentExecution??execution??0)*.25;
      const trend=recentExecution!=null&&execution!=null?clamp((recentExecution-execution)*.22,-5,5):0;
      forecast=Math.round(clamp(base+trend-missedPenalty*.4,0,100));
    }

    return {progress,quality,forecast,confidence,coverage,assessedCount:known.length,dueCount:due.length,recentAvg,confidenceScore,keyEvidence,missedPenalty};
  };

  statusCopy=function(m){
    if(m.forecast==null)return {tone:'neutral',label:'Building signal',text:'BUILD needs a few more completed sessions before it calls the trajectory. Keep logging the work; don’t chase the number.'};
    if(m.forecast>=90)return {tone:'good',label:'Strong build',text:'The sessions that matter most are landing. Protect recovery and keep the next key session controlled.'};
    if(m.forecast>=82)return {tone:'good',label:'On track',text:'The build supports the goal right now. The job is consistency, not adding extra work.'};
    if(m.forecast>=72)return {tone:'watch',label:'Within reach',text:'The goal is still live, but execution of the next key sessions matters more than extra mileage.'};
    return {tone:'risk',label:'Needs attention',text:'The current pattern is not supporting the goal strongly enough. Recover first, then rebuild around the next high-impact session.'};
  };

  coachingInsight=function(){
    const m=metrics(),n=nextKey();
    const recentKnown=dueSessions().filter(s=>s.week>=Math.max(1,state.week-2)&&assessed(s));
    const keyMiss=recentKnown.filter(s=>impact(s)>=.78&&assessed(s).score<=20).slice(-1)[0];
    const modified=recentKnown.filter(s=>impact(s)>=.78&&assessed(s).score>=40&&assessed(s).score<75).slice(-1)[0];
    if(keyMiss&&n)return `${escapeHTML(keyMiss.title)} didn’t land. Don’t repay it. The best response is to arrive ready for ${escapeHTML(n.title)}.`;
    if(modified&&n)return `${escapeHTML(modified.title)} delivered a different stimulus than planned. Keep the next few days normal and protect ${escapeHTML(n.title)}.`;
    if(m.recentAvg>=90&&m.quality>=88&&n)return `Recent execution is strong. Resist turning good training into more training. Keep ${escapeHTML(n.title)} exactly as prescribed.`;
    if(m.recentAvg<m.progress-6&&n)return `Recent execution has softened relative to the wider build. Make ${escapeHTML(n.title)} the next clean checkpoint rather than adding volume elsewhere.`;
    if(n)return `${escapeHTML(n.title)} is the next high-impact session. Its purpose: ${escapeHTML(n.objective.toLowerCase())}`;
    return 'The training work is complete. Nothing needs to be added now; race readiness comes from arriving fresh enough to use it.';
  };

  render();
})();
