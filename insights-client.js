(()=>{
  const labels={long:'Long run',marathon:'Marathon pace',threshold:'Threshold',interval:'Intervals'};
  function data(){try{return {plan:JSON.parse(localStorage.getItem('build.plan')||'null'),a:JSON.parse(localStorage.getItem('build.assessments')||'{}')}}catch{return {}}}
  const key=s=>`${s.week}|${s.day}|${s.title}`;
  function score(type,plan,a){const ss=(plan?.sessions||[]).filter(s=>s.type===type&&a[key(s)]);if(!ss.length)return null;return Math.round(ss.reduce((n,s)=>n+a[key(s)].score,0)/ss.length)}
  function inject(){
    const head=[...document.querySelectorAll('.page-head .eyebrow')].find(x=>x.textContent.trim()==='Build Progress');
    if(!head||document.getElementById('buildPillars'))return;
    const {plan,a}=data();if(!plan||!a)return;
    const scores=Object.keys(labels).map(t=>[t,score(t,plan,a)]);
    const section=document.createElement('section');section.id='buildPillars';section.className='card pillars-card';
    section.innerHTML=`<div class="progress-head"><b>Build pillars</b><span>Marathon-specific</span></div><div class="pillars">${scores.map(([t,s])=>`<div><span>${labels[t]}</span><div class="pillar-track"><i style="width:${s??0}%"></i></div><b>${s==null?'—':`${s}%`}</b></div>`).join('')}</div>`;
    const grids=head.closest('main').querySelector('.metrics-grid.two');if(grids)grids.after(section);
  }
  const o=new MutationObserver(inject);o.observe(document.documentElement,{childList:true,subtree:true});inject();
})();
