// Optional real-browser regression. Run from app/ with Playwright + Chromium installed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let playwright;
try{playwright=require('playwright')}catch{
 if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw Error('Install app development dependencies and Playwright Chromium before running test:browser.');
 playwright=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));
}
const {createDevServer}=require('../dev-server.cjs');
(async()=>{
 const server=createDevServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 let browser;
 try{
  browser=await playwright.chromium.launch({headless:true,...(process.env.BUILD_TEST_CHROMIUM?{executablePath:process.env.BUILD_TEST_CHROMIUM}:{} )});
  const origin=`http://127.0.0.1:${server.address().port}`,context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,acceptDownloads:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin);await page.getByRole('button',{name:'Import my plan',exact:true}).click();
  const source=path.join(__dirname,'fixtures/BUILD_12_week_marathon_plan.json');
  await page.locator('#planFileInput').setInputFiles(source);await page.locator('#confirmPlan').waitFor();
  assert.equal(await page.locator('#importRaceDate').inputValue(),'');
  assert.equal(await page.locator('[data-import-change]').count(),5);
  assert.equal(await page.locator('[data-import-change]:checked').count(),0);
  await page.locator('#confirmPlan').click();
  assert.equal(await page.locator('.session-row').count(),7);
  const expected=JSON.parse(fs.readFileSync(source,'utf8')).sessions;
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('build.plan')).sessions),expected);
  await page.reload();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('build.plan')).sessions),expected);
  for(const [width,height]of [[390,844],[1280,900]]){
   await page.setViewportSize({width,height});
   for(const name of ['Home','My plan','Review','Progress']){
    await page.getByRole('button',{name,exact:true}).click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name} at ${width}px must fit`);
   }
  }
  await page.getByRole('button',{name:'Open settings',exact:true}).click();
  const downloaded=page.waitForEvent('download');await page.locator('#exportBackup').click();
  const backup=JSON.parse(fs.readFileSync(await (await downloaded).path(),'utf8'));assert.deepEqual(backup.plan.sessions,expected);
  const second=await browser.newContext(),restore=await second.newPage();await restore.goto(origin);
  await restore.locator('#backupFileInput').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await restore.locator('#confirmRestore').click();
  assert.deepEqual(await restore.evaluate(()=>JSON.parse(localStorage.getItem('build.plan')).sessions),expected);
  assert.deepEqual(errors,[]);console.log('PASS: actual plan import, reload, mobile/desktop navigation, backup export and independent-context restore. No provider data was simulated.');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(error=>{console.error(error);process.exitCode=1});
