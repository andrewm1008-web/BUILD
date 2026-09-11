// Publish only the browser assets; /api handlers are bundled separately by Vercel.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),output=path.join(root,'public');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
const assets=new Set(['index.html','sw.js','manifest.webmanifest','sample-plan.csv','sample-plan.json']);
for(const [,name]of html.matchAll(/(?:src|href)="([^"?#]+)"/g))assets.add(name);
for(const icon of manifest.icons||[])assets.add(icon.src);
for(const name of assets){
 if(name.includes('..')||path.isAbsolute(name)||/^https?:/.test(name))throw Error(`Only local app assets may be published: ${name}`);
 if(!fs.statSync(path.join(root,name)).isFile())throw Error(`Missing app asset: ${name}`);
}
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
for(const name of assets){fs.mkdirSync(path.dirname(path.join(output,name)),{recursive:true});fs.copyFileSync(path.join(root,name),path.join(output,name))}
console.log(`Built ${assets.size} browser assets in public/. API code and local data are excluded.`);
