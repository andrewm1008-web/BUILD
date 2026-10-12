(()=>{
  const pairs=[['raceInput','raceDateInput'],['genRace','genDate'],['importRace','importRaceDate'],['builderRace','builderRaceDate'],['editRace','editRaceDate']];
  function inject(){
    for(const [nameId,dateId]of pairs){
      const name=document.getElementById(nameId),date=document.getElementById(dateId);
      if(!name||!date||name.dataset.racePickerBound)continue;
      name.dataset.racePickerBound='true';
      const field=name.closest('label'),selected=BuildRaces.find(name.value,date.value);
      const wrapper=document.createElement('div');wrapper.className='race-picker';
      wrapper.innerHTML=`<label class="field">Choose a marathon<select id="${nameId}RacePicker" aria-label="Choose a marathon"><option value="">Select your marathon</option>${BuildRaces.races.map(r=>`<option value="${r.id}">${escapeHTML(r.label)}</option>`).join('')}<option value="custom">Other marathon / enter manually</option></select></label><p class="race-picker-note" aria-live="polite"></p>`;
      field.before(wrapper);const select=wrapper.querySelector('select'),note=wrapper.querySelector('p');
      select.value=selected?.id||(name.value?'custom':'');
      function display(){const race=BuildRaces.get(select.value);field.hidden=select.value!=='custom';note.textContent=race?.note||(race?'Date from the event organizer.':'');}
      select.onchange=()=>{
        const race=BuildRaces.get(select.value);
        if(race){name.value=race.name;date.value=race.date;name.dispatchEvent(new Event('input',{bubbles:true}));date.dispatchEvent(new Event('input',{bubbles:true}));date.dispatchEvent(new Event('change',{bubbles:true}));}
        else if(select.value===''){name.value='';date.value='';}
        display();
      };
      date.addEventListener('change',()=>{const race=BuildRaces.get(select.value);if(race&&date.value!==race.date){select.value='custom';display();}});
      display();if(field.hidden&&document.activeElement===name)select.focus();
    }
  }
  const observer=new MutationObserver(inject);observer.observe(document.documentElement,{childList:true,subtree:true});inject();
})();
