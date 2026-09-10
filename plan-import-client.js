for(const [id,isCSV]of [['planFileInput',false],['planCsvFileInput',true]]){
  document.getElementById(id).addEventListener('change',async e=>{
    const file=e.target.files[0];e.target.value='';if(!file)return;
    try{if(file.size>2000000)throw Error('Choose a plan under 2 MB.');const source=await file.text();previewPlan(isCSV?BuildData.planCSV(source):BuildData.plan(JSON.parse(source)))}
    catch(error){notify(error.message||'Could not read this plan.')}
  });
}
