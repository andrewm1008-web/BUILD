import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicDir=path.join(root,'app/public');
const assets={};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.csv':'text/csv; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
for(const name of fs.readdirSync(publicDir)){const file=path.join(publicDir,name);if(fs.statSync(file).isFile())assets['/'+name]={type:types[path.extname(name)]||'application/octet-stream',bytes:fs.readFileSync(file).toString('base64')}}
const routes=fs.readFileSync(path.join(root,'worker/routes.js'),'utf8').replace('export async function stravaRoute','async function stravaRoute');
const source=routes+'\nconst assets='+JSON.stringify(assets)+';\n'+`export default {async fetch(request,env){try{const url=new URL(request.url);const api=await stravaRoute(request,env);if(api)return api;if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});const asset=assets[url.pathname==='/'?'/index.html':url.pathname];if(!asset)return new Response('Not found',{status:404});return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(asset.bytes),c=>c.charCodeAt(0)),{headers:{'Content-Type':asset.type,'Cache-Control':url.pathname==='/sw.js'?'no-cache':'private, no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':\"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com\"}})}catch{return new Response('BUILD could not complete this request. Please try again.',{status:500,headers:{'Cache-Control':'no-store'}})}}};\n`;
fs.writeFileSync(path.join(root,'worker/index.js'),source);
console.log('Prepared Worker with '+Object.keys(assets).length+' browser assets and server-only Strava routes.');
