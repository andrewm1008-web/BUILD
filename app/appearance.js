// Presentation preferences are independent from training data and backups.
const BuildAppearance=(()=>{
 let mode='light';try{mode=localStorage.getItem('build.previewAppearance')||'light'}catch{}
 if(!['light','dark','system'].includes(mode))mode='light';
 const media=typeof window.matchMedia==='function'?window.matchMedia('(prefers-color-scheme: dark)'):null;
 function apply(){document.documentElement.dataset.appearance=mode==='system'?(media?.matches?'dark':'light'):mode;document.documentElement.style.colorScheme=document.documentElement.dataset.appearance}
 function set(value){mode=['light','dark','system'].includes(value)?value:'light';try{localStorage.setItem('build.previewAppearance',mode)}catch{}apply()}
 media?.addEventListener?.('change',apply);apply();
 return {set,get:()=>mode};
})();
