// Local development server with the same /api routes as the Vercel deployment.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.csv':'text/csv','.svg':'image/svg+xml','.png':'image/png'};
const routes={'/api/health':'./api/health','/api/strava/connect':'./api/strava/connect','/api/strava/callback':'./api/strava/callback','/api/strava/activities':'./api/strava/activities','/api/strava/disconnect':'./api/strava/disconnect'};
const assets=new Set(['index.html','app.js','calendar.js','data.js','workflow-client.js','profile-client.js','plan-import-client.js','insights-client.js','strava-client.js','migration-client.js','engine-v2.js','styles.css','extras.css','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','sample-plan.csv','sample-plan.json']);
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(routes[url.pathname]){req.query=Object.fromEntries(url.searchParams);return await require(routes[url.pathname])(req,res)}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end()}
  const file=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
  if(!assets.has(file)){res.writeHead(404);return res.end('Not found')}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
  if(req.method==='HEAD')return res.end();fs.createReadStream(path.join(root,file)).pipe(res);
 }catch{res.writeHead(500);res.end('Request failed')}
});
server.listen(Number(process.env.PORT)||8765,'127.0.0.1',()=>console.log(`BUILD running at http://localhost:${server.address().port}`));
