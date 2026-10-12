// Only published full-marathon dates. London has two separate race days.
// Reviewed against organizer pages on 2026-10-12; not an exhaustive race directory.
const BuildRaces=(()=>{
  const races=[
    {id:'london-2027-sat',name:'TCS London Marathon',label:'TCS London Marathon 2027 · Saturday 24 April',date:'2027-04-24',aliases:['London','London Marathon'],source:'https://www.londonmarathonevents.co.uk/london-marathon',note:'Choose the day on your entry confirmation: London runs on 24 and 25 April.'},
    {id:'london-2027-sun',name:'TCS London Marathon',label:'TCS London Marathon 2027 · Sunday 25 April',date:'2027-04-25',aliases:['London','London Marathon'],source:'https://www.londonmarathonevents.co.uk/london-marathon',note:'Choose the day on your entry confirmation: London runs on 24 and 25 April.'},
    {id:'brighton-2027',name:'Brighton Marathon',label:'Brighton Marathon 2027 · 4 April',date:'2027-04-04',source:'https://www.londonmarathonevents.co.uk/brighton-marathon-weekend'},
    {id:'manchester-2027',name:'adidas Manchester Marathon',label:'adidas Manchester Marathon 2027 · 18 April',date:'2027-04-18',aliases:['Manchester','Manchester Marathon'],source:'https://www.manchestermarathon.co.uk/event-info/about-event/'},
    {id:'edinburgh-2027',name:'Edinburgh Marathon',label:'Edinburgh Marathon 2027 · 30 May',date:'2027-05-30',source:'https://www.edinburghmarathon.com/marathon'},
    {id:'barcelona-2027',name:'Zurich Marató Barcelona',label:'Zurich Marató Barcelona 2027 · 14 March',date:'2027-03-14',aliases:['Barcelona','Barcelona Marathon'],source:'https://zurichmaratobarcelona.es/en/'},
    {id:'rotterdam-2027',name:'NN Marathon Rotterdam',label:'NN Marathon Rotterdam 2027 · 11 April',date:'2027-04-11',aliases:['Rotterdam','Rotterdam Marathon'],source:'https://nnmarathonrotterdam.nl/en/'},
    {id:'boston-2027',name:'Boston Marathon',label:'Boston Marathon 2027 · 19 April',date:'2027-04-19',source:'https://www.baa.org/races/boston-marathon/'}
  ];
  const additions=[
    ['vienna','Vienna City Marathon','Austria','2027-04-18','https://www.vienna-marathon.com/?go=marathon&lang=en',['Vienna']],
    ['prague','Vodafone Prague Marathon','Czechia','2027-05-02','https://www.runczech.com/en/events/vodafone-prague-marathon-2027/races/vodafone-prague-marathon',['Prague','Prague Marathon']],
    ['copenhagen','Copenhagen Marathon','Denmark','2027-05-09','https://copenhagenmarathon.dk/en/',['Copenhagen']],
    ['berlin','GENERALI BERLIN MARATHON','Germany','2027-09-26','https://www.bmw-berlin-marathon.com/en/press',['Berlin','Berlin Marathon','BMW Berlin Marathon']],
    ['hamburg','Haspa Marathon Hamburg','Germany','2027-04-25','https://haspa-marathon-hamburg.de/en/race-info-marathon/',['Hamburg','Hamburg Marathon']],
    ['rome','Acea Run Rome The Marathon','Italy','2027-03-14','https://www.runromethemarathon.com/',['Rome','Rome Marathon']],
    ['milan','Wizz Air Milano Marathon','Italy','2027-04-04','https://www.milanomarathon.it/en/marathon/',['Milan','Milan Marathon','Milano Marathon']],
    ['seville','Zurich Seville Marathon','Spain','2027-02-21','https://www.zurichmaratonsevilla.es/en/zms-regulations',['Seville','Seville Marathon','Sevilla']],
    ['stockholm','adidas Stockholm Marathon','Sweden','2027-05-29','https://stockholmmarathon.se/eng/eng-lopare/',['Stockholm','Stockholm Marathon']],
    ['zurich','OCHSNER SPORT Zürich Marathon','Switzerland','2027-04-11','https://www.zuerichmarathon.ch/marathon-2/marathon',['Zurich','Zurich Marathon','Zürich Marathon']]
  ];
  for(const race of races){race.country=race.id.startsWith('boston')?'United States':race.id.startsWith('barcelona')?'Spain':race.id.startsWith('rotterdam')?'Netherlands':'United Kingdom';}
  for(const [city,name,country,date,source,aliases]of additions){
    const formatted=new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB',{day:'numeric',month:'long',timeZone:'UTC'});
    races.push({id:`${city}-2027`,name,country,date,source,aliases,label:`${name} 2027 · ${formatted}`});
  }
  function groups(){return [...new Set(races.map(r=>r.country))].sort((a,b)=>a==='United States'?1:b==='United States'?-1:a.localeCompare(b)).map(country=>({country,races:races.filter(r=>r.country===country).sort((a,b)=>a.name.localeCompare(b.name)||a.date.localeCompare(b.date))}));}
  const normalized=value=>String(value||'').trim().toLowerCase();
  function find(name,date){return races.find(r=>r.date===date&&[r.name,...(r.aliases||[])].some(n=>normalized(n)===normalized(name)));}
  return {races,groups,find,get:id=>races.find(r=>r.id===id)};
})();
