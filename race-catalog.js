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
  const normalized=value=>String(value||'').trim().toLowerCase();
  function find(name,date){return races.find(r=>r.date===date&&[r.name,...(r.aliases||[])].some(n=>normalized(n)===normalized(name)));}
  return {races,find,get:id=>races.find(r=>r.id===id)};
})();
