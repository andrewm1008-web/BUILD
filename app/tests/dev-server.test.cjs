const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createDevServer}=require('../dev-server.cjs');
const {browserAssets}=require('../browser-assets.cjs');
test('preview serves every published asset with correct types and refuses source files',async()=>{
 const server=createDevServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 try{
  const origin=`http://127.0.0.1:${server.address().port}`;
  for(const asset of browserAssets()){
   const response=await fetch(origin+'/'+asset);assert.equal(response.status,200,asset);await response.arrayBuffer();
   if(asset.endsWith('.woff2'))assert.equal(response.headers.get('content-type'),'font/woff2');
   if(asset.endsWith('.webp'))assert.equal(response.headers.get('content-type'),'image/webp');
  }
  for(const asset of ['package.json','.env','lib/strava.cjs','dev-server.cjs','browser-assets.cjs','tests/fixtures/BUILD_12_week_marathon_plan.json'])assert.equal((await fetch(origin+'/'+asset)).status,404,asset);
  const head=await fetch(origin+'/design.css',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  assert.equal((await fetch(origin+'/design.css',{method:'POST'})).status,405);
  assert.equal((await fetch(origin+'/%ZZ')).status,400);
 }finally{await new Promise(resolve=>server.close(resolve))}
});
