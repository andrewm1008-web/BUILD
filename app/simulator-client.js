// Interactive web rendering of the native layouts; no native capabilities are simulated.
(()=>{
 function updateControls(){
  document.querySelectorAll('[data-theme]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.theme===BuildAppearance.get()));button.onclick=()=>{BuildAppearance.set(button.dataset.theme);updateControls()}});
  document.querySelectorAll('[data-preview-screen]').forEach(button=>{button.setAttribute('aria-current',button.dataset.previewScreen===state.screen?'page':'false');button.onclick=()=>{if(document.querySelector('.sheet')){notify('Close the sheet before changing screens.');return}if(!profile.onboarded&&button.dataset.previewScreen!=='settings'){notify('Import a plan or explore the example first.');return}state.screen=button.dataset.previewScreen;state.selected=null;state.activity=null;render()}});
  document.querySelectorAll('[data-theme-select]').forEach(select=>{select.value=BuildAppearance.get();select.onchange=()=>{BuildAppearance.set(select.value);updateControls()}});
 }
 const beforeSettings=settingsView;
 settingsView=function(){return beforeSettings().replace('<div class="dashboard-grid">','<section class="card appearance-card"><label class="field">Appearance<select data-theme-select><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label></section><div class="dashboard-grid">')};
 let previousScreen=state.screen;
 const beforeRender=render;
 render=function(){beforeRender();updateControls();if(previousScreen!==state.screen){document.querySelector('.phone-scroll')?.scrollTo?.({top:0,behavior:'instant'});previousScreen=state.screen}};
 const size=document.getElementById('previewSize');
 function fitDevice(){
  const width=size?.value==='430'?430:390,height=width===430?932:844,viewportWidth=window.innerWidth,viewportHeight=window.innerHeight;
  document.documentElement.style.setProperty('--phone-width',width+'px');
  document.documentElement.style.setProperty('--device-logical-height',height+'px');
  if(!viewportWidth||!viewportHeight)return;
  const availableWidth=viewportWidth>950?viewportWidth-416:viewportWidth-24,availableHeight=viewportHeight-(viewportWidth>950?80:110);
  const scale=viewportWidth<=520?1:Math.max(.3,Math.min(1,availableWidth/(width+18),availableHeight/(height+18)));
  document.documentElement.style.setProperty('--device-scale',String(scale));
  document.documentElement.style.setProperty('--device-display-width',(width+18)*scale+'px');
  document.documentElement.style.setProperty('--device-display-height',(height+18)*scale+'px');
 }
 if(size)size.onchange=fitDevice;window.addEventListener('resize',fitDevice);fitDevice();
 const screen=document.querySelector('.phone-screen');
 const beforeWorkflow=openWorkflow;
 openWorkflow=function(...args){const top=window.scrollY||0,sheet=beforeWorkflow(...args);if(screen)screen.appendChild(sheet);window.scrollTo?.({top,behavior:'instant'});return sheet};
 if(screen){const notice=document.getElementById('notice');if(notice)screen.appendChild(notice)}
 if(screen)new MutationObserver(()=>{document.querySelectorAll('body > .sheet').forEach(sheet=>screen.appendChild(sheet))}).observe(document.body,{childList:true});
 render();
})();
