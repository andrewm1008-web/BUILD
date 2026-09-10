(()=>{
  try{
    const stored=JSON.parse(localStorage.getItem('build.plan')||'null');
    const oldDemo=stored&&stored.name==='London Marathon Build'&&stored.weeks===12&&!stored.id&&Array.isArray(stored.sessions)&&stored.sessions.length<=11;
    if(oldDemo){localStorage.setItem('build.plan',JSON.stringify(defaultPlan));localStorage.setItem('build.schema.version','4');location.reload();return}
    localStorage.setItem('build.schema.version','4');
  }catch{}
})();
