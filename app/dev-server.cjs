// Local development server with the same /api routes as the Vercel deployment.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.csv':'text/csv','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const routes={'/api/health':'./api/health','/api/strava/connect':'./api/strava/connect','/api/strava/callback':'./api/strava/callback','/api/strava/activities':'./api/strava/activities','/api/strava/disconnect':'./api/strava/disconnect'};
function createDevServer(){
const assets=require('./browser-assets.cjs').browserAssets(root);
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(routes[url.pathname]){req.query=Object.fromEntries(url.searchParams);return await require(routes[url.pathname])(req,res)}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end()}
  let file;try{file=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html'}catch{res.writeHead(400);return res.end('Invalid path')}
  if(!assets.has(file)){res.writeHead(404);return res.end('Not found')}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')return res.end();const stream=fs.createReadStream(path.join(root,file));stream.on('error',()=>res.destroy());stream.pipe(res);
 }catch{res.writeHead(500);res.end('Request failed')}
});
return server;
}
if(require.main===module){const server=createDevServer();server.listen(Number(process.env.PORT)||8765,'127.0.0.1',()=>console.log(`BUILD running at http://localhost:${server.address().port}`));
}
module.exports={createDevServer};
