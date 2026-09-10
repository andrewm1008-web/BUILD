function openGoalEditor(){
  const sheet=openWorkflow('Edit your build',`<label class="field">Your name<input id="editName" value="${escapeHTML(profile.name)}" maxlength="100"></label><label class="field">Race<input id="editRace" value="${escapeHTML(plan.race)}" maxlength="200"></label><label class="field">Goal time<input id="editGoal" value="${escapeHTML(plan.goal)}" maxlength="100"></label><label class="field">Race date<input id="editRaceDate" type="date" value="${plan.raceDate||''}"></label><label class="field">Plan start date<input id="editStartDate" type="date" value="${plan.startDate||''}"></label><p class="muted-copy">Use the start date on your own plan. Set a race date to suggest a ${plan.weeks}-week build ending on race day.</p><label class="field">Current week (used if no start date)<input id="editWeek" type="number" min="1" max="${plan.weeks}" step="1" value="${BuildCalendar.currentWeek(plan)}"></label><button class="primary full" id="saveGoal">Save build</button>`);
  document.getElementById('editRaceDate').onchange=e=>{if(e.target.value)document.getElementById('editStartDate').value=BuildCalendar.startForRace(e.target.value,plan.weeks)};
  document.getElementById('saveGoal').onclick=()=>{
    try{
      const next=BuildData.plan({...plan,race:document.getElementById('editRace').value,goal:document.getElementById('editGoal').value,raceDate:document.getElementById('editRaceDate').value,startDate:document.getElementById('editStartDate').value,currentWeek:Number(document.getElementById('editWeek').value)});
      const oldPlan=plan,oldProfile=profile;plan=next;profile={...profile,name:document.getElementById('editName').value.trim()||'Runner'};
      try{save()}catch(error){plan=oldPlan;profile=oldProfile;throw error}
      sheet.remove();state.week=BuildCalendar.currentWeek(plan);render();notify('Build details saved.');
    }catch(error){notify(error.message)}
  };
}
(()=>{
  function inject(){const reset=document.getElementById('resetData');if(!reset||document.getElementById('editBuildGoal'))return;const b=document.createElement('button');b.id='editBuildGoal';b.className='primary full';b.textContent='Edit race & goal';reset.before(b);b.onclick=openGoalEditor}
  const observer=new MutationObserver(inject);observer.observe(document.documentElement,{childList:true,subtree:true});inject();
})();
