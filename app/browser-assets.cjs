// One allowlist for preview and packaging. Never serve the source tree.
const fs=require('node:fs'),path=require('node:path');
function browserAssets(root=__dirname){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
 const assets=new Set(['index.html','sw.js','manifest.webmanifest','sample-plan.csv','sample-plan.json']);
 for(const [,name]of html.matchAll(/(?:src|href)="([^"?#]+)"/g))assets.add(name);
 for(const icon of manifest.icons||[])assets.add(icon.src);
 for(const name of assets){
  if(name.includes('..')||path.isAbsolute(name)||/^[a-z]+:/i.test(name)||!fs.statSync(path.join(root,name)).isFile())throw Error(`Only existing local browser assets may be published: ${name}`);
 }
 return assets;
}
module.exports={browserAssets};
