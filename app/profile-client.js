function openGoalEditor(){
  const sheet=openWorkflow('Edit your build',`<label class="field">Your name<input id="editName" value="${escapeHTML(profile.name)}" maxlength="100"></label><label class="field">Race<input id="editRace" value="${escapeHTML(plan.race)}" maxlength="200"></label><label class="field">Goal time<input id="editGoal" value="${escapeHTML(plan.goal)}" maxlength="100"></label><label class="field">Race date<input id="editRaceDate" type="date" value="${plan.raceDate||''}"></label><label class="field">Plan start date<input id="editStartDate" type="date" value="${plan.startDate||''}"></label><p class="muted-copy">Use the start date on your own plan. Set a race date to suggest a ${plan.weeks}-week build ending on race day.</p><label class="field">Current week (used if no start date)<input id="editWeek" type="number" min="1" max="${plan.weeks}" step="1" value="${BuildCalendar.currentWeek(plan)}"></label><button class="primary full" id="saveGoal">Save build</button>`);
  const start=document.getElementById('editStartDate'),raceDate=document.getElementById('editRaceDate');
  const controls=document.createElement('div');
  const manual=!!plan.startDate&&(!plan.raceDate||plan.startDate!==BuildCalendar.startForRace(plan.raceDate,plan.weeks));
  controls.innerHTML=`<label class="field">Plan length (weeks)<input id="editPlanWeeks" type="number" min="${Math.max(...plan.sessions.map(s=>s.week))}" max="52" step="1" value="${plan.weeks}"></label><label class="schedule-override"><input id="editManualStart" type="checkbox" ${manual?'checked':''}> Choose a different start date</label><p class="muted-copy" id="editSchedule" aria-live="polite"></p>`;
  start.closest('label').before(controls);
  const weeks=document.getElementById('editPlanWeeks'),override=document.getElementById('editManualStart'),message=document.getElementById('editSchedule');
  function refreshDates(){
    start.readOnly=!!raceDate.value&&!override.checked;
    try{if(raceDate.value&&!override.checked){start.value=BuildSetup.schedule(raceDate.value,weeks.value).startDate;message.textContent=`${weeks.value} weeks · starts ${start.value} · race day ${raceDate.value}.`;}else message.textContent=override.checked?'Using your chosen start date.':'Choose a race date to calculate the start automatically.';document.getElementById('saveGoal').disabled=false;}
    catch(error){message.textContent=error.message;document.getElementById('saveGoal').disabled=true;}
  }
  for(const input of [raceDate,weeks,override]){input.oninput=refreshDates;input.onchange=refreshDates;}
  start.oninput=()=>{if(!start.readOnly){override.checked=true;refreshDates();}};
  refreshDates();
  document.getElementById('saveGoal').onclick=()=>{
    try{
      const dates=raceDate.value&&!override.checked?BuildSetup.schedule(raceDate.value,weeks.value):{raceDate:raceDate.value,weeks:Number(weeks.value),startDate:start.value};
      const next=BuildData.plan({...plan,...dates,race:document.getElementById('editRace').value,goal:document.getElementById('editGoal').value,currentWeek:Math.min(Number(document.getElementById('editWeek').value),Number(weeks.value))});
      const oldPlan=plan,oldProfile=profile;plan=next;profile={...profile,name:document.getElementById('editName').value.trim()||'Runner'};
      try{save()}catch(error){plan=oldPlan;profile=oldProfile;throw error}
      sheet.remove();state.week=BuildCalendar.currentWeek(plan);render();notify('Build details saved.');
    }catch(error){notify(error.message)}
  };
}
