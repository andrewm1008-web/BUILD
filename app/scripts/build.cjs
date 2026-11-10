// Publish only the browser assets; /api handlers are bundled separately by Vercel.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),output=path.join(root,'public');
const assets=require('../browser-assets.cjs').browserAssets(root);
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
for(const name of assets){fs.mkdirSync(path.dirname(path.join(output,name)),{recursive:true});fs.copyFileSync(path.join(root,name),path.join(output,name))}
console.log(`Built ${assets.size} browser assets in public/. API code and local data are excluded.`);
